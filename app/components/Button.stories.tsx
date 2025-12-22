import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

/**
 * ボタンコンポーネントのストーリー
 * 
 * Storybook で「レゴブロックを1個ずつ見る」ように、
 * ボタンの見た目を確認できます。
 */
const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 基本的なボタン
 * 一番よく使う青いボタンです
 */
export const Primary: Story = {
  args: {
    label: 'クリックしてね',
    variant: 'primary',
  },
};

/**
 * サブのボタン
 * 目立たせたくないときに使うグレーのボタンです
 */
export const Secondary: Story = {
  args: {
    label: 'キャンセル',
    variant: 'secondary',
  },
};

/**
 * 長いテキストのボタン
 * 文字が長いときにどう見えるか確認できます
 */
export const LongText: Story = {
  args: {
    label: 'これは長いテキストのボタンです',
    variant: 'primary',
  },
};
