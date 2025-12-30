'use client';

import { useState, useEffect } from 'react';

interface Memo {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface MemoListProps {
  userId: string;
  onConvertToTask: (memo: Memo) => void;
  onMemoDeleted?: () => void;
}

export default function MemoList({ userId, onConvertToTask, onMemoDeleted }: MemoListProps) {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchMemos = async () => {
    try {
      const response = await fetch(`/api/memos?userId=${userId}&order=${sortOrder}`);
      if (response.ok) {
        const data = await response.json();
        setMemos(data);
      }
    } catch (error) {
      console.error('Failed to fetch memos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMemos();
  }, [userId, sortOrder]);

  // メモ追加・更新・削除イベントを監視してリアルタイム更新
  useEffect(() => {
    const handleMemoChange = () => {
      fetchMemos();
    };

    window.addEventListener('memoAdded', handleMemoChange);
    window.addEventListener('memoUpdated', handleMemoChange);
    window.addEventListener('memoDeleted', handleMemoChange);

    return () => {
      window.removeEventListener('memoAdded', handleMemoChange);
      window.removeEventListener('memoUpdated', handleMemoChange);
      window.removeEventListener('memoDeleted', handleMemoChange);
    };
  }, [userId, sortOrder]);

  const handleEdit = (memo: Memo) => {
    setEditingId(memo.id);
    setEditContent(memo.content);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editContent.trim()) return;

    try {
      const response = await fetch('/api/memos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingId,
          content: editContent,
        }),
      });

      if (response.ok) {
        setEditingId(null);
        setEditContent('');
        fetchMemos();
        window.dispatchEvent(new CustomEvent('memoUpdated'));
      }
    } catch (error) {
      console.error('Failed to update memo:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('このメモを削除しますか？')) return;

    try {
      const response = await fetch(`/api/memos?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchMemos();
        window.dispatchEvent(new CustomEvent('memoDeleted'));
      }
    } catch (error) {
      console.error('Failed to delete memo:', error);
    }
  };

  const handleConvertToTask = (memo: Memo) => {
    onConvertToTask(memo);
  };

  // MemoList を外部から更新できるように、userId が変わったら再取得
  useEffect(() => {
    fetchMemos();
  }, [onMemoDeleted]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="text-sm text-gray-500">メモを読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">📝 クイックメモ</h2>
        <button
          onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
          className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
        >
          {sortOrder === 'desc' ? '新しい順' : '古い順'}
          <span>{sortOrder === 'desc' ? '↓' : '↑'}</span>
        </button>
      </div>

      {memos.length === 0 ? (
        <div className="text-sm text-gray-500 text-center py-4">
          メモがありません。サイドバーから追加してください。
        </div>
      ) : (
        <div className="space-y-2">
          {memos.map((memo) => (
            <div
              key={memo.id}
              className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:border-gray-300 transition-colors"
            >
              {editingId === memo.id ? (
                <div>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded p-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveEdit}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs py-1.5 rounded transition-colors"
                    >
                      保存
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEditContent('');
                      }}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs py-1.5 rounded transition-colors"
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-800 mb-2 whitespace-pre-wrap">
                    {memo.content}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {new Date(memo.createdAt).toLocaleString('ja-JP', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleConvertToTask(memo)}
                        className="text-xs bg-green-100 hover:bg-green-200 text-green-700 px-2 py-1 rounded transition-colors"
                        title="タスクに変換"
                      >
                        タスク化
                      </button>
                      <button
                        onClick={() => handleEdit(memo)}
                        className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded transition-colors"
                        title="編集"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => handleDelete(memo.id)}
                        className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded transition-colors"
                        title="削除"
                      >
                        削除
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
