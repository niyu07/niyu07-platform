import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Prettier との統合(パッケージインストール後に有効化)
  // {
  //   plugins: {
  //     prettier: (await import('eslint-plugin-prettier')).default,
  //   },
  //   rules: {
  //     'prettier/prettier': 'error',
  //   },
  // },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // 追加の無視パターン
    'node_modules/**',
    'coverage/**',
    '.storybook-static/**',
  ]),
]);

export default eslintConfig;
