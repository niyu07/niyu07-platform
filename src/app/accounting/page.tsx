'use client';

import { useState } from 'react';
import { Transaction } from '../types';
import AccountingDashboard from './components/AccountingDashboard';
import TransactionInput from './components/TransactionInput';
import TransactionList from './components/TransactionList';
import TaxSimulator from './components/TaxSimulator';
import Reports from './components/Reports';
import TaxFiling from './components/TaxFiling';
import Settings from './components/Settings';

type TabType =
  | 'ダッシュボード'
  | '取引入力'
  | '取引一覧'
  | '扶養シミュレーター'
  | 'レポート'
  | '確定申告'
  | '設定';

export default function AccountingPage() {
  const [activeTab, setActiveTab] = useState<TabType>('ダッシュボード');
  const [transactionType, setTransactionType] = useState<'収入' | '経費'>(
    '収入'
  );
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const tabs: TabType[] = [
    'ダッシュボード',
    '取引入力',
    '取引一覧',
    '扶養シミュレーター',
    'レポート',
    '確定申告',
    '設定',
  ];

  const handleNavigateToInput = (tab: TabType, type?: '収入' | '経費') => {
    setActiveTab(tab);
    if (type) {
      setTransactionType(type);
    }
  };

  const handleNavigateToTab = (tab: TabType) => {
    setActiveTab(tab);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setTransactionType(transaction.type);
    setActiveTab('取引入力');
  };

  const handleCancelEdit = () => {
    setEditingTransaction(null);
  };

  const handleTransactionSuccess = () => {
    setEditingTransaction(null);
    setRefreshKey((prev) => prev + 1); // データを再取得するためのキー
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'ダッシュボード':
        return (
          <AccountingDashboard
            key={refreshKey}
            onNavigateToInput={handleNavigateToInput}
            onNavigateToTab={handleNavigateToTab}
          />
        );
      case '取引入力':
        return (
          <TransactionInput
            initialType={transactionType}
            editingTransaction={editingTransaction}
            onSuccess={handleTransactionSuccess}
            onCancelEdit={handleCancelEdit}
          />
        );
      case '取引一覧':
        return (
          <TransactionList key={refreshKey} onEdit={handleEditTransaction} />
        );
      case '扶養シミュレーター':
        return <TaxSimulator />;
      case 'レポート':
        return <Reports />;
      case '確定申告':
        return <TaxFiling />;
      case '設定':
        return <Settings />;
      default:
        return (
          <AccountingDashboard
            key={refreshKey}
            onNavigateToInput={handleNavigateToInput}
            onNavigateToTab={handleNavigateToTab}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1400px] mx-auto p-6">
        {/* ヘッダー */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">会計管理</h1>
          <p className="text-gray-600">
            収支の記録、扶養の管理、レポート作成を一元管理します。
          </p>
        </div>

        {/* タブナビゲーション */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex overflow-x-auto custom-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 whitespace-nowrap font-medium transition-colors border-b-2 ${
                  activeTab === tab
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-600 border-transparent hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* コンテンツエリア */}
        <div>{renderContent()}</div>
      </div>
    </div>
  );
}
