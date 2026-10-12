export { createKeychainSecureStore } from './keychain';
export {
  createMemoryKeyValueFactory,
  createMemoryKeyValueStore,
  createMemorySecureStore,
} from './memory';
export { createMmkvFactory, resolveEncryptionKey } from './mmkv';
export type { KeyValueStore, KeyValueStoreFactory, SecureStore } from './types';

/** Namespaces: 'app' is Member-independent; everything else is `member:<id>`. */
export const namespaces = {
  app: 'app',
  member: (memberId: string) => `member.${memberId}`,
} as const;
