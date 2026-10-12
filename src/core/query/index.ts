import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { type Query, QueryClient } from '@tanstack/react-query';
import type { Persister } from '@tanstack/react-query-persist-client';

import type { KeyValueStore } from '@/core/storage';

import { PERSISTED_DOMAINS } from './keys';

export { PERSISTED_DOMAINS, queryKeys } from './keys';

export const PERSIST_MAX_AGE_MS = 24 * 60 * 60 * 1000;

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: PERSIST_MAX_AGE_MS,
        retry: (failureCount, error) => {
          const retryable = (error as { retryable?: boolean }).retryable ?? false;
          return retryable && failureCount < 2;
        },
        refetchOnWindowFocus: false,
      },
      mutations: { retry: 0 },
    },
  });
}

/** Allow-list: only L1 domains are written to disk, never profile detail or messages. */
export function shouldDehydrateQuery(query: Query): boolean {
  const domain = query.queryKey[0];
  if (typeof domain !== 'string' || !PERSISTED_DOMAINS.has(domain)) return false;
  if (query.meta?.persist === false) return false;
  return query.state.status === 'success';
}

export function createQueryPersister(store: KeyValueStore): Persister {
  return createSyncStoragePersister({
    key: 'rq.cache',
    storage: {
      getItem: (k) => store.getString(k) ?? null,
      setItem: (k, v) => store.set(k, v),
      removeItem: (k) => store.delete(k),
    },
    throttleTime: 1_000,
  });
}
