'use client';

import { useState } from 'react';
import { mockAccountingSettings } from '../../data/mockData';

export default function TaxSimulator() {
  const [partTimeIncome, setPartTimeIncome] = useState<number>(250000);
  const [businessRevenue, setBusinessRevenue] = useState<number>(920000);
  const [businessExpense, setBusinessExpense] = useState<number>(340000);
  const [useBlueReturn, setUseBlueReturn] = useState<boolean>(true);

  const settings = mockAccountingSettings;

  // 計算ロジック
  const calculateTax = () => {
    // 給与所得の計算（給与所得控除後）
    // 給与所得控除: 250,000円 → 0円（控除後）
    const salaryIncome = 0; // 簡易計算

    // 事業所得の計算
    let businessIncome = businessRevenue - businessExpense;

    // 青色申告特別控除
    if (useBlueReturn && businessIncome > 0) {
      businessIncome = Math.max(
        0,
        businessIncome - settings.blueReturnDeduction
      );
    }

    // 合計所得
    const totalIncome = salaryIncome + businessIncome;

    // 扶養判定
    const dependentLimit = settings.dependentIncomeLimit;
    const remaining = dependentLimit - totalIncome;
    const progress = (totalIncome / dependentLimit) * 100;

    let status: '扶養内' | '超過リスク' | '超過' = '扶養内';
    if (progress >= 100) {
      status = '超過';
    } else if (progress >= 80) {
      status = '超過リスク';
    }

    return {
      salaryIncome,
      businessIncome,
      totalIncome,
      remaining,
      progress: Math.min(progress, 100),
      status,
      dependentLimit,
    };
  };

  const result = calculateTax();

  const getStatusColor = () => {
    if (result.status === '扶養内') return 'text-green-600';
    if (result.status === '超過リスク') return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBgColor = () => {
    if (result.status === '扶養内') return 'bg-green-50';
    if (result.status === '超過リスク') return 'bg-yellow-50';
    return 'bg-red-50';
  };

  // 月別予測データ
  const monthlyProjection = [
    { month: '1月', projected: 50000 },
    { month: '2月', projected: 60000 },
    { month: '3月', projected: 80000 },
    { month: '4月', projected: 100000 },
    { month: '5月', projected: 130000 },
    { month: '6月', projected: 160000 },
    { month: '7月', projected: 180000 },
    { month: '8月', projected: 200000 },
    { month: '9月', projected: 210000 },
    { month: '10月', projected: 220000 },
    { month: '11月', projected: 230000 },
    { month: '12月', projected: 240000 },
  ];

  const maxProjected = Math.max(...monthlyProjection.map((m) => m.projected));

  return (
    <div className="space-y-6">
      {/* メインカード */}
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
        {/* ゲージ */}
        <div className="flex flex-col items-center mb-8">
          {/* 半円ゲージ（SVG） */}
          <div className="relative w-64 h-32 mb-4">
            <svg viewBox="0 0 200 100" className="w-full h-full">
              {/* 背景 */}
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="20"
              />
              {/* プログレス */}
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke={
                  result.status === '扶養内'
                    ? '#10b981'
                    : result.status === '超過リスク'
                      ? '#f59e0b'
                      : '#ef4444'
                }
                strokeWidth="20"
                strokeDasharray={`${(result.progress / 100) * 251.2} 251.2`}
                strokeLinecap="round"
              />
              {/* インジケーター */}
              <circle
                cx={
                  100 +
                  80 * Math.cos(Math.PI - (result.progress / 100) * Math.PI)
                }
                cy={
                  100 -
                  80 * Math.sin(Math.PI - (result.progress / 100) * Math.PI)
                }
                r="8"
                fill="#1f2937"
              />
            </svg>
          </div>

          <h2 className="text-lg font-medium text-gray-600 mb-2">
            現在の合計所得
          </h2>
          <div className="text-5xl font-bold text-gray-900 mb-4">
            ¥{result.totalIncome.toLocaleString()}
          </div>

          <div className="flex gap-8 text-center">
            <div>
              <p className="text-sm text-gray-600">残り</p>
              <p className="text-2xl font-bold text-green-600">
                ¥{Math.max(0, result.remaining).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">進捗</p>
              <p className="text-2xl font-bold text-blue-600">
                {result.progress.toFixed(0)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">判定</p>
              <p
                className={`text-2xl font-bold ${result.status === '扶養内' ? 'text-green-600' : 'text-red-600'}`}
              >
                {result.status}
              </p>
            </div>
          </div>
        </div>

        {/* 収入シミュレーション */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            収入シミュレーション
          </h3>

          <div className="space-y-6">
            {/* 給与収入（アルバイト） */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  給与収入（アルバイト）
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">¥</span>
                  <input
                    type="number"
                    min="0"
                    max="500000"
                    step="10000"
                    value={partTimeIncome}
                    onChange={(e) =>
                      setPartTimeIncome(
                        Math.min(500000, Math.max(0, Number(e.target.value)))
                      )
                    }
                    className="w-32 px-3 py-1 text-right border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-blue-600"
                  />
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="500000"
                step="10000"
                value={partTimeIncome}
                onChange={(e) => setPartTimeIncome(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>
                  給与所得控除: ¥{partTimeIncome.toLocaleString()} → 所得: ¥0
                </span>
              </div>
            </div>

            {/* 事業収入（業務委託） */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  事業収入（業務委託）
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">¥</span>
                  <input
                    type="number"
                    min="0"
                    max="1500000"
                    step="10000"
                    value={businessRevenue}
                    onChange={(e) =>
                      setBusinessRevenue(
                        Math.min(1500000, Math.max(0, Number(e.target.value)))
                      )
                    }
                    className="w-32 px-3 py-1 text-right border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 font-bold text-green-600"
                  />
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="1500000"
                step="10000"
                value={businessRevenue}
                onChange={(e) => setBusinessRevenue(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
              />
            </div>

            {/* 事業経費 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  事業経費
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">¥</span>
                  <input
                    type="number"
                    min="0"
                    max="800000"
                    step="10000"
                    value={businessExpense}
                    onChange={(e) =>
                      setBusinessExpense(
                        Math.min(800000, Math.max(0, Number(e.target.value)))
                      )
                    }
                    className="w-32 px-3 py-1 text-right border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 font-bold text-red-600"
                  />
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="800000"
                step="10000"
                value={businessExpense}
                onChange={(e) => setBusinessExpense(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
              />
            </div>

            {/* 青色申告特別控除を適用 */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                id="blueReturn"
                checked={useBlueReturn}
                onChange={(e) => setUseBlueReturn(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="blueReturn" className="text-sm text-gray-700">
                青色申告特別控除を適用
                <span className="text-xs text-gray-500 ml-2">
                  最大65万円の控除が受けられます
                </span>
              </label>
            </div>
          </div>

          {/* 計算結果詳細 */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">給与所得:</span>
              <span className="font-medium">
                ¥{result.salaryIncome.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">事業所得:</span>
              <span className="font-medium">
                ¥{result.businessIncome.toLocaleString()}
              </span>
            </div>
            {useBlueReturn && (
              <div className="flex justify-between text-sm text-blue-600">
                <span>（青色控除適用後）</span>
                <span className="font-medium">
                  -¥
                  {Math.min(
                    businessRevenue - businessExpense,
                    settings.blueReturnDeduction
                  ).toLocaleString()}
                </span>
              </div>
            )}
            <div className="border-t border-gray-300 pt-2 mt-2"></div>
            <div className="flex justify-between font-bold">
              <span className="text-gray-900">合計所得:</span>
              <span className="text-gray-900">
                ¥{result.totalIncome.toLocaleString()}
              </span>
            </div>
          </div>

          {/* ステータス表示 */}
          <div
            className={`mt-6 p-4 rounded-lg flex items-center gap-3 ${getStatusBgColor()}`}
          >
            <div className="text-3xl">
              {result.status === '扶養内' && '✓'}
              {result.status === '超過リスク' && '⚠️'}
              {result.status === '超過' && '✗'}
            </div>
            <div className="flex-1">
              <h4 className={`font-bold text-lg ${getStatusColor()}`}>
                {result.status === '扶養内' && '扶養内です'}
                {result.status === '超過リスク' && '超過リスクあり'}
                {result.status === '超過' && '扶養を超過しています'}
              </h4>
              <p className="text-sm text-gray-600">
                {result.status === '扶養内' &&
                  `あと ¥${result.remaining.toLocaleString()} 稼げます`}
                {result.status === '超過リスク' &&
                  `残り ¥${result.remaining.toLocaleString()}。注意が必要です`}
                {result.status === '超過' &&
                  `¥${Math.abs(result.remaining).toLocaleString()} オーバーしています`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 年間収入予測 */}
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-6">年間収入予測</h3>

        {/* グラフ */}
        <div className="relative h-64 mb-4">
          <div className="absolute inset-0 flex items-end justify-between gap-2">
            {monthlyProjection.map((data, index) => {
              const height = (data.projected / maxProjected) * 100;
              const isOverLimit =
                data.projected > settings.dependentIncomeLimit;

              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex items-end justify-center h-48">
                    <div
                      className={`w-full ${isOverLimit ? 'bg-red-400' : 'bg-blue-400'} rounded-t-lg transition-all hover:opacity-80 cursor-pointer relative group`}
                      style={{ height: `${height}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        {data.month}
                        <br />
                        projected : ¥{data.projected.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 mt-2">{data.month}</div>
                </div>
              );
            })}
          </div>

          {/* 扶養ライン */}
          <div
            className="absolute left-0 right-0 border-t-2 border-dashed border-yellow-500"
            style={{
              bottom: `${(settings.dependentIncomeLimit / maxProjected) * 100}%`,
            }}
          >
            <span className="absolute -top-3 right-0 bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded">
              扶養ライン
            </span>
          </div>
        </div>

        {/* 親の年収目安 */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">親の年収目安</span>
            <select className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>900万円以下（控除額63万）</option>
              <option>900万円超（控除額減額）</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
