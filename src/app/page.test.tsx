import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SessionProvider } from 'next-auth/react';
import Home from './page';

/**
 * ホームページのテスト
 *
 * このテストは「画面が正しく表示されるか」を確認します。
 * 初心者向けの最初のテストとして、シンプルな内容にしています。
 */
describe('Home Page', () => {
  // テスト用のラッパー関数
  const renderWithSession = (component: React.ReactElement) => {
    return render(
      <SessionProvider session={null}>{component}</SessionProvider>
    );
  };

  it('ページが正しく表示される', () => {
    // ホームページを描画する
    renderWithSession(<Home />);

    // Productivity Hub というタイトルが表示されているか確認
    const heading = screen.getByText(/Productivity Hub/i);
    expect(heading).toBeInTheDocument();
  });

  it('サイドバーが表示される', () => {
    // ホームページを描画する
    renderWithSession(<Home />);

    // サイドバーの「ホーム」メニューが表示されているか確認
    const homeMenu = screen.getByText('ホーム');
    expect(homeMenu).toBeInTheDocument();
  });

  it('今月の支出カードが表示される', () => {
    // ホームページを描画する
    renderWithSession(<Home />);

    // 今月の支出カードが表示されているか確認
    const expenseCard = screen.getByText('今月の支出');
    expect(expenseCard).toBeInTheDocument();
  });
});
