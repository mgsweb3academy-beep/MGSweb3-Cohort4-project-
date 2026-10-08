import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  users: defineTable({
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
