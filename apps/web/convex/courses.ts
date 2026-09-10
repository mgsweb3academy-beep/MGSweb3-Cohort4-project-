import { v } from 'convex/values';
import { mutation, query, type QueryCtx } from './_generated/server';
import type { Doc } from './_generated/dataModel';

async function toCourse(ctx: QueryCtx, course: Doc<'courses'>) {
  const program = await ctx.db.get(course.programId);
  const lessons = await ctx.db
    .query('lessons')
    .withIndex('by_course', (q) => q.eq('courseId', course._id))
    .collect();
  return {
    id: course._id as string,
    title: course.title,
    programId: course.programId as string,
    programName: program?.name ?? 'Unassigned',
    instructorId: 'inst_1',
    instructorName: course.instructorName,
    status: course.status,
    lessonCount: lessons.length,
    enrollmentCount: 0,
    rejectionReason: course.rejectionReason,
  };
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const courses = await ctx.db.query('courses').order('desc').collect();
    return Promise.all(courses.map((course) => toCourse(ctx, course)));
  },
});

export const get = query({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    const courseId = ctx.db.normalizeId('courses', id);
    const course = courseId ? await ctx.db.get(courseId) : null;
    return course ? toCourse(ctx, course) : null;
  },
});

export const create = mutation({
  args: { title: v.string() },
  handler: async (ctx, { title }) => {
    const program = await ctx.db.query('programs').first();
    if (!program) throw new Error('Create a program first');
    return await ctx.db.insert('courses', {
      title,
      programId: program._id,
      instructorName: 'Dr. Yemi F.',
      status: 'draft',
    });
  },
});

export const setStatus = mutation({
  args: {
    id: v.string(),
    status: v.union(v.literal('draft'), v.literal('in_review'), v.literal('published'), v.literal('rejected')),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, { id, status, reason }) => {
    const courseId = ctx.db.normalizeId('courses', id);
    if (!courseId) throw new Error('Course not found');
    await ctx.db.patch(courseId, { status, rejectionReason: status === 'rejected' ? reason : undefined });
  },
});

export const remove = mutation({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    const courseId = ctx.db.normalizeId('courses', id);
    if (!courseId) return;
    const lessons = await ctx.db
      .query('lessons')
      .withIndex('by_course', (q) => q.eq('courseId', courseId))
      .collect();
    await Promise.all(lessons.map((lesson) => ctx.db.delete(lesson._id)));
    await ctx.db.delete(courseId);
  },
});
