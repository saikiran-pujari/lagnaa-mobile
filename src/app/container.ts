import * as api from '@/api';
import { env, release } from '@/core/env';
import { type ApiClient, createApiClient } from '@/core/http';
import { log } from '@/core/logger';
import { createMonitoring, type Monitoring } from '@/core/monitoring';
import { createNotificationsBridge, type NotificationsBridge } from '@/core/notifications';
import { createSession, type Session } from '@/core/session';
import {
  createKeychainSecureStore,
  createMemoryKeyValueFactory,
  createMmkvFactory,
  type KeyValueStoreFactory,
  namespaces,
  resolveEncryptionKey,
  type SecureStore,
} from '@/core/storage';
import { createNoopUpdateProvider, type UpdateProvider } from '@/core/updates';

import { createQueryClient, createQueryPersister, namespacesForMember } from './query';

/** Everything the app composes at startup. Built once by `bootstrap()`. */
export interface Container {
  secure: SecureStore;
  kv: KeyValueStoreFactory;
  session: Session;
  apiClient: ApiClient;
  monitoring: Monitoring;
  notifications: NotificationsBridge;
  updates: UpdateProvider;
  queryClient: ReturnType<typeof createQueryClient>;
  queryPersister: ReturnType<typeof createQueryPersister>;
}

export interface ContainerOverrides {
  secure?: SecureStore;
  kv?: KeyValueStoreFactory;
}

export async function buildContainer(overrides: ContainerOverrides = {}): Promise<Container> {
  log.setLevel(env.logLevel);
  const monitoring = createMonitoring(env, release);
  monitoring.init();

  const secure = overrides.secure ?? createKeychainSecureStore();
  let kv: KeyValueStoreFactory;
  if (overrides.kv) {
    kv = overrides.kv;
  } else {
    try {
      kv = createMmkvFactory(await resolveEncryptionKey(secure));
    } catch (e) {
      monitoring.captureError(e, { where: 'mmkv.init' });
      kv = createMemoryKeyValueFactory();
    }
  }

  const notifications = createNotificationsBridge();
  const queryClient = createQueryClient();
  const queryPersister = createQueryPersister(kv.open(namespaces.app));

  const session = createSession({
    secure,
    refreshTokens: (refreshToken) => api.auth.refreshTokens(refreshToken),
    revoke: (tokens) => api.auth.revoke(tokens),
    onSignedIn: async (memberId) => {
      monitoring.setMember(memberId);
    },
    onSignedOut: async (memberId) => {
      monitoring.setMember(null);
      queryClient.clear();
      await queryPersister.removeClient();
      if (memberId) for (const ns of namespacesForMember(memberId)) kv.open(ns).clearAll();
    },
  });

  const apiClient = createApiClient({
    baseUrl: env.apiBaseUrl,
    tokens: {
      getAccessToken: () => session.getAccessToken(),
      refresh: () => session.refresh(),
      onAuthFailure: (reason) => void session.signOut(reason),
    },
  });
  api.installApiClient(apiClient);

  const updates = createNoopUpdateProvider(env.ota.channel, 'embedded');
  monitoring.setBundle(updates.current().bundleId);

  return {
    secure,
    kv,
    session,
    apiClient,
    monitoring,
    notifications,
    updates,
    queryClient,
    queryPersister,
  };
}
