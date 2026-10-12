import * as Keychain from 'react-native-keychain';

import type { SecureStore } from './types';

/**
 * Keychain-backed SecureStore. Each key is its own keychain service so entries can be
 * deleted independently. Accessible after first unlock, never migrated to another device.
 */
export function createKeychainSecureStore(prefix = 'in.lagnaa.app'): SecureStore {
  const service = (key: string) => `${prefix}.${key}`;
  const options = {
    accessible: Keychain.ACCESSIBLE.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
  };
  return {
    async get(key) {
      const result = await Keychain.getGenericPassword({ service: service(key) });
      return result ? result.password : null;
    },
    async set(key, value) {
      await Keychain.setGenericPassword(key, value, { ...options, service: service(key) });
    },
    async delete(key) {
      await Keychain.resetGenericPassword({ service: service(key) });
    },
  };
}
