import type { UserRole, UserStatus } from 'types';
import { prisma } from 'db';

export async function createUser(input: {
  email: string;
  password?: string;
  name: string;
  role?: UserRole;
  githubUsername?: string;
  provider?: 'credentials' | 'github' | 'google';
}) {
  return prisma.user.create({
    data: {
      email: input.email,
      name: input.name,
      role: input.role || 'student',
      status: 'active',
    }
  });
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

// Mocks for now to fix Next.js build
export async function verifyPassword(email: string, password: string) {
  const user = await getUserByEmail(email);
  if (!user) return null;
  // TODO: Add proper password hashing/verification
  return user;
}

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
