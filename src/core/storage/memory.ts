import type { KeyValueStore, KeyValueStoreFactory, SecureStore } from './types';

/** In-memory adapters for tests and for environments without native storage. */
export function createMemorySecureStore(): SecureStore {
  const m = new Map<string, string>();
  return {
    get: async (k) => m.get(k) ?? null,
    set: async (k, v) => {
      m.set(k, v);
    },
    delete: async (k) => {
      m.delete(k);
    },
  };
}

export function createMemoryKeyValueStore(): KeyValueStore {
  const m = new Map<string, string | number | boolean>();
  return {
    getString: (k) => {
      const v = m.get(k);
      return typeof v === 'string' ? v : undefined;
    },
    getNumber: (k) => {
      const v = m.get(k);
      return typeof v === 'number' ? v : undefined;
    },
    getBoolean: (k) => {
      const v = m.get(k);
      return typeof v === 'boolean' ? v : undefined;
    },
    set: (k, v) => {
      m.set(k, v);
    },
    delete: (k) => {
      m.delete(k);
    },
    getAllKeys: () => [...m.keys()],
    clearAll: () => m.clear(),
  };
}

export function createMemoryKeyValueFactory(): KeyValueStoreFactory {
  const stores = new Map<string, KeyValueStore>();
  return {
    open: (ns) => {
      let s = stores.get(ns);
      if (!s) {
        s = createMemoryKeyValueStore();
        stores.set(ns, s);
      }
      return s;
    },
  };
}
