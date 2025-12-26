import { StudyTimeData } from '../../types';

interface StudyTimeChartProps {
  data: StudyTimeData[];
  view: '週' | '月' | '年';
  onViewChange: (view: '週' | '月' | '年') => void;
}

export default function StudyTimeChart({
  data,
  view,
  onViewChange,
}: StudyTimeChartProps) {
  const maxHours = Math.max(...data.map((d) => d.hours), 8);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900">学習時間の推移</h2>
        <div className="flex gap-2">
          {(['週', '月', '年'] as const).map((v) => (
            <button
              key={v}
              onClick={() => onViewChange(v)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                view === v
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* チャート */}
      <div className="relative" style={{ height: '300px' }}>
        {/* Y軸ラベル */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500 pr-2">
          <span>{maxHours}h</span>
          <span>{(maxHours * 3) / 4}h</span>
          <span>{maxHours / 2}h</span>
          <span>{maxHours / 4}h</span>
          <span>0h</span>
        </div>

        {/* チャートエリア */}
        <div className="ml-12 h-full flex items-end gap-4">
          {data.map((item, index) => {
            const barHeight = (item.hours / maxHours) * 100;
            const avgY = ((maxHours - item.average) / maxHours) * 100;

            return (
              <div key={index} className="flex-1 relative h-full">
                {/* グリッドライン */}
                <div className="absolute inset-x-0 bottom-0 h-full border-l border-gray-100" />

                {/* 平均線のポイント */}
                <div
                  className="absolute left-1/2 transform -translate-x-1/2 w-2 h-2 bg-orange-500 rounded-full z-10"
                  style={{ bottom: `${100 - avgY}%` }}
                />

                {/* バー */}
                <div className="absolute inset-x-0 bottom-0 flex justify-center">
                  <div
                    className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all hover:from-blue-600 hover:to-blue-500 cursor-pointer relative group"
                    style={{ height: `${barHeight}%` }}
                  >
                    {/* ツールチップ */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block">
                      <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                        {item.hours}h
                      </div>
                    </div>
                  </div>
                </div>

                {/* X軸ラベル */}
                <div className="absolute -bottom-6 left-0 right-0 text-center text-xs text-gray-500">
                  {item.date}
                </div>
              </div>
            );
          })}
        </div>

        {/* 平均線 */}
        <svg
          className="absolute ml-12 pointer-events-none"
          style={{
            top: 0,
            left: 0,
            width: 'calc(100% - 3rem)',
            height: '100%',
          }}
        >
          <polyline
            points={data
              .map((item, i) => {
                const x = ((i + 0.5) / data.length) * 100;
                const y = ((maxHours - item.average) / maxHours) * 100;
                return `${x}%,${y}%`;
              })
              .join(' ')}
            fill="none"
            stroke="#F97316"
            strokeWidth="2"
            strokeDasharray="4 4"
          />
        </svg>
      </div>

      {/* 凡例 */}
      <div className="flex items-center justify-center gap-6 mt-8 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded" />
          <span className="text-gray-600">学習時間</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-orange-500 border-dashed border-orange-500" />
          <span className="text-gray-600">平均</span>
        </div>
      </div>

      {/* 合計表示 */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">合計学習時間</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">
          {data.reduce((sum, d) => sum + d.hours, 0).toFixed(1)}h
        </p>
      </div>
    </div>
  );
}
