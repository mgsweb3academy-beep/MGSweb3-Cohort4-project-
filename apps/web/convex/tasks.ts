import { ConvexError, v } from 'convex/values';
import { mutation, query, type QueryCtx } from './_generated/server';
import type { Doc } from './_generated/dataModel';
import { requireUser, requireCohortStaff } from './permissions';

const state = v.union(v.literal('Assigned'), v.literal('Branched'), v.literal('Pushed'), v.literal('In Review'), v.literal('Closed'));
const priority = v.union(v.literal('low'), v.literal('medium'), v.literal('high'));
const nextStates: Record<string, string[]> = {
  Assigned: ['Branched'], Branched: ['Pushed'], Pushed: ['In Review'], 'In Review': ['Closed', 'Pushed'], Closed: ['Assigned'],
};
function fail(code: string, message: string): never { throw new ConvexError({ code, message }); }
function publicTask(task: Doc<'tasks'>) { const { _id, _creationTime: _time, ...fields } = task; return { id: _id, ...fields }; }
async function membership(ctx: QueryCtx, user: Doc<'users'>, cohortId: string) {
  const id = ctx.db.normalizeId('cohorts', cohortId);
  return id ? ctx.db.query('enrollments').withIndex('by_cohort_user', q => q.eq('cohortId', id).eq('userId', user._id)).unique() : null;
}
async function load(ctx: QueryCtx, id: string, user: Doc<'users'>) {
  const taskId = ctx.db.normalizeId('tasks', id);
  const task = taskId ? await ctx.db.get(taskId) : null;
  if (!task) fail('NOT_FOUND', 'Task not found');
  if (user.role === 'instructor') await requireCohortStaff(ctx, task.cohortId);
  if (user.role === 'student' && !await membership(ctx, user, task.cohortId)) fail('FORBIDDEN', 'You are not enrolled in this cohort');
  return task;
}
const metadata = { title: v.optional(v.string()), description: v.optional(v.string()), priority: v.optional(priority), dueDate: v.optional(v.string()), lessonId: v.optional(v.string()), lessonTitle: v.optional(v.string()) };

