import { api } from './client';
import * as S from './schemas/auth';
import type { AuthSessionResult, Member } from './types';

function toSession(data: {
  accessToken: string;
  refreshToken?: string;
  user: { id: string; email: string; phone?: string | null; role: string; isVerified?: boolean };
  isNewUser?: boolean;
  needsProfileCompletion?: boolean;
}): AuthSessionResult {
  if (!data.refreshToken) throw new Error('Server did not return a refresh token');
  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    member: {
      memberId: data.user.id,
      email: data.user.email,
      phone: data.user.phone ?? null,
      role: data.user.role,
      isVerified: data.user.isVerified ?? false,
      hasProfile: !data.needsProfileCompletion,
    },
    isNewMember: data.isNewUser ?? false,
    needsProfileCompletion: data.needsProfileCompletion ?? false,
  };
}

export async function signIn(identifier: string, password: string): Promise<AuthSessionResult> {
  const res = await api().request(S.LoginResponse, {
    method: 'POST',
    path: '/auth/login',
    body: { identifier, password },
    auth: false,
  });
  return toSession(res.data);
}

export async function signInWithGoogle(idToken: string): Promise<AuthSessionResult> {
  const res = await api().request(S.LoginResponse, {
    method: 'POST',
    path: '/auth/google',
    body: { idToken },
    auth: false,
  });
  return toSession(res.data);
}

export interface RegisterInput {
  email: string;
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  dateOfBirth: string;
  profileFor: 'SELF' | 'MY_SON' | 'MY_DAUGHTER' | 'MY_BROTHER' | 'MY_SISTER';
  role?: 'USER' | 'PARENT';
  emailVerificationToken?: string;
}

export async function register(input: RegisterInput): Promise<Member> {
  const res = await api().request(S.RegisterResponse, {
    method: 'POST',
    path: '/auth/register',
    body: { ...input, acceptTerms: true },
    auth: false,
  });
  const u = res.data.user;
  return {
    memberId: u.id,
    email: u.email,
    phone: u.phone ?? null,
    role: u.role,
    isVerified: u.isVerified ?? false,
    hasProfile: false,
  };
}

/** Used by core/session; returns null when the refresh token is rejected (401). */
export async function refreshTokens(
  refreshToken: string,
): Promise<{ accessToken: string; refreshToken: string } | null> {
  try {
    const res = await api().request(S.RefreshResponse, {
      method: 'POST',
      path: '/auth/refresh',
      body: { refreshToken },
      auth: false,
      timeoutMs: 8_000,
    });
    return {
      accessToken: res.data.accessToken,
      refreshToken: res.data.refreshToken ?? refreshToken,
    };
  } catch (e) {
    const status = (e as { status?: number }).status;
    if (status === 401 || status === 403) return null;
    throw e;
  }
}

/** Best-effort server-side revocation; the caller has already cleared local tokens, so the bearer is passed explicitly. */
export async function revoke(tokens: { accessToken: string; refreshToken: string }): Promise<void> {
  await api().request(S.EmptyResponse, {
    method: 'POST',
    path: '/auth/logout',
    body: { refreshToken: tokens.refreshToken },
    bearer: tokens.accessToken,
    timeoutMs: 5_000,
  });
}

export async function revokeAll(): Promise<void> {
  await api().request(S.EmptyResponse, { method: 'POST', path: '/auth/logout-all' });
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await api().request(S.EmptyResponse, {
    method: 'POST',
    path: '/auth/change-password',
    body: { currentPassword, newPassword },
  });
}

export async function sendEmailOtp(email: string): Promise<void> {
  await api().request(S.SendOtpResponse, {
    method: 'POST',
    path: '/auth/email/send-otp',
    body: { email },
    auth: false,
  });
}

export async function verifyEmailOtp(email: string, code: string): Promise<string> {
  const res = await api().request(S.VerifyOtpResponse, {
    method: 'POST',
    path: '/auth/email/verify-otp',
    body: { email, code },
    auth: false,
  });
  return res.data.emailVerificationToken;
}

export async function getPublicAuthConfig(): Promise<{
  requireEmailVerification: boolean;
  googleClientId: string | null;
}> {
  const res = await api().request(S.PublicAuthConfigResponse, {
    path: '/auth/public-config',
    auth: false,
  });
  return res.data;
}

export async function getFirebaseToken(): Promise<string | null> {
  try {
    const res = await api().request(S.FirebaseTokenResponse, { path: '/auth/firebase-token' });
    return res.data.token;
  } catch (e) {
    if ((e as { status?: number }).status === 503) return null;
    throw e;
  }
}

export async function getMe(): Promise<Member & { profileId: string | null }> {
  const res = await api().request(S.MeResponse, { path: '/auth/me' });
  const d = res.data;
  return {
    memberId: d.id,
    email: d.email,
    phone: d.phone ?? null,
    role: d.role,
    isVerified: d.isVerified ?? false,
    hasProfile: !!d.profile,
    profileId: d.profile?.id ?? null,
  };
}
