'use client';

import { TaskDashboard } from '../../types';
import { formatMinutesToHours } from '../utils/taskUtils';

interface TaskDashboardProps {
  dashboard: TaskDashboard;
}

export default function TaskDashboardComponent({
  dashboard,
}: TaskDashboardProps) {
  const { statistics, insights, categoryAccuracies } = dashboard;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <span>📊</span>
        <span>ダッシュボード</span>
      </h2>

      {/* 今週の統計 */}
      <div className="mb-8">
        <h3 className="text-sm font-medium text-gray-700 mb-4">今週の統計</h3>
        <div className="grid grid-cols-2 gap-4">
          {/* 完了率カード */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-blue-700">完了率</span>
              <span
                className={`text-xs px-2 py-1 rounded ${
                  statistics.weekOverWeekChange >= 0
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {statistics.weekOverWeekChange >= 0 ? '↑' : '↓'}{' '}
                {Math.abs(statistics.weekOverWeekChange)}%
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-blue-900">
                {statistics.completionRate}
              </span>
              <span className="text-sm text-blue-700">%</span>
            </div>
            <div className="text-xs text-blue-600 mt-1">
              {statistics.completedTasks}完了 / {statistics.totalTasks}全体
            </div>

            {/* ドーナツチャート簡易版 */}
            <div className="mt-4 flex items-center gap-3">
              <div className="relative w-16 h-16">
                <svg className="w-16 h-16 transform -rotate-90">
                  {/* 背景円 */}
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    fill="none"
                  />
                  {/* 完了率円弧 */}
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="#3b82f6"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${
                      (statistics.completionRate / 100) * 175.93
                    } 175.93`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-semibold text-blue-900">
                    {statistics.completionRate}%
                  </span>
                </div>
              </div>
              <div className="flex-1 text-xs space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-gray-600">
                    完了 {statistics.completedTasks}件
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-gray-600">
                    進行中 {statistics.inProgressTasks}件
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-400" />
                  <span className="text-gray-600">
                    未着手 {statistics.pendingTasks}件
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 平均完了時間カード */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
            <div className="text-sm text-purple-700 mb-2">平均完了時間</div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-purple-900">
                {Math.floor(statistics.averageCompletionMinutes / 60)}
              </span>
              <span className="text-sm text-purple-700">時間</span>
              <span className="text-xl font-semibold text-purple-900 ml-1">
                {statistics.averageCompletionMinutes % 60}
              </span>
              <span className="text-sm text-purple-700">分</span>
            </div>
            <div className="text-xs text-purple-600 mt-1">
              = {formatMinutesToHours(statistics.averageCompletionMinutes)}
            </div>
            {statistics.overdueTasks > 0 && (
              <div className="mt-3 text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                ⚠️ 遅延タスク: {statistics.overdueTasks}件
              </div>
            )}
          </div>
        </div>
      </div>

      {/* インサイト */}
      {insights.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
            <span>💡</span>
            <span>インサイト</span>
          </h3>
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  insight.severity === 'high'
                    ? 'bg-red-50 border-red-500'
                    : insight.severity === 'medium'
                      ? 'bg-orange-50 border-orange-500'
                      : 'bg-blue-50 border-blue-500'
                }`}
              >
                <div className="text-sm font-medium text-gray-900 mb-1">
                  {insight.message}
                </div>
                {insight.suggestion && (
                  <div className="text-xs text-gray-600 flex items-start gap-2">
                    <span>💬</span>
                    <span>{insight.suggestion}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* カテゴリ別精度 */}
      {categoryAccuracies.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-4">
            カテゴリ別精度
          </h3>
          <div className="space-y-3">
            {categoryAccuracies.map((acc) => (
              <div key={acc.category}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700">{acc.category}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {acc.taskCount}タスク
                    </span>
                    <span
                      className={`text-sm font-semibold ${
                        acc.accuracy >= 90 && acc.accuracy <= 110
                          ? 'text-green-600'
                          : acc.accuracy > 110
                            ? 'text-red-600'
                            : 'text-blue-600'
                      }`}
                    >
                      {acc.accuracy}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      acc.accuracy >= 90 && acc.accuracy <= 110
                        ? 'bg-green-500'
                        : acc.accuracy > 110
                          ? 'bg-red-500'
                          : 'bg-blue-500'
                    }`}
                    style={{
                      width: `${Math.min(acc.accuracy, 100)}%`,
                    }}
                  />
                </div>
                <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
                  <span>
                    見積: {formatMinutesToHours(acc.averageEstimated)}
                  </span>
                  <span>実績: {formatMinutesToHours(acc.averageActual)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
