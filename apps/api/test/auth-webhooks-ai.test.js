'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { of, throwError } = require('rxjs');
const { NotImplementedException, ServiceUnavailableException } = require('@nestjs/common');
const { AuthService } = require('../dist/modules/auth/auth.service');
const { WebhooksService } = require('../dist/modules/webhooks/webhooks.service');
const { AiProxyService } = require('../dist/modules/ai-proxy/ai-proxy.service');
const { mockPrisma } = require('./helpers');

function withEnv(vars, fn) {
  const saved = {};
  for (const key of Object.keys(vars)) {
    saved[key] = process.env[key];
    if (vars[key] === undefined) delete process.env[key]; else process.env[key] = vars[key];
  }
  const restore = () => { for (const key of Object.keys(saved)) { if (saved[key] === undefined) delete process.env[key]; else process.env[key] = saved[key]; } };
  try {
    const result = fn();
    if (result && typeof result.then === 'function') return result.finally(restore);
    restore();
    return result;
  } catch (error) { restore(); throw error; }
}

test('self-registration ignores a requested role', async () => {
  const m = mockPrisma({
    'user.findUnique': null,
    'user.create': (args) => ({ id: 'u1', email: args.data.email, role: args.data.role, passwordHash: 'x' }),
  });
  const service = new AuthService(m.prisma, { sign: () => 'token' });
  const result = await service.register({ name: 'Eve', email: 'eve@example.com', password: 'password1', role: 'admin' });
  assert.equal(m.lastArgs('user.create').data.role, 'student');
  assert.equal(result.user.role, 'student');
  assert.equal(result.user.passwordHash, undefined);
});

test('the mock GitHub OAuth sign-in is unavailable in production', async () => {
  const service = new AuthService(mockPrisma().prisma, { sign: () => 'token' });
  await withEnv({ NODE_ENV: 'production' }, () => assert.rejects(service.handleGithubOAuth('code'), NotImplementedException));
});

test('webhook signatures: valid, forged, wrong length, missing, and unset secret', () => {
  const service = new WebhooksService(mockPrisma().prisma);
  const body = Buffer.from('{"ref":"refs/heads/task-1"}');
  const sign = (secret) => 'sha256=' + crypto.createHmac('sha256', secret).update(body).digest('hex');

  assert.equal(service.verifySignature(body, sign('s3cret'), 's3cret'), true);
  assert.equal(service.verifySignature(body, sign('other'), 's3cret'), false);
  assert.equal(service.verifySignature(body, 'sha256=short', 's3cret'), false);
  assert.equal(service.verifySignature(body, undefined, 's3cret'), false);

  withEnv({ NODE_ENV: 'production' }, () => assert.equal(service.verifySignature(body, undefined, ''), false));
  withEnv({ NODE_ENV: 'development' }, () => assert.equal(service.verifySignature(body, undefined, ''), true));
});

test('a push to a task branch records a contribution against the real task and cohort', async () => {
  const m = mockPrisma({
    'task.findUnique': { id: 't1', cohortId: 'cohort-1' },
    'user.findFirst': { id: 'u1' },
    'contribution.findFirst': null,
    'contribution.create': {},
  });
  await new WebhooksService(m.prisma).handleGithubEvent('push', {
    ref: 'refs/heads/task-t1', pusher: { name: 'octocat' }, commits: [{}, {}],
  });
  const data = m.lastArgs('contribution.create').data;
  assert.equal(data.taskId, 't1');
  assert.equal(data.cohortId, 'cohort-1');
  assert.equal(data.rawCommitCount, 2);
});

test('pushes to non-task branches or unknown tasks are ignored', async () => {
  const m = mockPrisma({ 'task.findUnique': null });
  const service = new WebhooksService(m.prisma);
  await service.handleGithubEvent('push', { ref: 'refs/heads/main', pusher: { name: 'octocat' } });
  await service.handleGithubEvent('push', { ref: 'refs/heads/task-missing', pusher: { name: 'octocat' } });
  assert.equal(m.argsOf('contribution.create').length, 0);
});

test('the AI proxy forwards lesson text and returns the AI answer', async () => {
  let posted;
  const http = { post: (url, body) => { posted = { url, body }; return of({ data: { answer: 'hi' } }); } };
  const m = mockPrisma({ 'lesson.findFirst': { textContent: 'Lesson body' } });
  const result = await new AiProxyService(http, m.prisma).askTutor('what?', 'l1', 'u1');
  assert.equal(result.answer, 'hi');
  assert.match(posted.url, /\/v1\/tutor\/ask$/);
  assert.equal(posted.body.payload.lessonContext, 'Lesson body');
  assert.deepEqual(m.lastArgs('lesson.findFirst').where, { id: 'l1', course: { status: 'published' } });
});

test('an AI outage surfaces as 503 instead of a canned answer; review is explicitly unavailable', async () => {
  const http = { post: () => throwError(() => new Error('connect ECONNREFUSED')) };
  const service = new AiProxyService(http, mockPrisma({ 'lesson.findFirst': null }).prisma);
  await assert.rejects(service.askTutor('what?', 'l1', 'u1'), ServiceUnavailableException);
  await assert.rejects(service.triggerCodeReview('t1'), NotImplementedException);
});
