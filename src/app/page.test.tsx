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
 * 認証済みユーザーのダッシュボード表示をテストします。
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
              categories: [
                {
                  name: '食費',
                  amount: 20000,
                  percentage: 40,
                  color: '#FF6B6B',
                },
                {
                  name: '交通費',
                  amount: 15000,
                  percentage: 30,
                  color: '#4ECDC4',
                },
                {
                  name: 'その他',
                  amount: 15000,
                  percentage: 30,
                  color: '#95E1D3',
                },
              ],
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

  it('認証済みユーザーのダッシュボードが正しく表示される', async () => {
    renderWithSession(<Home />);

    // ローディングが終わるまで待つ
    await waitFor(() => {
      expect(screen.queryByText('読み込み中...')).not.toBeInTheDocument();
    });

    // 主要な要素が表示されていることを確認
    expect(screen.getByText('Productivity Hub')).toBeInTheDocument();
    expect(screen.getByText(/テストユーザー/i)).toBeInTheDocument();
  });

  it('APIからダッシュボードデータを取得する', async () => {
    renderWithSession(<Home />);

    await waitFor(() => {
      expect(screen.queryByText('読み込み中...')).not.toBeInTheDocument();
    });

    // fetch が /api/dashboard を呼び出したことを確認
    expect(global.fetch).toHaveBeenCalledWith('/api/dashboard');
  });
});
