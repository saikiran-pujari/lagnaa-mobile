const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Every destination a link or a notification can open. Resolved by the navigation module. */
export type DeepLinkRoute =
  | { name: 'profile'; profileId: string }
  | { name: 'chat'; conversationId: string }
  | { name: 'interests' }
  | { name: 'connection'; interestId: string }
  | { name: 'notificationSettings' };

export interface DeepLinkConfig {
  scheme: string;
  universalHost: string;
}

/**
 * Parses `lagnaa://…` and `https://<host>/…` URLs into routes. Returns null for anything
 * unknown, malformed, or with a non-UUID id, so unexpected input can never reach a screen.
 */
export function parseDeepLink(url: string, config: DeepLinkConfig): DeepLinkRoute | null {
  let path: string;
  const schemePrefix = `${config.scheme}://`;
  if (url.startsWith(schemePrefix)) {
    path = url.slice(schemePrefix.length);
  } else if (config.universalHost && url.startsWith(`https://${config.universalHost}/`)) {
    path = url.slice(`https://${config.universalHost}/`.length);
  } else {
    return null;
  }
  const segments = path.split('?')[0]!.split('#')[0]!.split('/').filter(Boolean);
  const [head, id] = segments;
  switch (head) {
    case 'profile':
      return id && UUID.test(id) && segments.length === 2
        ? { name: 'profile', profileId: id }
        : null;
    case 'chat':
      return id && UUID.test(id) && segments.length === 2
        ? { name: 'chat', conversationId: id }
        : null;
    case 'interests':
      return segments.length === 1 ? { name: 'interests' } : null;
    case 'connection':
      return id && UUID.test(id) && segments.length === 2
        ? { name: 'connection', interestId: id }
        : null;
    case 'settings':
      return id === 'notifications' && segments.length === 2
        ? { name: 'notificationSettings' }
        : null;
    default:
      return null;
  }
}

/** Translates a push payload (server contract: data.type + ids) into the same routes. */
export function routeFromNotificationData(
  data: Record<string, string | undefined> | undefined,
): DeepLinkRoute | null {
  if (!data) return null;
  switch (data.type) {
    case 'NEW_MESSAGE':
      return data.conversationId && UUID.test(data.conversationId)
        ? { name: 'chat', conversationId: data.conversationId }
        : null;
    case 'NEW_INTEREST':
    case 'INTEREST_ACCEPTED':
      return { name: 'interests' };
    default:
      return null;
  }
}
