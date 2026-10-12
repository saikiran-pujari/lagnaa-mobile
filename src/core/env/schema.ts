import { z } from 'zod';

export const AppEnvironment = z.enum(['development', 'staging', 'production']);
export type AppEnvironment = z.infer<typeof AppEnvironment>;

export const OtaChannel = z.enum(['development', 'staging', 'production']);
export type OtaChannel = z.infer<typeof OtaChannel>;

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .default('')
  .refine((v) => v === '' || /^https?:\/\//.test(v), 'must be a URL or empty');

export const EnvSchema = z.object({
  APP_ENV: AppEnvironment,
  API_BASE_URL: z
    .string()
    .trim()
    .regex(/^https?:\/\//, 'API_BASE_URL must be a URL'),
  API_BASE_URL_ANDROID_EMULATOR: z.string().trim().optional().default(''),
  OTA_CHANNEL: OtaChannel,
  OTA_UPDATE_URL: optionalUrl,
  SENTRY_DSN: z.string().trim().optional().default(''),
  SENTRY_ENVIRONMENT: z.string().trim().optional().default(''),
  GOOGLE_WEB_CLIENT_ID: z.string().trim().optional().default(''),
  GOOGLE_IOS_CLIENT_ID: z.string().trim().optional().default(''),
  DEEP_LINK_SCHEME: z.string().trim().optional().default('lagnaa'),
  UNIVERSAL_LINK_HOST: z.string().trim().optional().default(''),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).optional().default('info'),
});

export type RawEnv = z.input<typeof EnvSchema>;
