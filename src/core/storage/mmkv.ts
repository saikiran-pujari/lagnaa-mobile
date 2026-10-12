import { createMMKV, type MMKV } from 'react-native-mmkv';

import type { KeyValueStore, KeyValueStoreFactory, SecureStore } from './types';

const ENCRYPTION_KEY_NAME = 'mmkv.encryption-key';

function randomKey(bytes = 32): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let out = '';
  for (let i = 0; i < bytes; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

/** Fetches (or creates once) the MMKV encryption key from the secure store. */
export async function resolveEncryptionKey(secure: SecureStore): Promise<string> {
  const existing = await secure.get(ENCRYPTION_KEY_NAME);
  if (existing) return existing;
  const created = randomKey();
  await secure.set(ENCRYPTION_KEY_NAME, created);
  return created;
}

function wrap(instance: MMKV): KeyValueStore {
  return {
    getString: (k) => instance.getString(k),
    getNumber: (k) => instance.getNumber(k),
    getBoolean: (k) => instance.getBoolean(k),
    set: (k, v) => instance.set(k, v),
    delete: (k) => instance.remove(k),
    getAllKeys: () => instance.getAllKeys(),
    clearAll: () => instance.clearAll(),
  };
}

/** Encrypted MMKV factory; one instance per namespace, all sharing the keychain-held key. */
export function createMmkvFactory(encryptionKey: string): KeyValueStoreFactory {
  const cache = new Map<string, KeyValueStore>();
  return {
    open(namespace) {
      let s = cache.get(namespace);
      if (!s) {
        s = wrap(createMMKV({ id: `lagnaa.${namespace}`, encryptionKey }));
        cache.set(namespace, s);
      }
      return s;
    },
  };
}
