import { CategoryTotal } from '../../types';

interface CategoryStatsProps {
  categoryTotals: CategoryTotal[];
  totalHours: number;
}

export default function CategoryStats({
  categoryTotals,
  totalHours,
}: CategoryStatsProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      {/* ヘッダー */}
      <h2 className="text-lg font-bold text-gray-900 mb-6">
        カテゴリ別累計とレベル
      </h2>

      {/* 左側: ドーナツチャート */}
      <div className="grid grid-cols-2 gap-8">
        <div className="flex items-center justify-center">
          <div className="relative w-64 h-64">
            {/* SVGドーナツチャート */}
            <svg viewBox="0 0 200 200" className="transform -rotate-90">
              {categoryTotals.map((cat, index) => {
                // 開始角度を計算（前のカテゴリまでの合計）
                const startAngle = categoryTotals
                  .slice(0, index)
                  .reduce((sum, c) => {
                    const pct = (c.totalHours / totalHours) * 100;
                    return sum + (pct / 100) * 360;
                  }, 0);

                const percentage = (cat.totalHours / totalHours) * 100;
                const angle = (percentage / 100) * 360;
                const endAngle = startAngle + angle;

                // 円弧のパスを計算
                const startRad = (startAngle * Math.PI) / 180;
                const endRad = (endAngle * Math.PI) / 180;
                const outerRadius = 90;
                const innerRadius = 60;

                const x1 = 100 + outerRadius * Math.cos(startRad);
                const y1 = 100 + outerRadius * Math.sin(startRad);
                const x2 = 100 + outerRadius * Math.cos(endRad);
                const y2 = 100 + outerRadius * Math.sin(endRad);
                const x3 = 100 + innerRadius * Math.cos(endRad);
                const y3 = 100 + innerRadius * Math.sin(endRad);
                const x4 = 100 + innerRadius * Math.cos(startRad);
                const y4 = 100 + innerRadius * Math.sin(startRad);

                const largeArc = angle > 180 ? 1 : 0;

                return (
                  <path
                    key={index}
                    d={`M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`}
                    fill={cat.color}
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                  />
                );
              })}
            </svg>

            {/* 中央のテキスト */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-4xl font-bold text-gray-900">{totalHours}</p>
              <p className="text-sm text-gray-500 mt-1">Total Hours</p>
            </div>
          </div>
        </div>

        {/* 右側: カテゴリリスト */}
        <div className="space-y-4">
          {categoryTotals.map((cat, index) => {
            const progressWidth = (cat.totalHours / totalHours) * 100;

            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="font-medium text-gray-900">
                      {cat.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-900">
                      {cat.totalHours}h
                    </span>
                    <div className="flex items-center gap-1 bg-gray-100 rounded px-2 py-0.5">
                      <span className="text-xs text-gray-600">Lv.</span>
                      <span className="text-xs font-bold text-gray-900">
                        {cat.level}
                      </span>
                    </div>
                  </div>
                </div>
                {/* プログレスバー */}
                <div className="relative w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="absolute left-0 top-0 h-full rounded-full transition-all"
                    style={{
                      width: `${progressWidth}%`,
                      backgroundColor: cat.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
