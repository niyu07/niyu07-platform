import Link from 'next/link';
import { PomodoroData } from '../types';

interface PomodoroChartProps {
  data: PomodoroData[];
}

export default function PomodoroChart({ data }: PomodoroChartProps) {
  const maxCount = Math.max(...data.map((d) => d.count));

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold text-gray-900">今週のポモドーロ</h2>
        <Link
          href="/pomodoro"
          className="text-xs text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1"
        >
          詳細を見る
          <span>→</span>
        </Link>
      </div>
      <p className="text-xs text-gray-500 mb-4">集中時間の推移</p>

      <div className="space-y-2.5">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2.5">
            <div
              className={`w-7 text-xs font-medium ${
                item.isToday
                  ? 'text-orange-600 font-bold'
                  : item.count === 0
                    ? 'text-gray-400'
                    : 'text-gray-600'
              }`}
            >
              {item.day}
            </div>
            <div className="flex-1 relative">
              <div
                className={`h-7 rounded-lg overflow-hidden ${
                  item.isToday ? 'bg-orange-50' : 'bg-gray-100'
                }`}
              >
                {item.count > 0 && (
                  <div
                    className={`h-full rounded-lg transition-all ${
                      item.isToday ? 'bg-orange-500' : 'bg-blue-500'
                    }`}
                    style={{
                      width: `${(item.count / maxCount) * 100}%`,
                    }}
                  />
                )}
              </div>
            </div>
            <div
              className={`w-10 text-xs text-right ${
                item.isToday
                  ? 'text-orange-600 font-bold'
                  : item.count === 0
                    ? 'text-gray-400'
                    : 'text-gray-500'
              }`}
            >
              {item.count > 0 ? item.count : '-'}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="flex justify-between text-xs">
          <span className="text-gray-600">週合計</span>
          <span className="font-bold text-gray-900">
            {data.reduce((acc, item) => acc + item.count, 0)} セッション
          </span>
        </div>
      </div>
    </div>
  );
}
