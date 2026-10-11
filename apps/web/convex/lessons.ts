import { ConvexError, v } from 'convex/values';
import { mutation, query } from './_generated/server';
import type { Doc } from './_generated/dataModel';
import { requireCourseStaff, requireUser } from './permissions';
import { assertInstructorMayEdit, canViewCourse } from './courses';

const CONTENT_TYPES = ['video', 'pdf', 'markdown', 'audio', 'code'];

function fail(code: string, message: string): never {
  throw new ConvexError({ code, message });
}

function toLesson(lesson: Doc<'lessons'>) {
  return {
    id: lesson._id as string,
    courseId: lesson.courseId as string,
    title: lesson.title,
    contentType: lesson.contentType,
    contentUrl: lesson.contentUrl,
    textContent: lesson.textContent,
    order: lesson.order,
  };
}

const lessonFields = {
  title: v.string(),
  contentType: v.string(),
  contentUrl: v.optional(v.string()),
  textContent: v.optional(v.string()),
  order: v.number(),
};

// Only http(s) links are accepted so a lesson cannot carry a javascript: or data: URL into the players.
function validateFields(fields: { title: string; contentType: string; contentUrl?: string }) {
  if (!fields.title.trim()) fail('VALIDATION_ERROR', 'Title is required');
  if (!CONTENT_TYPES.includes(fields.contentType)) fail('VALIDATION_ERROR', 'Unknown content type');
  if (fields.contentUrl) {
    let protocol = '';
    try { protocol = new URL(fields.contentUrl).protocol; } catch { /* rejected below */ }
    if (protocol !== 'http:' && protocol !== 'https:') fail('VALIDATION_ERROR', 'Content URL must be an http(s) link');
  }
}

export const listByCourse = query({
  args: { courseId: v.string() },
  handler: async (ctx, { courseId }) => {
    const user = await requireUser(ctx);
    const id = ctx.db.normalizeId('courses', courseId);
    const course = id ? await ctx.db.get(id) : null;
    if (!id || !course || !canViewCourse(user, course)) return [];
    const lessons = await ctx.db
      .query('lessons')
      .withIndex('by_course', (q) => q.eq('courseId', id))
      .collect();
    return lessons.sort((a, b) => a.order - b.order).map(toLesson);
  },
});

export const get = query({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    const user = await requireUser(ctx);
    const lessonId = ctx.db.normalizeId('lessons', id);
    const lesson = lessonId ? await ctx.db.get(lessonId) : null;
    const course = lesson ? await ctx.db.get(lesson.courseId) : null;
    return lesson && course && canViewCourse(user, course) ? toLesson(lesson) : null;
  },
});

export const create = mutation({
  args: { courseId: v.string(), ...lessonFields },
  handler: async (ctx, { courseId, ...fields }) => {
    const { user, course } = await requireCourseStaff(ctx, courseId);
    assertInstructorMayEdit(user, course);
    validateFields(fields);
    const lessonId = await ctx.db.insert('lessons', { courseId: course._id, ...fields });
    const lesson = await ctx.db.get(lessonId);
    return lesson ? toLesson(lesson) : null;
  },
});

export const update = mutation({
  args: { id: v.string(), ...lessonFields },
  handler: async (ctx, { id, ...fields }) => {
    const lessonId = ctx.db.normalizeId('lessons', id);
    const existing = lessonId ? await ctx.db.get(lessonId) : null;
    if (!lessonId || !existing) fail('NOT_FOUND', 'Lesson not found');
    const { user, course } = await requireCourseStaff(ctx, existing.courseId);
    assertInstructorMayEdit(user, course);
    validateFields(fields);
    await ctx.db.patch(lessonId, fields);
    const lesson = await ctx.db.get(lessonId);
    return lesson ? toLesson(lesson) : null;
  },
});
