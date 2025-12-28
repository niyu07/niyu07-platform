'use client';

import { useState, useMemo, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Sidebar from '../components/Sidebar';
import TimerCard from './components/TimerCard';
import SummaryCards from './components/SummaryCards';
import WeeklyActivityChart from './components/WeeklyActivityChart';
import CategoryStatsChart from './components/CategoryStatsChart';
import ProductivityHeatmap from './components/ProductivityHeatmap';
import SessionHistory from './components/SessionHistory';
import { usePomodoro } from './hooks/usePomodoro';
import {
  usePomodoroData,
  usePomodoroStats,
  usePomodoroHeatmap,
} from './hooks/usePomodoroData';
import SettingsModal from './components/SettingsModal';
import { PomodoroSettings, DEFAULT_POMODORO_SETTINGS } from './types';

function PomodoroContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [settings, setSettings] = useState<PomodoroSettings>(
    DEFAULT_POMODORO_SETTINGS
  );
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // ログインユーザーのIDを取得（フォールバックとして 'user-1' を使用）
  const userId = session?.user?.id || 'user-1';

  // タスクからの遷移時にタスク情報を取得（useMemoを使用してレンダリング時に計算）
  const taskInfo = useMemo(() => {
    const taskId = searchParams.get('taskId');
    const taskTitle = searchParams.get('taskTitle');
    if (taskId && taskTitle) {
      return { taskId, taskTitle };
    }
    return null;
  }, [searchParams]);

  // DBからセッション履歴と統計データを取得（ログインユーザーIDを使用）
  const { sessions: dbSessions, refresh: refreshSessions } =
    usePomodoroData(userId);
  const { stats: todayStatsFromDB, refresh: refreshTodayStats } =
    usePomodoroStats(userId, 'today');
  const { stats: weekStatsFromDB, refresh: refreshWeekStats } =
    usePomodoroStats(userId, 'week');
  const { heatmapData, refresh: refreshHeatmap } = usePomodoroHeatmap(
    userId,
    4
  );

  // セッション完了時のコールバック（統計を再取得）
  const handleSessionComplete = useCallback(() => {
    console.log('📊 統計データを再取得中...');
    refreshSessions();
    refreshTodayStats();
    refreshWeekStats();
    refreshHeatmap();
  }, [refreshSessions, refreshTodayStats, refreshWeekStats, refreshHeatmap]);

  const {
    timerState,
    sessions,
    timerDirection,
    start,
    pause,
    reset,
    skip,
    changeMode,
    changeCategory,
    toggleTimerDirection,
    getFormattedTime,
  } = usePomodoro(settings, handleSessionComplete, userId);

  // リアルタイムセッション、DBセッションを統合
  const allSessions = useMemo(() => {
    return [...sessions, ...dbSessions];
  }, [sessions, dbSessions]);

  // 今日の統計を動的に更新（DBとリアルタイムセッションを統合）
  const todayStats = useMemo(() => {
    const completedWorkSessions = sessions.filter(
      (s) => s.mode === '作業' && s.completionStatus === '完走'
    ).length;

    const focusMinutes = sessions
      .filter((s) => s.mode === '作業' && s.completionStatus === '完走')
      .reduce((sum, s) => sum + s.durationMinutes, 0);

    const dbCompletedSessions = todayStatsFromDB?.focusSessions || 0;
    const dbFocusMinutes = todayStatsFromDB?.totalFocusTime || 0;

    const today = new Date();
    const dateString = today.toISOString().split('T')[0];

    return {
      date: dateString,
      completedSessions: dbCompletedSessions + completedWorkSessions,
      focusMinutes: dbFocusMinutes + focusMinutes,
      categoryBreakdown: [],
      goalAchieved:
        dbCompletedSessions + completedWorkSessions >= settings.dailyGoal,
    };
  }, [sessions, todayStatsFromDB, settings.dailyGoal]);

  // 週次データを構築（DBデータを使用）
  const weeklyActivity = useMemo(() => {
    if (weekStatsFromDB?.dailyStats) {
      const totalMinutes = weekStatsFromDB.dailyStats.reduce(
        (sum: number, day: { minutes: number }) => sum + day.minutes,
        0
      );
      return {
        weekStart: weekStatsFromDB.dailyStats[0]?.date || '',
        weekEnd: weekStatsFromDB.dailyStats[6]?.date || '',
        totalMinutes,
        dailyStats: weekStatsFromDB.dailyStats.map((day) => ({
          day: day.day,
          minutes: day.minutes,
          categoryBreakdown: day.categoryBreakdown.map((cat) => ({
            category: cat.category as import('./types').PomodoroCategory,
            minutes: cat.minutes,
          })),
        })),
        averageMinutesPerDay: totalMinutes / 7,
      };
    }

    // デフォルト値（データがない場合）
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    return {
      weekStart: weekStart.toISOString().split('T')[0],
      weekEnd: weekEnd.toISOString().split('T')[0],
      totalMinutes: 0,
      dailyStats: ['日', '月', '火', '水', '木', '金', '土'].map((day) => ({
        day,
        minutes: 0,
        categoryBreakdown: [],
      })),
      averageMinutesPerDay: 0,
    };
  }, [weekStatsFromDB]);

  // カテゴリ別統計を構築（DBデータを使用）
  const categoryStats = useMemo(() => {
    if (weekStatsFromDB?.categoryStats) {
      const CATEGORY_COLORS: Record<string, string> = {
        Design: '#3B82F6',
        Coding: '#8B5CF6',
        Study: '#F59E0B',
        Meeting: '#10B981',
        Other: '#6B7280',
      };

      return weekStatsFromDB.categoryStats.map(
        (stat: {
          category: string;
          totalMinutes: number;
          percentage: number;
          sessionCount: number;
        }) => ({
          category: stat.category as import('./types').PomodoroCategory,
          totalMinutes: stat.totalMinutes,
          percentage: stat.percentage,
          sessionCount: stat.sessionCount,
          color: CATEGORY_COLORS[stat.category] || CATEGORY_COLORS.Other,
        })
      );
    }
    return [];
  }, [weekStatsFromDB]);

  // ストリークデータを使用
  const currentStreak = weekStatsFromDB?.streak?.current || 0;
  const longestStreak = weekStatsFromDB?.streak?.longest || 0;
  const isNewRecord = currentStreak === longestStreak && currentStreak > 0;

  const handleSaveSettings = (newSettings: PomodoroSettings) => {
    setSettings(newSettings);
    // TODO: データベースに設定を保存
    console.log('設定を保存しました:', newSettings);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        user={{
          id: userId,
          name: session?.user?.name || 'ユーザー',
          email: session?.user?.email || '',
          avatar: session?.user?.image || undefined,
        }}
        currentPage="ポモドーロ"
      />

      <div className="ml-64 p-8">
        {/* ヘッダー */}
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              ポモドーロタイマー
            </h1>
            <p className="text-sm text-gray-600">
              集中力を高めて、生産性を最大化しましょう
            </p>
            {taskInfo && (
              <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-900">
                  <span className="font-semibold">タスク:</span>{' '}
                  {taskInfo.taskTitle}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                clipRule="evenodd"
              />
            </svg>
            設定
          </button>
        </div>

        {/* メインコンテンツエリア */}
        <div className="grid grid-cols-3 gap-6">
          {/* 左カラム: タイマー */}
          <div className="col-span-1">
            <TimerCard
              timerState={timerState}
              formattedTime={getFormattedTime()}
              timerDirection={timerDirection}
              onStart={start}
              onPause={pause}
              onReset={reset}
              onSkip={skip}
              onModeChange={changeMode}
              onCategoryChange={changeCategory}
              onToggleTimerDirection={toggleTimerDirection}
            />
          </div>

          {/* 右カラム: 統計とチャート */}
          <div className="col-span-2 space-y-6">
            {/* サマリーカード */}
            <SummaryCards
              todayStats={todayStats}
              settings={settings}
              currentStreak={currentStreak}
              isNewRecord={isNewRecord}
            />

            {/* 今週の活動とカテゴリ別集計 */}
            <div className="grid grid-cols-2 gap-6">
              <WeeklyActivityChart weeklyActivity={weeklyActivity} />
              <CategoryStatsChart categoryStats={categoryStats} />
            </div>

            {/* 最適時間帯ヒートマップ */}
            <ProductivityHeatmap
              timeSlotProductivity={heatmapData?.timeSlotProductivity || []}
              goldenTime={
                heatmapData?.goldenTime || {
                  timeSlot: '設定なし',
                  averageProductivityScore: 0,
                  recommendation: 'データが不足しています',
                }
              }
            />

            {/* 履歴 */}
            <SessionHistory sessions={allSessions} />
          </div>
        </div>
      </div>

      {/* 設定モーダル */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />
    </div>
  );
}

export default function PomodoroPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          読み込み中...
        </div>
      }
    >
      <PomodoroContent />
    </Suspense>
  );
}
