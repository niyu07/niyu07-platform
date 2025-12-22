import type { Preview } from '@storybook/react';
import '../app/globals.css'; // Next.js のグローバルスタイルを読み込む

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
