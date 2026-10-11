'use node';

import { pbkdf2Sync, randomBytes, timingSafeEqual, createHash } from 'node:crypto';
import { v } from 'convex/values';
import { action, type ActionCtx } from './_generated/server';
import { internal } from './_generated/api';
import type { PublicUser } from './users';

const ITERATIONS = 310000;

// Same format as apps/web/lib/security/encryption.ts: pbkdf2_sha256$iterations$saltHex$hashHex
function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = pbkdf2Sync(password, salt, ITERATIONS, 32, 'sha256');
  return `pbkdf2_sha256$${ITERATIONS}$${salt.toString('hex')}$${hash.toString('hex')}`;
}

function passwordMatches(password: string, stored: string): boolean {
  const [scheme, iterations, saltHex, hashHex] = stored.split('$');
  if (scheme !== 'pbkdf2_sha256' || !iterations || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, 'hex');
  const actual = pbkdf2Sync(password, Buffer.from(saltHex, 'hex'), Number(iterations), expected.length, 'sha256');
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

async function requireService(ctx: ActionCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity || identity.service !== true) throw new Error('UNAUTHORIZED');
}
const DUMMY_HASH = hashPassword('dummy-account-password');

// Returns null when the email is already registered.
export const register = action({
  args: { email: v.string(), name: v.string(), password: v.string(), provider: v.optional(v.union(v.literal('credentials'), v.literal('github'), v.literal('google'))) },
  handler: async (ctx, { email, name, password, provider }): Promise<PublicUser | null> => {
    await requireService(ctx);
    email = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !name.trim()) throw new Error('Invalid registration');
    await ctx.runMutation(internal.onboarding.throttle, { key: `register:${email}`, limit: 5, windowMs: 3600000 });
    const isCredentials = !provider || provider === 'credentials';
    if (isCredentials && password.length < 8) throw new Error('Password must be at least 8 characters');
    if (!isCredentials) {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity || identity.subject !== email) throw new Error('UNAUTHORIZED');
    }
    return await ctx.runMutation(internal.users.insert, {
      email,
      name,
      role: 'student',
      passwordHash: isCredentials ? hashPassword(password) : undefined,
    });
  },
});

export const verifyCredentials = action({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, { email, password }): Promise<PublicUser | null> => {
    await requireService(ctx);
    email = email.trim().toLowerCase();
    await ctx.runMutation(internal.onboarding.throttle, { key: `login:${email}`, limit: 10, windowMs: 900000 });
    const user = await ctx.runQuery(internal.users.byEmailWithHash, { email });
    const matches = passwordMatches(password, user?.passwordHash ?? DUMMY_HASH);
    if (!user?.passwordHash || !matches) return null;
    if (user.status !== 'active' || !user.emailVerified) return null;
    const { passwordHash: _hash, _id, _creationTime, ...fields } = user;
    return { ...fields, githubUsername: user.githubUsername, suspendedAt: user.suspendedAt, suspensionReason: user.suspensionReason, sessionVersion: user.sessionVersion ?? 0, id: _id, joinedAt: new Date(_creationTime).toISOString(), cohortIds: [] };
  },
});

const tokenHash = (token: string) => createHash('sha256').update(token).digest('hex');
export const requestToken = action({
  args: { email: v.string(), kind: v.union(v.literal('reset'), v.literal('verify')) },
  handler: async (ctx, { email, kind }): Promise<{ success: boolean }> => {
    await requireService(ctx);
    await ctx.runMutation(internal.onboarding.throttle, { key: `mail:${kind}:${email.trim().toLowerCase()}`, limit: 3, windowMs: 1800000 });
    const deliveryUrl = process.env.AUTH_EMAIL_DELIVERY_URL;
    const deliverySecret = process.env.AUTH_EMAIL_DELIVERY_SECRET;
    if (!deliveryUrl || !deliverySecret) throw new Error('Email delivery is not configured');
    email = email.trim().toLowerCase();
    const token = randomBytes(32).toString('hex');
    const issued = await ctx.runMutation(internal.onboarding.issueToken, { email, kind, tokenHash: tokenHash(token) });
    if (issued) {
      const response = await fetch(deliveryUrl, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${deliverySecret}` }, body: JSON.stringify({ email, kind, token, expiresInMinutes: 30 }) });
      if (!response.ok) throw new Error('Email delivery failed');
    }
    return { success: true };
  },
});
export const consumeToken = action({
  args: { token: v.string(), kind: v.union(v.literal('reset'), v.literal('verify')), newPassword: v.optional(v.string()) },
  handler: async (ctx, { token, kind, newPassword }): Promise<boolean> => {
    await requireService(ctx);
    if (kind === 'reset' && (!newPassword || newPassword.length < 8)) throw new Error('Password must be at least 8 characters');
    return ctx.runMutation(internal.onboarding.consumeToken, { tokenHash: tokenHash(token), kind, passwordHash: kind === 'reset' ? hashPassword(newPassword!) : undefined });
  },
});

export const createInvite = action({
  args: { cohortId: v.id('cohorts'), email: v.optional(v.string()), teamId: v.optional(v.id('teams')) },
  handler: async (ctx, args): Promise<{ code: string }> => ctx.runMutation(internal.onboarding.createInvite, { ...args, code: randomBytes(32).toString('hex') }),
});

export const claimOAuth = action({
  args: { email: v.string() },
  handler: async (ctx, { email }): Promise<boolean> => {
    await requireService(ctx);
    const identity = await ctx.auth.getUserIdentity();
    email = email.trim().toLowerCase();
    if (identity?.subject !== email) throw new Error('UNAUTHORIZED');
    return ctx.runMutation(internal.users.claimOAuth, { email });
  },
});
