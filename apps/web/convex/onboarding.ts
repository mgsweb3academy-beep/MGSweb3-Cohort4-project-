import { ConvexError, v } from 'convex/values';
import { internalMutation, mutation, query } from './_generated/server';
import { requireUser, requireCohortStaff } from './permissions';

const kind = v.union(v.literal('reset'), v.literal('verify'));
export const issueToken = internalMutation({
  args: { email: v.string(), kind, tokenHash: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db.query('users').withIndex('by_email', q => q.eq('email', args.email)).unique();
    if (!user || user.status !== 'active') return false;
    const previous = await ctx.db.query('authTokens').withIndex('by_user_kind', q => q.eq('userId', user._id).eq('kind', args.kind)).collect();
    for (const token of previous) await ctx.db.delete(token._id);
    await ctx.db.insert('authTokens', { userId: user._id, kind: args.kind, tokenHash: args.tokenHash, expiresAt: Date.now() + 30 * 60 * 1000 });
    return true;
  },
});
export const consumeToken = internalMutation({
  args: { tokenHash: v.string(), kind, passwordHash: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const token = await ctx.db.query('authTokens').withIndex('by_hash', q => q.eq('tokenHash', args.tokenHash)).unique();
    if (!token || token.kind !== args.kind || token.expiresAt <= Date.now()) return false;
    const user = await ctx.db.get(token.userId);
    if (!user || user.status !== 'active') return false;
    if (args.kind === 'reset') {
      if (!args.passwordHash) return false;
      await ctx.db.patch(user._id, { passwordHash: args.passwordHash, emailVerified: true, sessionVersion: (user.sessionVersion ?? 0) + 1 });
    } else await ctx.db.patch(user._id, { emailVerified: true });
    await ctx.db.delete(token._id);
    return true;
  },
});
export const getInvite = query({
  args: { code: v.string() },
  handler: async (ctx, { code }) => {
    const user = await requireUser(ctx);
    const invite = await ctx.db.query('invites').withIndex('by_code', q => q.eq('code', code)).unique();
    if (!invite || invite.revoked || invite.expiresAt <= Date.now() || (invite.email && invite.email !== user.email)) return null;
    return { code, cohortId: invite.cohortId, createdBy: invite.createdBy, createdAt: invite.createdAt };
  },
});
export const createInvite = internalMutation({
  args: { cohortId: v.id('cohorts'), email: v.optional(v.string()), teamId: v.optional(v.id('teams')), code: v.string() },
  handler: async (ctx, args) => {
    const { user } = await requireCohortStaff(ctx, args.cohortId);
    if (!await ctx.db.get(args.cohortId)) throw new Error('Cohort not found');
    if (args.teamId) {
      const team = await ctx.db.get(args.teamId);
      if (!team || team.cohortId !== args.cohortId) throw new Error('Team does not belong to this cohort');
    }
    const code = args.code;
    await ctx.db.insert('invites', { ...args, email: args.email?.trim().toLowerCase(), code, createdBy: user._id, createdAt: new Date().toISOString(), expiresAt: Date.now() + 7 * 86400000 });
    return { code };
  },
});
export const acceptInvite = mutation({
  args: { code: v.string() },
  handler: async (ctx, { code }) => {
    const user = await requireUser(ctx);
    const invite = await ctx.db.query('invites').withIndex('by_code', q => q.eq('code', code)).unique();
    if (!invite || invite.revoked || invite.expiresAt <= Date.now() || (invite.email && invite.email !== user.email)) throw new ConvexError({ code: 'FORBIDDEN', message: 'Invite is invalid or expired' });
    if (invite.email && !user.emailVerified) throw new ConvexError({ code: 'FORBIDDEN', message: 'Verify your email before accepting this invitation' });
    const existing = await ctx.db.query('enrollments').withIndex('by_cohort_user', q => q.eq('cohortId', invite.cohortId).eq('userId', user._id)).unique();
    const enrollmentId = existing?._id ?? await ctx.db.insert('enrollments', { cohortId: invite.cohortId, userId: user._id, teamId: invite.teamId });
    if (existing && invite.teamId && existing.teamId !== invite.teamId) await ctx.db.patch(existing._id, { teamId: invite.teamId });
    if (!existing) {
      const cohort = await ctx.db.get(invite.cohortId);
      if (cohort) await ctx.db.patch(cohort._id, { learnerCount: cohort.learnerCount + 1 });
    }
    return { success: true, cohortId: invite.cohortId, enrollmentId };
  },
});

export const throttle = internalMutation({
  args: { key: v.string(), limit: v.number(), windowMs: v.number() },
  handler: async (ctx, { key, limit, windowMs }) => {
    const bucket = await ctx.db.query('authThrottle').withIndex('by_key', q => q.eq('key', key)).unique();
    const now = Date.now();
    if (!bucket) { await ctx.db.insert('authThrottle', { key, count: 1, resetAt: now + windowMs }); return; }
    if (bucket.resetAt <= now) { await ctx.db.patch(bucket._id, { count: 1, resetAt: now + windowMs }); return; }
    if (bucket.count >= limit) throw new ConvexError({ code: 'TOO_MANY_REQUESTS', message: 'Try again later' });
    await ctx.db.patch(bucket._id, { count: bucket.count + 1 });
  },
});

export const revokeInvite = mutation({
  args: { code: v.string() }, handler: async (ctx, { code }) => {
    const invite = await ctx.db.query('invites').withIndex('by_code', q => q.eq('code', code)).unique();
    if (!invite) throw new Error('Invite not found');
    await requireCohortStaff(ctx, invite.cohortId);
    await ctx.db.patch(invite._id, { revoked: true });
  },
});
