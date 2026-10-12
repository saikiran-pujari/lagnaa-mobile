export * from 'react-native-web';

/** Native screens probes TurboModules; they are absent in the browser. */
export const TurboModuleRegistry = {
  get(_name: string) {
    return null;
  },
  getEnforcing(name: string): never {
    throw new Error(`${name} is not available in the browser preview`);
  },
};
