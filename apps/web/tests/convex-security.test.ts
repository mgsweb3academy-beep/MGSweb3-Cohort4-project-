/// <reference types="vite/client" />
import { convexTest } from 'convex-test';
import { describe, expect, it } from 'vitest';
import schema from '../convex/schema';
import { api, internal } from '../convex/_generated/api';

const modules = import.meta.glob('../convex/**/*.ts');
async function fixture() {
  const t = convexTest(schema, modules);
  const ids = await t.run(async ctx => {
    const admin = await ctx.db.insert('users', { name: 'Admin', email: 'admin@example.com', role: 'admin', status: 'active' });
    const student = await ctx.db.insert('users', { name: 'Student', email: 'student@example.com', role: 'student', status: 'active' });
    const peer = await ctx.db.insert('users', { name: 'Peer', email: 'peer@example.com', role: 'student', status: 'active' });
    const peer2 = await ctx.db.insert('users', { name: 'Peer 2', email: 'peer2@example.com', role: 'student', status: 'active' });
    const program = await ctx.db.insert('programs', { name: 'Program', weekCount: 8 });
    const cohort = await ctx.db.insert('cohorts', { name: 'Cohort', programId: program, startDate: '2026-10-01', weekCount: 8, instructorName: 'Admin', learnerCount: 2, teamCount: 2 });
    const teamA = await ctx.db.insert('teams', { name: 'A', cohortId: cohort });
    const teamB = await ctx.db.insert('teams', { name: 'B', cohortId: cohort });
    await ctx.db.insert('enrollments', { userId: student, cohortId: cohort, teamId: teamA });
    await ctx.db.insert('enrollments', { userId: peer, cohortId: cohort, teamId: teamB });
    await ctx.db.insert('enrollments', { userId: peer2, cohortId: cohort, teamId: teamB });
    return { admin, student, peer, peer2, program, cohort, teamA, teamB };
  });
  return { t, ids, admin: t.withIdentity({ subject: 'admin@example.com', sessionVersion: 0 }), student: t.withIdentity({ subject: 'student@example.com', sessionVersion: 0 }), peer: t.withIdentity({ subject: 'peer@example.com', sessionVersion: 0 }), peer2: t.withIdentity({ subject: 'peer2@example.com', sessionVersion: 0 }) };
}
describe('database authorization', () => {
  it('rejects anonymous and student role changes, permits an administrator', async () => {
    const { t, ids, student, admin } = await fixture();
    await expect(t.mutation(api.users.setRole, { id: ids.student, role: 'admin' })).rejects.toThrow();
    await expect(student.mutation(api.users.setRole, { id: ids.student, role: 'admin' })).rejects.toThrow();
    await admin.mutation(api.users.setRole, { id: ids.student, role: 'instructor' });
    expect((await student.query(api.users.getByEmail, { email: 'student@example.com' }))?.role).toBe('instructor');
  });
  it('rejects suspended accounts and sessions revoked by password reset', async () => {
    const { t, ids, student, admin } = await fixture();
    await admin.mutation(api.users.setStatus, { id: ids.student, status: 'suspended' });
    await expect(student.query(api.tasks.list, {})).rejects.toThrow();
    await t.run(ctx => ctx.db.patch(ids.student, { status: 'active', sessionVersion: 1 }));
    await expect(student.query(api.tasks.list, {})).rejects.toThrow();
  });
  it('rejects anonymous course deletion and reading another learner progress', async () => {
    const { t, ids, student } = await fixture();
    const course = await t.run(ctx => ctx.db.insert('courses', { title: 'Course', programId: ids.program, instructorName: 'Admin', status: 'draft' }));
    const lesson = await t.run(ctx => ctx.db.insert('lessons', { courseId: course, title: 'Lesson', contentType: 'markdown', order: 1 }));
    await expect(t.mutation(api.courses.remove, { id: course })).rejects.toThrow();
    await expect(student.query(api.progress.get, { lessonId: lesson, userId: ids.peer })).rejects.toThrow();
  });
});
describe('persistent task lifecycle', () => {
  it('shares creation, detail, transitions and reviews; requires distinct approvals', async () => {
    const { admin, student, peer, peer2, ids } = await fixture();
    const task = await admin.mutation(api.tasks.create, { title: 'Build', teamId: ids.teamA, teamName: 'A', cohortId: ids.cohort });
    expect((await student.query(api.tasks.get, { id: task.id })).title).toBe('Build');
    await expect(student.mutation(api.tasks.transition, { id: task.id, to: 'Pushed' })).rejects.toThrow();
    await student.mutation(api.tasks.transition, { id: task.id, to: 'Branched' });
    await student.mutation(api.tasks.transition, { id: task.id, to: 'Pushed' });
    await student.mutation(api.tasks.transition, { id: task.id, to: 'In Review' });
    await expect(student.mutation(api.tasks.review, { id: task.id, status: 'approved', comment: 'Own team' })).rejects.toThrow();
    await peer.mutation(api.tasks.review, { id: task.id, status: 'approved', comment: 'Good' });
    await peer.mutation(api.tasks.review, { id: task.id, status: 'approved', comment: 'Again' });
    await expect(admin.mutation(api.tasks.transition, { id: task.id, to: 'Closed' })).rejects.toThrow();
    await admin.mutation(api.tasks.review, { id: task.id, status: 'approved', comment: 'Reviewed' });
    await expect(admin.mutation(api.tasks.transition, { id: task.id, to: 'Closed' })).rejects.toThrow();
    await peer2.mutation(api.tasks.review, { id: task.id, status: 'approved', comment: 'Second peer' });
    await admin.mutation(api.tasks.transition, { id: task.id, to: 'Closed' });
    expect((await admin.query(api.tasks.get, { id: task.id })).state).toBe('Closed');
    await admin.mutation(api.tasks.remove, { id: task.id });
    await expect(admin.query(api.tasks.get, { id: task.id })).rejects.toThrow();
  });
  it('cannot create tasks as a student or access an unenrolled cohort', async () => {
    const { t, admin, student, ids } = await fixture();
    await expect(student.mutation(api.tasks.create, { title: 'Build', teamId: ids.teamA, teamName: 'A', cohortId: ids.cohort })).rejects.toThrow();
    const task = await admin.mutation(api.tasks.create, { title: 'Build', teamId: ids.teamA, teamName: 'A', cohortId: ids.cohort });
    await t.run(async ctx => {
      for (const e of await ctx.db.query('enrollments').collect()) if (e.userId === ids.student) await ctx.db.delete(e._id);
    });
    expect((await student.query(api.tasks.list, {})).tasks).toHaveLength(0);
    await expect(student.query(api.tasks.get, { id: task.id })).rejects.toThrow();
  });
});
describe('onboarding', () => {
  it('creates authenticated team invitations, requires verified email and supports revocation', async () => {
    const { admin, student, t, ids } = await fixture();
    const { code } = await admin.action(api.authNode.createInvite, { cohortId: ids.cohort, teamId: ids.teamB, email: 'student@example.com' });
    await expect(student.mutation(api.onboarding.acceptInvite, { code })).rejects.toThrow();
    await t.run(ctx => ctx.db.patch(ids.student, { emailVerified: true }));
    await student.mutation(api.onboarding.acceptInvite, { code });
    const enrollment = await t.run(ctx => ctx.db.query('enrollments').withIndex('by_cohort_user', q => q.eq('cohortId', ids.cohort).eq('userId', ids.student)).unique());
    expect(enrollment?.teamId).toBe(ids.teamB);
    await admin.mutation(api.onboarding.revokeInvite, { code });
    await expect(student.mutation(api.onboarding.acceptInvite, { code })).rejects.toThrow();
  });
  it('blocks direct password actions and requires verified email for credential login', async () => {
    const { t } = await fixture();
    await expect(t.action(api.authNode.verifyCredentials, { email: 'student@example.com', password: 'password123' })).rejects.toThrow('UNAUTHORIZED');
    const service = t.withIdentity({ subject: 'corridor-auth-service', service: true });
    const user = await service.action(api.authNode.register, { email: 'new@example.com', name: 'New', password: 'password123' });
    expect(user?.role).toBe('student');
    expect(await service.action(api.authNode.verifyCredentials, { email: 'new@example.com', password: 'password123' })).toBeNull();
    await t.mutation(internal.onboarding.issueToken, { email: 'new@example.com', kind: 'verify', tokenHash: 'verify-hash' });
    expect(await t.mutation(internal.onboarding.consumeToken, { tokenHash: 'verify-hash', kind: 'verify' })).toBe(true);
    expect((await service.action(api.authNode.verifyCredentials, { email: 'new@example.com', password: 'password123' }))?.id).toBe(user?.id);
    expect(await service.action(api.authNode.verifyCredentials, { email: 'new@example.com', password: 'wrong-password' })).toBeNull();
  });
  it('OAuth email ownership revokes a password on an unverified account', async () => {
    const { t, ids } = await fixture();
    await t.run(ctx => ctx.db.patch(ids.student, { passwordHash: 'attacker-password', emailVerified: false }));
    const service = t.withIdentity({ subject: 'student@example.com', service: true });
    expect(await service.action(api.authNode.claimOAuth, { email: 'student@example.com' })).toBe(true);
    const user = await t.run(ctx => ctx.db.get(ids.student));
    expect(user?.passwordHash).toBeUndefined();
    expect(user?.emailVerified).toBe(true);
    expect(user?.sessionVersion).toBe(1);
  });
  it('throttles authentication in the database across repeated requests', async () => {
    const { t } = await fixture();
    for (let i = 0; i < 3; i++) await t.mutation(internal.onboarding.throttle, { key: 'mail:test', limit: 3, windowMs: 60000 });
    await expect(t.mutation(internal.onboarding.throttle, { key: 'mail:test', limit: 3, windowMs: 60000 })).rejects.toThrow();
  });
  it('rejects nonexistent invitations and records acceptance only once', async () => {
    const { admin, student, ids, t } = await fixture();
    await expect(student.mutation(api.onboarding.acceptInvite, { code: 'invented' })).rejects.toThrow();
    await t.run(ctx => ctx.db.insert('invites', { code: 'real-code', cohortId: ids.cohort, createdBy: ids.admin, createdAt: new Date().toISOString(), expiresAt: Date.now() + 10000 }));
    const first = await student.mutation(api.onboarding.acceptInvite, { code: 'real-code' });
    const second = await student.mutation(api.onboarding.acceptInvite, { code: 'real-code' });
    expect(first.enrollmentId).toBe(second.enrollmentId);
    expect((await admin.query(api.users.list, {}))).toHaveLength(4);
  });
  it('reset tokens expire, are single use, and change the stored password', async () => {
    const { t, ids } = await fixture();
    await t.mutation(internal.onboarding.issueToken, { email: 'student@example.com', kind: 'reset', tokenHash: 'hash' });
    expect(await t.mutation(internal.onboarding.consumeToken, { tokenHash: 'hash', kind: 'verify' })).toBe(false);
    expect(await t.mutation(internal.onboarding.consumeToken, { tokenHash: 'hash', kind: 'reset', passwordHash: 'new-hash' })).toBe(true);
    expect(await t.mutation(internal.onboarding.consumeToken, { tokenHash: 'hash', kind: 'reset', passwordHash: 'other' })).toBe(false);
    const user = await t.run(ctx => ctx.db.get(ids.student));
    expect(user?.passwordHash).toBe('new-hash');
    expect(user?.sessionVersion).toBe(1);
    await t.mutation(internal.onboarding.issueToken, { email: 'student@example.com', kind: 'reset', tokenHash: 'expired' });
    await t.run(async ctx => { const token = await ctx.db.query('authTokens').first(); await ctx.db.patch(token!._id, { expiresAt: 0 }); });
    expect(await t.mutation(internal.onboarding.consumeToken, { tokenHash: 'expired', kind: 'reset', passwordHash: 'other' })).toBe(false);
  });
});

