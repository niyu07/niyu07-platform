import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// @testing-library/jest-dom のマッチャーを追加
expect.extend(matchers);

// 各テスト後にクリーンアップ
afterEach(() => {
  cleanup();
});

// グローバルなテストのセットアップをここに書く
// 例: モックの設定、グローバル変数の設定など
