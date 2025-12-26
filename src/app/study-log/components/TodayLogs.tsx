import { StudyLog } from '../../types';

interface TodayLogsProps {
  logs: StudyLog[];
  totalHours: number;
}

const categoryColors: Record<string, string> = {
  Programming: 'bg-blue-100 text-blue-700',
  Design: 'bg-green-100 text-green-700',
  English: 'bg-purple-100 text-purple-700',
  Math: 'bg-orange-100 text-orange-700',
  Other: 'bg-gray-100 text-gray-700',
};

const categoryIcons: Record<string, string> = {
  Programming: '💻',
  Design: '🎨',
  English: '📚',
  Math: '🔢',
  Other: '📝',
};

export default function TodayLogs({ logs, totalHours }: TodayLogsProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">今日のログ</h2>
        <p className="text-sm font-medium text-green-600">
          Total {totalHours}h
        </p>
      </div>

      {/* ログリスト */}
      <div className="space-y-3">
        {logs.map((log) => {
          const hours = Math.floor(log.durationMinutes / 60);
          const minutes = log.durationMinutes % 60;
          const durationText =
            hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

          return (
            <div
              key={log.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              {/* 時刻とカテゴリバッジ */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">
                    {categoryIcons[log.category] || '📝'}
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {log.time}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900">
                    {durationText}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      categoryColors[log.category] || categoryColors.Other
                    }`}
                  >
                    {log.category}
                  </span>
                </div>
              </div>

              {/* 学習内容 */}
              <p className="text-sm text-gray-700 mb-2">{log.content}</p>

              {/* 教材と評価 */}
              <div className="flex items-center justify-between">
                {log.material && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <span>📖</span>
                    <span>{log.material}</span>
                  </div>
                )}
                {log.rating && (
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-sm">
                        {i < (log.rating ?? 0) ? '⭐' : '☆'}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {logs.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">まだログがありません</p>
            <p className="text-xs mt-1">学習を記録してみましょう</p>
          </div>
        )}
      </div>
    </div>
  );
}
