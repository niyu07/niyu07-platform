import { PomodoroSession, CATEGORY_COLORS } from '../types';

interface SessionHistoryProps {
  sessions: PomodoroSession[];
}

export default function SessionHistory({ sessions }: SessionHistoryProps) {
  // 時間フォーマット（HH:MM）
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // モード表示ラベル
  const getModeLabel = (mode: string, completionStatus: string) => {
    if (mode === '休憩') return '休憩';
    if (mode === '長休憩') return '長休憩';
    return completionStatus === '完走' ? '作業' : '作業（中断）';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">履歴</h3>

      <div className="space-y-3">
        {sessions.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            まだセッションがありません
          </div>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {/* カテゴリカラーインジケーター */}
              <div
                className="w-2 h-12 rounded-full"
                style={{
                  backgroundColor:
                    session.mode === '休憩' || session.mode === '長休憩'
                      ? '#6B7280'
                      : CATEGORY_COLORS[session.category],
                }}
              />

              {/* 時間範囲 */}
              <div className="flex-shrink-0">
                <div className="text-sm font-medium text-gray-900">
                  {formatTime(session.startTime)} -{' '}
                  {formatTime(session.endTime)}
                </div>
              </div>

              {/* カテゴリとモード */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900">
                  {session.mode === '休憩' || session.mode === '長休憩'
                    ? getModeLabel(session.mode, session.completionStatus)
                    : session.category}
                </div>
              </div>

              {/* 時間とステータス */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <span
                  className={`text-sm font-semibold ${
                    session.completionStatus === '完走'
                      ? 'text-green-600'
                      : 'text-orange-600'
                  }`}
                >
                  {session.durationMinutes}分
                </span>
                <span className="text-xs text-gray-500">
                  {getModeLabel(session.mode, session.completionStatus)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
