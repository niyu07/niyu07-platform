import { MonthlyGoal } from '../../types';

interface MonthlyGoalsProps {
  goals: MonthlyGoal[];
  encouragementMessage?: string;
}

const categoryColors: Record<string, string> = {
  Programming: '#4F7FFF',
  Design: '#4CAF50',
  English: '#9C27B0',
  Math: '#FF9800',
  Other: '#9E9E9E',
};

export default function MonthlyGoals({
  goals,
  encouragementMessage,
}: MonthlyGoalsProps) {
  const overallPercentage =
    goals.reduce((sum, goal) => sum + goal.percentage, 0) / goals.length;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      {/* ヘッダー */}
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-900 mb-1">12月の目標</h2>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">達成率</p>
          <p className="text-2xl font-bold text-blue-600">
            {Math.round(overallPercentage)}%
          </p>
        </div>
      </div>

      {/* プログレスバー全体 */}
      <div className="w-full h-3 bg-gray-100 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all"
          style={{ width: `${Math.min(overallPercentage, 100)}%` }}
        />
      </div>

      {/* カテゴリ別目標 */}
      <div className="space-y-4">
        {goals.map((goal) => {
          const remaining = goal.target - goal.current;

          return (
            <div key={goal.category}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  {goal.category}
                </span>
                <span className="text-sm text-gray-600">
                  {goal.current} / {goal.target}h
                </span>
              </div>
              <div className="relative w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(goal.percentage, 100)}%`,
                    backgroundColor: categoryColors[goal.category],
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">あと {remaining}時間</p>
            </div>
          );
        })}
      </div>

      {/* 応援メッセージ */}
      {encouragementMessage && (
        <div className="mt-6 bg-blue-50 rounded-lg p-3 flex items-start gap-2">
          <span className="text-lg">🚀</span>
          <p className="text-sm text-blue-700 font-medium">
            {encouragementMessage}
          </p>
        </div>
      )}
    </div>
  );
}
