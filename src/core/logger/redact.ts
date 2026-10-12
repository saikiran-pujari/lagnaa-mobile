const SENSITIVE_KEY =
  /token|secret|password|otp|email|phone|dateOfBirth|timeOfBirth|horoscope|content|firstName|lastName|fatherName|motherName|address|authorization|cookie/i;
const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const LONG_DIGITS = /\d{10,}/g;

export const REDACTED = '[redacted]';

/** Deep-redacts sensitive keys and obvious PII patterns in strings. Pure; never throws. */
export function redact<T>(value: T, depth = 0): T {
  if (depth > 6) return REDACTED as unknown as T;
  if (typeof value === 'string')
    return value.replace(EMAIL, REDACTED).replace(LONG_DIGITS, REDACTED) as unknown as T;
  if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1)) as unknown as T;
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = SENSITIVE_KEY.test(k) ? REDACTED : redact(v, depth + 1);
    }
    return out as T;
  }
  return value;
}

/** Replaces UUIDs and numeric ids in a path with placeholders: /profile/123e… → /profile/:id */
export function pathTemplate(path: string): string {
  return path
    .split('?')[0]!
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, ':id')
    .replace(/\/\d+(?=\/|$)/g, '/:id');
}
