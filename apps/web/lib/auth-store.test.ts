import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createUser, getUserByEmail, updateUserRole, updateUserStatus, acceptInvite, getInviteByCode } from './auth-store.ts';

describe('auth store onboarding rules', () => {
  it('applies role updates and suspensions immediately', () => {
    const user = createUser({
      email: 'test-role@example.com',
      password: 'password123',
      name: 'Role Test',
      role: 'student',
      githubUsername: 'role-test',
    });

    assert.equal(getUserByEmail('test-role@example.com')?.role, 'student');

    updateUserRole(user.id, 'instructor');
    assert.equal(getUserByEmail('test-role@example.com')?.role, 'instructor');

    updateUserStatus(user.id, 'suspended');
    assert.equal(getUserByEmail('test-role@example.com')?.status, 'suspended');
  });

  it('accepts invite codes and attaches enrollment to the learner', () => {
    const invite = getInviteByCode('cohort-07');
    assert.ok(invite);

    const user = createUser({
      email: 'invite@example.com',
      password: 'password123',
      name: 'Invite Test',
      role: 'student',
    });

    const result = acceptInvite('cohort-07', user.id);

    assert.equal(result.success, true);
    assert.equal(getUserByEmail('invite@example.com')?.cohortIds[0], 'cohort-07');
  });
});
