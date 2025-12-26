import { CategoryStats } from '../types';

interface CategoryStatsChartProps {
  categoryStats: CategoryStats[];
}

export default function CategoryStatsChart({
  categoryStats,
}: CategoryStatsChartProps) {
  // 合計時間を計算
  const totalMinutes = categoryStats.reduce(
    (sum, cat) => sum + cat.totalMinutes,
    0
  );
  const totalHours = Math.round(totalMinutes / 60);

  // 簡易ドーナツチャート用に円周に基づいて各セグメントの角度を計算
  // 各カテゴリの開始角度を事前に計算
  const segmentsWithAngles = categoryStats.map((cat, index) => {
    const startPercentage = categoryStats
      .slice(0, index)
      .reduce((sum, c) => sum + c.percentage, 0);
    return {
      ...cat,
      startAngle: (startPercentage / 100) * 360,
      endAngle: ((startPercentage + cat.percentage) / 100) * 360,
    };
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        カテゴリ別集計
      </h3>

      <div className="flex items-center gap-8">
        {/* ドーナツチャート */}
        <div className="relative w-48 h-48 flex-shrink-0">
          {/* SVG ドーナツチャート */}
          <svg viewBox="0 0 100 100" className="transform -rotate-90">
            {segmentsWithAngles.map((cat, index) => {
              const { startAngle, endAngle } = cat;

              // 円弧のパス計算
              const radius = 35;
              const innerRadius = 25;
              const centerX = 50;
              const centerY = 50;

              const startRad = (startAngle * Math.PI) / 180;
              const endRad = (endAngle * Math.PI) / 180;

              const x1 = centerX + radius * Math.cos(startRad);
              const y1 = centerY + radius * Math.sin(startRad);
              const x2 = centerX + radius * Math.cos(endRad);
              const y2 = centerY + radius * Math.sin(endRad);
              const x3 = centerX + innerRadius * Math.cos(endRad);
              const y3 = centerY + innerRadius * Math.sin(endRad);
              const x4 = centerX + innerRadius * Math.cos(startRad);
              const y4 = centerY + innerRadius * Math.sin(startRad);

              const largeArc = cat.percentage > 50 ? 1 : 0;

              const pathData = [
                `M ${x1} ${y1}`,
                `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
                `L ${x3} ${y3}`,
                `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}`,
                'Z',
              ].join(' ');

              return (
                <path
                  key={index}
                  d={pathData}
                  fill={cat.color}
                  className="transition-opacity hover:opacity-80"
                />
              );
            })}
          </svg>

          {/* 中央のテキスト */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold text-gray-900">
              {totalHours}h
            </div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
        </div>

        {/* 凡例 */}
        <div className="flex-1 space-y-3">
          {categoryStats.map((cat, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-sm text-gray-700">{cat.category}</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {cat.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
