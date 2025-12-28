'use client';

import { useState, useEffect } from 'react';
import { useGoogleTasks, GoogleTask } from '@/hooks/useGoogleTasks';

interface GoogleTaskSelectorProps {
  onTaskSelect: (task: GoogleTask | null) => void;
  selectedTaskId?: string;
}

export function GoogleTaskSelector({
  onTaskSelect,
  selectedTaskId,
}: GoogleTaskSelectorProps) {
  const { tasks, isLoading, isAuthenticated, fetchTasks } = useGoogleTasks();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated && isOpen) {
      fetchTasks();
    }
  }, [isAuthenticated, isOpen, fetchTasks]);

  if (!isAuthenticated) {
    return (
      <div className="text-sm text-gray-500 italic">
        Google Tasksを使用するにはログインしてください
      </div>
    );
  }

  const selectedTask = tasks.find((t) => t.id === selectedTaskId);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
      >
        <span className="text-sm text-gray-700">
          {selectedTask ? (
            <span className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              {selectedTask.title}
            </span>
          ) : (
            'Google Tasksからタスクを選択'
          )}
        </span>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${
            isOpen ? 'transform rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-gray-500">
              読み込み中...
            </div>
          ) : tasks.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              タスクがありません
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  onTaskSelect(null);
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-500 hover:bg-gray-50 transition-colors"
              >
                タスクなし
              </button>
              {tasks.map((task) => (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => {
                    onTaskSelect(task);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-blue-50 transition-colors ${
                    task.id === selectedTaskId
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    <div>
                      <div>{task.title}</div>
                      {task.notes && (
                        <div className="text-xs text-gray-500 truncate">
                          {task.notes}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
