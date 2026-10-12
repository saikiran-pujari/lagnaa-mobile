import type { ApiClient } from '@/core/http';

let client: ApiClient | null = null;

/** The composition root installs the client once; api modules read it lazily. */
export function installApiClient(c: ApiClient): void {
  client = c;
}

export function api(): ApiClient {
  if (!client)
    throw new Error('ApiClient not installed. Call installApiClient() during bootstrap.');
  return client;
}
