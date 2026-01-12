'use client';

import { useMemo } from 'react';

interface HistoryData {
  month: string;
  total: number;
  limit: number;
  breakdown: Record<string, number>;
}

interface UsageHistoryChartProps {
  history: HistoryData[];
}

export default function UsageHistoryChart({ history }: UsageHistoryChartProps) {
  // 月を日本語表記に変換（例: 2026-01 → 2026年1月）
  const formatMonth = (month: string) => {
    const [year, monthNum] = month.split('-');
    return `${year}年${parseInt(monthNum, 10)}月`;
  };

  // グラフ描画用のデータを計算
  const chartData = useMemo(() => {
    const maxValue = Math.max(
      ...history.map((h) => Math.max(h.total, h.limit))
    );
    return history
      .slice()
      .reverse()
      .map((item) => ({
        ...item,
        percentage: maxValue > 0 ? (item.total / maxValue) * 100 : 0,
        usageRate: item.limit > 0 ? (item.total / item.limit) * 100 : 0,
      }));
  }, [history]);

  if (history.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          月次使用履歴
        </h2>
        <p className="text-gray-500">データがありません</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">月次使用履歴</h2>

      {/* グラフ */}
      <div className="space-y-4">
        {chartData.map((item, index) => (
          <div key={index}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">
                {formatMonth(item.month)}
              </span>
              <span className="text-sm text-gray-600">
                {item.total.toLocaleString()} / {item.limit.toLocaleString()} 回
                <span
                  className={`ml-2 font-semibold ${
                    item.usageRate >= 90
                      ? 'text-red-600'
                      : item.usageRate >= 70
                        ? 'text-yellow-600'
                        : 'text-green-600'
                  }`}
                >
                  ({Math.round(item.usageRate)}%)
                </span>
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
              <div
                className={`h-6 rounded-full transition-all duration-300 ${
                  item.usageRate >= 90
                    ? 'bg-red-500'
                    : item.usageRate >= 70
                      ? 'bg-yellow-500'
                      : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(item.usageRate, 100)}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* 凡例 */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-600 mb-2">使用率の目安:</p>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-sm text-gray-700">70%未満（安全）</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span className="text-sm text-gray-700">70-90%（注意）</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-sm text-gray-700">90%以上（警告）</span>
          </div>
        </div>
      </div>
    </div>
  );
}
