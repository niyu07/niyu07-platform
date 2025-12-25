import { SummaryData } from '../types';

interface SummaryCardsProps {
  data: SummaryData;
}

export default function SummaryCards({ data }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {/* 今日のタスク */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">✓</span>
          <h3 className="text-xs font-medium text-gray-600">今日のタスク</h3>
        </div>
        <div className="flex items-end gap-1 mb-2">
          <span className="text-2xl font-bold text-gray-900">
            {data.todayTasks.completed}
          </span>
          <span className="text-sm text-gray-400 mb-0.5">
            / {data.todayTasks.total}
          </span>
        </div>
        <div className="relative w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-blue-500 rounded-full transition-all"
            style={{ width: `${data.todayTasks.percentage}%` }}
          />
        </div>
        <div className="mt-1.5 text-right text-xs font-medium text-blue-500">
          {data.todayTasks.percentage}%
        </div>
      </div>

      {/* 今週の収入 */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">💵</span>
          <h3 className="text-xs font-medium text-gray-600">今週の収入</h3>
        </div>
        <div className="mb-2">
          <div className="text-2xl font-bold text-green-600">
            ¥{data.weeklyIncome.amount.toLocaleString()}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500">📈 先週比</span>
          <span className="text-xs font-bold text-green-600">
            +{data.weeklyIncome.change}%
          </span>
        </div>
      </div>

      {/* 今日の学習 */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">📚</span>
          <h3 className="text-xs font-medium text-gray-600">今日の学習</h3>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {data.todayStudy.goal}時間
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              残り {data.todayStudy.remaining}h
            </div>
          </div>
          <div className="relative w-14 h-14">
            <svg className="transform -rotate-90" width="56" height="56">
              <circle
                cx="28"
                cy="28"
                r="24"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="4"
              />
              <circle
                cx="28"
                cy="28"
                r="24"
                fill="none"
                stroke="#8b5cf6"
                strokeWidth="4"
                strokeDasharray={`${data.todayStudy.percentage * 1.51} 151`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-purple-600">
                {data.todayStudy.percentage}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 扶養まで */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">⚠️</span>
          <h3 className="text-xs font-medium text-gray-600">扶養まで</h3>
        </div>
        <div className="mb-1.5">
          <div className="text-2xl font-bold text-orange-600">
            ¥{(data.dependentLimit.remaining / 1000).toFixed(0)}k
          </div>
        </div>
        <div className="text-xs text-orange-500 font-medium">注意が必要</div>
        <div className="text-xs text-gray-500 mt-0.5">残り収入可能額</div>
      </div>
    </div>
  );
}
