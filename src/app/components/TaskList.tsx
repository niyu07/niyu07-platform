'use client';

import Link from 'next/link';
import { Task, Priority } from '../types';
import { useState } from 'react';

interface TaskListProps {
  tasks: Task[];
}

const getPriorityColor = (priority: Priority): string => {
  const colors = {
    高: 'bg-red-100 text-red-700 border-red-200',
    中: 'bg-orange-100 text-orange-700 border-orange-200',
    低: 'bg-gray-100 text-gray-600 border-gray-200',
  };
  return colors[priority];
};

const getPriorityBadge = (priority: Priority): string => {
  const badges = {
    高: '🔴',
    中: '🟡',
    低: '⚪',
  };
  return badges[priority];
};

export default function TaskList({ tasks: initialTasks }: TaskListProps) {
  const [tasks, setTasks] = useState(initialTasks);

  const toggleTask = (id: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  // 優先度順、未完了優先でソート
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    const priorityOrder = { 高: 0, 中: 1, 低: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">今日のタスク</h2>
        <Link
          href="/tasks"
          className="text-xs text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1"
        >
          すべて見る
          <span>→</span>
        </Link>
      </div>

      <div className="space-y-2 max-h-125 overflow-y-auto pr-1 custom-scrollbar">
        {sortedTasks.map((task) => (
          <div
            key={task.id}
            className={`flex items-start gap-2.5 p-2.5 rounded-lg border transition-all ${
              task.completed
                ? 'bg-gray-50 border-gray-200'
                : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'
            }`}
          >
            <button
              onClick={() => toggleTask(task.id)}
              className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                task.completed
                  ? 'bg-blue-500 border-blue-500'
                  : 'border-gray-300 hover:border-blue-400'
              }`}
            >
              {task.completed && (
                <span className="text-white text-[10px]">✓</span>
              )}
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <span
                  className={`text-sm ${
                    task.completed
                      ? 'line-through text-gray-400'
                      : 'text-gray-900'
                  }`}
                >
                  {task.content}
                </span>
                <span
                  className={`flex-shrink-0 px-1.5 py-0.5 rounded-full text-[10px] font-medium border ${getPriorityColor(task.priority)}`}
                >
                  {getPriorityBadge(task.priority)} {task.priority}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
