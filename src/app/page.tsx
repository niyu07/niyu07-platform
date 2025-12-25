import Sidebar from './components/Sidebar';
import GreetingHeader from './components/GreetingHeader';
import SummaryCards from './components/SummaryCards';
import EventTimeline from './components/EventTimeline';
import WeatherCard from './components/WeatherCard';
import PomodoroChart from './components/PomodoroChart';
import TaskList from './components/TaskList';
import ExpenseChart from './components/ExpenseChart';
import {
  mockUser,
  mockEvents,
  mockTasks,
  mockWeather,
  mockPomodoroData,
  mockExpenseData,
  mockSummaryData,
} from './data/mockData';

export default function Home() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* サイドバー */}
      <Sidebar user={mockUser} currentPage="ホーム" />

      {/* メインコンテンツ */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* 挨拶ヘッダー */}
          <GreetingHeader
            userName={mockUser.name.split('')[0]}
            todayEvents={mockSummaryData.todayEvents}
          />

          {/* サマリーカード */}
          <SummaryCards data={mockSummaryData} />

          {/* 2カラムレイアウト */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左カラム (2/3) */}
            <div className="lg:col-span-2 space-y-6">
              {/* 今日の予定 */}
              <EventTimeline events={mockEvents} />

              {/* ポモドーロチャート */}
              <PomodoroChart data={mockPomodoroData} />

              {/* 支出グラフ */}
              <ExpenseChart data={mockExpenseData} />
            </div>

            {/* 右カラム (1/3) */}
            <div className="space-y-6">
              {/* 天気カード */}
              <WeatherCard weather={mockWeather} />

              {/* 今日のタスク */}
              <TaskList tasks={mockTasks} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
