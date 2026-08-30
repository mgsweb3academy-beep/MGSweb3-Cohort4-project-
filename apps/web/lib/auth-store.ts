import type { User, UserRole, UserStatus } from 'types';

export interface AuthUserRecord extends User {
  passwordHash: string;
  emailVerified: boolean;
  provider?: 'credentials' | 'github' | 'google';
  lastLoginAt?: string;
}

interface InviteRecord {
  code: string;
  cohortId: string;
  createdBy: string;
  createdAt: string;
}

interface EnrollmentRecord {
  id: string;
  userId: string;
  cohortId: string;
  createdAt: string;
}

interface TokenRecord {
  token: string;
  email: string;
  kind: 'email' | 'password';
  used: boolean;
  expiresAt: string;
}

const users = new Map<string, AuthUserRecord>();
const invites = new Map<string, InviteRecord>();
const enrollments = new Map<string, EnrollmentRecord>();
const tokens = new Map<string, TokenRecord>();

const seededInvite: InviteRecord = {
  code: 'cohort-07',
  cohortId: 'cohort-07',
  createdBy: 'admin-1',
  createdAt: new Date().toISOString(),
};

invites.set(seededInvite.code, seededInvite);

const seededUsers: Array<Partial<AuthUserRecord>> = [
  {
    id: 'admin1',
    name: 'Admin User',
    email: 'admin@corridor.local',
    role: 'admin',
    status: 'active',
    joinedAt: new Date().toISOString(),
    cohortIds: [],
    passwordHash: 'admin',
    emailVerified: true,
    provider: 'credentials',
  },
  {
    id: 'inst1',
    name: 'Instructor User',
    email: 'instructor@corridor.local',
    role: 'instructor',
    status: 'active',
    joinedAt: new Date().toISOString(),
    cohortIds: [],
    passwordHash: 'instructor',
    emailVerified: true,
    provider: 'credentials',
  },
  {
    id: 'student1',
    name: 'Student User',
    email: 'student@corridor.local',
    role: 'student',
    status: 'active',
    joinedAt: new Date().toISOString(),
    cohortIds: ['cohort-07'],
    passwordHash: 'student',
    emailVerified: true,
    provider: 'credentials',
  },
];

for (const seededUser of seededUsers) {
  users.set(seededUser.email!, {
    ...seededUser,
    id: seededUser.id!,
    name: seededUser.name!,
    email: seededUser.email!,
    role: seededUser.role as UserRole,
    status: (seededUser.status as UserStatus) || 'active',
    joinedAt: seededUser.joinedAt || new Date().toISOString(),
    cohortIds: seededUser.cohortIds || [],
    passwordHash: seededUser.passwordHash!,
    emailVerified: seededUser.emailVerified ?? true,
    provider: seededUser.provider || 'credentials',
  } as AuthUserRecord);
}

export function createUser(input: {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
  githubUsername?: string;
  provider?: 'credentials' | 'github' | 'google';
}) {
  const id = `user_${Math.random().toString(36).slice(2, 10)}`;
  const record: AuthUserRecord = {
    id,
    name: input.name,
    email: input.email,
    role: input.role || 'student',
    status: 'active',
    joinedAt: new Date().toISOString(),
    cohortIds: [],
    passwordHash: input.password,
    emailVerified: false,
    githubUsername: input.githubUsername,
    provider: input.provider || 'credentials',
  };

  users.set(record.email, record);
  return record;
}

export function getUserByEmail(email: string) {
  return users.get(email);
}

export function verifyPassword(email: string, password: string) {
  const user = users.get(email);
  if (!user || user.status === 'suspended') {
    return null;
  }
  return user.passwordHash === password ? user : null;
}

export function requestEmailVerification(email: string) {
  const user = users.get(email);
  if (!user) {
    return null;
  }

  const token = `verify_${Math.random().toString(36).slice(2, 12)}`;
  tokens.set(token, {
    token,
    email,
    kind: 'email',
    used: false,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
  });

  return { token, email };
}

export function verifyEmailToken(token: string) {
  const record = tokens.get(token);
  if (!record || record.kind !== 'email' || record.used) {
    return false;
  }

  const user = users.get(record.email);
  if (!user) {
    return false;
  }

  user.emailVerified = true;
  record.used = true;
  return true;
}

export function requestPasswordReset(email: string) {
  const user = users.get(email);
  if (!user) {
    return null;
  }

  const token = `reset_${Math.random().toString(36).slice(2, 12)}`;
  tokens.set(token, {
    token,
    email,
    kind: 'password',
    used: false,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
  });

  return { token, email };
}

export function resetPasswordWithToken(token: string, newPassword: string) {
  const record = tokens.get(token);
  if (!record || record.kind !== 'password' || record.used) {
    return false;
  }

  const user = users.get(record.email);
  if (!user) {
    return false;
  }

  user.passwordHash = newPassword;
  record.used = true;
  return true;
}

export function updateUserRole(id: string, role: UserRole) {
  for (const user of users.values()) {
    if (user.id === id) {
      user.role = role;
      return user;
    }
  }
  return null;
}

export function updateUserStatus(id: string, status: UserStatus) {
  for (const user of users.values()) {
    if (user.id === id) {
      user.status = status;
      return user;
    }
  }
  return null;
}

export function getInviteByCode(code: string) {
  return invites.get(code);
}

export function acceptInvite(code: string, userId: string) {
  const invite = invites.get(code);
  if (!invite) {
    return { success: false, error: 'Invite not found' };
  }

  const user = Array.from(users.values()).find((candidate) => candidate.id === userId);
  if (!user || user.status === 'suspended') {
    return { success: false, error: 'User is suspended' };
  }

  if (!user.cohortIds.includes(invite.cohortId)) {
    user.cohortIds = [...user.cohortIds, invite.cohortId];
  }

  const enrollmentId = `enr_${Math.random().toString(36).slice(2, 10)}`;
  enrollments.set(enrollmentId, {
    id: enrollmentId,
    userId,
    cohortId: invite.cohortId,
    createdAt: new Date().toISOString(),
  });

  return { success: true, cohortId: invite.cohortId, enrollmentId };
}
