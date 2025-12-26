'use client';

import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { mockUser, mockStudyLogDashboard } from '../data/mockData';
import StudySummaryCards from './components/StudySummaryCards';
import StudyTimeChart from './components/StudyTimeChart';
import CategoryStats from './components/CategoryStats';
import SkillTree from './components/SkillTree';
import StudyLogForm from './components/StudyLogForm';
import TodayLogs from './components/TodayLogs';
import MonthlyGoals from './components/MonthlyGoals';
import MaterialRecommendations from './components/MaterialRecommendations';

export default function StudyLogPage() {
  const [dashboard] = useState(mockStudyLogDashboard);
  const [chartView, setChartView] = useState<'週' | '月' | '年'>('週');

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar user={mockUser} currentPage="学習ログ" />

      <div className="ml-64 p-8">
        {/* ヘッダー */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">学習ログ</h1>
          <p className="text-sm text-gray-600">
            学習記録を管理して、スキルアップを可視化しましょう
          </p>
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
      </div>
    </div>
  );
}
