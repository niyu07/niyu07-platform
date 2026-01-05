import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SessionProvider, useSession } from 'next-auth/react';
import Home from './page';

// next-auth/react をモック
vi.mock('next-auth/react', async () => {
  const actual =
    await vi.importActual<typeof import('next-auth/react')>('next-auth/react');
  return {
    ...actual,
    useSession: vi.fn(),
  };
});

/**
 * ホームページのテスト
 *
 * このテストは「画面が正しく表示されるか」を確認します。
 * 初心者向けの最初のテストとして、シンプルな内容にしています。
 */
describe('Home Page', () => {
  beforeEach(() => {
    // モックをクリア
    vi.clearAllMocks();

    // useSession のモックをセットアップ
    vi.mocked(useSession).mockReturnValue({
      data: {
        user: {
          id: '1',
          name: 'テストユーザー',
          email: 'test@example.com',
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
      status: 'authenticated',
      update: vi.fn(),
    });

    // グローバル fetch をモック
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            user: {
              id: '1',
              name: 'テストユーザー',
              email: 'test@example.com',
            },
            summaryData: {
              todayEvents: 3,
              todayTasks: {
                completed: 3,
                total: 5,
                percentage: 60,
              },
              weeklyIncome: {
                amount: 50000,
                change: 10,
              },
              todayStudy: {
                goal: 3,
                remaining: 1,
                percentage: 67,
              },
              dependentLimit: {
                remaining: 500000,
              },
              needsAttention: false,
            },
            todayEvents: [],
            todayTasks: [],
            weather: null,
            pomodoroData: [],
            expenseData: {
              categories: [],
              total: 50000,
              period: '2025年1月',
            },
          }),
      })
    ) as unknown as typeof fetch;
  });

  // テスト用のラッパー関数
  const renderWithSession = (component: React.ReactElement) => {
    return render(
      <SessionProvider session={null}>{component}</SessionProvider>
    );
  };

  it('ページが正しく表示される', async () => {
    // ホームページを描画する
    renderWithSession(<Home />);

    // データが読み込まれるまで待つ
    await waitFor(() => {
      expect(screen.queryByText('読み込み中...')).not.toBeInTheDocument();
    });

    // ユーザー名が表示されているか確認
    const userName = await screen.findByText(/テストユーザー/i);
    expect(userName).toBeInTheDocument();
  });

  it('サイドバーが表示される', async () => {
    // ホームページを描画する
    renderWithSession(<Home />);

    // データが読み込まれるまで待つ
    await waitFor(
      () => {
        expect(screen.queryByText('読み込み中...')).not.toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // サイドバーのタイトルが表示されているか確認
    const sidebarTitle = screen.getByText('Productivity Hub');
    expect(sidebarTitle).toBeInTheDocument();
  });

  it('今月の支出カードが表示される', async () => {
    // ホームページを描画する
    renderWithSession(<Home />);

    // データが読み込まれるまで待つ
    await waitFor(() => {
      expect(screen.queryByText('読み込み中...')).not.toBeInTheDocument();
    });

    // 今月の支出カードが表示されているか確認
    const expenseCard = await screen.findByText('今月の支出');
    expect(expenseCard).toBeInTheDocument();
  });
});
