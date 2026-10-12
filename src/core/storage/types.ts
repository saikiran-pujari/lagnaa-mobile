/** Secret storage: OS keychain / keystore. Async because the native bridge is. */
export interface SecureStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
}

/** Fast synchronous key/value storage (encrypted MMKV in the app). */
export interface KeyValueStore {
  getString(key: string): string | undefined;
  getNumber(key: string): number | undefined;
  getBoolean(key: string): boolean | undefined;
  set(key: string, value: string | number | boolean): void;
  delete(key: string): void;
  getAllKeys(): string[];
  clearAll(): void;
}

export interface KeyValueStoreFactory {
  /** One isolated store per namespace (e.g. per Member). */
  open(namespace: string): KeyValueStore;
}