export const list = query({
  args: { cohortId: v.optional(v.string()), teamId: v.optional(v.string()), state: v.optional(state), cursor: v.optional(v.number()), limit: v.optional(v.number()) },
  handler: async (ctx, filters) => {
    const user = await requireUser(ctx);
    const enrollments = user.role === 'student' ? await ctx.db.query('enrollments').withIndex('by_user', q => q.eq('userId', user._id)).collect() : [];
    const owned = user.role === 'instructor' ? (await ctx.db.query('cohorts').collect()).filter(c => c.instructorId === user._id) : [];
    const allowed = new Set(user.role === 'instructor' ? owned.map(c => c._id as string) : enrollments.map(e => e.cohortId as string));
    let tasks = filters.cohortId
      ? await ctx.db.query('tasks').withIndex('by_cohort', q => q.eq('cohortId', filters.cohortId!)).collect()
      : await ctx.db.query('tasks').collect();
    tasks = tasks.filter(t => (user.role === 'admin' || allowed.has(t.cohortId)) && (!filters.teamId || t.teamId === filters.teamId) && (!filters.state || t.state === filters.state));
    tasks.sort((a, b) => Number(a.state === 'Closed') - Number(b.state === 'Closed') || b.updatedAt.localeCompare(a.updatedAt));
    const cursor = Math.max(0, Math.floor(filters.cursor ?? 0));
    const limit = Math.max(1, Math.min(100, Math.floor(filters.limit ?? 20)));
    return { tasks: tasks.slice(cursor, cursor + limit).map(publicTask), total: tasks.length, nextCursor: cursor + limit < tasks.length ? cursor + limit : undefined };
  },
});
export const get = query({ args: { id: v.string() }, handler: async (ctx, { id }) => publicTask(await load(ctx, id, await requireUser(ctx))) });
export const create = mutation({
  args: { ...metadata, teamId: v.string(), teamName: v.string(), cohortId: v.string() },
  handler: async (ctx, args) => {
    const { user } = await requireCohortStaff(ctx, args.cohortId);
    if (!args.title?.trim() || !args.teamId.trim()) fail('VALIDATION_ERROR', 'Title and team are required');
    const cohortId = ctx.db.normalizeId('cohorts', args.cohortId);
    if (!cohortId || !await ctx.db.get(cohortId)) fail('VALIDATION_ERROR', 'Cohort not found');
    const teamId = ctx.db.normalizeId('teams', args.teamId);
    const team = teamId ? await ctx.db.get(teamId) : null;
    if (!team || team.cohortId !== cohortId) fail('VALIDATION_ERROR', 'Team does not belong to this cohort');
    const now = new Date().toISOString();
    const id = await ctx.db.insert('tasks', { ...args, title: args.title.trim(), teamName: team.name, priority: args.priority ?? 'medium', state: 'Assigned', createdAt: now, updatedAt: now, reviews: [], transitions: [{ from: null, to: 'Assigned', at: now, by: user._id, byName: user.name }] });
    return publicTask((await ctx.db.get(id))!);
  },
});
export const update = mutation({
  args: { id: v.string(), ...metadata },
  handler: async (ctx, { id, ...fields }) => {
    const task = await load(ctx, id, await requireUser(ctx, ['instructor', 'admin']));
    await requireCohortStaff(ctx, task.cohortId);
    if (fields.title !== undefined && !fields.title.trim()) fail('VALIDATION_ERROR', 'Title cannot be empty');
    const patch = Object.fromEntries(Object.entries(fields).filter(([, value]) => value !== undefined));
    await ctx.db.patch(task._id, { ...patch, updatedAt: new Date().toISOString() });
    return publicTask((await ctx.db.get(task._id))!);
  },
});
export const remove = mutation({ args: { id: v.string() }, handler: async (ctx, { id }) => {
  const task = await load(ctx, id, await requireUser(ctx, ['instructor', 'admin']));
  await ctx.db.delete(task._id);
} });
export const transition = mutation({
  args: { id: v.string(), to: state },
  handler: async (ctx, { id, to }) => {
    const user = await requireUser(ctx);
    const task = await load(ctx, id, user);
    if (user.role === 'student') {
      const member = await membership(ctx, user, task.cohortId);
      if (member?.teamId !== task.teamId || to === 'Closed' || to === 'Assigned') fail('FORBIDDEN', 'This transition requires instructor permission');
    }
    if (user.role !== 'student') await requireCohortStaff(ctx, task.cohortId);
    if (!nextStates[task.state].includes(to)) fail('INVALID_TRANSITION', `Cannot move from ${task.state} to ${to}`);
    if (to === 'Closed' && new Set(task.approvalIds ?? []).size < 2) fail('INSUFFICIENT_REVIEWS', 'Two distinct peer approvals are required');
    const now = new Date().toISOString();
    await ctx.db.patch(task._id, { state: to, updatedAt: now, closedAt: to === 'Closed' ? now : undefined, approvalIds: to === 'Pushed' || to === 'Assigned' ? [] : task.approvalIds ?? [], transitions: [...task.transitions, { from: task.state, to, at: now, by: user._id, byName: user.name }] });
    return publicTask((await ctx.db.get(task._id))!);
  },
});
export const review = mutation({
  args: { id: v.string(), status: v.union(v.literal('approved'), v.literal('changes_requested')), comment: v.string() },
  handler: async (ctx, { id, status, comment }) => {
    const user = await requireUser(ctx);
    const task = await load(ctx, id, user);
    if (task.state !== 'In Review') fail('INVALID_STATE', 'Task is not in review');
    if (!comment.trim()) fail('VALIDATION_ERROR', 'Review comment is required');
    const member = await membership(ctx, user, task.cohortId);
    if (member?.teamId === task.teamId) fail('FORBIDDEN', 'You cannot review your own team');
    const now = new Date().toISOString();
    const review = { id: `${user._id}:${now}`, taskId: id, reviewerId: user._id, reviewerName: user.name, status, comment: comment.trim(), createdAt: now };
    await ctx.db.patch(task._id, { reviews: [...task.reviews, review], approvalIds: status === 'approved' && user.role === 'student' ? [...new Set([...(task.approvalIds ?? []), user._id])] : task.approvalIds ?? [], updatedAt: now,
      ...(status === 'changes_requested' ? { state: 'Pushed' as const, approvalIds: [], transitions: [...task.transitions, { from: task.state, to: 'Pushed', at: now, by: user._id, byName: user.name }] } : {}) });
    return { task: publicTask((await ctx.db.get(task._id))!), review };
  },
});
