'use client';

import { useState } from 'react';

interface SettingsTab {
  id: string;
  label: string;
  icon: string;
}

const tabs: SettingsTab[] = [
  { id: 'account', label: 'アカウント', icon: '👤' },
  { id: 'appearance', label: '外観', icon: '🎨' },
  { id: 'notifications', label: '通知', icon: '🔔' },
  { id: 'integrations', label: '連携サービス', icon: '🔗' },
  { id: 'data', label: 'データ管理', icon: '💾' },
  { id: 'security', label: 'セキュリティ', icon: '🛡️' },
  { id: 'payment', label: '支払い', icon: '💳' },
  { id: 'help', label: 'ヘルプ・サポート', icon: '❓' },
];

interface SettingsNavigationProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function SettingsNavigation({
  activeTab,
  onTabChange,
}: SettingsNavigationProps) {
  return (
    <div className="bg-white rounded-2xl p-4 space-y-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3 ${
            activeTab === tab.id
              ? 'bg-blue-500 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <span className="text-xl">{tab.icon}</span>
          <span className="font-medium">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
