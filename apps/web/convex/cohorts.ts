import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import type { Doc } from './_generated/dataModel';

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
    instructorName: cohort.instructorName,
    learnerCount: cohort.learnerCount,
    teamCount: cohort.teamCount,
    status: statusFor(cohort.startDate, cohort.weekCount),
  };
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const cohorts = await ctx.db.query('cohorts').order('desc').collect();
    return Promise.all(cohorts.map(async (cohort) => toCohort(cohort, await ctx.db.get(cohort.programId))));
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    programId: v.string(),
    startDate: v.string(),
    weekCount: v.number(),
    instructorName: v.string(),
  },
  handler: async (ctx, args) => {
    const programId = ctx.db.normalizeId('programs', args.programId);
    const program = programId ? await ctx.db.get(programId) : null;
    if (!program) throw new Error('Program not found');
    const id = await ctx.db.insert('cohorts', {
      name: args.name,
      programId: program._id,
      startDate: args.startDate,
      weekCount: args.weekCount,
      instructorName: args.instructorName,
      learnerCount: 0,
      teamCount: 0,
    });
    const cohort = await ctx.db.get(id);
    return cohort ? toCohort(cohort, program) : null;
  },
});
