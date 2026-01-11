'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface ReceiptItem {
  name: string;
  price?: number;
}

interface ReceiptOcrData {
  id: string;
  receiptId: string;
  storeName: string | null;
  transactionDate: string | null;
  totalAmount: number | null;
  taxAmount: number | null;
  paymentMethod: string | null;
  items: ReceiptItem[];
  rawText: string | null;
  confidence: number | null;
}

interface Receipt {
  id: string;
  userId: string;
  imageUrl: string;
  uploadedAt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  ocrData: ReceiptOcrData | null;
}

interface Filters {
  startDate: string;
  endDate: string;
  storeName: string;
  status: string;
}

export default function ReceiptList() {
  const { data: session } = useSession();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    startDate: '',
    endDate: '',
    storeName: '',
    status: '',
  });

  // 領収書一覧を取得
  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.storeName) params.append('storeName', filters.storeName);
      if (filters.status) params.append('status', filters.status);

      const response = await fetch(`/api/receipts/list?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setReceipts(data.data);
      } else {
        setError(data.message || '領収書の取得に失敗しました');
      }
    } catch (err) {
      console.error('Fetch receipts error:', err);
      setError('領収書の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchReceipts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, filters]);

  // 詳細モーダルを開く
  const openDetailModal = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
    setShowDetailModal(true);
  };

  // 詳細モーダルを閉じる
  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedReceipt(null);
  };

  // 領収書を削除
  const handleDelete = async (id: string) => {
    if (!confirm('この領収書を削除しますか？')) return;

    try {
      const response = await fetch(`/api/receipts/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setReceipts(receipts.filter((r) => r.id !== id));
        closeDetailModal();
      } else {
        alert(data.message || '削除に失敗しました');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('削除に失敗しました');
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
        <h1 className="text-3xl font-bold text-gray-900">領収書管理</h1>
      </div>

      {/* フィルタセクション */}
      <div className="bg-white rounded-lg shadow-md p-4 space-y-4">
        <h2 className="font-semibold text-gray-900">フィルタ</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              開始日
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) =>
                setFilters({ ...filters, startDate: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              終了日
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) =>
                setFilters({ ...filters, endDate: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              店舗名
            </label>
            <input
              type="text"
              value={filters.storeName}
              onChange={(e) =>
                setFilters({ ...filters, storeName: e.target.value })
              }
              placeholder="店舗名で検索"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ステータス
            </label>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">すべて</option>
              <option value="pending">保留中</option>
              <option value="processing">処理中</option>
              <option value="completed">完了</option>
              <option value="failed">失敗</option>
            </select>
          </div>
        </div>
        <button
          onClick={() =>
            setFilters({
              startDate: '',
              endDate: '',
              storeName: '',
              status: '',
            })
          }
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          フィルタをクリア
        </button>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* ローディング */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* 領収書一覧 */}
      {!loading && receipts.length === 0 && (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <p className="text-gray-600">領収書が見つかりませんでした</p>
        </div>
      )}

      {!loading && receipts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {receipts.map((receipt) => (
            <div
              key={receipt.id}
              onClick={() => openDetailModal(receipt)}
              className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
            >
              <div className="relative aspect-3/4 bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={receipt.imageUrl}
                  alt="領収書"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {new Date(receipt.uploadedAt).toLocaleDateString('ja-JP')}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      receipt.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : receipt.status === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {receipt.status === 'completed'
                      ? '完了'
                      : receipt.status === 'failed'
                        ? '失敗'
                        : '処理中'}
                  </span>
                </div>
                {receipt.ocrData && (
                  <>
                    <p className="font-semibold text-gray-900 truncate">
                      {receipt.ocrData.storeName || '店舗名なし'}
                    </p>
                    {receipt.ocrData.totalAmount && (
                      <p className="text-lg font-bold text-blue-600">
                        ¥{receipt.ocrData.totalAmount.toLocaleString()}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 詳細モーダル */}
      {showDetailModal && selectedReceipt && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeDetailModal}
        >
          <div
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">領収書詳細</h2>
              <button
                onClick={closeDetailModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* 画像表示 */}
              <div className="relative w-full max-w-md mx-auto">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedReceipt.imageUrl}
                  alt="領収書"
                  className="rounded-lg shadow-lg w-full h-auto"
                />
              </div>

              {/* OCR結果 */}
              {selectedReceipt.ocrData && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-gray-900">
                    OCR結果
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">店舗名:</span>
                      <p className="font-medium">
                        {selectedReceipt.ocrData.storeName || '未検出'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">日付:</span>
                      <p className="font-medium">
                        {selectedReceipt.ocrData.transactionDate
                          ? new Date(
                              selectedReceipt.ocrData.transactionDate
                            ).toLocaleDateString('ja-JP')
                          : '未検出'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">合計金額:</span>
                      <p className="font-medium text-blue-600">
                        {selectedReceipt.ocrData.totalAmount
                          ? `¥${selectedReceipt.ocrData.totalAmount.toLocaleString()}`
                          : '未検出'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">消費税:</span>
                      <p className="font-medium">
                        {selectedReceipt.ocrData.taxAmount
                          ? `¥${selectedReceipt.ocrData.taxAmount.toLocaleString()}`
                          : '未検出'}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-gray-600">支払い方法:</span>
                      <p className="font-medium">
                        {selectedReceipt.ocrData.paymentMethod || '未検出'}
                      </p>
                    </div>
                  </div>

                  {/* 品目リスト */}
                  {selectedReceipt.ocrData.items &&
                    selectedReceipt.ocrData.items.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">品目</h4>
                        <ul className="space-y-1 text-sm">
                          {selectedReceipt.ocrData.items.map((item, index) => (
                            <li
                              key={index}
                              className="flex justify-between text-gray-700"
                            >
                              <span>{item.name}</span>
                              {item.price && (
                                <span>¥{item.price.toLocaleString()}</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  {/* 信頼度 */}
                  {selectedReceipt.ocrData.confidence !== null && (
                    <div>
                      <span className="text-sm text-gray-600">
                        OCR信頼度:{' '}
                        {Math.round(selectedReceipt.ocrData.confidence * 100)}%
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* アクションボタン */}
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleDelete(selectedReceipt.id)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  削除
                </button>
                <button
                  onClick={closeDetailModal}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
