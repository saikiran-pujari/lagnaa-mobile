import { parseDeepLink, routeFromNotificationData } from '@/core/deeplinks';

const cfg = { scheme: 'lagnaa', universalHost: 'lagnaa.in' };
const id = '123e4567-e89b-12d3-a456-426614174000';

describe('deep links', () => {
  it('parses scheme and universal links to the same route', () => {
    expect(parseDeepLink(`lagnaa://profile/${id}`, cfg)).toEqual({
      name: 'profile',
      profileId: id,
    });
    expect(parseDeepLink(`https://lagnaa.in/profile/${id}`, cfg)).toEqual({
      name: 'profile',
      profileId: id,
    });
    expect(parseDeepLink(`lagnaa://chat/${id}?utm=1`, cfg)).toEqual({
      name: 'chat',
      conversationId: id,
    });
    expect(parseDeepLink('lagnaa://interests', cfg)).toEqual({ name: 'interests' });
    expect(parseDeepLink('lagnaa://settings/notifications', cfg)).toEqual({
      name: 'notificationSettings',
    });
  });
  it('rejects unknown hosts, unknown paths and non-uuid ids', () => {
    expect(parseDeepLink(`https://evil.example/profile/${id}`, cfg)).toBeNull();
    expect(parseDeepLink('lagnaa://profile/42', cfg)).toBeNull();
    expect(parseDeepLink('lagnaa://admin', cfg)).toBeNull();
    expect(parseDeepLink(`lagnaa://profile/${id}/extra`, cfg)).toBeNull();
  });
  it('maps push payloads', () => {
    expect(routeFromNotificationData({ type: 'NEW_MESSAGE', conversationId: id })).toEqual({
      name: 'chat',
      conversationId: id,
    });
    expect(routeFromNotificationData({ type: 'INTEREST_ACCEPTED', interestId: id })).toEqual({
      name: 'interests',
    });
    expect(routeFromNotificationData({ type: 'SOMETHING_ELSE' })).toBeNull();
  });
});
