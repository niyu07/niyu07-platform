'use client';

import { ExpenseData } from '../types';

interface ExpenseChartProps {
  data: ExpenseData;
}

export default function ExpenseChart({ data }: ExpenseChartProps) {
  // SVGドーナツチャートの計算
  const radius = 80;
  const strokeWidth = 40;
  const center = 100;
  const circumference = 2 * Math.PI * radius;

  let currentAngle = -90; // 12時の位置から開始

  const segments = data.categories.map((category) => {
    const angle = (category.percentage / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;

    // 円弧のパスを計算
    const startX =
      center + radius * Math.cos((startAngle * Math.PI) / 180);
    const startY =
      center + radius * Math.sin((startAngle * Math.PI) / 180);
    const endX = center + radius * Math.cos((endAngle * Math.PI) / 180);
    const endY = center + radius * Math.sin((endAngle * Math.PI) / 180);

    const largeArcFlag = angle > 180 ? 1 : 0;

    const path = `
      M ${center},${center}
      L ${startX},${startY}
      A ${radius},${radius} 0 ${largeArcFlag} 1 ${endX},${endY}
      Z
    `;

    currentAngle = endAngle;

    return {
      ...category,
      path,
    };
  });

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <h2 className="text-lg font-bold text-gray-900 mb-1">今月の支出</h2>
      <p className="text-xs text-gray-500 mb-4">{data.period}</p>

      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* ドーナツチャート */}
        <div className="relative">
          <svg width="180" height="180" viewBox="0 0 200 200">
            {segments.map((segment, index) => (
              <path
                key={index}
                d={segment.path}
                fill={segment.color}
                className="transition-all hover:opacity-80 cursor-pointer"
              />
            ))}
            {/* 中央の円（ドーナツの穴） */}
            <circle cx="100" cy="100" r="60" fill="white" />
          </svg>
          {/* 中央のテキスト */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-xl font-bold text-gray-900">
              ¥{(data.total / 1000).toFixed(0)}k
            </div>
            <div className="text-[10px] text-gray-500">合計</div>
          </div>
        </div>

        {/* 凡例 */}
        <div className="flex-1 space-y-2.5">
          {data.categories.map((category, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-xs text-gray-700">{category.name}</span>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-gray-900">
                  {category.percentage}%
                </div>
                <div className="text-[10px] text-gray-500">
                  ¥{category.amount.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