describe('course ownership and visibility', () => {
  it('hides draft courses and lessons from anonymous callers and students', async () => {
    const { t, student, admin, ids } = await fixture();
    const course = await admin.mutation(api.courses.create, { title: 'Draft', programId: ids.program });
    const lesson = await admin.mutation(api.lessons.create, { courseId: course, title: 'Private', contentType: 'markdown', textContent: 'Private text', order: 1 });
    await expect(t.query(api.courses.list, {})).rejects.toThrow();
    expect(await student.query(api.courses.get, { id: course })).toBeNull();
    expect(await student.query(api.lessons.get, { id: lesson!.id })).toBeNull();
    await admin.mutation(api.courses.setStatus, { id: course, status: 'in_review' });
    await admin.mutation(api.courses.setStatus, { id: course, status: 'published' });
    expect((await student.query(api.lessons.get, { id: lesson!.id }))?.textContent).toBe('Private text');
  });
  it('limits instructor changes to owned courses and locks content during review', async () => {
    const { t, ids, admin } = await fixture();
    const instructorId = await t.run(ctx => ctx.db.insert('users', { name: 'Instructor', email: 'instructor@example.com', role: 'instructor', status: 'active' }));
    const instructor = t.withIdentity({ subject: 'instructor@example.com', sessionVersion: 0 });
    const course = await admin.mutation(api.courses.create, { title: 'Owned', programId: ids.program });
    await expect(instructor.mutation(api.courses.remove, { id: course })).rejects.toThrow();
    await admin.mutation(api.courses.assignOwner, { id: course, instructorId });
    await instructor.mutation(api.courses.setStatus, { id: course, status: 'in_review' });
    await expect(instructor.mutation(api.lessons.create, { courseId: course, title: 'Changed', contentType: 'markdown', order: 1 })).rejects.toThrow();
    await expect(instructor.mutation(api.courses.setStatus, { id: course, status: 'published' })).rejects.toThrow();
    await expect(instructor.mutation(api.tasks.create, { title: 'Other cohort', cohortId: ids.cohort, teamId: ids.teamA, teamName: 'A' })).rejects.toThrow();
  });
  it('keeps requested changes in review history and clears current approvals', async () => {
    const { admin, peer, ids } = await fixture();
    const task = await admin.mutation(api.tasks.create, { title: 'Build', teamId: ids.teamA, teamName: 'A', cohortId: ids.cohort });
    for (const to of ['Branched', 'Pushed', 'In Review'] as const) await admin.mutation(api.tasks.transition, { id: task.id, to });
    await peer.mutation(api.tasks.review, { id: task.id, status: 'approved', comment: 'Initially approved' });
    await peer.mutation(api.tasks.review, { id: task.id, status: 'changes_requested', comment: 'Fix the failing test' });
    const updated = await admin.query(api.tasks.get, { id: task.id });
    expect(updated.state).toBe('Pushed');
    expect(updated.approvalIds).toEqual([]);
    expect(updated.reviews.at(-1)?.comment).toBe('Fix the failing test');
  });
});
