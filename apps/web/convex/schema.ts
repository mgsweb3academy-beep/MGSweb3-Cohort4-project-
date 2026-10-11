import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  teams: defineTable({ name: v.string(), cohortId: v.id('cohorts') }).index('by_cohort', ['cohortId']),
  tasks: defineTable({
    title: v.string(), description: v.optional(v.string()),
    teamId: v.string(), teamName: v.string(), cohortId: v.string(),
    lessonId: v.optional(v.string()), lessonTitle: v.optional(v.string()),
    priority: v.union(v.literal('low'), v.literal('medium'), v.literal('high')),
    state: v.union(v.literal('Assigned'), v.literal('Branched'), v.literal('Pushed'), v.literal('In Review'), v.literal('Closed')),
    dueDate: v.optional(v.string()), createdAt: v.string(), updatedAt: v.string(), closedAt: v.optional(v.string()),
    transitions: v.array(v.object({ from: v.union(v.string(), v.null()), to: v.string(), at: v.string(), by: v.string(), byName: v.string() })),
    approvalIds: v.optional(v.array(v.string())),
    reviews: v.array(v.object({ id: v.string(), taskId: v.string(), reviewerId: v.string(), reviewerName: v.string(), status: v.union(v.literal('approved'), v.literal('changes_requested')), comment: v.string(), createdAt: v.string() })),
  }).index('by_cohort', ['cohortId']),
  enrollments: defineTable({ userId: v.id('users'), cohortId: v.id('cohorts'), teamId: v.optional(v.string()) }).index('by_user', ['userId']).index('by_cohort_user', ['cohortId', 'userId']),
  invites: defineTable({ revoked: v.optional(v.boolean()), teamId: v.optional(v.id('teams')), code: v.string(), cohortId: v.id('cohorts'), createdBy: v.id('users'), createdAt: v.string(), expiresAt: v.number(), email: v.optional(v.string()) }).index('by_code', ['code']),
  authThrottle: defineTable({ key: v.string(), count: v.number(), resetAt: v.number() }).index('by_key', ['key']),
  authTokens: defineTable({ tokenHash: v.string(), userId: v.id('users'), kind: v.union(v.literal('reset'), v.literal('verify')), expiresAt: v.number() }).index('by_hash', ['tokenHash']).index('by_user_kind', ['userId', 'kind']),
  users: defineTable({
    emailVerified: v.optional(v.boolean()),
    sessionVersion: v.optional(v.number()),
    email: v.string(),
    name: v.string(),
    role: v.string(), // student | instructor | admin
    status: v.string(), // active | suspended
    passwordHash: v.optional(v.string()),
    githubUsername: v.optional(v.string()),
    suspendedAt: v.optional(v.string()),
    suspensionReason: v.optional(v.string()),
  }).index('by_email', ['email']),

  programs: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    weekCount: v.number(),
  }),

  courses: defineTable({
    instructorId: v.optional(v.id('users')),
    title: v.string(),
    programId: v.id('programs'),
    instructorName: v.string(),
    status: v.string(), // draft | in_review | published | rejected
    rejectionReason: v.optional(v.string()),
  }),

  lessons: defineTable({
    courseId: v.id('courses'),
    title: v.string(),
    contentType: v.string(), // video | pdf | markdown | audio | code
    contentUrl: v.optional(v.string()),
    textContent: v.optional(v.string()),
    order: v.number(),
  }).index('by_course', ['courseId']),

  cohorts: defineTable({
    instructorId: v.optional(v.id('users')),
    name: v.string(),
    programId: v.id('programs'),
    startDate: v.string(), // YYYY-MM-DD
    weekCount: v.number(),
    instructorName: v.string(),
    learnerCount: v.number(),
    teamCount: v.number(),
  }),

  lessonProgress: defineTable({
    lessonId: v.id('lessons'),
    userId: v.string(),
    lastPosition: v.number(),
    isCompleted: v.boolean(),
    bookmarks: v.array(v.object({ id: v.string(), position: v.number(), label: v.string() })),
    notes: v.array(v.object({ id: v.string(), position: v.number(), content: v.string() })),
  }).index('by_lesson_user', ['lessonId', 'userId']),
});
