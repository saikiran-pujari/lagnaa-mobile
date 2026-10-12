import { createSession, useSessionStore } from '@/core/session';
import { createMemorySecureStore } from '@/core/storage';

const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64url');
const token = (exp: number, userId = 'u1') => `h.${b64({ userId, role: 'USER', exp })}.s`;
const future = Math.floor(Date.now() / 1000) + 3600;
const past = Math.floor(Date.now() / 1000) - 10;

describe('session', () => {
  beforeEach(() => useSessionStore.getState().setBooting());

  it('restores a valid session from the secure store', async () => {
    const secure = createMemorySecureStore();
    await secure.set('auth.access', token(future));
    await secure.set('auth.refresh', 'r');
    const session = createSession({ secure, refreshTokens: jest.fn() });
    await session.restore();
    expect(useSessionStore.getState()).toMatchObject({ status: 'signedIn', memberId: 'u1' });
  });

  it('refreshes an expired access token during restore, single-flight', async () => {
    const secure = createMemorySecureStore();
    await secure.set('auth.access', token(past));
    await secure.set('auth.refresh', 'r');
    const refreshTokens = jest.fn(async () => ({
      accessToken: token(future, 'u2'),
      refreshToken: 'r2',
    }));
    const session = createSession({ secure, refreshTokens });
    await Promise.all([session.restore(), session.refresh(), session.getAccessToken()]);
    expect(refreshTokens).toHaveBeenCalledTimes(1);
    expect(useSessionStore.getState().memberId).toBe('u2');
    expect(await secure.get('auth.refresh')).toBe('r2');
  });

  it('signs out when the refresh token is rejected and clears the keychain', async () => {
    const secure = createMemorySecureStore();
    await secure.set('auth.access', token(past));
    await secure.set('auth.refresh', 'r');
    const session = createSession({ secure, refreshTokens: async () => null });
    await session.restore();
    expect(useSessionStore.getState()).toMatchObject({
      status: 'signedOut',
      lastSignOutReason: 'expired',
    });
    expect(await secure.get('auth.access')).toBeNull();
  });

  it('runs sign-out hooks with the member id and reason', async () => {
    const secure = createMemorySecureStore();
    const onSignedOut = jest.fn(async () => undefined);
    const session = createSession({ secure, refreshTokens: jest.fn(), onSignedOut });
    await session.signIn({ accessToken: token(future, 'u9'), refreshToken: 'r' }, true);
    expect(useSessionStore.getState().status).toBe('needsProfile');
    await session.signOut('revoked');
    expect(onSignedOut).toHaveBeenCalledWith('u9', 'revoked');
    expect(useSessionStore.getState().status).toBe('signedOut');
  });
});
