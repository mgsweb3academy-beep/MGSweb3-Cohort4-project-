import type { UserRole, UserStatus } from 'types';
import { prisma } from 'db';
import { hashPassword, verifyPassword as verifyPasswordHash } from './security/encryption';

export async function createUser(input: {
  email: string;
  password?: string;
  name: string;
  role?: UserRole;
  githubUsername?: string;
  provider?: 'credentials' | 'github' | 'google';
}) {
  const user = await prisma.user.create({
    data: {
      email: input.email,
      name: input.name,
      role: input.role || 'student',
      status: 'active',
      passwordHash: input.password ? await hashPassword(input.password) : null,
    }
  });
  return {
    ...user,
    role: user.role as UserRole,
    status: user.status as UserStatus,
  };
}

export async function getUserByEmail(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user) return null;
  return {
    ...user,
    role: user.role as UserRole,
    status: user.status as UserStatus,
  };
}

export async function updateUserRole(id: string, role: UserRole) {
  const user = await prisma.user.update({
    where: { id },
    data: { role },
  });
  return {
    ...user,
    role: user.role as UserRole,
    status: user.status as UserStatus,
  };
}

export async function updateUserStatus(id: string, status: UserStatus) {
  const user = await prisma.user.update({
    where: { id },
    data: { status },
  });
  return {
    ...user,
    role: user.role as UserRole,
    status: user.status as UserStatus,
  };
}

export async function verifyPassword(email: string, password: string) {
  const user = await getUserByEmail(email);
  if (!user?.passwordHash) return null;
  const matches = await verifyPasswordHash(password, user.passwordHash);
  return matches ? user : null;
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
