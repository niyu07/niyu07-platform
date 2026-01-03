'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

// デフォルトのカテゴリ設定
const DEFAULT_REVENUE_CATEGORIES = [
  'コンサルティング収入',
  '開発業務収入',
  'デザイン業務収入',
  'ライティング収入',
  'その他の売上',
];

const DEFAULT_EXPENSE_CATEGORIES = [
  '通信費',
  '交通費',
  '消耗品費',
  '広告宣伝費',
  '接待交際費',
  '地代家賃',
  '水道光熱費',
  '外注費',
  '研修費',
  'その他経費',
];

export default function Settings() {
  const { data: session } = useSession();
  const [activeSection, setActiveSection] = useState<
    'categories' | 'fiscal' | 'profile'
  >('categories');

  // カテゴリ設定
  const [revenueCategories, setRevenueCategories] = useState<string[]>(
    DEFAULT_REVENUE_CATEGORIES
  );
  const [expenseCategories, setExpenseCategories] = useState<string[]>(
    DEFAULT_EXPENSE_CATEGORIES
  );
  const [newRevenueCategoryName, setNewRevenueCategoryName] = useState('');
  const [newExpenseCategoryName, setNewExpenseCategoryName] = useState('');

  // 事業年度設定
  const [fiscalYearStart, setFiscalYearStart] = useState('01-01');

  // プロフィール設定
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');

  // カテゴリの追加
  const handleAddRevenueCategory = () => {
    if (newRevenueCategoryName.trim()) {
      setRevenueCategories([
        ...revenueCategories,
        newRevenueCategoryName.trim(),
      ]);
      setNewRevenueCategoryName('');
    }
  };

  const handleAddExpenseCategory = () => {
    if (newExpenseCategoryName.trim()) {
      setExpenseCategories([
        ...expenseCategories,
        newExpenseCategoryName.trim(),
      ]);
      setNewExpenseCategoryName('');
    }
  };

  // カテゴリの削除
  const handleRemoveRevenueCategory = (index: number) => {
    setRevenueCategories(revenueCategories.filter((_, i) => i !== index));
  };

  const handleRemoveExpenseCategory = (index: number) => {
    setExpenseCategories(expenseCategories.filter((_, i) => i !== index));
  };

  // 設定の保存（ここではローカルステートのみ）
  const handleSaveSettings = () => {
    // TODO: APIに保存する処理を実装
    alert('設定を保存しました');
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-8 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 rounded-lg p-3 text-4xl">⚙️</div>
          <div>
            <h2 className="text-3xl font-bold">会計設定</h2>
            <p className="text-purple-100 mt-1">
              カテゴリや事業情報をカスタマイズできます
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* サイドバー */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 space-y-2">
            <button
              onClick={() => setActiveSection('categories')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeSection === 'categories'
                  ? 'bg-purple-50 text-purple-700 font-medium'
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              📂 カテゴリ設定
            </button>
            <button
              onClick={() => setActiveSection('fiscal')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeSection === 'fiscal'
                  ? 'bg-purple-50 text-purple-700 font-medium'
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              📅 事業年度設定
            </button>
            <button
              onClick={() => setActiveSection('profile')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeSection === 'profile'
                  ? 'bg-purple-50 text-purple-700 font-medium'
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              👤 事業者情報
            </button>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="lg:col-span-3">
          {/* カテゴリ設定 */}
          {activeSection === 'categories' && (
            <div className="space-y-6">
              {/* 収入カテゴリ */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-green-500">💰</span>
                  収入カテゴリ
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  取引入力時に選択できる収入のカテゴリを管理します
                </p>

                <div className="space-y-3">
                  {revenueCategories.map((category, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="text-gray-900">{category}</span>
                      <button
                        onClick={() => handleRemoveRevenueCategory(index)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                      >
                        削除
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex gap-2">
                  <input
                    type="text"
                    value={newRevenueCategoryName}
                    onChange={(e) => setNewRevenueCategoryName(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') handleAddRevenueCategory();
                    }}
                    placeholder="新しいカテゴリ名"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={handleAddRevenueCategory}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    追加
                  </button>
                </div>
              </div>

              {/* 経費カテゴリ */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-red-500">📊</span>
                  経費カテゴリ
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  取引入力時に選択できる経費のカテゴリを管理します
                </p>

                <div className="space-y-3">
                  {expenseCategories.map((category, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="text-gray-900">{category}</span>
                      <button
                        onClick={() => handleRemoveExpenseCategory(index)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                      >
                        削除
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex gap-2">
                  <input
                    type="text"
                    value={newExpenseCategoryName}
                    onChange={(e) => setNewExpenseCategoryName(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') handleAddExpenseCategory();
                    }}
                    placeholder="新しいカテゴリ名"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={handleAddExpenseCategory}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    追加
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 事業年度設定 */}
          {activeSection === 'fiscal' && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-blue-500">📅</span>
                事業年度設定
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                事業年度の開始月日を設定します（通常は1月1日）
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    事業年度開始日
                  </label>
                  <input
                    type="text"
                    value={fiscalYearStart}
                    onChange={(e) => setFiscalYearStart(e.target.value)}
                    placeholder="MM-DD (例: 01-01)"
                    className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    フォーマット: MM-DD (例: 04-01 は 4月1日)
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">
                    💡 事業年度について
                  </h4>
                  <ul className="space-y-1 text-sm text-blue-800">
                    <li>• 個人事業主の場合、通常は1月1日〜12月31日</li>
                    <li>• 法人の場合、任意の月を開始月にできます</li>
                    <li>• 確定申告は事業年度ごとに行います</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* 事業者情報 */}
          {activeSection === 'profile' && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-purple-500">👤</span>
                事業者情報
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                請求書や確定申告書類に使用する事業者情報を登録します
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    屋号・事業者名
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="例: 山田太郎デザイン事務所"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    事業内容
                  </label>
                  <input
                    type="text"
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    placeholder="例: Webデザイン業"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    電話番号
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="例: 090-1234-5678"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    住所
                  </label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="例: 〒100-0001 東京都千代田区..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">
                    現在のユーザー情報
                  </h4>
                  <div className="space-y-1 text-sm text-gray-700">
                    <p>
                      <span className="font-medium">名前:</span>{' '}
                      {session?.user?.name || '未設定'}
                    </p>
                    <p>
                      <span className="font-medium">メール:</span>{' '}
                      {session?.user?.email || '未設定'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 保存ボタン */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">設定の保存</h4>
                <p className="text-sm text-gray-500 mt-1">
                  変更内容を保存します
                </p>
              </div>
              <button
                onClick={handleSaveSettings}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ヒント */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
          <span>💡</span>
          設定のヒント
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>カテゴリは事業内容に合わせて自由にカスタマイズできます</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>
              不要なカテゴリは削除して、よく使うカテゴリだけを残すことをおすすめします
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>
              事業者情報は請求書や確定申告書類に使用されるため、正確に入力してください
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>設定は定期的に見直し、最新の状態に保ちましょう</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
