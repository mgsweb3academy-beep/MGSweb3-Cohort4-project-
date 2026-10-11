'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { ForbiddenException, NotFoundException, BadRequestException } = require('@nestjs/common');
const { TasksService } = require('../dist/modules/tasks/tasks.service');
const { mockPrisma, now, student, instructor, admin } = require('./helpers');

const dbTask = (overrides = {}) => ({
  id: 't1', title: 'Task', teamId: 'team-1', cohortId: 'cohort-1', state: 'Assigned',
  createdAt: now, updatedAt: now, closedAt: null, team: { name: 'Team' }, ...overrides,
});

test('students only query tasks of teams they belong to; staff are unscoped', async () => {
  const m = mockPrisma({ 'task.findMany': [] });
  const service = new TasksService(m.prisma);
  await service.getTasks(student, {});
  assert.deepEqual(m.lastArgs('task.findMany').where, { team: { members: { some: { userId: 'student-1' } } } });
  await service.getTasks(instructor, {});
  assert.deepEqual(m.lastArgs('task.findMany').where, {});
});

test("the 'In Review' filter maps to the Prisma enum value InReview", async () => {
  const m = mockPrisma({ 'task.findMany': [] });
  await new TasksService(m.prisma).getTasks(admin, { state: 'In Review' });
  assert.equal(m.lastArgs('task.findMany').where.state, 'InReview');
});

test('a task outside the student scope is reported as not found', async () => {
  const m = mockPrisma({ 'task.findFirst': null });
  await assert.rejects(new TasksService(m.prisma).getTaskById('t1', student), NotFoundException);
  assert.deepEqual(m.lastArgs('task.findFirst').where.team, { members: { some: { userId: 'student-1' } } });
});

test('a student cannot close a task', async () => {
  const m = mockPrisma({
    'task.findFirst': dbTask({ state: 'InReview' }),
    'cohort.findUnique': { id: 'cohort-1', instructorId: 'instructor-1' },
  });
  await assert.rejects(new TasksService(m.prisma).updateTaskState('t1', 'Closed', student), ForbiddenException);
  assert.equal(m.argsOf('task.update').length, 0);
});

test("an instructor of another cohort cannot close a task, the cohort's instructor can", async () => {
  const impl = {
    'task.findFirst': dbTask({ state: 'InReview' }),
    'cohort.findUnique': { id: 'cohort-1', instructorId: 'instructor-1' },
    'task.update': (args) => dbTask({ state: args.data.state, closedAt: args.data.closedAt }),
  };
  const m = mockPrisma(impl);
  const service = new TasksService(m.prisma);
  await assert.rejects(service.updateTaskState('t1', 'Closed', { id: 'instructor-2', role: 'instructor' }), ForbiddenException);
  const closed = await service.updateTaskState('t1', 'Closed', instructor);
  assert.equal(closed.state, 'Closed');
});

test("team members can move a task into review, stored as InReview and returned as 'In Review'", async () => {
  const m = mockPrisma({
    'task.findFirst': dbTask({ state: 'Pushed' }),
    'task.update': (args) => dbTask({ state: args.data.state }),
  });
  const result = await new TasksService(m.prisma).updateTaskState('t1', 'In Review', student);
  assert.equal(m.lastArgs('task.update').data.state, 'InReview');
  assert.equal(result.state, 'In Review');
});

test('invalid transitions are rejected using the API state names', async () => {
  const m = mockPrisma({ 'task.findFirst': dbTask({ state: 'InReview' }) });
  await assert.rejects(new TasksService(m.prisma).updateTaskState('t1', 'Assigned', admin), BadRequestException);
});

test('creating a task requires the cohort instructor and a team from the same cohort', async () => {
  const m = mockPrisma({
    'cohort.findUnique': { id: 'cohort-1', instructorId: 'instructor-1' },
    'team.findUnique': { id: 'team-9', cohortId: 'cohort-2' },
  });
  const service = new TasksService(m.prisma);
  await assert.rejects(service.createTask({ title: 'x', teamId: 'team-9', cohortId: 'cohort-1' }, { id: 'instructor-2', role: 'instructor' }), ForbiddenException);
  await assert.rejects(service.createTask({ title: 'x', teamId: 'team-9', cohortId: 'cohort-1' }, instructor), BadRequestException);
  assert.equal(m.argsOf('task.create').length, 0);
});
