import { z } from 'zod';

import { createApiClient, isApiError } from '@/core/http';

import { createFakeTransport, json } from '@tests/setup/fakes/transport';

const schema = z.object({ success: z.literal(true), data: z.object({ ok: z.boolean() }) });

function setup(access: string | null = 'A1') {
  const fake = createFakeTransport();
  const tokens = {
    getAccessToken: jest.fn(async () => access),
    refresh: jest.fn(async () => 'A2'),
    onAuthFailure: jest.fn(),
  };
  const client = createApiClient({
    baseUrl: 'https://api.test/api',
    tokens,
    transport: fake.transport,
  });
  return { fake, tokens, client };
}

describe('apiClient', () => {
  it('sends bearer, request id and validates the response', async () => {
    const { fake, client } = setup();
    fake.on('GET', '/ping', () => json(200, { success: true, data: { ok: true } }));
    const out = await client.request(schema, { path: '/ping', query: { a: 1, b: undefined } });
    expect(out.data.ok).toBe(true);
    expect(fake.calls[0]?.url).toBe('https://api.test/api/ping?a=1');
    expect(fake.calls[0]?.headers.Authorization).toBe('Bearer A1');
    expect(fake.calls[0]?.headers['X-Request-Id']).toBeTruthy();
  });

  it('refreshes once on 401 TOKEN_EXPIRED and retries with the new token', async () => {
    const { fake, tokens, client } = setup();
    fake.on(
      'GET',
      '/me',
      () => json(401, { success: false, error: { code: 'TOKEN_EXPIRED', message: 'expired' } }),
      true,
    );
    fake.on('GET', '/me', () => json(200, { success: true, data: { ok: true } }));
    await client.request(schema, { path: '/me' });
    expect(tokens.refresh).toHaveBeenCalledTimes(1);
    expect(fake.calls[1]?.headers.Authorization).toBe('Bearer A2');
  });

  it('signs out immediately on a revoked token without refreshing', async () => {
    const { fake, tokens, client } = setup();
    fake.on('GET', '/me', () =>
      json(401, { success: false, error: { code: 'TOKEN_REVOKED', message: 'revoked' } }),
    );
    await expect(client.request(schema, { path: '/me' })).rejects.toMatchObject({
      code: 'TOKEN_REVOKED',
    });
    expect(tokens.refresh).not.toHaveBeenCalled();
    expect(tokens.onAuthFailure).toHaveBeenCalledWith('revoked');
  });

  it('reports a contract mismatch instead of returning bad data', async () => {
    const { fake, client } = setup();
    fake.on('GET', '/ping', () => json(200, { success: true, data: { ok: 'yes' } }));
    await expect(client.request(schema, { path: '/ping' })).rejects.toMatchObject({
      code: 'CONTRACT_MISMATCH',
      retryable: true,
    });
  });

  it('maps server errors and rate limits', async () => {
    const { fake, client } = setup();
    fake.on('GET', '/limited', () => ({
      status: 429,
      headers: { 'retry-after': '30' },
      text: JSON.stringify({ success: false, error: { message: 'slow down' } }),
    }));
    try {
      await client.request(schema, { path: '/limited' });
      throw new Error('should have thrown');
    } catch (e) {
      expect(isApiError(e) && e.code === 'RATE_LIMITED' && e.retryAfterSeconds === 30).toBe(true);
    }
  });

  it('does not refresh or sign out on 401 when no session token was sent', async () => {
    const { fake, tokens, client } = setup(null);
    fake.on('POST', '/auth/logout', () =>
      json(401, { success: false, error: { message: 'no token' } }),
    );
    await expect(
      client.request(schema, { method: 'POST', path: '/auth/logout' }),
    ).rejects.toMatchObject({ status: 401 });
    expect(tokens.refresh).not.toHaveBeenCalled();
    expect(tokens.onAuthFailure).not.toHaveBeenCalled();
  });

  it('uses an explicit bearer without consulting the session', async () => {
    const { fake, tokens, client } = setup(null);
    fake.on('POST', '/auth/logout', () => json(200, { success: true, data: { ok: true } }));
    await client.request(schema, { method: 'POST', path: '/auth/logout', bearer: 'OLD' });
    expect(fake.calls[0]?.headers.Authorization).toBe('Bearer OLD');
    expect(tokens.getAccessToken).not.toHaveBeenCalled();
  });
});
