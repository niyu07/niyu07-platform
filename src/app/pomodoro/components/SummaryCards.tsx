import { DailyStats, PomodoroSettings } from '../types';

interface SummaryCardsProps {
  todayStats: DailyStats;
  settings: PomodoroSettings;
  currentStreak: number;
  isNewRecord: boolean;
}

export default function SummaryCards({
  todayStats,
  settings,
  currentStreak,
  isNewRecord,
}: SummaryCardsProps) {
  const { completedSessions, focusMinutes, goalAchieved } = todayStats;
  const remaining = Math.max(0, settings.dailyGoal - completedSessions);

  // 平均セッション時間（簡易計算）
  const averageSessionMinutes =
    completedSessions > 0 ? Math.round(focusMinutes / completedSessions) : 0;

  // 時間表示フォーマット
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}時間${mins}分` : `${mins}分`;
  };

  return (
    <div className="grid grid-cols-4 gap-4">
      {/* 完了セッション */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="text-sm text-gray-600">完了セッション</div>
        </div>
        <div className="text-3xl font-bold text-gray-900">
          {completedSessions}回
        </div>
        <div className="text-xs text-gray-500 mt-1">
          目標まであと{remaining}回
        </div>
        {goalAchieved && (
          <div className="mt-3 px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full inline-block">
            今日の目標達成！
          </div>
        )}
      </div>

      {/* 集中時間 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="text-sm text-gray-600">集中時間</div>
        </div>
        <div className="text-3xl font-bold text-gray-900">
          {formatTime(focusMinutes)}
        </div>
        <div className="text-xs text-green-600 mt-1">今日の目標達成！</div>
      </div>

      {/* 平均セッション */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <div className="text-sm text-gray-600">平均セッション</div>
        </div>
        <div className="text-3xl font-bold text-gray-900">
          {averageSessionMinutes}分
        </div>
        <div className="text-xs text-gray-500 mt-1">ほぼ完走！</div>
      </div>

      {/* 連続実施 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-orange-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"
              />
            </svg>
          </div>
          <div className="text-sm text-gray-600">連続実施</div>
        </div>
        <div className="text-3xl font-bold text-gray-900">
          {currentStreak}日
        </div>
        {isNewRecord && (
          <div className="text-xs text-orange-600 mt-1">新記録！</div>
        )}
      </div>
    </div>
  );
}
