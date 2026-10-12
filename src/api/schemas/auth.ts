import { z } from 'zod';

import { envelope, isoDate, nullableString } from './common';

export const AuthUser = z.looseObject({
  id: z.string(),
  email: z.string(),
  phone: nullableString,
  role: z.string(),
  isVerified: z.boolean().optional(),
});

export const ProfileSeed = z.looseObject({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  profilePhoto: z.string().optional(),
  gender: z.string().optional(),
  dateOfBirth: z.string().optional(),
});

export const LoginResponse = envelope(
  z.looseObject({
    accessToken: z.string(),
    refreshToken: z.string().optional(),
    user: AuthUser,
    isNewUser: z.boolean().optional(),
    needsProfileCompletion: z.boolean().optional(),
    profileSeed: ProfileSeed.optional(),
  }),
);

export const RefreshResponse = envelope(
  z.looseObject({ accessToken: z.string(), refreshToken: z.string().optional() }),
);

export const RegisterResponse = envelope(z.looseObject({ user: AuthUser }));

export const PublicAuthConfigResponse = envelope(
  z.looseObject({ requireEmailVerification: z.boolean(), googleClientId: z.string().nullable() }),
);

export const SendOtpResponse = z.looseObject({ success: z.boolean() });
export const VerifyOtpResponse = envelope(z.looseObject({ emailVerificationToken: z.string() }));
export const FirebaseTokenResponse = envelope(z.looseObject({ token: z.string() }));
export const EmptyResponse = z.looseObject({
  success: z.boolean(),
  message: z.string().optional(),
});

/** GET /auth/me: user with nested private profile (own view). */
export const MeResponse = envelope(
  z.looseObject({
    id: z.string(),
    email: z.string(),
    phone: nullableString,
    role: z.string(),
    isVerified: z.boolean().optional(),
    isActive: z.boolean().optional(),
    createdAt: isoDate.optional(),
    lastLoginAt: isoDate.nullable().optional(),
    profile: z
      .looseObject({ id: z.string(), firstName: z.string(), lastName: z.string() })
      .nullable()
      .optional(),
  }),
);
