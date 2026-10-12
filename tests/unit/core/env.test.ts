import { buildEnv } from '@/core/env';

const base = {
  APP_ENV: 'production',
  API_BASE_URL: 'https://service.lagnaa.in/api/',
  OTA_CHANNEL: 'production',
} as const;

describe('env', () => {
  it('builds a frozen env with normalised base url', () => {
    const env = buildEnv(base, 'ios');
    expect(env.apiBaseUrl).toBe('https://service.lagnaa.in/api');
    expect(env.isProduction).toBe(true);
    expect(Object.isFrozen(env)).toBe(true);
  });

  it('uses the emulator host only for Android development', () => {
    const dev = {
      APP_ENV: 'development',
      API_BASE_URL: 'http://localhost:3003/api',
      API_BASE_URL_ANDROID_EMULATOR: 'http://10.0.2.2:3003/api',
      OTA_CHANNEL: 'development',
    } as const;
    expect(buildEnv(dev, 'android').apiBaseUrl).toBe('http://10.0.2.2:3003/api');
    expect(buildEnv(dev, 'ios').apiBaseUrl).toBe('http://localhost:3003/api');
    expect(
      buildEnv({ ...base, API_BASE_URL_ANDROID_EMULATOR: 'http://10.0.2.2' }, 'android').apiBaseUrl,
    ).toBe('https://service.lagnaa.in/api');
  });

  it('rejects a missing or malformed API url', () => {
    expect(() => buildEnv({ ...base, API_BASE_URL: 'service.lagnaa.in' })).toThrow(/API_BASE_URL/);
  });

  it('disables Sentry and Google when their ids are empty', () => {
    const env = buildEnv(base);
    expect(env.sentry.enabled).toBe(false);
    expect(env.google.enabled).toBe(false);
  });
});
