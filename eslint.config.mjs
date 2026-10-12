import rnFlat from '@react-native/eslint-config/flat';
import prettier from 'eslint-config-prettier';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unusedImports from 'eslint-plugin-unused-imports';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tseslint from 'typescript-eslint';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

// The RN flat config's Flow block (eslint-plugin-ft-flow) is incompatible with ESLint 9; we have no Flow files.
const rnBase = rnFlat.filter((entry) => !(entry.plugins && 'ft-flow' in entry.plugins));

export default tseslint.config(
  {
    ignores: [
      'node_modules/**',
      'android/**',
      'ios/**',
      'coverage/**',
      'skills/**',
      '.claude/**',
      '.scratch-template/**',
      '**/*.generated.ts',
      'assets/**',
      'web/**',
    ],
  },
  ...rnBase,
  ...tseslint.configs.recommendedTypeChecked,
  prettier,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: { parserOptions: { projectService: true, tsconfigRootDir: rootDir } },
    plugins: { 'simple-import-sort': simpleImportSort, 'unused-imports': unusedImports },
    rules: {
      'simple-import-sort/imports': [
        'error',
        { groups: [['^\\u0000'], ['^react', '^@?\\w'], ['^@/'], ['^@tests/'], ['^\\.']] },
      ],
      'simple-import-sort/exports': 'error',
      'unused-imports/no-unused-imports': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/require-await': 'off',
      'react-native/no-inline-styles': 'off',
      'no-console': ['error', { allow: ['warn', 'error', 'log'] }],
      'no-void': 'off',
      'react/no-unstable-nested-components': ['warn', { allowAsProps: true }],
    },
  },
  {
    // Architecture rules: screens and the design system never touch infrastructure directly.
    files: ['src/features/**/screens/**', 'src/design-system/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'react-native-keychain', message: 'Use core/storage via the container.' },
            { name: 'react-native-mmkv', message: 'Use core/storage via the container.' },
            { name: '@react-navigation/native', message: 'Use @/navigation hooks.' },
          ],
          patterns: [
            { group: ['@react-native-firebase/*'], message: 'Use core/notifications.' },
            {
              group: ['@/core/http', '@/core/http/*'],
              message: 'Screens use feature hooks and @/api, not the HTTP client.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
    ...tseslint.configs.disableTypeChecked,
    rules: {
      ...tseslint.configs.disableTypeChecked.rules,
      '@typescript-eslint/no-require-imports': 'off',
    },
    languageOptions: {
      globals: {
        Buffer: 'readonly',
        require: 'readonly',
        module: 'writable',
        process: 'readonly',
        __dirname: 'readonly',
        console: 'readonly',
      },
    },
  },
  {
    files: ['tests/**'],
    rules: {
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/require-await': 'off',
    },
  },
);
