import { v } from 'convex/values';
import { internalMutation, internalQuery, mutation, query } from './_generated/server';
import type { Doc } from './_generated/dataModel';

function toPublicUser(user: Doc<'users'>) {
  return {
    id: user._id as string,
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
    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', email))
      .unique();
    return user ? toPublicUser(user) : null;
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
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
    const userId = ctx.db.normalizeId('users', id);
    if (!userId) throw new Error('User not found');
    if (status === 'suspended') {
      await ctx.db.patch(userId, { status, suspendedAt: new Date().toISOString(), suspensionReason: reason });
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
  args: { email: v.string(), name: v.string(), role: v.string(), passwordHash: v.string() },
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
