'use client';

import { useState } from 'react';

export default function Reports() {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // ダミーデータ
  const reportData = {
    totalRevenue: 920000,
    totalExpense: 340000,
    profit: 580000,
    profitMargin: 63,
    categoryBreakdown: [
      { category: '消耗品費', amount: 95200, percentage: 28, color: '#4F7FFF' },
      {
        category: '旅費交通費',
        amount: 74800,
        percentage: 22,
        color: '#10b981',
      },
      { category: '通信費', amount: 61200, percentage: 18, color: '#a855f7' },
      {
        category: '水道光熱費',
        amount: 51000,
        percentage: 15,
        color: '#f97316',
      },
      { category: '地代家賃', amount: 34000, percentage: 10, color: '#eab308' },
      { category: 'その他', amount: 23800, percentage: 7, color: '#9ca3af' },
    ],
    clientRevenue: [
      {
        rank: 1,
        client: '株式会社A',
        amount: 320000,
        transactions: 8,
        contribution: 35,
      },
      {
        rank: 2,
        client: '株式会社B',
        amount: 250000,
        transactions: 5,
        contribution: 27,
      },
      {
        rank: 3,
        client: '株式会社C',
        amount: 180000,
        transactions: 4,
        contribution: 20,
      },
      {
        rank: 4,
        client: '個人クライアントD',
        amount: 100000,
        transactions: 2,
        contribution: 11,
      },
    ],
    monthlyData: [
      { month: '1月', profit: 47000, revenue: 75000, expense: 28000 },
      { month: '2月', profit: 40000, revenue: 60000, expense: 20000 },
      { month: '3月', profit: 55000, revenue: 85000, expense: 30000 },
      { month: '4月', profit: 47000, revenue: 75000, expense: 28000 },
      { month: '5月', profit: 70000, revenue: 100000, expense: 30000 },
      { month: '6月', profit: 75000, revenue: 120000, expense: 45000 },
    ],
  };

  const maxMonthlyValue = Math.max(
    ...reportData.monthlyData.map((d) =>
      Math.max(d.profit, d.revenue, d.expense)
    )
  );

  return (
    <div className="space-y-6">
      {/* ヘッダー・期間選択 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              期間:
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="yyyy/mm/dd"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="flex items-center text-gray-500">〜</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="yyyy/mm/dd"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              今年
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              今月
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              前年
            </button>
          </div>

          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
              <span>⬇️</span>
              PDFダウンロード
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              レポート生成
            </button>
          </div>
        </div>
      </div>

      {/* KPIカード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-400 to-green-500 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-white/20 rounded-lg p-2">💰</div>
            <span className="text-sm text-white/80">売上合計</span>
          </div>
          <div className="text-3xl font-bold">
            ¥{reportData.totalRevenue.toLocaleString()}
          </div>
          <div className="mt-2 text-sm text-white/80">
            <span className="bg-white/20 px-2 py-1 rounded">利益率 63%</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-400 to-red-500 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-white/20 rounded-lg p-2">📊</div>
            <span className="text-sm text-white/80">経費合計</span>
          </div>
          <div className="text-3xl font-bold">
            ¥{reportData.totalExpense.toLocaleString()}
          </div>
          <div className="mt-2 text-sm text-white/80">
            <span className="bg-white/20 px-2 py-1 rounded">経費率 37%</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-white/20 rounded-lg p-2">📈</div>
            <span className="text-sm text-white/80">利益</span>
          </div>
          <div className="text-3xl font-bold">
            ¥{reportData.profit.toLocaleString()}
          </div>
          <div className="mt-2 text-sm text-white/80">
            <span className="bg-white/20 px-2 py-1 rounded">利益率 63%</span>
          </div>
        </div>
      </div>

      {/* 経費カテゴリ別内訳 & 月次収支推移 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 経費カテゴリ別内訳 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-6">
            経費カテゴリ別内訳
          </h3>

          {/* ドーナツチャート（中心に合計） */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative w-48 h-48">
              <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
                {reportData.categoryBreakdown.map((cat, index) => {
                  const total = reportData.categoryBreakdown.reduce(
                    (sum, c) => sum + c.percentage,
                    0
                  );
                  const startAngle = reportData.categoryBreakdown
                    .slice(0, index)
                    .reduce((sum, c) => sum + (c.percentage / total) * 360, 0);
                  const endAngle = startAngle + (cat.percentage / total) * 360;

                  const radius = 70;
                  const innerRadius = 50;
                  const startRad = (startAngle * Math.PI) / 180;
                  const endRad = (endAngle * Math.PI) / 180;

                  const x1 = 100 + radius * Math.cos(startRad);
                  const y1 = 100 + radius * Math.sin(startRad);
                  const x2 = 100 + radius * Math.cos(endRad);
                  const y2 = 100 + radius * Math.sin(endRad);
                  const x3 = 100 + innerRadius * Math.cos(endRad);
                  const y3 = 100 + innerRadius * Math.sin(endRad);
                  const x4 = 100 + innerRadius * Math.cos(startRad);
                  const y4 = 100 + innerRadius * Math.sin(startRad);

                  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

                  return (
                    <path
                      key={index}
                      d={`M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`}
                      fill={cat.color}
                      className="hover:opacity-80 cursor-pointer transition-opacity"
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-2xl font-bold text-gray-900">
                  ¥{(reportData.totalExpense / 1000).toFixed(0)}k
                </div>
                <div className="text-sm text-gray-500">合計経費</div>
              </div>
            </div>
          </div>

          {/* 凡例 */}
          <div className="grid grid-cols-2 gap-3">
            {reportData.categoryBreakdown.map((cat, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: cat.color }}
                ></div>
                <div className="flex-1">
                  <div className="text-xs text-gray-600">{cat.category}</div>
                  <div className="text-sm font-medium">{cat.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 月次収支推移 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-6">月次収支推移</h3>

          <div className="relative h-64">
            <div className="absolute inset-0 flex items-end justify-between gap-3">
              {reportData.monthlyData.map((data, index) => {
                const revenueHeight = (data.revenue / maxMonthlyValue) * 100;
                const expenseHeight = (data.expense / maxMonthlyValue) * 100;
                const profitHeight = (data.profit / maxMonthlyValue) * 100;

                return (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center"
                  >
                    <div className="w-full flex gap-1 items-end justify-center h-48">
                      <div
                        className="flex-1 bg-blue-400 rounded-t hover:opacity-80 cursor-pointer"
                        style={{ height: `${profitHeight}%` }}
                        title={`利益: ¥${data.profit.toLocaleString()}`}
                      ></div>
                      <div
                        className="flex-1 bg-green-400 rounded-t hover:opacity-80 cursor-pointer"
                        style={{ height: `${revenueHeight}%` }}
                        title={`売上: ¥${data.revenue.toLocaleString()}`}
                      ></div>
                      <div
                        className="flex-1 bg-red-400 rounded-t hover:opacity-80 cursor-pointer"
                        style={{ height: `${expenseHeight}%` }}
                        title={`経費: ¥${data.expense.toLocaleString()}`}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-600 mt-2">
                      {data.month}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 凡例 */}
          <div className="flex items-center justify-center gap-6 mt-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-400 rounded"></div>
              <span className="text-gray-600">利益</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded"></div>
              <span className="text-gray-600">売上</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-400 rounded"></div>
              <span className="text-gray-600">経費</span>
            </div>
          </div>
        </div>
      </div>

      {/* 取引先別売上 TOP 10 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-6">
          取引先別売上 TOP 10
        </h3>

        <div className="space-y-4">
          {reportData.clientRevenue.map((client) => (
            <div key={client.rank} className="flex items-center gap-4">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                  client.rank === 1
                    ? 'bg-yellow-400'
                    : client.rank === 2
                      ? 'bg-gray-400'
                      : client.rank === 3
                        ? 'bg-orange-400'
                        : 'bg-gray-300'
                }`}
              >
                {client.rank === 1 && '🥇'}
                {client.rank === 2 && '🥈'}
                {client.rank === 3 && '🥉'}
                {client.rank > 3 && client.rank}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900">{client.client}</h4>
                <p className="text-sm text-gray-600">
                  取引回数: {client.transactions}回
                </p>
              </div>
              <div className="flex-1">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${client.contribution}%` }}
                  ></div>
                </div>
              </div>
              <div className="w-32 text-right">
                <div className="font-bold text-gray-900">
                  ¥{client.amount.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">
                  貢献比: {client.contribution}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
