'use client';

import { User } from '../types';
import Link from 'next/link';
import { useState } from 'react';
import { useSession } from 'next-auth/react';

interface SidebarProps {
  user: User;
  currentPage?: string;
}

export default function Sidebar({
  user,
  currentPage = 'ホーム',
}: SidebarProps) {
  const { data: session } = useSession();
  const [isAddingMemo, setIsAddingMemo] = useState(false);
  const [memoContent, setMemoContent] = useState('');

  const menuItems = [
    { name: 'ホーム', icon: '🏠', href: '/' },
    { name: '会計', icon: '💰', href: '/accounting' },
    { name: 'カレンダー', icon: '📅', href: '/calendar' },
    { name: 'タスク', icon: '✓', href: '/tasks' },
    { name: 'ポモドーロ', icon: '🍅', href: '/pomodoro' },
    { name: '学習ログ', icon: '📚', href: '/study-log' },
    { name: '天気', icon: '🌤️', href: '/weather' },
    { name: '勤怠管理', icon: '⏰', href: '/attendance' },
    {
      name: '扶養シミュレーション',
      icon: '💵',
      href: '/tax/dependent-simulation',
    },
  ];

  const handleAddMemo = async () => {
    if (!memoContent.trim()) return;

    // NextAuth のセッションから実際のユーザーIDを取得
    const actualUserId = session?.user?.id || user.id;

    try {
      const response = await fetch('/api/memos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: actualUserId,
          content: memoContent,
        }),
      });

      if (response.ok) {
        setMemoContent('');
        setIsAddingMemo(false);

        // カスタムイベントを発火してメモリストを更新
        window.dispatchEvent(new CustomEvent('memoAdded'));
      } else {
        const data = await response.json();
        console.error('Failed to save memo:', data);
        alert('メモの保存に失敗しました: ' + (data.error || '不明なエラー'));
      }
    } catch (error) {
      console.error('Failed to add memo:', error);
      alert('メモの保存中にエラーが発生しました');
    }
  };

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
          <Link
            key={item.name}
            href={item.href}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
              currentPage === item.name
                ? 'bg-[#6366f1] text-white'
                : 'text-gray-300 hover:bg-[#252841]'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-sm font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>

      {/* クイックメモ */}
      <div className="px-3 pb-3">
        {!isAddingMemo ? (
          <button
            onClick={() => setIsAddingMemo(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-[#252841] text-gray-300 hover:bg-[#2d3250] transition-colors"
          >
            <span className="text-xl">📝</span>
            <span className="text-sm font-medium">メモを追加</span>
          </button>
        ) : (
          <div className="bg-[#252841] rounded-lg p-3">
            <textarea
              value={memoContent}
              onChange={(e) => setMemoContent(e.target.value)}
              placeholder="思いついたことを書く..."
              className="w-full bg-[#1a1d2e] text-white text-sm rounded p-2 mb-2 resize-none focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
              rows={3}
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddMemo}
                className="flex-1 bg-[#6366f1] hover:bg-[#5558e3] text-white text-xs py-1.5 rounded transition-colors"
              >
                保存
              </button>
              <button
                onClick={() => {
                  setIsAddingMemo(false);
                  setMemoContent('');
                }}
                className="flex-1 bg-[#1a1d2e] hover:bg-[#252841] text-gray-300 text-xs py-1.5 rounded transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 設定 */}
      <div className="px-3 pb-4">
        <Link
          href="/settings"
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-[#252841] transition-colors"
        >
          <span className="text-xl">⚙️</span>
          <span className="text-sm font-medium">設定</span>
        </Link>
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
