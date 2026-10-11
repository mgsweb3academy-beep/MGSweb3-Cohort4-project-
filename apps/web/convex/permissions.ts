import { ConvexError } from 'convex/values';
import type { QueryCtx, MutationCtx } from './_generated/server';

export async function requireUser(ctx: QueryCtx | MutationCtx, roles?: string[]) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new ConvexError({ code: 'UNAUTHORIZED', message: 'Sign in required' });
  const user = await ctx.db.query('users').withIndex('by_email', q => q.eq('email', identity.subject)).unique();
  if (!user || user.status !== 'active') throw new ConvexError({ code: 'FORBIDDEN', message: 'Account unavailable' });
  if (identity.sessionVersion !== (user.sessionVersion ?? 0)) throw new ConvexError({ code: 'UNAUTHORIZED', message: 'Session expired' });
  if (roles && !roles.includes(user.role)) throw new ConvexError({ code: 'FORBIDDEN', message: 'Permission denied' });
  return user;
}

export async function requireCohortStaff(ctx: QueryCtx | MutationCtx, cohortId: string) {
  const user = await requireUser(ctx, ['admin', 'instructor']);
  const id = ctx.db.normalizeId('cohorts', cohortId);
  const cohort = id ? await ctx.db.get(id) : null;
  if (!cohort) throw new ConvexError({ code: 'NOT_FOUND', message: 'Cohort not found' });
  if (user.role !== 'admin' && cohort.instructorId !== user._id) throw new ConvexError({ code: 'FORBIDDEN', message: 'You do not manage this cohort' });
  return { user, cohort };
}
export async function requireCourseStaff(ctx: QueryCtx | MutationCtx, courseId: string) {
  const user = await requireUser(ctx, ['admin', 'instructor']);
  const id = ctx.db.normalizeId('courses', courseId);
  const course = id ? await ctx.db.get(id) : null;
  if (!course) throw new ConvexError({ code: 'NOT_FOUND', message: 'Course not found' });
  if (user.role !== 'admin' && course.instructorId !== user._id) throw new ConvexError({ code: 'FORBIDDEN', message: 'You do not manage this course' });
  return { user, course };
}
