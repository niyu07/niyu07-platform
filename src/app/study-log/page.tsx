'use client';

import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import {
  mockUser,
  mockStudyLogDashboard,
  mockStudyLogSettings,
  mockHabitCompletions,
} from '../data/mockData';
import StudySummaryCards from './components/StudySummaryCards';
import StudyTimeChart from './components/StudyTimeChart';
import CategoryStats from './components/CategoryStats';
import SkillTree from './components/SkillTree';
import StudyLogForm from './components/StudyLogForm';
import TodayLogs from './components/TodayLogs';
import MonthlyGoals from './components/MonthlyGoals';
import MaterialRecommendations from './components/MaterialRecommendations';
import StudyLogSettingsModal from './components/StudyLogSettingsModal';
import HabitTracker from './components/HabitTracker';
import { StudyLogSettings, HabitCompletion } from '../types';

export default function StudyLogPage() {
  const [dashboard, setDashboard] = useState(mockStudyLogDashboard);
  const [chartView, setChartView] = useState<'週' | '月' | '年'>('週');
  const [settings, setSettings] = useState<StudyLogSettings>(
    mockStudyLogSettings
  );
  const [habitCompletions, setHabitCompletions] = useState<HabitCompletion[]>(
    mockHabitCompletions
  );
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const handleSaveSettings = (newSettings: StudyLogSettings) => {
    setSettings(newSettings);
    // TODO: 実際のAPI呼び出しでデータを保存
    console.log('Settings saved:', newSettings);

    // 目標時間が変更された場合、ダッシュボードを更新
    setDashboard({
      ...dashboard,
      today: {
        ...dashboard.today,
        goalHours: newSettings.dailyGoalHours,
        remaining: newSettings.dailyGoalHours - dashboard.today.hours,
      },
    });
  };

  const handleToggleHabit = (habitId: string, completed: boolean) => {
    const today = new Date().toISOString().split('T')[0];

    // 既存の完了記録を探す
    const existingCompletion = habitCompletions.find(
      (c) => c.habitId === habitId && c.date === today
    );

    if (existingCompletion) {
      // 既存の記録を更新
      setHabitCompletions(
        habitCompletions.map((c) =>
          c.id === existingCompletion.id
            ? { ...c, completed, updatedAt: new Date().toISOString() }
            : c
        )
      );
    } else {
      // 新しい記録を追加
      const newCompletion: HabitCompletion = {
        id: `hc-${Date.now()}`,
        habitId,
        date: today,
        completed,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setHabitCompletions([...habitCompletions, newCompletion]);
    }

    // TODO: 実際のAPI呼び出しでデータを保存
    console.log('Habit toggled:', { habitId, completed });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar user={mockUser} currentPage="学習ログ" />

      <div className="ml-64 p-8">
        {/* ヘッダー */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              学習ログ
            </h1>
            <p className="text-sm text-gray-600">
              学習記録を管理して、スキルアップを可視化しましょう
            </p>
          </div>
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-lg">⚙️</span>
            <span className="text-sm font-medium">設定</span>
          </button>
        </div>

        {/* サマリーカード */}
        <StudySummaryCards
          today={dashboard.today}
          weekly={dashboard.weekly}
          streak={dashboard.streak}
          total={dashboard.total}
        />

        {/* メインコンテンツエリア */}
        <div className="grid grid-cols-3 gap-6 mt-6">
          {/* 左カラム（2/3） */}
          <div className="col-span-2 space-y-6">
            {/* 学習時間の推移 */}
            <StudyTimeChart
              data={dashboard.weeklyData}
              view={chartView}
              onViewChange={setChartView}
            />

            {/* カテゴリ別累計とレベル */}
            <CategoryStats
              categoryTotals={dashboard.categoryTotals}
              totalHours={dashboard.total.hours}
            />

            {/* スキルツリー */}
            <SkillTree skills={dashboard.skills} />
          </div>

          {/* 右カラム（1/3） */}
          <div className="space-y-6">
            {/* 学習記録フォーム */}
            <StudyLogForm />

            {/* 習慣トラッカー */}
            <HabitTracker
              habits={settings.habits}
              completions={habitCompletions}
              onToggleHabit={handleToggleHabit}
            />

            {/* 今日のログ */}
            <TodayLogs
              logs={dashboard.todayLogs}
              totalHours={dashboard.today.hours}
            />

            {/* 月次目標 */}
            <MonthlyGoals
              goals={dashboard.monthlyGoals}
              encouragementMessage={dashboard.encouragementMessage}
            />

            {/* 教材レコメンド */}
            <MaterialRecommendations
              recommendations={dashboard.recommendations}
            />
          </div>
        </div>

        {/* 設定モーダル */}
        <StudyLogSettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          settings={settings}
          onSave={handleSaveSettings}
        />
      </div>
    </div>
  );
}
