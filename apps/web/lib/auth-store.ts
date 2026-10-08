import type { UserRole, UserStatus } from 'types';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

let _convex: ConvexHttpClient | null = null;
function getConvex() {
  if (!_convex) {
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!url) {
      throw new Error('NEXT_PUBLIC_CONVEX_URL is not set');
    }
    _convex = new ConvexHttpClient(url);
  }
  return _convex;
}

type StoredUser = {
  id: string;
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
  const user = await getConvex().action(api.authNode.register, {
    email: input.email,
    name: input.name,
    password: input.password ?? '',
  });
  return user as StoredUser | null;
}

export async function getUserByEmail(email: string) {
  const user = await getConvex().query(api.users.getByEmail, { email });
  return user as StoredUser | null;
}

export async function updateUserRole(id: string, role: UserRole) {
  await getConvex().mutation(api.users.setRole, { id, role: role as 'student' | 'instructor' | 'admin' });
}

export async function updateUserStatus(id: string, status: UserStatus) {
  await getConvex().mutation(api.users.setStatus, { id, status: status as 'active' | 'suspended' });
}

export async function verifyPassword(email: string, password: string) {
  const user = await getConvex().action(api.authNode.verifyCredentials, { email, password });
  return user as StoredUser | null;
}

// Mocks for now to fix Next.js build
export async function requestEmailVerification(email: string) {
  return { token: 'mock_token', email };
}

export async function verifyEmailToken(token: string) {
  return true;
}

export async function requestPasswordReset(email: string) {
  return { token: 'mock_token', email };
}

export async function resetPasswordWithToken(token: string, newPassword: string) {
  return true;
}

export async function getInviteByCode(code: string) {
  return { code, cohortId: 'cohort-07', createdBy: 'admin', createdAt: new Date().toISOString() };
}

export async function acceptInvite(code: string, userId: string) {
  return { success: true, cohortId: 'cohort-07', enrollmentId: 'enr_1' };
}
