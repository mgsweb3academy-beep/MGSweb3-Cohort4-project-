import { ConvexError, v } from 'convex/values';
import { mutation, query, type QueryCtx } from './_generated/server';
import type { Doc } from './_generated/dataModel';
import { requireCourseStaff, requireUser } from './permissions';

function fail(code: string, message: string): never {
  throw new ConvexError({ code, message });
}

// Students see published courses only. Instructors also see their own courses; admins see everything.
export function canViewCourse(user: Doc<'users'>, course: Doc<'courses'>) {
  if (course.status === 'published' || user.role === 'admin') return true;
  return user.role === 'instructor' && course.instructorId === user._id;
}

// Instructors cannot change a course once it is published or waiting on review, so approved content
// cannot be swapped out without going back through the admin review. Admins are not restricted.
export function assertInstructorMayEdit(user: Doc<'users'>, course: Doc<'courses'>) {
  if (user.role === 'admin') return;
  if (course.status === 'published' || course.status === 'in_review') {
    fail('FORBIDDEN', 'Published or in-review courses cannot be edited by instructors');
  }
}

const instructorMoves: Record<string, string[]> = {
  draft: ['in_review'],
  rejected: ['draft', 'in_review'],
  in_review: ['draft'],
};

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
    instructorId: (course.instructorId as string | undefined) ?? '',
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
    const user = await requireUser(ctx);
    const courses = await ctx.db.query('courses').order('desc').collect();
    return Promise.all(courses.filter((course) => canViewCourse(user, course)).map((course) => toCourse(ctx, course)));
  },
});

export const get = query({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    const user = await requireUser(ctx);
    const courseId = ctx.db.normalizeId('courses', id);
    const course = courseId ? await ctx.db.get(courseId) : null;
    // Hidden courses look identical to missing ones.
    return course && canViewCourse(user, course) ? toCourse(ctx, course) : null;
  },
});

export const create = mutation({
  args: { title: v.string(), programId: v.optional(v.string()) },
  handler: async (ctx, { title, programId }) => {
    const user = await requireUser(ctx, ['instructor', 'admin']);
    if (!title.trim()) fail('VALIDATION_ERROR', 'Title is required');
    let program;
    if (programId) {
      const id = ctx.db.normalizeId('programs', programId);
      program = id ? await ctx.db.get(id) : null;
    } else {
      program = await ctx.db.query('programs').first();
    }
    if (!program) fail('VALIDATION_ERROR', programId ? 'Program not found' : 'Create a program first');
    return await ctx.db.insert('courses', {
      title: title.trim(),
      programId: program._id,
      instructorId: user._id,
      instructorName: user.name,
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
    const { user, course } = await requireCourseStaff(ctx, id);
    if (user.role === 'admin') {
      if ((status === 'published' || status === 'rejected') && course.status !== 'in_review') {
        fail('INVALID_TRANSITION', 'Only courses in review can be published or rejected');
      }
    } else if (!(instructorMoves[course.status] ?? []).includes(status)) {
      fail('FORBIDDEN', `Instructors cannot move a ${course.status} course to ${status}`);
    }
    await ctx.db.patch(course._id, { status, rejectionReason: status === 'rejected' ? reason : undefined });
  },
});

export const remove = mutation({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    const { user, course } = await requireCourseStaff(ctx, id);
    assertInstructorMayEdit(user, course);
    const lessons = await ctx.db
      .query('lessons')
      .withIndex('by_course', (q) => q.eq('courseId', course._id))
      .collect();
    for (const lesson of lessons) {
      const progress = await ctx.db
        .query('lessonProgress')
        .withIndex('by_lesson_user', (q) => q.eq('lessonId', lesson._id))
        .collect();
      await Promise.all(progress.map((row) => ctx.db.delete(row._id)));
      await ctx.db.delete(lesson._id);
    }
    await ctx.db.delete(course._id);
  },
});

// Admin-only: gives an existing (e.g. legacy, owner-less) course an instructor owner.
export const assignOwner = mutation({
  args: { id: v.string(), instructorId: v.id('users') },
  handler: async (ctx, { id, instructorId }) => {
    await requireUser(ctx, ['admin']);
    const courseId = ctx.db.normalizeId('courses', id);
    if (!courseId || !await ctx.db.get(courseId)) fail('NOT_FOUND', 'Course not found');
    const owner = await ctx.db.get(instructorId);
    if (!owner || owner.status !== 'active' || (owner.role !== 'instructor' && owner.role !== 'admin')) {
      fail('VALIDATION_ERROR', 'Owner must be an active instructor or admin');
    }
    await ctx.db.patch(courseId, { instructorId, instructorName: owner.name });
  },
});
