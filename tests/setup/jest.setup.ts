/* Native modules replaced by fakes so unit and component tests run without a device. */
jest.mock('react-native-config', () => ({
  __esModule: true,
  default: {
    APP_ENV: 'development',
    API_BASE_URL: 'http://localhost:3003/api',
    API_BASE_URL_ANDROID_EMULATOR: 'http://10.0.2.2:3003/api',
    OTA_CHANNEL: 'development',
    DEEP_LINK_SCHEME: 'lagnaa',
    UNIVERSAL_LINK_HOST: 'lagnaa.in',
    LOG_LEVEL: 'error',
  },
}));

jest.mock('react-native-keychain', () => {
  const store = new Map<string, string>();
  return {
    ACCESSIBLE: { AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: 'x' },
    getGenericPassword: jest.fn(async ({ service }: { service: string }) =>
      store.has(service) ? { username: service, password: store.get(service) } : false,
    ),
    setGenericPassword: jest.fn(async (_u: string, p: string, { service }: { service: string }) => {
      store.set(service, p);
      return true;
    }),
    resetGenericPassword: jest.fn(async ({ service }: { service: string }) =>
      store.delete(service),
    ),
  };
});

jest.mock('react-native-mmkv', () => ({
  createMMKV: () => {
    const m = new Map<string, string | number | boolean>();
    return {
      getString: (k: string) => (typeof m.get(k) === 'string' ? m.get(k) : undefined),
      getNumber: (k: string) => (typeof m.get(k) === 'number' ? m.get(k) : undefined),
      getBoolean: (k: string) => (typeof m.get(k) === 'boolean' ? m.get(k) : undefined),
      set: (k: string, v: string | number | boolean) => m.set(k, v),
      remove: (k: string) => m.delete(k),
      getAllKeys: () => [...m.keys()],
      clearAll: () => m.clear(),
    };
  },
}));

jest.mock('react-native-bootsplash', () => ({
  __esModule: true,
  default: { hide: jest.fn(async () => undefined) },
}));
jest.mock('@sentry/react-native', () => ({
  init: jest.fn(),
  captureException: jest.fn(),
  addBreadcrumb: jest.fn(),
  setUser: jest.fn(),
  setTag: jest.fn(),
  setTags: jest.fn(),
}));
jest.mock('@react-native-firebase/app', () => ({ getApps: () => [] }));
jest.mock('@react-native-firebase/messaging', () => ({}));
