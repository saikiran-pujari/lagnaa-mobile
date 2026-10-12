import { pathTemplate, redact, REDACTED } from '@/core/logger/redact';

describe('redact', () => {
  it('redacts sensitive keys at any depth', () => {
    const out = redact({
      user: { email: 'a@b.com', phone: '9876543210', name: 'ok' },
      accessToken: 'x',
    });
    expect(out).toEqual({
      user: { email: REDACTED, phone: REDACTED, name: 'ok' },
      accessToken: REDACTED,
    });
  });
  it('redacts email and long digit runs inside strings', () => {
    expect(redact('contact me at someone@example.com or 9876543210')).toBe(
      `contact me at ${REDACTED} or ${REDACTED}`,
    );
  });
  it('templates ids out of paths', () => {
    expect(pathTemplate('/profile/123e4567-e89b-12d3-a456-426614174000?x=1')).toBe('/profile/:id');
    expect(pathTemplate('/message/42')).toBe('/message/:id');
  });
});
