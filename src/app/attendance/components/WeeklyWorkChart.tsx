'use client';

import { WeeklyWorkData } from '../../types';

interface WeeklyWorkChartProps {
  weeklyData: WeeklyWorkData[];
}

export default function WeeklyWorkChart({ weeklyData }: WeeklyWorkChartProps) {
  const maxMinutes = Math.max(...weeklyData.map((d) => d.workMinutes), 1);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-6">週間勤務時間</h2>

      {/* 棒グラフ */}
      <div className="relative h-64">
        <div className="absolute inset-0 flex items-end justify-between gap-2 px-4">
          {weeklyData.map((data, index) => {
            const height = (data.workMinutes / maxMinutes) * 100;
            const hours = Math.floor(data.workMinutes / 60);
            const minutes = data.workMinutes % 60;

            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full flex items-end justify-center h-48">
                  <div
                    className="w-full bg-blue-500 rounded-t-lg transition-all hover:opacity-80 cursor-pointer relative group"
                    style={{
                      height: `${height}%`,
                      minHeight: data.workMinutes > 0 ? '8px' : '0',
                    }}
                    title={`${data.dayOfWeek}: ${hours}h ${minutes}m`}
                  >
                    {data.workMinutes > 0 && (
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {hours}h {minutes}m
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-600 mt-2 font-medium">
                  {data.dayOfWeek}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 合計表示 */}
      <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          週間合計:{' '}
          <span className="font-bold text-gray-900">
            {Math.floor(
              weeklyData.reduce((sum, d) => sum + d.workMinutes, 0) / 60
            )}
            時間
          </span>
        </div>
        <div className="text-sm text-gray-600">
          平均:{' '}
          <span className="font-bold text-gray-900">
            {(
              weeklyData.reduce((sum, d) => sum + d.workMinutes, 0) /
              60 /
              7
            ).toFixed(1)}
            h/日
          </span>
        </div>
      </div>
    </div>
  );
}
