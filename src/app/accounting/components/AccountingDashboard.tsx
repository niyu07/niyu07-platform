'use client';

import {
  mockAccountingKPI,
  mockMonthlyFinancialData,
  mockTransactions,
} from '../../data/mockData';
import { Transaction } from '../../types';
import { useState } from 'react';

type DisplayMode = '利益' | '売上' | '経費';

type TabType =
  | 'ダッシュボード'
  | '取引入力'
  | '取引一覧'
  | '扶養シミュレーター'
  | 'レポート'
  | '確定申告'
  | '設定';

interface AccountingDashboardProps {
  onNavigateToInput: (tab: TabType, transactionType?: '収入' | '経費') => void;
  onNavigateToTab: (tab: TabType) => void;
}

export default function AccountingDashboard({
  onNavigateToInput,
  onNavigateToTab,
}: AccountingDashboardProps) {
  const [displayMode, setDisplayMode] = useState<DisplayMode>('利益');
  const [selectedYear, setSelectedYear] = useState<number>(2024);

  const kpi = mockAccountingKPI;
  const monthlyData = mockMonthlyFinancialData;
  const recentTransactions = mockTransactions.slice(0, 5);

  // グラフの最大値を計算
  const maxValue = Math.max(
    ...monthlyData.map((d) => {
      if (displayMode === '利益') return d.profit;
      if (displayMode === '売上') return d.revenue;
      return d.expense;
    })
  );

  const formatCurrency = (amount: number, showSign = false): string => {
    const formatted = `¥${amount.toLocaleString()}`;
    if (showSign && amount > 0) return `+${formatted}`;
    if (showSign && amount < 0) return `-${formatted}`;
    return formatted;
  };

  const getTransactionAmount = (transaction: Transaction): string => {
    const sign = transaction.type === '収入' ? '+' : '-';
    return `${sign}¥${transaction.amount.toLocaleString()}`;
  };

  const getTransactionColor = (transaction: Transaction): string => {
    return transaction.type === '収入' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* KPIカード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 今年の売上 */}
        <div className="bg-gradient-to-br from-green-400 to-green-500 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-white/20 rounded-lg p-2">💰</div>
            <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
              +{kpi.yearRevenueChange}%
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-white/80">今年の売上</p>
            <p className="text-3xl font-bold mt-1">
              ¥{kpi.yearRevenue.toLocaleString()}
            </p>
          </div>
          <div className="mt-4 h-1 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white/40 rounded-full w-3/4"></div>
          </div>
        </div>

        {/* 今年の経費 */}
        <div className="bg-gradient-to-br from-red-400 to-red-500 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-white/20 rounded-lg p-2">📊</div>
            <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
              経費率 {kpi.expenseRate}%
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-white/80">今年の経費</p>
            <p className="text-3xl font-bold mt-1">
              ¥{kpi.yearExpense.toLocaleString()}
            </p>
          </div>
          <div className="mt-4 h-1 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white/40 rounded-full w-1/3"></div>
          </div>
        </div>

        {/* 事業所得 */}
        <div className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-white/20 rounded-lg p-2">💼</div>
            <div className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-medium">
              あと ¥{kpi.dependentRemaining.toLocaleString()}
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-white/80">事業所得（青色控除後）</p>
            <p className="text-3xl font-bold mt-1">
              ¥{kpi.businessIncome.toLocaleString()}
            </p>
          </div>
          <div className="mt-4 h-1 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white/40 rounded-full w-1/2"></div>
          </div>
        </div>
      </div>

      {/* アクションボタン */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => onNavigateToInput('取引入力', '収入')}
          className="border-2 border-dashed border-green-300 bg-green-50 hover:bg-green-100 rounded-xl p-6 text-center transition-colors"
        >
          <span className="text-2xl mb-2 block">+</span>
          <span className="text-green-700 font-medium">売上を追加</span>
        </button>
        <button
          onClick={() => onNavigateToInput('取引入力', '経費')}
          className="border-2 border-dashed border-red-300 bg-red-50 hover:bg-red-100 rounded-xl p-6 text-center transition-colors"
        >
          <span className="text-2xl mb-2 block">+</span>
          <span className="text-red-700 font-medium">経費を追加</span>
        </button>
      </div>

      {/* 月別収支推移 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">月別収支推移</h2>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={2024}>2024年</option>
            <option value={2023}>2023年</option>
          </select>
        </div>

        {/* 表示モード切替 */}
        <div className="flex gap-2 mb-6">
          {(['利益', '売上', '経費'] as DisplayMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setDisplayMode(mode)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                displayMode === mode
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* グラフ */}
        <div className="relative h-64">
          <div className="absolute inset-0 flex items-end justify-between gap-2 px-4">
            {monthlyData.map((data, index) => {
              const value =
                displayMode === '利益'
                  ? data.profit
                  : displayMode === '売上'
                    ? data.revenue
                    : data.expense;
              const height = (value / maxValue) * 100;
              const color =
                displayMode === '利益'
                  ? 'bg-blue-500'
                  : displayMode === '売上'
                    ? 'bg-green-500'
                    : 'bg-red-500';

              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex items-end justify-center h-48">
                    <div
                      className={`w-full ${color} rounded-t-lg transition-all hover:opacity-80 cursor-pointer`}
                      style={{ height: `${height}%` }}
                      title={`${data.month}: ${formatCurrency(value)}`}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-600 mt-2">{data.month}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 凡例 */}
        <div className="flex items-center justify-center gap-6 mt-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">利益</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600">売上</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-600">経費</span>
          </div>
        </div>
      </div>

      {/* 最近の取引 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">最近の取引</h2>
          <button
            onClick={() => onNavigateToTab('取引一覧')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
          >
            すべて見る
            <span>→</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  日付
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  種類
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  カテゴリ
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  詳細
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                  金額
                </th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">
                  アクション
                </th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4 text-sm text-gray-900">
                    {transaction.date}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        transaction.type === '収入'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {transaction.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {transaction.category}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900">
                    {transaction.detail}
                  </td>
                  <td
                    className={`py-3 px-4 text-sm text-right font-medium ${getTransactionColor(transaction)}`}
                  >
                    {getTransactionAmount(transaction)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button className="text-gray-400 hover:text-blue-600">
                        ✏️
                      </button>
                      <button className="text-gray-400 hover:text-red-600">
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
