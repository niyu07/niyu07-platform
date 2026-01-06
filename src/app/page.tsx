'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Sidebar from './components/Sidebar';
import GreetingHeader from './components/GreetingHeader';
import SummaryCards from './components/SummaryCards';
import EventTimeline from './components/EventTimeline';
import WeatherCard from './components/WeatherCard';
import PomodoroChart from './components/PomodoroChart';
import TaskList from './components/TaskList';
import ExpenseChart from './components/ExpenseChart';
import HabitChecklist from './components/HabitChecklist';
import {
  Event,
  Weather,
  PomodoroData,
  ExpenseData,
  SummaryData,
  Task,
  Habit,
  HabitCompletion,
} from './types';

interface DashboardData {
  user: {
    id: string;
    name: string;
    email: string;
  };
  summaryData: SummaryData;
  todayEvents: Event[];
  todayTasks: Task[];
  weather: Weather | null;
  pomodoroData: PomodoroData[];
  expenseData: ExpenseData;
  habits?: {
    habits: Habit[];
    completions: HabitCompletion[];
  };
}

export default function Home() {
  const { status } = useSession();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      fetchDashboardData();
    }
  }, [status, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard');

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();
      setDashboardData(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">エラーが発生しました</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            再読み込み
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* サイドバー */}
      <Sidebar user={dashboardData.user} currentPage="ホーム" />

      {/* メインコンテンツ */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* 挨拶ヘッダー */}
          <GreetingHeader
            userName={dashboardData.user.name.split('')[0]}
            todayEvents={dashboardData.summaryData.todayEvents}
          />

          {/* サマリーカード */}
          <SummaryCards data={dashboardData.summaryData} />

          {/* 2カラムレイアウト */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左カラム (2/3) */}
            <div className="lg:col-span-2 space-y-6">
              {/* 今日の予定 */}
              <EventTimeline events={dashboardData.todayEvents} />

              {/* ポモドーロチャート */}
              <PomodoroChart data={dashboardData.pomodoroData} />

              {/* 支出グラフ */}
              <ExpenseChart data={dashboardData.expenseData} />
            </div>

            {/* 右カラム (1/3) */}
            <div className="space-y-6">
              {/* 天気カード */}
              {dashboardData.weather && (
                <WeatherCard weather={dashboardData.weather} />
              )}

              {/* 習慣チェックリスト */}
              {dashboardData.habits && (
                <HabitChecklist
                  habits={dashboardData.habits.habits}
                  completions={dashboardData.habits.completions}
                />
              )}

              {/* 今日のタスク */}
              <TaskList tasks={dashboardData.todayTasks} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
