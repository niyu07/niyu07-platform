import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

/**
 * ボタンコンポーネントのテスト
 * 
 * ボタンが正しく動くかを確認します。
 */
describe('Button', () => {
  it('ボタンが表示される', () => {
    render(<Button label="テストボタン" />);

    const button = screen.getByText('テストボタン');
    expect(button).toBeInTheDocument();
  });

  it('クリックすると関数が呼ばれる', async () => {
    // クリックされたかを記録する関数を作る
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button label="クリック" onClick={handleClick} />);

    const button = screen.getByText('クリック');
    await user.click(button);

    // 関数が1回呼ばれたか確認
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('primary ボタンは青い背景になる', () => {
    render(<Button label="Primary" variant="primary" />);

    const button = screen.getByText('Primary');
    expect(button).toHaveClass('bg-blue-600');
  });

  it('secondary ボタンはグレーの背景になる', () => {
    render(<Button label="Secondary" variant="secondary" />);

    const button = screen.getByText('Secondary');
    expect(button).toHaveClass('bg-gray-200');
  });
});
