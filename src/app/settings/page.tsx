'use client';

import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import SettingsNavigation from './components/SettingsNavigation';
import AccountSettings from './components/AccountSettings';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('account');

  const user = {
    name: '山田太郎',
    email: 'yamada@example.com',
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'account':
        return <AccountSettings />;
      case 'appearance':
        return (
          <div className="text-center py-20 text-gray-500">
            <p className="text-6xl mb-4">🎨</p>
            <p className="text-xl">外観設定</p>
            <p className="text-sm mt-2">このセクションは現在開発中です</p>
          </div>
        );
      case 'notifications':
        return (
          <div className="text-center py-20 text-gray-500">
            <p className="text-6xl mb-4">🔔</p>
            <p className="text-xl">通知設定</p>
            <p className="text-sm mt-2">このセクションは現在開発中です</p>
          </div>
        );
      case 'integrations':
        return (
          <div className="text-center py-20 text-gray-500">
            <p className="text-6xl mb-4">🔗</p>
            <p className="text-xl">連携サービス</p>
            <p className="text-sm mt-2">このセクションは現在開発中です</p>
          </div>
        );
      case 'data':
        return (
          <div className="text-center py-20 text-gray-500">
            <p className="text-6xl mb-4">💾</p>
            <p className="text-xl">データ管理</p>
            <p className="text-sm mt-2">このセクションは現在開発中です</p>
          </div>
        );
      case 'security':
        return (
          <div className="text-center py-20 text-gray-500">
            <p className="text-6xl mb-4">🛡️</p>
            <p className="text-xl">セキュリティ</p>
            <p className="text-sm mt-2">このセクションは現在開発中です</p>
          </div>
        );
      case 'payment':
        return (
          <div className="text-center py-20 text-gray-500">
            <p className="text-6xl mb-4">💳</p>
            <p className="text-xl">支払い設定</p>
            <p className="text-sm mt-2">このセクションは現在開発中です</p>
          </div>
        );
      case 'help':
        return (
          <div className="text-center py-20 text-gray-500">
            <p className="text-6xl mb-4">❓</p>
            <p className="text-xl">ヘルプ・サポート</p>
            <p className="text-sm mt-2">このセクションは現在開発中です</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* メインサイドバー */}
      <Sidebar user={user} currentPage="設定" />

      {/* メインコンテンツ */}
      <div className="flex-1 ml-64 p-8">
        <div className="max-w-[1400px] mx-auto">
          {/* ヘッダー */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">設定</h1>
            <p className="text-gray-600">アカウントやアプリケーションの設定を管理</p>
          </div>

          {/* メインコンテンツ */}
          <div className="grid grid-cols-[280px_1fr] gap-6">
            {/* 設定タブナビゲーション */}
            <SettingsNavigation activeTab={activeTab} onTabChange={setActiveTab} />

            {/* コンテンツエリア */}
            <div className="bg-white rounded-2xl p-8 shadow-sm">{renderContent()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
