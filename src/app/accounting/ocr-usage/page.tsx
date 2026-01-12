'use client';

import { useState, useEffect } from 'react';
import UsageHistoryChart from '../components/UsageHistoryChart';
import ApiTypeBreakdown from '../components/ApiTypeBreakdown';
import UsageLimitEditor from '../components/UsageLimitEditor';

interface UsageData {
  current: {
    count: number;
    limit: number;
    remaining: number;
    isOverLimit: boolean;
    percentage: number;
    breakdown: Record<string, number>;
  };
  history: Array<{
    month: string;
    total: number;
    limit: number;
    breakdown: Record<string, number>;
  }>;
}

export default function OcrUsagePage() {
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsageData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ocr-usage?months=6');
      if (!response.ok) {
        throw new Error('使用状況の取得に失敗しました');
      }
      const result = await response.json();
      setUsageData(result.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching usage data:', err);
      setError(err instanceof Error ? err.message : '不明なエラー');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsageData();
  }, []);

  const handleLimitUpdated = () => {
    // 上限変更後、データを再取得
    fetchUsageData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-8"></div>
            <div className="h-64 bg-gray-300 rounded mb-8"></div>
            <div className="h-48 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-800">エラー: {error}</p>
            <button
              onClick={fetchUsageData}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              再試行
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!usageData) {
    return null;
  }

  const { current, history } = usageData;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            OCR使用状況ダッシュボード
          </h1>
          <p className="text-gray-600">
            Google Cloud Vision API の使用状況を管理します
          </p>
        </div>

        {/* 現在の使用状況カード */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            今月の使用状況
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">使用回数</p>
              <p className="text-3xl font-bold text-gray-900">
                {current.count.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">上限</p>
              <p className="text-3xl font-bold text-gray-900">
                {current.limit.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">残り</p>
              <p className="text-3xl font-bold text-green-600">
                {current.remaining.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">使用率</p>
              <p
                className={`text-3xl font-bold ${
                  current.percentage >= 90
                    ? 'text-red-600'
                    : current.percentage >= 70
                      ? 'text-yellow-600'
                      : 'text-green-600'
                }`}
              >
                {current.percentage}%
              </p>
            </div>
          </div>

          {/* プログレスバー */}
          <div className="mt-6">
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className={`h-4 rounded-full transition-all duration-300 ${
                  current.percentage >= 90
                    ? 'bg-red-600'
                    : current.percentage >= 70
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(current.percentage, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* 警告メッセージ */}
          {current.isOverLimit && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-semibold">
                ⚠️ 月間上限に達しました
              </p>
              <p className="text-red-700 text-sm mt-1">
                来月まで OCR 機能を利用できません。
              </p>
            </div>
          )}
          {!current.isOverLimit && current.percentage >= 90 && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 font-semibold">
                ⚠️ 上限に近づいています
              </p>
              <p className="text-yellow-700 text-sm mt-1">
                残り {current.remaining} 回です。ご注意ください。
              </p>
            </div>
          )}
        </div>

        {/* APIタイプ別使用状況 */}
        <div className="mb-8">
          <ApiTypeBreakdown
            breakdown={current.breakdown}
            total={current.count}
          />
        </div>

        {/* 月次使用履歴グラフ */}
        <div className="mb-8">
          <UsageHistoryChart history={history} />
        </div>

        {/* 使用上限変更 */}
        <div>
          <UsageLimitEditor
            currentLimit={current.limit}
            onLimitUpdated={handleLimitUpdated}
          />
        </div>
      </div>
    </div>
  );
}
