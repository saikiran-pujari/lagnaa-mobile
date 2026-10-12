import { Platform } from 'react-native';
import Config from 'react-native-config';

import { type AppEnvironment, EnvSchema, type OtaChannel, type RawEnv } from './schema';
import { APP_VERSION, BUILD_NUMBER } from './version.generated';

export type { AppEnvironment, OtaChannel };

export interface Env {
  readonly name: AppEnvironment;
  readonly isDevelopment: boolean;
  readonly isProduction: boolean;
  readonly apiBaseUrl: string;
  readonly ota: { readonly channel: OtaChannel; readonly updateUrl: string };
  readonly sentry: {
    readonly dsn: string;
    readonly environment: string;
    readonly enabled: boolean;
  };
  readonly google: {
    readonly webClientId: string;
    readonly iosClientId: string;
    readonly enabled: boolean;
  };
  readonly links: { readonly scheme: string; readonly universalHost: string };
  readonly logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export interface ReleaseInfo {
  readonly appVersion: string;
  readonly buildNumber: number;
  readonly platform: 'ios' | 'android';
  readonly environment: AppEnvironment;
  readonly channel: OtaChannel;
}

/**
 * Builds the frozen env object from raw key/values. Exported so tests can exercise validation
 * without react-native-config; the app calls it once with `Config` at module load.
 */
export function buildEnv(
  raw: RawEnv,
  platform: 'ios' | 'android' = Platform.OS as 'ios' | 'android',
): Env {
  const parsed = EnvSchema.safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new Error(`Invalid environment configuration: ${issues}`);
  }
  const v = parsed.data;
  const apiBaseUrl =
    platform === 'android' && v.APP_ENV === 'development' && v.API_BASE_URL_ANDROID_EMULATOR
      ? v.API_BASE_URL_ANDROID_EMULATOR
      : v.API_BASE_URL;
  return Object.freeze({
    name: v.APP_ENV,
    isDevelopment: v.APP_ENV === 'development',
    isProduction: v.APP_ENV === 'production',
    apiBaseUrl: apiBaseUrl.replace(/\/+$/, ''),
    ota: Object.freeze({ channel: v.OTA_CHANNEL, updateUrl: v.OTA_UPDATE_URL }),
    sentry: Object.freeze({
      dsn: v.SENTRY_DSN,
      environment: v.SENTRY_ENVIRONMENT || v.APP_ENV,
      enabled: v.SENTRY_DSN.length > 0,
    }),
    google: Object.freeze({
      webClientId: v.GOOGLE_WEB_CLIENT_ID,
      iosClientId: v.GOOGLE_IOS_CLIENT_ID,
      enabled: v.GOOGLE_WEB_CLIENT_ID.length > 0,
    }),
    links: Object.freeze({ scheme: v.DEEP_LINK_SCHEME, universalHost: v.UNIVERSAL_LINK_HOST }),
    logLevel: v.LOG_LEVEL,
  });
}

export const env: Env = buildEnv(Config as RawEnv);

export const release: ReleaseInfo = Object.freeze({
  appVersion: APP_VERSION,
  buildNumber: Platform.OS === 'ios' ? BUILD_NUMBER.ios : BUILD_NUMBER.android,
  platform: Platform.OS as 'ios' | 'android',
  environment: env.name,
  channel: env.ota.channel,
});
