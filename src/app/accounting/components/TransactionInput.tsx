'use client';

import { TransactionType } from '../../types';
import { useState } from 'react';

interface TransactionInputProps {
  initialType?: TransactionType;
}

export default function TransactionInput({
  initialType = '収入',
}: TransactionInputProps) {
  const [transactionType, setTransactionType] =
    useState<TransactionType>(initialType);
  const [date, setDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [detail, setDetail] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [client, setClient] = useState<string>('');
  const [clientType, setClientType] = useState<'法人' | '個人'>('法人');
  const [memo, setMemo] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Transaction submitted:', {
      transactionType,
      date,
      detail,
      amount,
      client,
      clientType,
      memo,
    });
    alert('売上を登録しました！');
  };

  const handleDraft = () => {
    alert('下書きとして保存しました');
  };

  const recentClients = [
    '株式会社A',
    '株式会社B',
    '株式会社C',
    '個人クライアントD',
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
        {/* 種類切り替え */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setTransactionType('収入')}
            className={`flex-1 py-3 rounded-lg font-medium transition-all ${
              transactionType === '収入'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            売上
          </button>
          <button
            onClick={() => setTransactionType('経費')}
            className={`flex-1 py-3 rounded-lg font-medium transition-all ${
              transactionType === '経費'
                ? 'bg-red-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            経費
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 日付 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              日付
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              例: 2025年12月25日 (木)
            </p>
          </div>

          {/* 取引先 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              取引先
            </label>
            <input
              type="text"
              value={client}
              onChange={(e) => setClient(e.target.value)}
              placeholder="例: 株式会社○○"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {client === '' && recentClients.length > 0 && (
              <div className="mt-2 text-sm text-gray-600">
                過去の取引先: {recentClients.slice(0, 3).join('、')}...
              </div>
            )}
          </div>

          {/* 案件名 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              案件名
            </label>
            <input
              type="text"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="例: Webサイトデザイン"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 金額 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              金額（税込）
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                ¥
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                required
                min="0"
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* 取引先区分 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              取引先区分
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="clientType"
                  value="法人"
                  checked={clientType === '法人'}
                  onChange={() => setClientType('法人')}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-gray-700">法人（源泉徴収あり）</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="clientType"
                  value="個人"
                  checked={clientType === '個人'}
                  onChange={() => setClientType('個人')}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-gray-700">個人（源泉徴収なし）</span>
              </label>
            </div>
          </div>

          {/* 詳細・メモ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              詳細・メモ
            </label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="取引の詳細や特記事項を入力..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* 領収書・請求書 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              領収書・請求書
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
              <div className="text-4xl mb-2">📤</div>
              <p className="text-gray-600">
                ファイルをドロップ または クリックで選択
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PDF, JPG, PNG (最大5MB)
              </p>
            </div>
          </div>

          {/* ボタン */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={handleDraft}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              下書き保存
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors shadow-lg"
            >
              売上を登録
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
