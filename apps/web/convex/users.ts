import { requireUser } from './permissions';
import { v } from 'convex/values';
import { internalMutation, internalQuery, mutation, query } from './_generated/server';
import type { Doc } from './_generated/dataModel';

function toPublicUser(user: Doc<'users'>) {
  return {
    id: user._id as string,
    sessionVersion: user.sessionVersion ?? 0,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    githubUsername: user.githubUsername,
    joinedAt: new Date(user._creationTime).toISOString(),
    cohortIds: [] as string[],
    suspendedAt: user.suspendedAt,
    suspensionReason: user.suspensionReason,
  };
}

export type PublicUser = ReturnType<typeof toPublicUser>;

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || identity.subject !== email) throw new Error('UNAUTHORIZED');
    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', email))
      .unique();
    if (!user) return null;
    const enrollments = await ctx.db.query('enrollments').withIndex('by_user', q => q.eq('userId', user._id)).collect();
    return { ...toPublicUser(user), cohortIds: enrollments.map(e => e.cohortId as string) };
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireUser(ctx, ['admin']);
    const users = await ctx.db.query('users').collect();
    return users.map(toPublicUser);
  },
});

export const setStatus = mutation({
  args: {
    id: v.string(),
    status: v.union(v.literal('active'), v.literal('suspended')),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, { id, status, reason }) => {
    const actor = await requireUser(ctx, ['admin']);
    const userId = ctx.db.normalizeId('users', id);
    const user = userId ? await ctx.db.get(userId) : null;
    if (!user || !userId) throw new Error('User not found');
    if (userId === actor._id && status === 'suspended') throw new Error('Cannot suspend yourself');
    if (status === 'suspended') {
      await ctx.db.patch(userId, { status, sessionVersion: (user.sessionVersion ?? 0) + 1, suspendedAt: new Date().toISOString(), suspensionReason: reason });
    } else {
      await ctx.db.patch(userId, { status, suspendedAt: undefined, suspensionReason: undefined });
    }
  },
});

export const setRole = mutation({
  args: {
    id: v.string(),
    role: v.union(v.literal('student'), v.literal('instructor'), v.literal('admin')),
  },
  handler: async (ctx, { id, role }) => {
    const actor = await requireUser(ctx, ['admin']);
    if (id === actor._id && role !== 'admin') throw new Error('Cannot demote yourself');
    const userId = ctx.db.normalizeId('users', id);
    if (!userId) throw new Error('User not found');
    await ctx.db.patch(userId, { role });
  },
});

// Internal only: returns the password hash, so it must never be callable from clients.
export const byEmailWithHash = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, { email }) =>
    ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', email))
      .unique(),
});

export const insert = internalMutation({
  args: { email: v.string(), name: v.string(), role: v.string(), passwordHash: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .unique();
    if (existing) return null;
    const id = await ctx.db.insert('users', { ...args, status: 'active' });
    const user = await ctx.db.get(id);
    return user ? toPublicUser(user) : null;
  },
});

export const claimOAuth = internalMutation({
  args: { email: v.string() }, handler: async (ctx, { email }) => {
    const user = await ctx.db.query('users').withIndex('by_email', q => q.eq('email', email)).unique();
    if (!user || user.status !== 'active') return false;
    if (!user.emailVerified) await ctx.db.patch(user._id, { emailVerified: true, passwordHash: undefined, sessionVersion: (user.sessionVersion ?? 0) + 1 });
    return true;
  },
});
