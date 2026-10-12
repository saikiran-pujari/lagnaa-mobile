/* eslint-disable no-bitwise */
export interface AccessClaims {
  userId: string;
  email?: string;
  role?: string;
  tv?: number;
  exp?: number;
  iat?: number;
}

function base64UrlDecode(input: string): string {
  const b64 = input.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((input.length + 3) % 4);
  if (typeof globalThis.atob === 'function') return globalThis.atob(b64);
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let out = '';
  let bits = 0;
  let value = 0;
  for (const c of b64.replace(/[=]+$/, '')) {
    value = (value << 6) | chars.indexOf(c);
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      out += String.fromCharCode((value >> bits) & 0xff);
    }
  }
  return out;
}

/** Decodes claims without verifying the signature (the server verifies; we only read expiry/ids). */
export function decodeClaims(token: string): AccessClaims | null {
  const parts = token.split('.');
  if (parts.length !== 3 || !parts[1]) return null;
  try {
    const json = JSON.parse(decodeURIComponent(escape(base64UrlDecode(parts[1])))) as AccessClaims;
    return typeof json.userId === 'string' ? json : null;
  } catch {
    return null;
  }
}

/** True when the token is expired or will expire within `skewSeconds`. */
export function isExpired(token: string, now = Date.now(), skewSeconds = 30): boolean {
  const claims = decodeClaims(token);
  if (!claims?.exp) return true;
  return claims.exp * 1000 <= now + skewSeconds * 1000;
}
