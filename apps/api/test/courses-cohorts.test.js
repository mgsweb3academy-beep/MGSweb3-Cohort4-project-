'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { ForbiddenException, NotFoundException } = require('@nestjs/common');
const { CoursesService } = require('../dist/modules/courses/courses.service');
const { CohortsService } = require('../dist/modules/cohorts/cohorts.service');
const { ContributionsService } = require('../dist/modules/contributions/contributions.service');
const { mockPrisma, student, instructor, otherInstructor, admin } = require('./helpers');

const course = (overrides = {}) => ({ id: 'c1', title: 'Course', programId: 'p1', instructorId: 'instructor-1', status: 'draft', ...overrides });

test('course listing is limited to published courses for students, plus own courses for instructors', async () => {
  const m = mockPrisma({ 'course.findMany': [] });
  const service = new CoursesService(m.prisma);
  await service.getCourses(student);
  assert.deepEqual(m.lastArgs('course.findMany').where, { status: 'published' });
  await service.getCourses(instructor);
  assert.deepEqual(m.lastArgs('course.findMany').where, { OR: [{ status: 'published' }, { instructorId: 'instructor-1' }] });
  await service.getCourses(admin);
  assert.deepEqual(m.lastArgs('course.findMany').where, {});
});

test('a draft course is not found for a student', async () => {
  const m = mockPrisma({ 'course.findFirst': null });
  await assert.rejects(new CoursesService(m.prisma).getCourseById('c1', student), NotFoundException);
  assert.equal(m.lastArgs('course.findFirst').where.status, 'published');
});

test("an instructor cannot submit or edit another instructor's course", async () => {
  const m = mockPrisma({ 'course.findUnique': course(), 'lesson.findUnique': { id: 'l1', courseId: 'c1' } });
  const service = new CoursesService(m.prisma);
  await assert.rejects(service.requestReview('c1', otherInstructor), ForbiddenException);
  await assert.rejects(service.createLesson({ courseId: 'c1', title: 'x', contentType: 'markdown' }, otherInstructor), ForbiddenException);
  await assert.rejects(service.updateLesson('l1', { title: 'x' }, otherInstructor), ForbiddenException);
  assert.equal(m.argsOf('lesson.create').length + m.argsOf('lesson.update').length + m.argsOf('course.update').length, 0);
});

test('the owning instructor can request review', async () => {
  const m = mockPrisma({ 'course.findUnique': course(), 'course.update': (a) => ({ ...course(), ...a.data }) });
  const result = await new CoursesService(m.prisma).requestReview('c1', instructor);
  assert.equal(result.status, 'in_review');
});

test('lesson progress update only writes whitelisted fields and requires a readable lesson', async () => {
  const m = mockPrisma({
    'lesson.findUnique': { id: 'l1', courseId: 'c1', course: course({ status: 'published' }) },
    'lessonProgress.upsert': {},
  });
  await new CoursesService(m.prisma).updateLessonProgress('l1', student, { lastPosition: 5, userId: 'someone-else', lessonId: 'l9' });
  const args = m.lastArgs('lessonProgress.upsert');
  assert.deepEqual(Object.keys(args.update).sort(), ['isCompleted', 'lastPosition']);
  assert.equal(args.where.lessonId_userId.userId, 'student-1');

  const hidden = mockPrisma({ 'lesson.findUnique': { id: 'l1', courseId: 'c1', course: course({ status: 'draft' }) } });
  await assert.rejects(new CoursesService(hidden.prisma).updateLessonProgress('l1', student, {}), NotFoundException);
});

test('cohort and team listings never select whole user rows (no passwordHash)', async () => {
  const m = mockPrisma({ 'cohort.findMany': [], 'cohort.findFirst': { id: 'k1' }, 'team.findMany': [] });
  const service = new CohortsService(m.prisma);
  await service.getCohorts(student);
  const include = m.lastArgs('cohort.findMany').include;
  assert.ok(include.members.include.user.select);
  assert.equal(include.members.include.user.select.passwordHash, undefined);
  assert.deepEqual(m.lastArgs('cohort.findMany').where, { members: { some: { userId: 'student-1' } } });
  await service.getTeamsByCohort('k1', student);
  assert.ok(m.lastArgs('team.findMany').include.members.include.user.select);
});

test('students cannot list teams of cohorts they do not belong to', async () => {
  const m = mockPrisma({ 'cohort.findFirst': null });
  await assert.rejects(new CohortsService(m.prisma).getTeamsByCohort('k1', student), NotFoundException);
});

test("only the cohort's instructor or an admin can create teams", async () => {
  const m = mockPrisma({ 'cohort.findUnique': { id: 'k1', instructorId: 'instructor-1' }, 'team.create': { id: 'tm1' } });
  const service = new CohortsService(m.prisma);
  await assert.rejects(service.createTeam('k1', { name: 'A', memberUserIds: [] }, otherInstructor), ForbiddenException);
  await service.createTeam('k1', { name: 'A', memberUserIds: [] }, instructor);
  await service.createTeam('k1', { name: 'A', memberUserIds: [] }, admin);
  assert.equal(m.argsOf('team.create').length, 2);
});

test('students can only read their own contributions regardless of learnerId', async () => {
  const m = mockPrisma({ 'contribution.findMany': [] });
  const service = new ContributionsService(m.prisma);
  await service.getContributions(student, 'k1', 'someone-else');
  assert.equal(m.lastArgs('contribution.findMany').where.learnerId, 'student-1');
  await service.getContributions(instructor, 'k1', 'someone-else');
  assert.equal(m.lastArgs('contribution.findMany').where.learnerId, 'someone-else');
});
