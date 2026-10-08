'use node';

import { pbkdf2Sync, randomBytes, timingSafeEqual } from 'node:crypto';
import { v } from 'convex/values';
import { action } from './_generated/server';
import { api, internal } from './_generated/api';
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

// Returns null when the email is already registered.
export const register = action({
  args: { email: v.string(), name: v.string(), password: v.string() },
  handler: async (ctx, { email, name, password }): Promise<PublicUser | null> => {
    return await ctx.runMutation(internal.users.insert, {
      email,
      name,
      role: 'student',
      passwordHash: hashPassword(password),
    });
  },
});

export const verifyCredentials = action({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, { email, password }): Promise<PublicUser | null> => {
    const user = await ctx.runQuery(internal.users.byEmailWithHash, { email });
    if (!user?.passwordHash || !passwordMatches(password, user.passwordHash)) return null;
    return await ctx.runQuery(api.users.getByEmail, { email });
  },
});
