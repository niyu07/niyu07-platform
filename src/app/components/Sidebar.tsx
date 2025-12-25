'use client';

import { User } from '../types';

interface SidebarProps {
  user: User;
  currentPage?: string;
}

export default function Sidebar({
  user,
  currentPage = 'ホーム',
}: SidebarProps) {
  const menuItems = [
    { name: 'ホーム', icon: '🏠' },
    { name: '会計', icon: '💰' },
    { name: 'カレンダー', icon: '📅' },
    { name: 'タスク', icon: '✓' },
    { name: 'ポモドーロ', icon: '🍅' },
    { name: '学習ログ', icon: '📚' },
    { name: '天気', icon: '🌤️' },
    { name: '勤怠管理', icon: '⏰' },
  ];

  return (
    <aside className="w-64 h-screen bg-[#1a1d2e] text-white flex flex-col fixed left-0 top-0">
      {/* ヘッダー */}
      <div className="p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-[#6366f1] rounded-full flex items-center justify-center font-bold text-lg">
            P
          </div>
          <h1 className="text-xl font-bold">Productivity Hub</h1>
        </div>
        <p className="text-sm text-gray-400 ml-13">生産性管理</p>
      </div>

      {/* メニュー */}
      <nav className="flex-1 px-3">
        {menuItems.map((item) => (
          <button
            key={item.name}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
              currentPage === item.name
                ? 'bg-[#6366f1] text-white'
                : 'text-gray-300 hover:bg-[#252841]'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-sm font-medium">{item.name}</span>
          </button>
        ))}
      </nav>

      {/* 設定 */}
      <div className="px-3 pb-4">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-[#252841] transition-colors">
          <span className="text-xl">⚙️</span>
          <span className="text-sm font-medium">設定</span>
        </button>
      </div>

      {/* ユーザー情報 */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#6366f1] rounded-full flex items-center justify-center">
            <span className="text-sm font-bold">{user.name.charAt(0)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
          </div>
          <button className="text-gray-400 hover:text-white">
            <span className="text-sm">↗</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
