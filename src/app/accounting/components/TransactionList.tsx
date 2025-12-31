'use client';

import { Transaction } from '../../types';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface TransactionListProps {
  onEdit?: (transaction: Transaction) => void;
}

export default function TransactionList({ onEdit }: TransactionListProps) {
  const { data: session } = useSession();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // フィルター状態
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<'all' | '収入' | '経費'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [sortField, setSortField] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // カテゴリ一覧を取得
  const categories = Array.from(
    new Set(transactions.map((t) => t.category))
  ).sort();

  // データ取得
  useEffect(() => {
    if (!session?.user?.email) {
      setIsLoading(false);
      return;
    }

    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/accounting/transactions?userId=${session.user.email}`
        );
        if (response.ok) {
          const data = await response.json();
          setTransactions(data);
          setFilteredTransactions(data);
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [session]);

  // フィルタリング・ソート処理
  useEffect(() => {
    let filtered = [...transactions];

    // テキスト検索
    if (searchText) {
      const lowerSearch = searchText.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.detail.toLowerCase().includes(lowerSearch) ||
          t.category.toLowerCase().includes(lowerSearch) ||
          (t.client && t.client.toLowerCase().includes(lowerSearch)) ||
          (t.memo && t.memo.toLowerCase().includes(lowerSearch))
      );
    }

    // 種別フィルター
    if (filterType !== 'all') {
      filtered = filtered.filter((t) => t.type === filterType);
    }

    // カテゴリフィルター
    if (filterCategory !== 'all') {
      filtered = filtered.filter((t) => t.category === filterCategory);
    }

    // 日付範囲フィルター
    if (filterStartDate) {
      filtered = filtered.filter(
        (t) => new Date(t.date) >= new Date(filterStartDate)
      );
    }
    if (filterEndDate) {
      filtered = filtered.filter(
        (t) => new Date(t.date) <= new Date(filterEndDate)
      );
    }

    // ソート
    filtered.sort((a, b) => {
      let compareValue = 0;
      if (sortField === 'date') {
        compareValue = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortField === 'amount') {
        compareValue = a.amount - b.amount;
      }
      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    setFilteredTransactions(filtered);
    setCurrentPage(1); // フィルター変更時は1ページ目に戻る
  }, [
    transactions,
    searchText,
    filterType,
    filterCategory,
    filterStartDate,
    filterEndDate,
    sortField,
    sortOrder,
  ]);

  // ページネーション計算
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

  // 削除処理
  const handleDelete = async (id: string) => {
    if (!confirm('この取引を削除してもよろしいですか？')) {
      return;
    }

    try {
      const response = await fetch(`/api/accounting/transactions?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTransactions((prev) => prev.filter((t) => t.id !== id));
        alert('取引を削除しました');
      } else {
        alert('削除に失敗しました');
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('削除に失敗しました');
    }
  };

  // フィルターのリセット
  const resetFilters = () => {
    setSearchText('');
    setFilterType('all');
    setFilterCategory('all');
    setFilterStartDate('');
    setFilterEndDate('');
    setSortField('date');
    setSortOrder('desc');
  };

  // 集計値の計算
  const totalRevenue = filteredTransactions
    .filter((t) => t.type === '収入')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = filteredTransactions
    .filter((t) => t.type === '経費')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalProfit = totalRevenue - totalExpense;

  const formatCurrency = (amount: number): string => {
    return `¥${amount.toLocaleString()}`;
  };

  const getTransactionAmount = (transaction: Transaction): string => {
    const sign = transaction.type === '収入' ? '+' : '-';
    return `${sign}${formatCurrency(transaction.amount)}`;
  };

  const getTransactionColor = (transaction: Transaction): string => {
    return transaction.type === '収入' ? 'text-green-600' : 'text-red-600';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // ローディング中の表示
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">データを読み込み中...</p>
        </div>
      </div>
    );
  }

  // ログインしていない場合
  if (!session?.user) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            ログインして取引データを表示しましょう
          </p>
          <button
            onClick={() => (window.location.href = '/api/auth/signin')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ログイン
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー & サマリー */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">取引一覧</h2>

        {/* サマリーカード */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <p className="text-sm text-green-700 mb-1">収入合計</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(totalRevenue)}
            </p>
            <p className="text-xs text-green-600 mt-1">
              {filteredTransactions.filter((t) => t.type === '収入').length} 件
            </p>
          </div>
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <p className="text-sm text-red-700 mb-1">経費合計</p>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(totalExpense)}
            </p>
            <p className="text-xs text-red-600 mt-1">
              {filteredTransactions.filter((t) => t.type === '経費').length} 件
            </p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-blue-700 mb-1">利益</p>
            <p
              className={`text-2xl font-bold ${
                totalProfit >= 0 ? 'text-blue-600' : 'text-red-600'
              }`}
            >
              {formatCurrency(totalProfit)}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              合計 {filteredTransactions.length} 件
            </p>
          </div>
        </div>
      </div>

      {/* 検索・フィルター */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">絞り込み</h3>
          <button
            onClick={resetFilters}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            リセット
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* テキスト検索 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              キーワード検索
            </label>
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="取引先、詳細、メモなど"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 種別フィルター */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              種別
            </label>
            <select
              value={filterType}
              onChange={(e) =>
                setFilterType(e.target.value as 'all' | '収入' | '経費')
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">すべて</option>
              <option value="収入">収入のみ</option>
              <option value="経費">経費のみ</option>
            </select>
          </div>

          {/* カテゴリフィルター */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              カテゴリ
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">すべて</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* 開始日 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              開始日
            </label>
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 終了日 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              終了日
            </label>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* ソート */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              並び順
            </label>
            <div className="flex gap-2">
              <select
                value={sortField}
                onChange={(e) =>
                  setSortField(e.target.value as 'date' | 'amount')
                }
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="date">日付順</option>
                <option value="amount">金額順</option>
              </select>
              <button
                onClick={() =>
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                }
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title={sortOrder === 'asc' ? '昇順' : '降順'}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 取引テーブル */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  日付
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  種別
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  カテゴリ
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  詳細
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  取引先
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                  金額
                </th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                  アクション
                </th>
              </tr>
            </thead>
            <tbody>
              {currentTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    {transactions.length === 0
                      ? '取引データがありません'
                      : '条件に一致する取引が見つかりません'}
                  </td>
                </tr>
              ) : (
                currentTransactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {formatDate(transaction.date)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.type === '収入'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {transaction.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {transaction.category}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      <div
                        className="max-w-xs truncate"
                        title={transaction.detail}
                      >
                        {transaction.detail}
                      </div>
                      {transaction.memo && (
                        <div className="text-xs text-gray-500 mt-1 max-w-xs truncate">
                          {transaction.memo}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {transaction.client || '-'}
                    </td>
                    <td
                      className={`py-3 px-4 text-sm text-right font-semibold ${getTransactionColor(transaction)}`}
                    >
                      {getTransactionAmount(transaction)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onEdit && onEdit(transaction)}
                          className="text-gray-400 hover:text-blue-600 transition-colors"
                          title="編集"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(transaction.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                          title="削除"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ページネーション */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-600">
              全 {filteredTransactions.length} 件中 {startIndex + 1} -{' '}
              {Math.min(endIndex, filteredTransactions.length)} 件を表示
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                前へ
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (page) =>
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                  )
                  .map((page, index, array) => {
                    const prevPage = array[index - 1];
                    const showEllipsis = prevPage && page - prevPage > 1;
                    return (
                      <div key={page} className="flex items-center gap-1">
                        {showEllipsis && (
                          <span className="px-2 text-gray-500">...</span>
                        )}
                        <button
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-1 rounded-lg transition-colors ${
                            currentPage === page
                              ? 'bg-blue-600 text-white'
                              : 'border border-gray-300 hover:bg-white'
                          }`}
                        >
                          {page}
                        </button>
                      </div>
                    );
                  })}
              </div>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                次へ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
