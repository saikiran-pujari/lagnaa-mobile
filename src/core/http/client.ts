import type { ZodType } from 'zod';

import { log } from '@/core/logger';
import { pathTemplate } from '@/core/logger/redact';

import { ApiError, codeForStatus } from './errors';
import { fetchTransport, type Transport } from './transport';

export interface TokenProvider {
  getAccessToken(): Promise<string | null>;
  /** Single-flight refresh; resolves the new access token or null if the session is gone. */
  refresh(): Promise<string | null>;
  /** Called when the server says the session is invalid beyond repair. */
  onAuthFailure(reason: 'expired' | 'revoked'): void;
}

export interface ApiClientOptions {
  baseUrl: string;
  tokens: TokenProvider;
  transport?: Transport;
  timeoutMs?: number;
  now?: () => number;
  requestId?: () => string;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  auth?: boolean;
  /** Explicit bearer for one request (e.g. revoking a session whose tokens were already cleared locally). */
  bearer?: string;
  timeoutMs?: number;
  signal?: AbortSignal;
}

export interface ApiClient {
  /** Performs the request and validates the whole JSON body against `schema`. */
  request<T>(schema: ZodType<T>, options: RequestOptions): Promise<T>;
}

const REVOKED_CODES = new Set([
  'TOKEN_REVOKED',
  'TOKEN_BLACKLISTED',
  'INVALID_SIGNATURE',
  'MALFORMED_TOKEN',
  'INVALID_TOKEN',
]);

function buildUrl(baseUrl: string, path: string, query?: RequestOptions['query']): string {
  const url = `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  if (!query) return url;
  const parts: string[] = [];
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined) continue;
    parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  }
  return parts.length ? `${url}?${parts.join('&')}` : url;
}

function defaultRequestId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function parseJson(text: string): unknown {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function serverError(status: number, body: unknown, headers: Record<string, string>): ApiError {
  const err = (body as { error?: { message?: string; code?: string; details?: unknown } } | null)
    ?.error;
  const message =
    err?.message ?? (body as { message?: string } | null)?.message ?? `Request failed (${status})`;
  const retryAfter = headers['retry-after'] ? Number(headers['retry-after']) : undefined;
  return new ApiError({
    code: err?.code ?? codeForStatus(status),
    message,
    status,
    retryable: status >= 500 || status === 429,
    retryAfterSeconds: Number.isFinite(retryAfter) ? retryAfter : undefined,
    details: err?.details,
  });
}

export function createApiClient(opts: ApiClientOptions): ApiClient {
  const transport = opts.transport ?? fetchTransport;
  const timeoutMs = opts.timeoutMs ?? 15_000;
  const requestId = opts.requestId ?? defaultRequestId;

  async function send(options: RequestOptions, token: string | null) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? timeoutMs);
    const onOuterAbort = () => controller.abort();
    options.signal?.addEventListener('abort', onOuterAbort);
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'X-Request-Id': requestId(),
    };
    if (options.body !== undefined) headers['Content-Type'] = 'application/json';
    if (token) headers.Authorization = `Bearer ${token}`;
    const started = Date.now();
    try {
      const res = await transport({
        url: buildUrl(opts.baseUrl, options.path, options.query),
        method: options.method ?? 'GET',
        headers,
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
        signal: controller.signal,
      });
      log.debug('http.response', {
        method: options.method ?? 'GET',
        path: pathTemplate(options.path),
        status: res.status,
        ms: Date.now() - started,
      });
      return res;
    } catch (e) {
      const aborted = controller.signal.aborted;
      const timedOut = aborted && !options.signal?.aborted;
      throw new ApiError({
        code: timedOut ? 'TIMEOUT' : 'NETWORK',
        message: timedOut
          ? 'The request timed out.'
          : 'Could not reach Lagnaa. Check your connection.',
        retryable: true,
        details: e instanceof Error ? e.message : String(e),
      });
    } finally {
      clearTimeout(timer);
      options.signal?.removeEventListener('abort', onOuterAbort);
    }
  }

  return {
    async request<T>(schema: ZodType<T>, options: RequestOptions): Promise<T> {
      const useAuth = options.auth ?? true;
      let token = options.bearer ?? (useAuth ? await opts.tokens.getAccessToken() : null);
      let res = await send(options, token);

      // A 401 can only mean 'session expired/revoked' when we actually sent a session token.
      if (res.status === 401 && useAuth && token !== null && options.bearer === undefined) {
        const body = parseJson(res.text) as { error?: { code?: string } } | null;
        const code = body?.error?.code;
        if (code && REVOKED_CODES.has(code)) {
          opts.tokens.onAuthFailure('revoked');
          throw serverError(res.status, body, res.headers);
        }
        token = await opts.tokens.refresh();
        if (!token) {
          opts.tokens.onAuthFailure('expired');
          throw serverError(res.status, body, res.headers);
        }
        res = await send(options, token);
      }

      const body = parseJson(res.text);
      if (res.status >= 400) throw serverError(res.status, body, res.headers);

      const parsed = schema.safeParse(body);
      if (!parsed.success) {
        log.error('http.contract_mismatch', {
          path: pathTemplate(options.path),
          issues: parsed.error.issues.slice(0, 5).map((i) => `${i.path.join('.')}: ${i.message}`),
        });
        throw new ApiError({
          code: 'CONTRACT_MISMATCH',
          message: 'Lagnaa returned something unexpected. Please try again.',
          status: res.status,
          retryable: true,
        });
      }
      return parsed.data;
    },
  };
}
