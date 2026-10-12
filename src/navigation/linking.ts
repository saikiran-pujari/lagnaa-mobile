import type { LinkingOptions } from '@react-navigation/native';

import { type DeepLinkConfig, type DeepLinkRoute, parseDeepLink } from '@/core/deeplinks';

import type { RootStackParamList } from './types';

/** React Navigation linking config: prefixes + the screen map. Parsing itself lives in core/deeplinks. */
export function buildLinking(config: DeepLinkConfig): LinkingOptions<RootStackParamList> {
  const prefixes = [`${config.scheme}://`];
  if (config.universalHost) prefixes.push(`https://${config.universalHost}`);
  return {
    prefixes,
    config: {
      screens: {
        ProfileDetail: 'profile/:profileId',
        ChatThread: 'chat/:conversationId',
        Main: { screens: { ConnectionsTab: 'interests' } },
        NotificationSettings: 'settings/notifications',
      },
    },
    // Only URLs our parser accepts are handed to React Navigation; everything else is dropped.
    filter: (url) => parseDeepLink(url, config) !== null,
  };
}

/** Converts a parsed route into a navigation action target. */
export function routeToNavigation(route: DeepLinkRoute): {
  name: keyof RootStackParamList;
  params?: object;
} {
  switch (route.name) {
    case 'profile':
      return { name: 'ProfileDetail', params: { profileId: route.profileId } };
    case 'chat':
      return { name: 'ChatThread', params: { conversationId: route.conversationId } };
    case 'interests':
    case 'connection':
      return {
        name: 'Main',
        params: { screen: 'ConnectionsTab', params: { segment: 'received' } },
      };
    case 'notificationSettings':
      return { name: 'NotificationSettings' };
  }
}
