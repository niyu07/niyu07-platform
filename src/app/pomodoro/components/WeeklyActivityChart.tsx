import { WeeklyActivity, CATEGORY_COLORS } from '../types';

interface WeeklyActivityChartProps {
  weeklyActivity: WeeklyActivity;
}

export default function WeeklyActivityChart({
  weeklyActivity,
}: WeeklyActivityChartProps) {
  const { dailyStats, totalMinutes, averageMinutesPerDay } = weeklyActivity;

  // 最大値を取得（スケーリング用）
  const maxMinutes = Math.max(...dailyStats.map((d) => d.minutes));

  // 時間表示フォーマット
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    return `${hours}時間`;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">今週の活動</h3>

      {/* バーチャート */}
      <div className="mb-6">
        <div className="flex items-end justify-between h-64 gap-3">
          {dailyStats.map((dayStat, index) => {
            const heightPercentage =
              maxMinutes > 0 ? (dayStat.minutes / maxMinutes) * 100 : 0;

            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                {/* 積み上げバー */}
                <div
                  className="w-full relative rounded-t-lg overflow-hidden"
                  style={{ height: `${heightPercentage}%` }}
                >
                  {dayStat.categoryBreakdown.map((cat, catIndex) => {
                    const catPercentage =
                      dayStat.minutes > 0
                        ? (cat.minutes / dayStat.minutes) * 100
                        : 0;

                    return (
                      <div
                        key={catIndex}
                        className="w-full"
                        style={{
                          height: `${catPercentage}%`,
                          backgroundColor: CATEGORY_COLORS[cat.category],
                        }}
                        title={`${cat.category}: ${cat.minutes}分`}
                      />
                    );
                  })}
                </div>

                {/* 曜日ラベル */}
                <div className="mt-2 text-sm font-medium text-gray-700">
                  {dayStat.day}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* サマリー */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          合計:{' '}
          <span className="font-semibold text-gray-900">
            {formatTime(totalMinutes)}
          </span>
        </div>
        <div className="text-sm text-gray-600">
          平均:{' '}
          <span className="font-semibold text-gray-900">
            {Math.round(averageMinutesPerDay / 60)}時間/日
          </span>
        </div>
      </div>
    </div>
  );
}
