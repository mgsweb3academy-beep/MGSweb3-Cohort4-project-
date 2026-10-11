import { ConvexError, v } from 'convex/values';
import { mutation, query, type QueryCtx } from './_generated/server';
import type { Doc } from './_generated/dataModel';
import { requireCohortStaff, requireUser } from './permissions';

const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

function statusFor(startDate: string, weekCount: number) {
  const start = new Date(startDate).getTime();
  const now = Date.now();
  if (now < start) return 'upcoming';
  if (now > start + weekCount * MS_PER_WEEK) return 'completed';
  return 'active';
}

function toCohort(cohort: Doc<'cohorts'>, program: Doc<'programs'> | null) {
  return {
    id: cohort._id as string,
    name: cohort.name,
    programId: cohort.programId as string,
    programName: program?.name ?? '',
    startDate: cohort.startDate,
    weekCount: cohort.weekCount,
    instructorId: (cohort.instructorId as string | undefined) ?? '',
    instructorName: cohort.instructorName,
    learnerCount: cohort.learnerCount,
    teamCount: cohort.teamCount,
    status: statusFor(cohort.startDate, cohort.weekCount),
  };
}

// Cohort ids the user may see: admins all, instructors the ones they own, students the ones they are enrolled in.
async function visibleCohortIds(ctx: QueryCtx, user: Doc<'users'>): Promise<Set<string> | 'all'> {
  if (user.role === 'admin') return 'all';
  if (user.role === 'instructor') {
    const cohorts = await ctx.db.query('cohorts').collect();
    return new Set(cohorts.filter((c) => c.instructorId === user._id).map((c) => c._id as string));
  }
  const enrollments = await ctx.db.query('enrollments').withIndex('by_user', (q) => q.eq('userId', user._id)).collect();
  return new Set(enrollments.map((e) => e.cohortId as string));
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    const visible = await visibleCohortIds(ctx, user);
    const cohorts = (await ctx.db.query('cohorts').order('desc').collect()).filter((c) => visible === 'all' || visible.has(c._id));
    return Promise.all(cohorts.map(async (cohort) => toCohort(cohort, await ctx.db.get(cohort.programId))));
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    programId: v.string(),
    startDate: v.string(),
    weekCount: v.number(),
    instructorName: v.optional(v.string()),
    instructorId: v.optional(v.id('users')),
  },
  handler: async (ctx, args) => {
    await requireUser(ctx, ['admin']);
    const programId = ctx.db.normalizeId('programs', args.programId);
    const program = programId ? await ctx.db.get(programId) : null;
    if (!program) throw new ConvexError({ code: 'NOT_FOUND', message: 'Program not found' });
    let instructorName = args.instructorName ?? 'Unassigned';
    if (args.instructorId) {
      const owner = await ctx.db.get(args.instructorId);
      if (!owner || owner.status !== 'active' || (owner.role !== 'instructor' && owner.role !== 'admin')) {
        throw new ConvexError({ code: 'VALIDATION_ERROR', message: 'Owner must be an active instructor or admin' });
      }
      instructorName = owner.name;
    }
    const id = await ctx.db.insert('cohorts', {
      name: args.name,
      programId: program._id,
      instructorId: args.instructorId,
      startDate: args.startDate,
      weekCount: args.weekCount,
      instructorName,
      learnerCount: 0,
      teamCount: 0,
    });
    const cohort = await ctx.db.get(id);
    return cohort ? toCohort(cohort, program) : null;
  },
});

// Admin-only: gives an existing (e.g. legacy, owner-less) cohort an instructor owner.
export const assignOwner = mutation({
  args: { id: v.string(), instructorId: v.id('users') },
  handler: async (ctx, { id, instructorId }) => {
    await requireUser(ctx, ['admin']);
    const cohortId = ctx.db.normalizeId('cohorts', id);
    if (!cohortId || !await ctx.db.get(cohortId)) throw new ConvexError({ code: 'NOT_FOUND', message: 'Cohort not found' });
    const owner = await ctx.db.get(instructorId);
    if (!owner || owner.status !== 'active' || (owner.role !== 'instructor' && owner.role !== 'admin')) {
      throw new ConvexError({ code: 'VALIDATION_ERROR', message: 'Owner must be an active instructor or admin' });
    }
    await ctx.db.patch(cohortId, { instructorId, instructorName: owner.name });
  },
});

export const listTeams = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    const visible = await visibleCohortIds(ctx, user);
    return (await ctx.db.query('teams').collect())
      .filter((t) => visible === 'all' || visible.has(t.cohortId))
      .map((t) => ({ id: t._id, name: t.name, cohortId: t.cohortId }));
  },
});

export const createTeam = mutation({
  args: { name: v.string(), cohortId: v.id('cohorts') },
  handler: async (ctx, args) => {
    const { cohort } = await requireCohortStaff(ctx, args.cohortId);
    if (!args.name.trim()) throw new ConvexError({ code: 'VALIDATION_ERROR', message: 'Team name is required' });
    const id = await ctx.db.insert('teams', { ...args, name: args.name.trim() });
    await ctx.db.patch(cohort._id, { teamCount: cohort.teamCount + 1 });
    return id;
  },
});

export const assignTeam = mutation({
  args: { userId: v.id('users'), teamId: v.id('teams') },
  handler: async (ctx, args) => {
    const team = await ctx.db.get(args.teamId);
    if (!team) throw new ConvexError({ code: 'NOT_FOUND', message: 'Team not found' });
    await requireCohortStaff(ctx, team.cohortId);
    const enrollment = await ctx.db.query('enrollments').withIndex('by_cohort_user', (q) => q.eq('cohortId', team.cohortId).eq('userId', args.userId)).unique();
    if (!enrollment) throw new ConvexError({ code: 'VALIDATION_ERROR', message: 'Learner is not enrolled' });
    await ctx.db.patch(enrollment._id, { teamId: args.teamId });
  },
});
