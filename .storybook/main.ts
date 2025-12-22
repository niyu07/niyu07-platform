import type { StorybookConfig } from '@storybook/nextjs';

const config: StorybookConfig = {
  // ストーリーファイルの場所
  stories: ['../**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  
  // 使用するアドオン
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  
  // Next.js フレームワークを使用
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },
  
  // ドキュメント設定
  docs: {
    autodocs: 'tag',
  },
  
  // 静的ファイルの場所
  staticDirs: ['../public'],
};

export default config;
