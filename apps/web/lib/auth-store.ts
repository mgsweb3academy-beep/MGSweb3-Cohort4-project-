import { createConvexToken } from './convex-token';
import type { UserRole, UserStatus } from 'types';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

function getConvex() {
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!url) {
      throw new Error('NEXT_PUBLIC_CONVEX_URL is not set');
    }
    return new ConvexHttpClient(url);
}

async function serviceConvex(email = 'corridor-auth-service') {
  const client = getConvex();
  client.setAuth(await createConvexToken(email, undefined, true));
  return client;
}

type StoredUser = {
  id: string;
  sessionVersion: number;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  githubUsername?: string;
  joinedAt: string;
  cohortIds: string[];
};

// Returns null when the email is already registered.
export async function createUser(input: {
  email: string;
  password?: string;
  name: string;
  role?: UserRole;
  githubUsername?: string;
  provider?: 'credentials' | 'github' | 'google';
}) {
  const client = await serviceConvex(input.email);
  const user = await client.action(api.authNode.register, {
    email: input.email,
    name: input.name,
    password: input.password ?? '',
    provider: input.provider ?? 'credentials',
  });
  return user as StoredUser | null;
}

export async function getUserByEmail(email: string) {
  const client = getConvex();
  client.setAuth(await createConvexToken(email));
  const user = await client.query(api.users.getByEmail, { email: email.trim().toLowerCase() });
  return user as StoredUser | null;
}

export async function updateUserRole(id: string, role: UserRole) {
  const { authenticatedConvex } = await import('./convex-server');
  await (await authenticatedConvex()).mutation(api.users.setRole, { id, role: role as 'student' | 'instructor' | 'admin' });
}

export async function updateUserStatus(id: string, status: UserStatus) {
  const { authenticatedConvex } = await import('./convex-server');
  await (await authenticatedConvex()).mutation(api.users.setStatus, { id, status: status as 'active' | 'suspended' });
}

export async function verifyPassword(email: string, password: string) {
  const user = await (await serviceConvex()).action(api.authNode.verifyCredentials, { email, password });
  return user as StoredUser | null;
}


export async function requestEmailVerification(email: string) {
  return (await serviceConvex()).action(api.authNode.requestToken, { email, kind: 'verify' });
}
export async function verifyEmailToken(token: string) {
  return (await serviceConvex()).action(api.authNode.consumeToken, { token, kind: 'verify' });
}
export async function requestPasswordReset(email: string) {
  return (await serviceConvex()).action(api.authNode.requestToken, { email, kind: 'reset' });
}
export async function resetPasswordWithToken(token: string, newPassword: string) {
  return (await serviceConvex()).action(api.authNode.consumeToken, { token, kind: 'reset', newPassword });
}
export async function getInviteByCode(code: string) {
  const { authenticatedConvex } = await import('./convex-server');
  return (await authenticatedConvex()).query(api.onboarding.getInvite, { code });
}
export async function acceptInvite(code: string) {
  const { authenticatedConvex } = await import('./convex-server');
  return (await authenticatedConvex()).mutation(api.onboarding.acceptInvite, { code });
}

export async function claimOAuthUser(email: string) {
  return (await serviceConvex(email)).action(api.authNode.claimOAuth, { email });
}
