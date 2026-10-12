import { Platform } from 'react-native';
import type * as AppNs from '@react-native-firebase/app';
import type * as MessagingNs from '@react-native-firebase/messaging';

import { log } from '@/core/logger';

/**
 * Push notifications bridge. Firebase is optional at build time (no google-services file in
 * dev); every call degrades to "not configured" instead of throwing.
 */
export interface NotificationsBridge {
  readonly configured: boolean;
  requestPermission(): Promise<boolean>;
  getToken(): Promise<string | null>;
  onTokenRefresh(handler: (token: string) => void): () => void;
  /** Fires when a notification tap opened or resumed the app. Also resolves the initial one. */
  onOpened(handler: (data: Record<string, string | undefined>) => void): () => void;
  onForegroundMessage(
    handler: (data: Record<string, string | undefined>, title?: string, body?: string) => void,
  ): () => void;
}

type MessagingModule = typeof MessagingNs;
type AppModule = typeof AppNs;

function loadFirebase(): { messaging: MessagingModule; app: AppModule } | null {
  try {
    // Required lazily so a build without Firebase config still boots.
    const app = require('@react-native-firebase/app') as AppModule;
    if (app.getApps().length === 0) return null;
    const messaging = require('@react-native-firebase/messaging') as MessagingModule;
    return { messaging, app };
  } catch (e) {
    log.info('notifications.firebase_unavailable', {
      error: e instanceof Error ? e.message : String(e),
    });
    return null;
  }
}

const noop = () => undefined;

export function createNotificationsBridge(): NotificationsBridge {
  const fb = loadFirebase();
  if (!fb) {
    return {
      configured: false,
      requestPermission: async () => false,
      getToken: async () => null,
      onTokenRefresh: () => noop,
      onOpened: () => noop,
      onForegroundMessage: () => noop,
    };
  }
  const m = fb.messaging;
  const instance = m.getMessaging();
  const asData = (msg: { data?: { [key: string]: string | object } }) => {
    const out: Record<string, string | undefined> = {};
    for (const [k, v] of Object.entries(msg.data ?? {}))
      out[k] = typeof v === 'string' ? v : undefined;
    return out;
  };
  return {
    configured: true,
    async requestPermission() {
      const status = await m.requestPermission(instance);
      const granted =
        status === m.AuthorizationStatus.AUTHORIZED || status === m.AuthorizationStatus.PROVISIONAL;
      log.info('notifications.permission', { granted, platform: Platform.OS });
      return granted;
    },
    async getToken() {
      try {
        return await m.getToken(instance);
      } catch (e) {
        log.warn('notifications.token_failed', {
          error: e instanceof Error ? e.message : String(e),
        });
        return null;
      }
    },
    onTokenRefresh(handler) {
      return m.onTokenRefresh(instance, handler);
    },
    onOpened(handler) {
      const unsub = m.onNotificationOpenedApp(instance, (msg) => handler(asData(msg)));
      void m.getInitialNotification(instance).then((msg) => {
        if (msg) handler(asData(msg));
      });
      return unsub;
    },
    onForegroundMessage(handler) {
      return m.onMessage(instance, (msg) =>
        handler(asData(msg), msg.notification?.title, msg.notification?.body),
      );
    },
  };
}
