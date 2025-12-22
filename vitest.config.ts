import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    // グローバルに expect などを使えるようにする
    globals: true,
    // ブラウザ環境を再現する
    environment: 'jsdom',
    // テストのセットアップファイル
    setupFiles: ['./vitest.setup.ts'],
    // テストファイルのパターン
    include: ['**/*.{test,spec}.{ts,tsx}'],
    // カバレッジの設定
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '.next/',
        'out/',
        '**/*.config.*',
        '**/*.setup.*',
        '**/types/**',
      ],
    },
  },
  resolve: {
    // Next.js と同じエイリアス設定
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
