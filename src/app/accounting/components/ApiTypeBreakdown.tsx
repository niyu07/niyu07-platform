'use client';

interface ApiTypeBreakdownProps {
  breakdown: Record<string, number>;
  total: number;
}

const API_TYPE_LABELS: Record<
  string,
  { name: string; icon: string; color: string }
> = {
  vision: { name: 'Vision API (OCR)', icon: '👁️', color: 'bg-blue-500' },
  calendar: { name: 'Calendar API', icon: '📅', color: 'bg-green-500' },
  tasks: { name: 'Tasks API', icon: '✓', color: 'bg-yellow-500' },
  gmail: { name: 'Gmail API', icon: '✉️', color: 'bg-red-500' },
};

export default function ApiTypeBreakdown({
  breakdown,
  total,
}: ApiTypeBreakdownProps) {
  const apiTypes = Object.keys(breakdown).filter((key) => breakdown[key] > 0);

  if (apiTypes.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          APIタイプ別使用状況
        </h2>
        <p className="text-gray-500">まだ使用していません</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        APIタイプ別使用状況
      </h2>

      <div className="space-y-4">
        {apiTypes.map((apiType) => {
          const count = breakdown[apiType];
          const percentage = total > 0 ? (count / total) * 100 : 0;
          const config = API_TYPE_LABELS[apiType] || {
            name: apiType,
            icon: '🔧',
            color: 'bg-gray-500',
          };

          return (
            <div key={apiType}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{config.icon}</span>
                  <span className="font-medium text-gray-700">
                    {config.name}
                  </span>
                </div>
                <span className="text-sm text-gray-600">
                  {count.toLocaleString()} 回
                  <span className="ml-2 font-semibold text-gray-800">
                    ({Math.round(percentage)}%)
                  </span>
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-3 rounded-full transition-all duration-300 ${config.color}`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 合計表示 */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-gray-800">合計</span>
          <span className="font-bold text-lg text-gray-900">
            {total.toLocaleString()} 回
          </span>
        </div>
      </div>
    </div>
  );
}
