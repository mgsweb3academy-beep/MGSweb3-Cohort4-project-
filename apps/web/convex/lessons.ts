import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import type { Doc } from './_generated/dataModel';

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

export const listByCourse = query({
  args: { courseId: v.string() },
  handler: async (ctx, { courseId }) => {
    const id = ctx.db.normalizeId('courses', courseId);
    if (!id) return [];
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
    const lessonId = ctx.db.normalizeId('lessons', id);
    const lesson = lessonId ? await ctx.db.get(lessonId) : null;
    return lesson ? toLesson(lesson) : null;
  },
});

export const create = mutation({
  args: { courseId: v.string(), ...lessonFields },
  handler: async (ctx, { courseId, ...fields }) => {
    const id = ctx.db.normalizeId('courses', courseId);
    if (!id) throw new Error('Course not found');
    const lessonId = await ctx.db.insert('lessons', { courseId: id, ...fields });
    const lesson = await ctx.db.get(lessonId);
    return lesson ? toLesson(lesson) : null;
  },
});

export const update = mutation({
  args: { id: v.string(), ...lessonFields },
  handler: async (ctx, { id, ...fields }) => {
    const lessonId = ctx.db.normalizeId('lessons', id);
    if (!lessonId) throw new Error('Lesson not found');
    await ctx.db.patch(lessonId, fields);
    const lesson = await ctx.db.get(lessonId);
    return lesson ? toLesson(lesson) : null;
  },
});
