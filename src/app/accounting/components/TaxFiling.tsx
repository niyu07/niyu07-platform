'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

export default function TaxFiling() {
  const { data: session } = useSession();
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
  const [isExporting, setIsExporting] = useState(false);

  // 年度リストの生成
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 5; i++) {
      years.push(currentYear - i);
    }
    return years;
  };

  // 確定申告データ出力処理
  const handleTaxFilingExport = async () => {
    if (!session?.user?.email) {
      alert('ログインが必要です');
      return;
    }

    setIsExporting(true);

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
    } catch (error) {
      console.error('Error exporting tax filing data:', error);
      alert('確定申告データの出力に失敗しました');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-8 text-white shadow-lg">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-white/20 rounded-lg p-3 text-4xl">📋</div>
          <div>
            <h2 className="text-3xl font-bold">確定申告データ管理</h2>
            <p className="text-blue-100 mt-1">
              年度ごとの収支データを整理し、確定申告用の資料を作成します
            </p>
          </div>
        </div>
      </div>

      {/* 確定申告の流れ */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">確定申告の流れ</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex flex-col items-center text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl mb-2">📊</div>
            <h4 className="font-bold text-gray-900 mb-1">1. データ収集</h4>
            <p className="text-sm text-gray-600">年間の収入・経費を記録</p>
          </div>
          <div className="flex flex-col items-center text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl mb-2">📄</div>
            <h4 className="font-bold text-gray-900 mb-1">2. データ出力</h4>
            <p className="text-sm text-gray-600">
              確定申告用データをエクスポート
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-3xl mb-2">✍️</div>
            <h4 className="font-bold text-gray-900 mb-1">3. 申告書作成</h4>
            <p className="text-sm text-gray-600">e-Taxまたは書面で作成</p>
          </div>
          <div className="flex flex-col items-center text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-3xl mb-2">📮</div>
            <h4 className="font-bold text-gray-900 mb-1">4. 提出</h4>
            <p className="text-sm text-gray-600">
              税務署へオンラインまたは郵送
            </p>
          </div>
        </div>
      </div>

      {/* データ出力設定 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-6">
          確定申告データ出力
        </h3>

        <div className="space-y-6">
          {/* 年度選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              対象年度
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {generateYearOptions().map((year) => (
                <option key={year} value={year}>
                  {year}年
                </option>
              ))}
            </select>
            <p className="mt-2 text-sm text-gray-500">
              対象期間: {selectedYear}年1月1日 〜 {selectedYear}年12月31日
            </p>
          </div>

          {/* 出力形式 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              出力形式
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer px-4 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="format"
                  value="pdf"
                  checked={exportFormat === 'pdf'}
                  onChange={() => setExportFormat('pdf')}
                  className="w-4 h-4 text-blue-600"
                />
                <div>
                  <span className="font-medium text-gray-900">PDF</span>
                  <p className="text-xs text-gray-500">
                    印刷や提出に適した形式
                  </p>
                </div>
              </label>
              <label className="flex items-center gap-2 cursor-pointer px-4 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="format"
                  value="csv"
                  checked={exportFormat === 'csv'}
                  onChange={() => setExportFormat('csv')}
                  className="w-4 h-4 text-blue-600"
                />
                <div>
                  <span className="font-medium text-gray-900">CSV</span>
                  <p className="text-xs text-gray-500">Excelで編集可能な形式</p>
                </div>
              </label>
            </div>
          </div>

          {/* 出力項目のカスタマイズ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              出力項目
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="flex items-start gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={exportOptions.includeSummary}
                  onChange={(e) =>
                    setExportOptions({
                      ...exportOptions,
                      includeSummary: e.target.checked,
                    })
                  }
                  className="w-5 h-5 text-blue-600 rounded mt-0.5"
                />
                <div>
                  <span className="font-medium text-gray-900 block">
                    サマリー
                  </span>
                  <span className="text-sm text-gray-500">
                    総売上・総経費・利益の概要
                  </span>
                </div>
              </label>
              <label className="flex items-start gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={exportOptions.includeExpenseBreakdown}
                  onChange={(e) =>
                    setExportOptions({
                      ...exportOptions,
                      includeExpenseBreakdown: e.target.checked,
                    })
                  }
                  className="w-5 h-5 text-blue-600 rounded mt-0.5"
                />
                <div>
                  <span className="font-medium text-gray-900 block">
                    経費カテゴリ別内訳
                  </span>
                  <span className="text-sm text-gray-500">
                    カテゴリごとの経費詳細
                  </span>
                </div>
              </label>
              <label className="flex items-start gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={exportOptions.includeClientBreakdown}
                  onChange={(e) =>
                    setExportOptions({
                      ...exportOptions,
                      includeClientBreakdown: e.target.checked,
                    })
                  }
                  className="w-5 h-5 text-blue-600 rounded mt-0.5"
                />
                <div>
                  <span className="font-medium text-gray-900 block">
                    取引先別売上内訳
                  </span>
                  <span className="text-sm text-gray-500">
                    取引先ごとの売上詳細
                  </span>
                </div>
              </label>
              <label className="flex items-start gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={exportOptions.includeMonthlyBreakdown}
                  onChange={(e) =>
                    setExportOptions({
                      ...exportOptions,
                      includeMonthlyBreakdown: e.target.checked,
                    })
                  }
                  className="w-5 h-5 text-blue-600 rounded mt-0.5"
                />
                <div>
                  <span className="font-medium text-gray-900 block">
                    月次収支内訳
                  </span>
                  <span className="text-sm text-gray-500">
                    月ごとの収支推移
                  </span>
                </div>
              </label>
              <label className="flex items-start gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors md:col-span-2">
                <input
                  type="checkbox"
                  checked={exportOptions.includeDetailedTransactions}
                  onChange={(e) =>
                    setExportOptions({
                      ...exportOptions,
                      includeDetailedTransactions: e.target.checked,
                    })
                  }
                  className="w-5 h-5 text-blue-600 rounded mt-0.5"
                />
                <div>
                  <span className="font-medium text-gray-900 block">
                    全取引明細
                  </span>
                  <span className="text-sm text-gray-500">
                    すべての収入・経費の詳細データ(ファイルサイズが大きくなります)
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* 出力ボタン */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleTaxFilingExport}
              disabled={isExporting}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
            >
              {isExporting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  出力中...
                </>
              ) : (
                <>
                  <span>📥</span>
                  データを出力
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 注意事項 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-yellow-900 mb-3 flex items-center gap-2">
          <span>⚠️</span>
          確定申告の注意事項
        </h3>
        <ul className="space-y-2 text-sm text-yellow-800">
          <li className="flex items-start gap-2">
            <span className="text-yellow-600 mt-0.5">•</span>
            <span>
              このシステムで出力されるデータは参考資料です。正式な確定申告書類は国税庁のe-Taxシステムまたは税務署の用紙を使用してください。
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-600 mt-0.5">•</span>
            <span>
              青色申告の場合、複式簿記での記帳が必要です。必要に応じて税理士にご相談ください。
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-600 mt-0.5">•</span>
            <span>
              確定申告の期限は通常2月16日〜3月15日です。余裕を持って準備しましょう。
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-600 mt-0.5">•</span>
            <span>
              控除証明書や領収書などの原本は別途保管し、必要に応じて提出できるようにしてください。
            </span>
          </li>
        </ul>
      </div>

      {/* 役立つリンク */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">役立つリンク</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="https://www.nta.go.jp/taxes/shiraberu/shinkoku/tokushu/index.htm"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="text-2xl">🏛️</div>
            <div>
              <div className="font-medium text-gray-900">
                国税庁 確定申告特集
              </div>
              <div className="text-sm text-gray-500">確定申告の詳しい情報</div>
            </div>
          </a>
          <a
            href="https://www.e-tax.nta.go.jp/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="text-2xl">💻</div>
            <div>
              <div className="font-medium text-gray-900">e-Tax</div>
              <div className="text-sm text-gray-500">
                オンライン申告システム
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
