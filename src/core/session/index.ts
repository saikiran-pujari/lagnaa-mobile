import { log } from '@/core/logger';
import type { SecureStore } from '@/core/storage';

import { decodeClaims, isExpired } from './jwt';
import { type SignOutReason, useSessionStore } from './store';

export { decodeClaims, isExpired } from './jwt';
export type { SessionStatus, SignOutReason } from './store';
export { selectMemberId, selectStatus, useSessionStore } from './store';

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface SessionDeps {
  secure: SecureStore;
  /** POST /auth/refresh; returns new tokens or null when the refresh token is rejected. */
  refreshTokens: (refreshToken: string) => Promise<Tokens | null>;
  /** Best-effort POST /auth/logout. Never throws. */
  revoke?: (tokens: Tokens) => Promise<void>;
  /** Hooks run on sign-in/sign-out (FCM registration, Firebase auth, cache purge). Never throw. */
  onSignedIn?: (memberId: string) => Promise<void>;
  onSignedOut?: (memberId: string | null, reason: SignOutReason) => Promise<void>;
  now?: () => number;
  restoreTimeoutMs?: number;
}

export interface Session {
  restore(): Promise<void>;
  signIn(tokens: Tokens, needsProfile: boolean): Promise<void>;
  signOut(reason: SignOutReason): Promise<void>;
  markProfileComplete(): void;
  getAccessToken(): Promise<string | null>;
  refresh(): Promise<string | null>;
}

const KEY_ACCESS = 'auth.access';
const KEY_REFRESH = 'auth.refresh';

function withTimeout<T>(p: Promise<T>, ms: number, fallback: T): Promise<T> {
  return new Promise((resolve) => {
    const t = setTimeout(() => resolve(fallback), ms);
    p.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      () => {
        clearTimeout(t);
        resolve(fallback);
      },
    );
  });
}

/**
 * The session module: owns tokens (in the secure store), the session status (in the store)
 * and the single-flight refresh. The HTTP client talks to it through `getAccessToken`/`refresh`.
 */
export function createSession(deps: SessionDeps): Session {
  const now = deps.now ?? Date.now;
  const store = useSessionStore;
  let refreshInFlight: Promise<string | null> | null = null;

  async function readTokens(): Promise<Tokens | null> {
    const [accessToken, refreshToken] = await Promise.all([
      deps.secure.get(KEY_ACCESS),
      deps.secure.get(KEY_REFRESH),
    ]);
    return accessToken && refreshToken ? { accessToken, refreshToken } : null;
  }

  async function writeTokens(t: Tokens) {
    await Promise.all([
      deps.secure.set(KEY_ACCESS, t.accessToken),
      deps.secure.set(KEY_REFRESH, t.refreshToken),
    ]);
  }

  async function clearTokens() {
    await Promise.all([deps.secure.delete(KEY_ACCESS), deps.secure.delete(KEY_REFRESH)]);
  }

  async function refresh(): Promise<string | null> {
    if (refreshInFlight) return refreshInFlight;
    refreshInFlight = (async () => {
      try {
        const current = await readTokens();
        if (!current) return null;
        const next = await deps.refreshTokens(current.refreshToken);
        if (!next) {
          await clearTokens();
          return null;
        }
        await writeTokens(next);
        return next.accessToken;
      } catch (e) {
        log.warn('session.refresh_failed', { error: e instanceof Error ? e.message : String(e) });
        return null;
      } finally {
        refreshInFlight = null;
      }
    })();
    return refreshInFlight;
  }

  async function signOut(reason: SignOutReason) {
    const memberId = store.getState().memberId;
    const tokens = await readTokens();
    await clearTokens();
    store.getState().setSignedOut(reason);
    if (tokens && reason === 'user' && deps.revoke) {
      try {
        await deps.revoke(tokens);
      } catch {
        /* best effort */
      }
    }
    try {
      await deps.onSignedOut?.(memberId, reason);
    } catch (e) {
      log.warn('session.signout_hook_failed', {
        error: e instanceof Error ? e.message : String(e),
      });
    }
    log.info('session.signed_out', { reason });
  }

  return {
    async restore() {
      store.getState().setBooting();
      let tokens: Tokens | null = null;
      try {
        tokens = await readTokens();
      } catch (e) {
        // A broken secure store (e.g. missing keychain entitlement) must never block the app: start signed out.
        log.error('session.secure_store_unavailable', {
          error: e instanceof Error ? e.message : String(e),
        });
      }
      if (!tokens) {
        store.getState().setSignedOut(null);
        return;
      }
      let access: string | null = tokens.accessToken;
      if (isExpired(access, now())) {
        access = await withTimeout(refresh(), deps.restoreTimeoutMs ?? 5_000, null);
      }
      const claims = access ? decodeClaims(access) : null;
      if (!claims) {
        await clearTokens();
        store.getState().setSignedOut('expired');
        return;
      }
      // Optimistic: profile completeness is re-checked by the app after boot.
      store.getState().setSignedIn(claims.userId, claims.role ?? null, false);
      log.info('session.restored');
    },
    async signIn(tokens, needsProfile) {
      const claims = decodeClaims(tokens.accessToken);
      if (!claims) throw new Error('Cannot sign in: access token is not decodable');
      await writeTokens(tokens);
      store.getState().setSignedIn(claims.userId, claims.role ?? null, needsProfile);
      try {
        await deps.onSignedIn?.(claims.userId);
      } catch (e) {
        log.warn('session.signin_hook_failed', {
          error: e instanceof Error ? e.message : String(e),
        });
      }
      log.info('session.signed_in', { needsProfile });
    },
    signOut,
    markProfileComplete() {
      store.getState().setNeedsProfile(false);
    },
    async getAccessToken() {
      const tokens = await readTokens();
      if (!tokens) return null;
      if (!isExpired(tokens.accessToken, now())) return tokens.accessToken;
      return refresh();
    },
    refresh,
  };
}
