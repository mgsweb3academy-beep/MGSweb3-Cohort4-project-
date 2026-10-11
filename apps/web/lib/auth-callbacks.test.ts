import { beforeEach, describe, expect, it, vi } from 'vitest';

const store = vi.hoisted(() => ({ createUser: vi.fn(), claimOAuthUser: vi.fn(), getUserByEmail: vi.fn(), verifyPassword: vi.fn() }));
vi.mock('@/lib/auth-store', () => store);
vi.mock('next-auth', () => ({ default: () => ({ handlers: {}, auth: vi.fn(), signIn: vi.fn(), signOut: vi.fn() }) }));
import { config } from '../auth';

const user = { id: 'real-id', email: 'learner@example.com', name: 'Learner', role: 'instructor', status: 'active', sessionVersion: 2 };
beforeEach(() => { vi.resetAllMocks(); store.getUserByEmail.mockResolvedValue(user); });
describe('asynchronous authentication callbacks', () => {
  it('awaits credential verification and rejects invalid or suspended credentials', async () => {
    const provider = config.providers.find(p => typeof p !== 'function' && p.id === 'credentials') as unknown as { options: { authorize: (credentials: { email: string; password: string }) => Promise<unknown> } };
    store.verifyPassword.mockResolvedValue(null);
    expect(await provider.options.authorize({ email: user.email, password: 'bad' })).toBeNull();
    store.verifyPassword.mockResolvedValue({ ...user, status: 'suspended' });
    expect(await provider.options.authorize({ email: user.email, password: 'password123' })).toBeNull();
    store.verifyPassword.mockResolvedValue(user);
    expect(await provider.options.authorize({ email: user.email, password: 'password123' })).toEqual(user);
  });
  it('reads the stored role and rejects a stale session version', async () => {
    const token = await config.callbacks.jwt({ token: { email: user.email, sessionVersion: 2 } } as never);
    expect(token.role).toBe('instructor');
    expect(token.id).toBe('real-id');
    const stale = await config.callbacks.jwt({ token: { email: user.email, sessionVersion: 1 } } as never);
    expect(stale.status).toBe('suspended');
  });
  it('fails closed when user lookup fails', async () => {
    store.getUserByEmail.mockRejectedValue(new Error('Database offline'));
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const token = await config.callbacks.jwt({ token: { email: user.email, sessionVersion: 2 } } as never);
    expect(token.status).toBe('suspended');
    spy.mockRestore();
  });
});
