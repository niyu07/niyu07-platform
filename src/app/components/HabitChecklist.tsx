'use client';

import { useState } from 'react';
import { Habit, HabitCompletion } from '../types';
import Link from 'next/link';

interface HabitChecklistProps {
  habits: Habit[];
  completions: HabitCompletion[];
}

export default function HabitChecklist({
  habits: initialHabits,
  completions: initialCompletions,
}: HabitChecklistProps) {
  const [completions, setCompletions] =
    useState<HabitCompletion[]>(initialCompletions);

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // 今日の完了状況を取得
  const getTodayCompletion = (habitId: string) => {
    return completions.find(
      (c) => c.habitId === habitId && c.date === todayStr
    );
  };

  const handleToggle = async (habitId: string) => {
    const completion = getTodayCompletion(habitId);
    const newCompletedState = !completion?.completed;

    // 楽観的更新
    if (completion) {
      setCompletions(
        completions.map((c) =>
          c.id === completion.id ? { ...c, completed: newCompletedState } : c
        )
      );
    } else {
      // イベントハンドラー内でDate.now()を呼ぶため、純粋性の問題を回避
      const timestamp = Date.now();
      const now = new Date().toISOString();
      const newCompletion: HabitCompletion = {
        id: `hc-${timestamp}`,
        habitId,
        date: todayStr,
        completed: newCompletedState,
        createdAt: now,
        updatedAt: now,
      };
      setCompletions([...completions, newCompletion]);
    }

    // TODO: API呼び出しで実際のデータを保存
    console.log('Habit toggled:', { habitId, completed: newCompletedState });
  };

  if (initialHabits.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">✓</span>
            <h2 className="text-lg font-bold text-gray-900">今日の習慣</h2>
          </div>
        </div>
        <div className="text-center py-8">
          <p className="text-sm text-gray-500 mb-3">
            今日の習慣はまだありません
          </p>
          <Link
            href="/study-log"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            学習ログで習慣を設定する →
          </Link>
        </div>
      </div>
    );
  }

  const completedCount = initialHabits.filter(
    (habit) => getTodayCompletion(habit.id)?.completed
  ).length;
  const percentage = Math.round((completedCount / initialHabits.length) * 100);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">✓</span>
          <h2 className="text-lg font-bold text-gray-900">今日の習慣</h2>
        </div>
        <div className="text-sm text-gray-600">
          {completedCount}/{initialHabits.length}
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
      <div className="space-y-2">
        {initialHabits.map((habit) => {
          const completion = getTodayCompletion(habit.id);
          const isCompleted = completion?.completed || false;

          return (
            <div
              key={habit.id}
              className={`flex items-center gap-3 p-2.5 rounded-lg border transition-colors ${
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
              </div>
            </div>
          );
        })}
      </div>

      {completedCount === initialHabits.length && initialHabits.length > 0 && (
        <div className="mt-3 p-2.5 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-xs text-green-700 text-center font-medium">
            🎉 今日の習慣をすべて完了！
          </p>
        </div>
      )}

      {/* フッター */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <Link
          href="/study-log"
          className="text-xs text-blue-600 hover:text-blue-700 font-medium block text-center"
        >
          学習ログで詳細を見る →
        </Link>
      </div>
    </div>
  );
}
