import { TimeSlotProductivity, GoldenTime } from '../types';

interface ProductivityHeatmapProps {
  timeSlotProductivity: TimeSlotProductivity[];
  goldenTime: GoldenTime | null;
}

export default function ProductivityHeatmap({
  timeSlotProductivity,
  goldenTime,
}: ProductivityHeatmapProps) {
  const timeSlots = ['08-10', '10-12', '12-14', '14-16', '16-18', '18-20'];
  const daysOfWeek = ['月', '火', '水', '木', '金', '土', '日'];
  const dayMapping = [1, 2, 3, 4, 5, 6, 0]; // 月曜日から日曜日

  // 生産性スコアに基づいて色を取得
  const getColorFromScore = (score: number) => {
    if (score >= 90) return 'bg-red-600';
    if (score >= 80) return 'bg-red-500';
    if (score >= 70) return 'bg-red-400';
    if (score >= 60) return 'bg-red-300';
    return 'bg-red-200';
  };

  // データを時間帯×曜日のマトリックスに変換
  const getProductivityData = (timeSlot: string, dayOfWeek: number) => {
    return timeSlotProductivity.find(
      (item) => item.timeSlot === timeSlot && item.dayOfWeek === dayOfWeek
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        最も生産的な時間帯
      </h3>

      {/* ゴールデンタイム表示 */}
      {goldenTime && (
        <div className="mb-6 flex items-center gap-2 text-sm text-blue-700 bg-blue-50 p-3 rounded-lg">
          <span>💡</span>
          <span className="font-medium">{goldenTime.recommendation}</span>
        </div>
      )}

      {/* ヒートマップグリッド */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* ヘッダー（曜日） */}
          <div className="flex mb-2">
            <div className="w-20 flex-shrink-0"></div>
            {daysOfWeek.map((day, index) => (
              <div
                key={index}
                className="flex-1 text-center text-sm font-medium text-gray-700 px-1"
              >
                {day}
              </div>
            ))}
          </div>

          {/* グリッド本体 */}
          {timeSlots.map((timeSlot, rowIndex) => (
            <div key={rowIndex} className="flex mb-2">
              {/* 時間帯ラベル */}
              <div className="w-20 flex-shrink-0 text-xs text-gray-600 flex items-center">
                {timeSlot}
              </div>

              {/* セル */}
              {dayMapping.map((dayOfWeek, colIndex) => {
                const data = getProductivityData(timeSlot, dayOfWeek);
                const colorClass = data
                  ? getColorFromScore(data.productivityScore)
                  : 'bg-gray-100';

                return (
                  <div
                    key={colIndex}
                    className={`flex-1 aspect-square mx-1 rounded ${colorClass} transition-all hover:scale-105 cursor-pointer`}
                    title={
                      data
                        ? `${daysOfWeek[colIndex]} ${timeSlot}\nセッション: ${data.completedSessions}回\n完走率: ${data.completionRate}%\nスコア: ${data.productivityScore}`
                        : '活動なし'
                    }
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* カラーレジェンド */}
      <div className="mt-4 flex items-center justify-end gap-2 text-xs text-gray-600">
        <span>低</span>
        <div className="flex gap-1">
          <div className="w-4 h-4 rounded bg-red-200"></div>
          <div className="w-4 h-4 rounded bg-red-300"></div>
          <div className="w-4 h-4 rounded bg-red-400"></div>
          <div className="w-4 h-4 rounded bg-red-500"></div>
          <div className="w-4 h-4 rounded bg-red-600"></div>
        </div>
        <span>高</span>
      </div>
    </div>
  );
}
