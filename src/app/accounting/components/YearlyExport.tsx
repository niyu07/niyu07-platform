'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  exportTransactionsToCSV,
  exportReceiptsToCSV,
  exportToExcel,
  exportToPDF,
  exportAllAsZip,
} from '@/lib/export-utils';

export default function YearlyExport() {
  const { data: session } = useSession();
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [progress, setProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);

  // 年の選択肢を生成（過去10年分）
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - i);

  // データ取得
  const fetchExportData = async (year: number) => {
    const response = await fetch(`/api/accounting/export?year=${year}`);
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'データの取得に失敗しました');
    }

    return data.data;
  };

  // CSVエクスポート（取引）
  const handleExportTransactionsCSV = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchExportData(selectedYear);
      exportTransactionsToCSV(data.transactions, selectedYear);
    } catch (err) {
      console.error('Export error:', err);
      setError(
        err instanceof Error ? err.message : 'エクスポートに失敗しました'
      );
    } finally {
      setLoading(false);
    }
  };

  // CSVエクスポート（領収書）
  const handleExportReceiptsCSV = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchExportData(selectedYear);
      exportReceiptsToCSV(data.receipts, selectedYear);
    } catch (err) {
      console.error('Export error:', err);
      setError(
        err instanceof Error ? err.message : 'エクスポートに失敗しました'
      );
    } finally {
      setLoading(false);
    }
  };

  // Excelエクスポート
  const handleExportExcel = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchExportData(selectedYear);
      exportToExcel(data);
    } catch (err) {
      console.error('Export error:', err);
      setError(
        err instanceof Error ? err.message : 'エクスポートに失敗しました'
      );
    } finally {
      setLoading(false);
    }
  };

  // PDFエクスポート
  const handleExportPDF = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchExportData(selectedYear);
      exportToPDF(data);
    } catch (err) {
      console.error('Export error:', err);
      setError(
        err instanceof Error ? err.message : 'エクスポートに失敗しました'
      );
    } finally {
      setLoading(false);
    }
  };

  // ZIPエクスポート（すべて）
  const handleExportAll = async () => {
    try {
      setLoading(true);
      setError('');
      setProgress({ current: 0, total: 0 });

      const data = await fetchExportData(selectedYear);

      await exportAllAsZip(data, (current, total) => {
        setProgress({ current, total });
      });

      setProgress(null);
    } catch (err) {
      console.error('Export error:', err);
      setError(
        err instanceof Error ? err.message : 'エクスポートに失敗しました'
      );
      setProgress(null);
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">ログインしてください</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            年次データエクスポート
          </h1>
          <p className="text-gray-600 mt-2">
            年末調整や確定申告に必要なデータを出力します
          </p>
        </div>
      </div>

      {/* 年選択セクション */}
      <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">対象年の選択</h2>
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">
            エクスポート対象年:
          </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}年
              </option>
            ))}
          </select>
        </div>
        <p className="text-sm text-gray-500">
          {selectedYear}年1月1日〜{selectedYear}
          年12月31日のデータをエクスポートします
        </p>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* 進捗表示 */}
      {progress && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-blue-700 font-medium">
              領収書画像をダウンロード中...
            </p>
            <p className="text-blue-600 text-sm">
              {progress.current} / {progress.total}
            </p>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* エクスポートオプション */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* CSV出力（取引データ） */}
        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">
                取引データ CSV
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                取引履歴をCSV形式で出力します。Excelやスプレッドシートで編集可能です。
              </p>
              <button
                onClick={handleExportTransactionsCSV}
                disabled={loading}
                className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                {loading ? '処理中...' : 'CSVダウンロード'}
              </button>
            </div>
          </div>
        </div>

        {/* CSV出力（領収書データ） */}
        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">
                領収書データ CSV
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                領収書のOCR結果をCSV形式で出力します。画像は含まれません。
              </p>
              <button
                onClick={handleExportReceiptsCSV}
                disabled={loading}
                className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                {loading ? '処理中...' : 'CSVダウンロード'}
              </button>
            </div>
          </div>
        </div>

        {/* Excel出力 */}
        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">
                年次レポート Excel
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                取引・領収書・月別集計・カテゴリ別集計を含むExcelファイルを出力します。
              </p>
              <button
                onClick={handleExportExcel}
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                {loading ? '処理中...' : 'Excelダウンロード'}
              </button>
            </div>
          </div>
        </div>

        {/* PDF出力 */}
        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">
                年次レポート PDF
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                印刷・提出用のPDF形式レポート。集計表と取引明細を含みます。
              </p>
              <button
                onClick={handleExportPDF}
                disabled={loading}
                className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                {loading ? '処理中...' : 'PDFダウンロード'}
              </button>
            </div>
          </div>
        </div>

        {/* ZIP一括出力 */}
        <div className="bg-white rounded-lg shadow-md p-6 space-y-4 border-2 border-purple-200 md:col-span-2 lg:col-span-3">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-gray-900">
                  全データ ZIP一括
                </h3>
                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                  推奨
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Excelレポート +
                領収書画像（年/月フォルダ構造）を一括ダウンロード。年末調整にそのまま使えます。
              </p>
              <button
                onClick={handleExportAll}
                disabled={loading}
                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg transition-colors font-medium"
              >
                {loading ? '処理中...' : 'ZIPダウンロード（推奨）'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 注意事項 */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex gap-3">
          <svg
            className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div className="text-sm text-amber-800">
            <p className="font-semibold mb-1">ご注意</p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                このデータは年末調整や確定申告の参考資料としてご利用ください
              </li>
              <li>
                正式な申告書類としての使用は、税理士または税務署にご確認ください
              </li>
              <li>
                ZIPダウンロードには領収書の枚数により時間がかかる場合があります
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
