'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

// 期間プリセットの定義
type PeriodPreset =
  | 'thisMonth'
  | 'lastMonth'
  | 'thisYear'
  | 'lastYear'
  | 'custom';

// レポートデータの型定義
interface ProfitLossData {
  totalRevenue: number;
  totalExpense: number;
  profit: number;
  profitMargin: number;
  topClients: Array<{
    rank: number;
    client: string;
    amount: number;
    transactions: number;
    contribution: number;
  }>;
}

interface CategoryData {
  expenseCategories: Array<{
    category: string;
    amount: number;
    percentage: number;
    color: string;
  }>;
  totalExpense: number;
}

interface MonthlyData {
  yearMonth: string;
  year: number;
  month: number;
  monthLabel: string;
  revenue: number;
  expense: number;
  profit: number;
}

export default function Reports() {
  const { data: session } = useSession();
  const [periodPreset, setPeriodPreset] = useState<PeriodPreset>('thisMonth');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<{
    profitLoss: ProfitLossData | null;
    category: CategoryData | null;
    monthly: MonthlyData[] | null;
  }>({
    profitLoss: null,
    category: null,
    monthly: null,
  });

  // 確定申告データ出力の状態
  const [showTaxFilingExport, setShowTaxFilingExport] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [exportFormat, setExportFormat] = useState<'pdf' | 'csv'>('pdf');
  const [exportOptions, setExportOptions] = useState({
    includeSummary: true,
    includeDetailedTransactions: false,
    includeExpenseBreakdown: true,
    includeClientBreakdown: true,
    includeMonthlyBreakdown: true,
  });

  // 期間プリセットから日付範囲を計算
  const getPeriodDates = (preset: PeriodPreset): { start: Date; end: Date } => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    switch (preset) {
      case 'thisMonth':
        return {
          start: new Date(year, month, 1),
          end: new Date(year, month + 1, 0, 23, 59, 59, 999),
        };
      case 'lastMonth':
        return {
          start: new Date(year, month - 1, 1),
          end: new Date(year, month, 0, 23, 59, 59, 999),
        };
      case 'thisYear':
        return {
          start: new Date(year, 0, 1),
          end: new Date(year, 11, 31, 23, 59, 59, 999),
        };
      case 'lastYear':
        return {
          start: new Date(year - 1, 0, 1),
          end: new Date(year - 1, 11, 31, 23, 59, 59, 999),
        };
      default:
        return { start: now, end: now };
    }
  };

  // プリセット選択時の処理
  const handlePresetChange = (preset: PeriodPreset) => {
    setPeriodPreset(preset);
    if (preset !== 'custom') {
      const { start, end } = getPeriodDates(preset);
      setStartDate(start.toISOString().split('T')[0]);
      setEndDate(end.toISOString().split('T')[0]);
    }
  };

  // 初期化: 今月のデータを設定
  useEffect(() => {
    handlePresetChange('thisMonth');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // レポートデータを取得
  const fetchReportData = async () => {
    if (!session?.user?.email || !startDate || !endDate) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        userId: session.user.email,
        startDate,
        endDate,
      });

      const response = await fetch(`/api/accounting/reports?${params}`);
      if (!response.ok) throw new Error('Failed to fetch report data');

      const data = await response.json();
      setReportData({
        profitLoss: data.profitLoss,
        category: data.category,
        monthly: data.monthly,
      });
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  // レポート生成ボタンが押されたときの処理
  const handleGenerateReport = () => {
    fetchReportData();
  };

  // PDF出力処理
  const handleExportPDF = async () => {
    if (!reportData.profitLoss) return;

    try {
      const params = new URLSearchParams({
        userId: session?.user?.email || '',
        startDate,
        endDate,
      });

      const response = await fetch(`/api/accounting/reports/pdf?${params}`);
      if (!response.ok) throw new Error('Failed to generate PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `会計レポート_${startDate}_${endDate}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('PDF出力に失敗しました');
    }
  };

  // 確定申告データ出力処理
  const handleTaxFilingExport = async () => {
    if (!session?.user?.email) return;

    try {
      const params = new URLSearchParams({
        userId: session.user.email,
        year: selectedYear.toString(),
        format: exportFormat,
        includeSummary: exportOptions.includeSummary.toString(),
        includeDetailedTransactions:
          exportOptions.includeDetailedTransactions.toString(),
        includeExpenseBreakdown:
          exportOptions.includeExpenseBreakdown.toString(),
        includeClientBreakdown: exportOptions.includeClientBreakdown.toString(),
        includeMonthlyBreakdown:
          exportOptions.includeMonthlyBreakdown.toString(),
      });

      const response = await fetch(`/api/tax/tax-filing-export?${params}`);
      if (!response.ok) throw new Error('Failed to export tax filing data');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `確定申告データ_${selectedYear}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setShowTaxFilingExport(false);
    } catch (error) {
      console.error('Error exporting tax filing data:', error);
      alert('確定申告データの出力に失敗しました');
    }
  };

  // 年度リストの生成
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 5; i++) {
      years.push(currentYear - i);
    }
    return years;
  };

  const maxMonthlyValue = reportData.monthly
    ? Math.max(
        ...reportData.monthly.map((d) =>
          Math.max(d.profit, d.revenue, d.expense)
        )
      )
    : 1;

  return (
    <div className="space-y-6">
      {/* 確定申告データ出力モーダル */}
      {showTaxFilingExport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                確定申告データ出力
              </h2>
              <button
                onClick={() => setShowTaxFilingExport(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* 年度選択 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  対象年度
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {generateYearOptions().map((year) => (
                    <option key={year} value={year}>
                      {year}年
                    </option>
                  ))}
                </select>
              </div>

              {/* 出力形式 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  出力形式
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="format"
                      value="pdf"
                      checked={exportFormat === 'pdf'}
                      onChange={() => setExportFormat('pdf')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-gray-700">PDF</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="format"
                      value="csv"
                      checked={exportFormat === 'csv'}
                      onChange={() => setExportFormat('csv')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-gray-700">CSV</span>
                  </label>
                </div>
              </div>

              {/* 出力項目のカスタマイズ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  出力項目
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeSummary}
                      onChange={(e) =>
                        setExportOptions({
                          ...exportOptions,
                          includeSummary: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-gray-700">
                      サマリー(総売上・総経費・利益)
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeExpenseBreakdown}
                      onChange={(e) =>
                        setExportOptions({
                          ...exportOptions,
                          includeExpenseBreakdown: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-gray-700">経費カテゴリ別内訳</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeClientBreakdown}
                      onChange={(e) =>
                        setExportOptions({
                          ...exportOptions,
                          includeClientBreakdown: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-gray-700">取引先別売上内訳</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeMonthlyBreakdown}
                      onChange={(e) =>
                        setExportOptions({
                          ...exportOptions,
                          includeMonthlyBreakdown: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-gray-700">月次収支内訳</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeDetailedTransactions}
                      onChange={(e) =>
                        setExportOptions({
                          ...exportOptions,
                          includeDetailedTransactions: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-gray-700">
                      全取引明細(詳細データ)
                    </span>
                  </label>
                </div>
              </div>

              {/* アクションボタン */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowTaxFilingExport(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleTaxFilingExport}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  出力
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPeriodPreset('custom');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="flex items-center text-gray-500">〜</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPeriodPreset('custom');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handlePresetChange('thisYear')}
              className={`px-4 py-2 border rounded-lg transition-colors ${
                periodPreset === 'thisYear'
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              今年
            </button>
            <button
              onClick={() => handlePresetChange('thisMonth')}
              className={`px-4 py-2 border rounded-lg transition-colors ${
                periodPreset === 'thisMonth'
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              今月
            </button>
            <button
              onClick={() => handlePresetChange('lastMonth')}
              className={`px-4 py-2 border rounded-lg transition-colors ${
                periodPreset === 'lastMonth'
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              先月
            </button>
            <button
              onClick={() => handlePresetChange('lastYear')}
              className={`px-4 py-2 border rounded-lg transition-colors ${
                periodPreset === 'lastYear'
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              前年
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowTaxFilingExport(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <span>📄</span>
              確定申告データ出力
            </button>
            <button
              onClick={handleExportPDF}
              disabled={!reportData.profitLoss}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>⬇️</span>
              PDFダウンロード
            </button>
            <button
              onClick={handleGenerateReport}
              disabled={loading || !startDate || !endDate}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'レポート生成中...' : 'レポート生成'}
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">レポートを生成中...</p>
        </div>
      )}

      {!loading && reportData.profitLoss && (
        <>
          {/* KPIカード */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-green-400 to-green-500 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-white/20 rounded-lg p-2">💰</div>
                <span className="text-sm text-white/80">売上合計</span>
              </div>
              <div className="text-3xl font-bold">
                ¥{reportData.profitLoss.totalRevenue.toLocaleString()}
              </div>
              <div className="mt-2 text-sm text-white/80">
                <span className="bg-white/20 px-2 py-1 rounded">
                  利益率 {reportData.profitLoss.profitMargin}%
                </span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-400 to-red-500 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-white/20 rounded-lg p-2">📊</div>
                <span className="text-sm text-white/80">経費合計</span>
              </div>
              <div className="text-3xl font-bold">
                ¥{reportData.profitLoss.totalExpense.toLocaleString()}
              </div>
              <div className="mt-2 text-sm text-white/80">
                <span className="bg-white/20 px-2 py-1 rounded">
                  経費率{' '}
                  {reportData.profitLoss.totalRevenue > 0
                    ? Math.round(
                        (reportData.profitLoss.totalExpense /
                          reportData.profitLoss.totalRevenue) *
                          100
                      )
                    : 0}
                  %
                </span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-white/20 rounded-lg p-2">📈</div>
                <span className="text-sm text-white/80">利益</span>
              </div>
              <div className="text-3xl font-bold">
                ¥{reportData.profitLoss.profit.toLocaleString()}
              </div>
              <div className="mt-2 text-sm text-white/80">
                <span className="bg-white/20 px-2 py-1 rounded">
                  利益率 {reportData.profitLoss.profitMargin}%
                </span>
              </div>
            </div>
          </div>

          {/* 経費カテゴリ別内訳 & 月次収支推移 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 経費カテゴリ別内訳 */}
            {reportData.category && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-6">
                  経費カテゴリ別内訳
                </h3>

                {reportData.category.expenseCategories.length > 0 ? (
                  <>
                    {/* ドーナツチャート */}
                    <div className="flex flex-col items-center mb-6">
                      <div className="relative w-48 h-48">
                        <svg
                          viewBox="0 0 200 200"
                          className="w-full h-full -rotate-90"
                        >
                          {reportData.category.expenseCategories.map(
                            (cat, index) => {
                              const total =
                                reportData.category!.expenseCategories.reduce(
                                  (sum, c) => sum + c.percentage,
                                  0
                                );
                              const startAngle = reportData
                                .category!.expenseCategories.slice(0, index)
                                .reduce(
                                  (sum, c) =>
                                    sum + (c.percentage / total) * 360,
                                  0
                                );
                              const endAngle =
                                startAngle + (cat.percentage / total) * 360;

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

                              const largeArc =
                                endAngle - startAngle > 180 ? 1 : 0;

                              return (
                                <path
                                  key={index}
                                  d={`M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`}
                                  fill={cat.color}
                                  className="hover:opacity-80 cursor-pointer transition-opacity"
                                />
                              );
                            }
                          )}
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <div className="text-2xl font-bold text-gray-900">
                            ¥
                            {(reportData.category.totalExpense / 1000).toFixed(
                              0
                            )}
                            k
                          </div>
                          <div className="text-sm text-gray-500">合計経費</div>
                        </div>
                      </div>
                    </div>

                    {/* 凡例 */}
                    <div className="grid grid-cols-2 gap-3">
                      {reportData.category.expenseCategories.map(
                        (cat, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: cat.color }}
                            ></div>
                            <div className="flex-1">
                              <div className="text-xs text-gray-600">
                                {cat.category}
                              </div>
                              <div className="text-sm font-medium">
                                {cat.percentage}%
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    この期間に経費データがありません
                  </div>
                )}
              </div>
            )}

            {/* 月次収支推移 */}
            {reportData.monthly && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-6">
                  月次収支推移
                </h3>

                {reportData.monthly.length > 0 ? (
                  <>
                    <div className="relative h-64">
                      <div className="absolute inset-0 flex items-end justify-between gap-3">
                        {reportData.monthly.map((data, index) => {
                          const revenueHeight =
                            (data.revenue / maxMonthlyValue) * 100;
                          const expenseHeight =
                            (data.expense / maxMonthlyValue) * 100;
                          const profitHeight =
                            (data.profit / maxMonthlyValue) * 100;

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
                                {data.monthLabel}
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
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    この期間に月次データがありません
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 取引先別売上 TOP 10 */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-6">
              取引先別売上 TOP 10
            </h3>

            {reportData.profitLoss.topClients.length > 0 ? (
              <div className="space-y-4">
                {reportData.profitLoss.topClients.map((client) => (
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
                      <h4 className="font-bold text-gray-900">
                        {client.client}
                      </h4>
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
            ) : (
              <div className="text-center py-8 text-gray-500">
                この期間に取引先データがありません
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
