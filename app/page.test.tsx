import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Home from './page';

/**
 * ホームページのテスト
 * 
 * このテストは「画面が正しく表示されるか」を確認します。
 * 初心者向けの最初のテストとして、シンプルな内容にしています。
 */
describe('Home Page', () => {
  it('ページが正しく表示される', () => {
    // ホームページを描画する
    render(<Home />);

    // 「To get started」というテキストが表示されているか確認
    const heading = screen.getByText(/To get started/i);
    expect(heading).toBeInTheDocument();
  });

  it('Next.js のロゴが表示される', () => {
    // ホームページを描画する
    render(<Home />);

    // Next.js のロゴ画像が表示されているか確認
    const logo = screen.getByAltText('Next.js logo');
    expect(logo).toBeInTheDocument();
  });

  it('Deploy Now ボタンが表示される', () => {
    // ホームページを描画する
    render(<Home />);

    // Deploy Now ボタンが表示されているか確認
    const deployButton = screen.getByText('Deploy Now');
    expect(deployButton).toBeInTheDocument();
  });
});
