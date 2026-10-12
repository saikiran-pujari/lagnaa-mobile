module.exports = (api) => {
  const isProduction = api.env('production');
  api.cache.using(() => isProduction);
  return {
    presets: ['module:@react-native/babel-preset'],
    plugins: [
      // Zod 4 and others use `export * as ns`; the RN 0.87 preset no longer includes this transform.
      '@babel/plugin-transform-export-namespace-from',
      [
        'module-resolver',
        {
          root: ['.'],
          alias: { '@': './src', '@tests': './tests' },
          extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
        },
      ],
      ...(isProduction ? [['transform-remove-console', { exclude: ['error', 'warn'] }]] : []),
      // Reanimated 4 worklets plugin must be last.
      'react-native-worklets/plugin',
    ],
  };
};
