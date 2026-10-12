import { z } from 'zod';

import { installApiClient, profile, search } from '@/api';
import { ProfileResponse } from '@/api/schemas/profile';
import { createApiClient } from '@/core/http';

import { createFakeTransport, json } from '@tests/setup/fakes/transport';

import noContact from './fixtures/profile.privateNoContact.json';
import withContact from './fixtures/profile.privateWithContact.json';
import pub from './fixtures/profile.public.json';
import searchCursor from './fixtures/search.cursor.json';

function install() {
  const fake = createFakeTransport();
  installApiClient(
    createApiClient({
      baseUrl: 'https://api.test/api',
      transport: fake.transport,
      tokens: {
        getAccessToken: async () => 't',
        refresh: async () => null,
        onAuthFailure: () => undefined,
      },
    }),
  );
  return fake;
}

describe('api contract', () => {
  it('maps the three profile levels to discriminated views', async () => {
    const fake = install();
    fake
      .on('GET', '/profile/a', () => json(200, pub), true)
      .on('GET', '/profile/b', () => json(200, noContact), true)
      .on('GET', '/profile/c', () => json(200, withContact), true);
    const a = await profile.getProfile('a');
    const b = await profile.getProfile('b');
    const c = await profile.getProfile('c');
    expect(a.level).toBe('public');
    expect(a.level === 'public' && a.interestStatus).toBe('PENDING');
    expect(a.primaryPhoto?.url).toContain('https://');
    expect(b.level).toBe('privateNoContact');
    expect(b.level === 'privateNoContact' && b.contactRequestStatus).toBe('NONE');
    expect(c.level).toBe('privateWithContact');
    expect(c.level === 'privateWithContact' && c.email).toBe('anjali@example.com');
    expect(c.photos[0]).toEqual({
      objectKey: 'profile-photos/7b1a0c3e-2222-4a2b-9c3d-000000000002/b.jpg',
    });
  });

  it('refuses a public profile that leaks contact details', () => {
    const leaked = { ...pub, data: { ...pub.data, email: 'x@y.z' } };
    expect(ProfileResponse.safeParse(leaked).success).toBe(false);
  });

  it('normalises the search envelope and cursor pagination', async () => {
    const fake = install();
    fake.on('GET', '/search', () => json(200, searchCursor));
    const page = await search.search({ minAge: 24, cursor: 'abc' });
    expect(page.items[0]).toMatchObject({
      profileId: expect.any(String),
      memberId: '7b1a0c3e-2222-4a2b-9c3d-000000000002',
      isVerified: true,
      compatibilityScore: 78,
      photo: null,
    });
    expect(page.page).toEqual({ nextCursor: 'eyJ4IjoxfQ', hasMore: true, total: null });
    expect(fake.calls[0]?.url).toContain('cursor=abc');
    expect(fake.calls[0]?.url).toContain('includeScore=true');
  });

  it('keeps zod available for ad-hoc assertions', () => {
    expect(z.string().safeParse('x').success).toBe(true);
  });
});
