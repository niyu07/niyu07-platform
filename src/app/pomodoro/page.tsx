'use client';

import { useState, useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import { mockUser } from '../data/mockData';
import TimerCard from './components/TimerCard';
import SummaryCards from './components/SummaryCards';
import WeeklyActivityChart from './components/WeeklyActivityChart';
import CategoryStatsChart from './components/CategoryStatsChart';
import ProductivityHeatmap from './components/ProductivityHeatmap';
import SessionHistory from './components/SessionHistory';
import { usePomodoro } from './hooks/usePomodoro';
import { mockPomodoroSettings, mockPomodoroDashboard } from './data/mockData';

export default function PomodoroPage() {
  const [settings] = useState(mockPomodoroSettings);
  const [dashboard] = useState(mockPomodoroDashboard);

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
  } = usePomodoro(settings);

  // リアルタイムセッションとモックセッションを統合
  const allSessions = useMemo(() => {
    return [...sessions, ...dashboard.recentSessions];
  }, [sessions, dashboard.recentSessions]);

  // 今日の統計を動的に更新（実装セッションを含む）
  const todayStats = useMemo(() => {
    const completedWorkSessions = sessions.filter(
      (s) => s.mode === '作業' && s.completionStatus === '完走'
    ).length;

    const focusMinutes = sessions
      .filter((s) => s.mode === '作業' && s.completionStatus === '完走')
      .reduce((sum, s) => sum + s.durationMinutes, 0);

    return {
      ...dashboard.today,
      completedSessions:
        dashboard.today.completedSessions + completedWorkSessions,
      focusMinutes: dashboard.today.focusMinutes + focusMinutes,
      goalAchieved:
        dashboard.today.completedSessions + completedWorkSessions >=
        settings.dailyGoal,
    };
  }, [sessions, dashboard.today, settings.dailyGoal]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar user={mockUser} currentPage="ポモドーロ" />

      <div className="ml-64 p-8">
        {/* ヘッダー */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            ポモドーロタイマー
          </h1>
          <p className="text-sm text-gray-600">
            集中力を高めて、生産性を最大化しましょう
          </p>
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
              currentStreak={dashboard.currentStreak}
              isNewRecord={dashboard.isNewRecord}
            />

            {/* 今週の活動とカテゴリ別集計 */}
            <div className="grid grid-cols-2 gap-6">
              <WeeklyActivityChart weeklyActivity={dashboard.thisWeek} />
              <CategoryStatsChart categoryStats={dashboard.categoryStats} />
            </div>

            {/* 最適時間帯ヒートマップ */}
            <ProductivityHeatmap
              timeSlotProductivity={dashboard.timeSlotProductivity}
              goldenTime={dashboard.goldenTime}
            />

            {/* 履歴 */}
            <SessionHistory sessions={allSessions} />
          </div>
        </div>
      </div>
    </div>
  );
}
