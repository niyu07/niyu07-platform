'use client';

import { Task } from '../../types';
import { useState } from 'react';
import { getDueDateUrgency, getDueDateLabel } from '../utils/taskUtils';

interface CalendarViewProps {
  tasks: Task[];
  onEdit?: (task: Task) => void;
  onDateClick?: (date: string) => void;
}

export default function CalendarView({
  tasks,
  onEdit,
  onDateClick,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 11, 1)); // 2025年12月

  // カレンダーの日付を生成
  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const calendar: Date[] = [];
    const current = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      calendar.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return calendar;
  };

  // 日付をYYYY/MM/DD形式に変換
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  };

  // 特定の日付のタスクを取得
  const getTasksForDate = (date: Date): Task[] => {
    const dateStr = formatDate(date);
    return tasks.filter((task) => task.dueDate === dateStr);
  };

  // 前月へ
  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  // 次月へ
  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  // 今日へ
  const goToToday = () => {
    setCurrentDate(new Date(2025, 11, 26)); // 2025/12/26（今日の設定）
  };

  const calendar = generateCalendar();
  const today = new Date(2025, 11, 26); // 2025/12/26
  const todayStr = formatDate(today);

  // 今後の締め切りタスクを取得（期限順にソート）
  const upcomingTasks = tasks
    .filter((task) => task.dueDate && task.status !== '完了')
    .sort((a, b) => {
      if (!a.dueDate || !b.dueDate) return 0;
      return a.dueDate.localeCompare(b.dueDate);
    })
    .slice(0, 10);

  return (
    <div className="flex gap-6">
      {/* カレンダー本体 */}
      <div className="flex-1 bg-white rounded-xl border border-gray-200 p-6">
      {/* カレンダーヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          📅 {currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
          >
            今日
          </button>
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-gray-100 rounded"
          >
            ◀
          </button>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded">
            ▶
          </button>
        </div>
      </div>

      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['日', '月', '火', '水', '木', '金', '土'].map((day, idx) => (
          <div
            key={day}
            className={`text-center text-sm font-semibold py-2 ${
              idx === 0
                ? 'text-red-600'
                : idx === 6
                  ? 'text-blue-600'
                  : 'text-gray-700'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* カレンダーグリッド */}
      <div className="grid grid-cols-7 gap-2">
        {calendar.map((date, idx) => {
          const dateStr = formatDate(date);
          const dayTasks = getTasksForDate(date);
          const isCurrentMonth = date.getMonth() === currentDate.getMonth();
          const isToday = dateStr === todayStr;

          return (
            <div
              key={idx}
              onClick={() => onDateClick && onDateClick(dateStr)}
              className={`min-h-24 border rounded-lg p-2 cursor-pointer transition-all ${
                isToday
                  ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-200'
                  : isCurrentMonth
                    ? 'bg-white border-gray-200 hover:bg-gray-50'
                    : 'bg-gray-50 border-gray-100'
              }`}
            >
              {/* 日付 */}
              <div
                className={`text-sm font-medium mb-1 ${
                  isToday
                    ? 'text-blue-600'
                    : isCurrentMonth
                      ? date.getDay() === 0
                        ? 'text-red-600'
                        : date.getDay() === 6
                          ? 'text-blue-600'
                          : 'text-gray-900'
                      : 'text-gray-400'
                }`}
              >
                {date.getDate()}
              </div>

              {/* タスク一覧 */}
              <div className="space-y-1">
                {dayTasks.slice(0, 3).map((task) => {
                  const urgency = getDueDateUrgency(task.dueDate);
                  const handleTaskClick = (e: React.MouseEvent) => {
                    e.stopPropagation();
                    onEdit?.(task);
                  };
                  return (
                    <div
                      key={task.id}
                      onClick={handleTaskClick}
                      className={`text-xs px-2 py-1 rounded truncate cursor-pointer ${
                        urgency === 'overdue' || urgency === 'today'
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : task.status === '完了'
                            ? 'bg-green-100 text-green-700 hover:bg-green-200 line-through'
                            : task.priority === '高'
                              ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      title={task.title}
                    >
                      {task.status === '完了' && '✓ '}
                      {task.title}
                    </div>
                  );
                })}
                {dayTasks.length > 3 && (
                  <div className="text-xs text-gray-500 px-2">
                    +{dayTasks.length - 3}件
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 凡例 */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-100 rounded" />
            <span>期限当日/遅延</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-100 rounded" />
            <span>高優先度</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-100 rounded" />
            <span>完了</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-50 ring-2 ring-blue-200 rounded" />
            <span>今日</span>
          </div>
        </div>
      </div>
      </div>

      {/* 締め切りリストサイドバー */}
      <div className="w-80 bg-white rounded-xl border border-gray-200 p-6 shrink-0">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          今後の締め切り
        </h3>

        {upcomingTasks.length === 0 ? (
          <div className="text-sm text-gray-500 text-center py-8 bg-gray-50 rounded-lg">
            締め切りのあるタスクがありません
          </div>
        ) : (
          <div className="space-y-3 max-h-[calc(100vh-240px)] overflow-y-auto">
            {upcomingTasks.map((task) => {
              const urgency = getDueDateUrgency(task.dueDate);
              const label = getDueDateLabel(task.dueDate);
              const bgColor =
                urgency === 'overdue' || urgency === 'today'
                  ? 'bg-red-50 border-red-300'
                  : urgency === 'soon'
                    ? 'bg-orange-50 border-orange-300'
                    : 'bg-white border-gray-200';
              const textColor =
                urgency === 'overdue' || urgency === 'today'
                  ? 'text-red-700'
                  : urgency === 'soon'
                    ? 'text-orange-700'
                    : 'text-gray-700';
              const badgeBgColor =
                urgency === 'overdue' || urgency === 'today'
                  ? 'bg-red-100'
                  : urgency === 'soon'
                    ? 'bg-orange-100'
                    : 'bg-gray-100';

              return (
                <div
                  key={task.id}
                  onClick={() => onEdit?.(task)}
                  className={`${bgColor} border-l-4 rounded-lg p-3 cursor-pointer hover:shadow-md transition-all`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className={`text-sm font-bold ${textColor}`}>
                        {task.title}
                      </div>
                      {task.description && (
                        <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {task.description}
                        </div>
                      )}
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-semibold ${badgeBgColor} ${textColor} ml-2 shrink-0`}
                    >
                      {label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{task.dueDate}</span>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded ${
                        task.priority === '高'
                          ? 'bg-red-100 text-red-700'
                          : task.priority === '中'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-gray-100 text-gray-700'
                      }`}>
                        {task.priority}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded ${
                          task.status === '未着手'
                            ? 'bg-gray-100 text-gray-700'
                            : task.status === '進行中'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {task.status}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
