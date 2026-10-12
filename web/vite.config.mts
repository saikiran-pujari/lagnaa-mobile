import path from 'node:path';
import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const webDir = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.resolve(webDir, '..');

const extensions = [
  '.web.tsx',
  '.web.ts',
  '.web.jsx',
  '.web.js',
  '.tsx',
  '.ts',
  '.jsx',
  '.js',
  '.mjs',
  '.json',
];

function shim(file: string) {
  return path.resolve(webDir, 'shims', file);
}

export default defineConfig({
  root: webDir,
  plugins: [react()],
  resolve: {
    extensions,
    alias: [
      { find: /^react-native$/, replacement: shim('react-native.ts') },
      { find: 'react-native-config', replacement: shim('config.ts') },
      { find: 'react-native-keychain', replacement: shim('keychain.ts') },
      { find: 'react-native-mmkv', replacement: shim('mmkv.ts') },
      { find: 'react-native-bootsplash', replacement: shim('bootsplash.ts') },
      { find: 'react-native-reanimated', replacement: shim('reanimated.tsx') },
      { find: '@sentry/react-native', replacement: shim('sentry.ts') },
      { find: '@react-native-firebase/app', replacement: shim('firebase-app.ts') },
      { find: '@react-native-firebase/messaging', replacement: shim('firebase-messaging.ts') },
      {
        find: '@react-native/assets-registry/registry',
        replacement: shim('asset-registry.ts'),
      },
      { find: /^@\//, replacement: `${path.resolve(appDir, 'src')}/` },
    ],
  },
  define: {
    __DEV__: JSON.stringify(true),
    global: 'globalThis',
  },
  optimizeDeps: {
    rolldownOptions: {
      resolve: { extensions },
    },
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
    fs: { allow: [appDir] },
  },
});
