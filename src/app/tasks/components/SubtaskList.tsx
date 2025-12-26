'use client';

import { Subtask } from '../../types';
import { useState } from 'react';

interface SubtaskListProps {
  subtasks: Subtask[];
  onToggle?: (subtaskId: string) => void;
  onAdd?: (title: string) => void;
  onDelete?: (subtaskId: string) => void;
  editable?: boolean;
}

export default function SubtaskList({
  subtasks,
  onToggle,
  onAdd,
  onDelete,
  editable = false,
}: SubtaskListProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const handleAdd = () => {
    if (newSubtaskTitle.trim() && onAdd) {
      onAdd(newSubtaskTitle.trim());
      setNewSubtaskTitle('');
      setIsAdding(false);
    }
  };

  // サブタスクをorder順にソート
  const sortedSubtasks = [...subtasks].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-2">
      {sortedSubtasks.map((subtask) => (
        <div
          key={subtask.id}
          className="flex items-center gap-2 p-2 bg-gray-50 rounded hover:bg-gray-100"
        >
          <input
            type="checkbox"
            checked={subtask.completed}
            onChange={() => onToggle && onToggle(subtask.id)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <span
            className={`flex-1 text-sm ${
              subtask.completed ? 'text-gray-400 line-through' : 'text-gray-700'
            }`}
          >
            {subtask.title}
          </span>
          {editable && onDelete && (
            <button
              onClick={() => onDelete(subtask.id)}
              className="text-gray-400 hover:text-red-600 text-sm"
              title="削除"
            >
              ✕
            </button>
          )}
        </div>
      ))}

      {/* 新規追加 */}
      {editable && (
        <div>
          {isAdding ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAdd();
                  if (e.key === 'Escape') {
                    setIsAdding(false);
                    setNewSubtaskTitle('');
                  }
                }}
                placeholder="サブタスク名..."
                className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <button
                onClick={handleAdd}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                追加
              </button>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setNewSubtaskTitle('');
                }}
                className="px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                キャンセル
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 px-2 py-1"
            >
              <span className="text-lg">+</span>
              <span>新しいサブタスク...</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
