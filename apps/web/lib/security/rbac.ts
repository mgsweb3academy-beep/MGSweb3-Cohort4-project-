/**
 * Corridor LMS — Role-Based Access Control (RBAC) System
 * Enforces security & authorization bounds for §6 Non-Functional Requirements.
 */

export type Role = 'student' | 'instructor' | 'admin' | 'agent';

export type Permission =
  // Course permissions
  | 'course:read'
  | 'course:create'
  | 'course:edit'
  | 'course:approve'
  | 'course:delete'
  // Task & submission permissions
  | 'task:read'
  | 'task:submit'
  | 'task:review'
  | 'task:assign'
  | 'task:close'
  // User & cohort administration
  | 'user:read'
  | 'user:edit'
  | 'user:suspend'
  | 'user:invite'
  // AI Agent operations
  | 'agent:configure'
  | 'agent:execute'
  // Analytics & platform control
  | 'analytics:read'
  | 'reports:export';

const ROLE_PERMISSIONS: Record<Role, Set<Permission>> = {
  student: new Set([
    'course:read',
    'task:read',
    'task:submit',
    'task:review',
    'user:read',
  ]),
  instructor: new Set([
    'course:read',
    'course:create',
    'course:edit',
    'task:read',
    'task:submit',
    'task:review',
    'task:assign',
    'task:close',
    'user:read',
    'user:invite',
    'analytics:read',
    'reports:export',
  ]),
  admin: new Set([
    'course:read',
    'course:create',
    'course:edit',
    'course:approve',
    'course:delete',
    'task:read',
    'task:submit',
    'task:review',
    'task:assign',
    'task:close',
    'user:read',
    'user:edit',
    'user:suspend',
    'user:invite',
    'agent:configure',
    'agent:execute',
    'analytics:read',
    'reports:export',
  ]),
  agent: new Set([
    'task:read',
    'task:assign',
    'task:review',
    'task:close',
    'agent:execute',
    'analytics:read',
  ]),
};

/**
 * Evaluates whether a role possesses a specific permission.
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;
  return permissions.has(permission);
}

/**
 * Asserts that a given role has the required permission, throwing an AuthorizationError if not.
 */
export function assertPermission(role: Role, permission: Permission): void {
  if (!hasPermission(role, permission)) {
    throw new Error(`Forbidden: Role '${role}' lacks required permission '${permission}'.`);
  }
}

/**
 * Session context helper for server-side evaluation.
 */
export interface UserSession {
  userId: string;
  role: Role;
  cohortId?: string;
  isSuspended?: boolean;
}

/**
 * Evaluates user session validity and permission access.
 */
export function authorizeSession(
  session: UserSession | null | undefined,
  requiredPermission: Permission
): { authorized: boolean; reason?: string } {
  if (!session) {
    return { authorized: false, reason: 'Unauthorized: Missing or invalid session token.' };
  }

  if (session.isSuspended) {
    return { authorized: false, reason: 'Forbidden: Account has been suspended.' };
  }

  if (!hasPermission(session.role, requiredPermission)) {
    return {
      authorized: false,
      reason: `Forbidden: Role '${session.role}' lacks '${requiredPermission}'.`,
    };
  }

  return { authorized: true };
}
