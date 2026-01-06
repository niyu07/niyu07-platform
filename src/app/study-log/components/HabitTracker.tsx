'use client';

import { useState } from 'react';
import { Habit, HabitCompletion } from '@/app/types';

interface HabitTrackerProps {
  habits: Habit[];
  completions: HabitCompletion[];
  onToggleHabit: (habitId: string, completed: boolean) => void;
}

export default function HabitTracker({
  habits,
  completions,
  onToggleHabit,
}: HabitTrackerProps) {
  const today = new Date();
  const todayDayOfWeek = today.getDay(); // 0: 日曜日 - 6: 土曜日
  const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD

  // 今日のアクティブな習慣のみをフィルタリング
  const todayHabits = habits.filter(
    (habit) => habit.isActive && habit.targetDays.includes(todayDayOfWeek)
  );

  // 今日の完了状況を取得
  const getTodayCompletion = (habitId: string) => {
    return completions.find(
      (c) => c.habitId === habitId && c.date === todayStr
    );
  };

  const handleToggle = (habitId: string) => {
    const completion = getTodayCompletion(habitId);
    onToggleHabit(habitId, !completion?.completed);
  };

  if (todayHabits.length === 0) {
    return null;
  }

  const completedCount = todayHabits.filter(
    (habit) => getTodayCompletion(habit.id)?.completed
  ).length;
  const percentage = Math.round((completedCount / todayHabits.length) * 100);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">✓</span>
          <h2 className="text-lg font-bold text-gray-900">今日の習慣</h2>
        </div>
        <div className="text-sm text-gray-600">
          {completedCount}/{todayHabits.length}
        </div>
      </div>

      {/* 進捗バー */}
      <div className="mb-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1 text-right">{percentage}%</p>
      </div>

      {/* 習慣リスト */}
      <div className="space-y-3">
        {todayHabits.map((habit) => {
          const completion = getTodayCompletion(habit.id);
          const isCompleted = completion?.completed || false;

          return (
            <div
              key={habit.id}
              className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                isCompleted
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <button
                onClick={() => handleToggle(habit.id)}
                className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  isCompleted
                    ? 'bg-blue-500 border-blue-500'
                    : 'bg-white border-gray-300 hover:border-blue-400'
                }`}
              >
                {isCompleted && (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M5 13l4 4L19 7"></path>
                  </svg>
                )}
              </button>

              <div className="flex-1 min-w-0">
                <h3
                  className={`text-sm font-medium transition-colors ${
                    isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'
                  }`}
                >
                  {habit.title}
                </h3>
                {habit.description && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {habit.description}
                  </p>
                )}
                {habit.category && (
                  <span className="inline-block mt-1 px-2 py-0.5 text-xs text-blue-600 bg-blue-100 rounded">
                    {habit.category}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {completedCount === todayHabits.length && todayHabits.length > 0 && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700 text-center font-medium">
            🎉 今日の習慣をすべて完了しました！
          </p>
        </div>
      )}
    </div>
  );
}
