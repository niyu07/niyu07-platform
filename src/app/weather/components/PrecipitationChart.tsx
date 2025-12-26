'use client';

import { useState } from 'react';
import { HourlyForecast, WeatherAlert } from '../types';

interface PrecipitationChartProps {
  forecasts: HourlyForecast[];
  alerts: WeatherAlert[];
}

export default function PrecipitationChart({
  forecasts,
  alerts,
}: PrecipitationChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const chartHeight = 200;

  // Calculate points for the area chart
  const points = forecasts.map((forecast, index) => {
    const x = (index / (forecasts.length - 1)) * 100;
    const y = chartHeight - (forecast.precipitation / 100) * chartHeight;
    return { x, y, precipitation: forecast.precipitation };
  });

  // Create SVG path for the area
  const areaPath = `
    M 0,${chartHeight}
    ${points.map((p) => `L ${p.x},${p.y}`).join(' ')}
    L 100,${chartHeight}
    Z
  `;

  // Create SVG path for the line
  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`)
    .join(' ');

  // Handle mouse move on chart
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;

    // Find closest point
    let closestIndex = 0;
    let minDistance = Math.abs(points[0].x - x);

    for (let i = 1; i < points.length; i++) {
      const distance = Math.abs(points[i].x - x);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = i;
      }
    }

    setHoveredIndex(closestIndex);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md space-y-4">
      <h2 className="text-xl font-bold text-gray-800">降水確率の推移</h2>

      {/* Chart */}
      <div className="relative">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-500">
          <div>80%</div>
          <div>60%</div>
          <div>40%</div>
          <div>20%</div>
          <div>0%</div>
        </div>

        {/* Chart area */}
        <div
          className="ml-12 relative cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <svg
            viewBox={`0 0 100 ${chartHeight}`}
            className="w-full"
            preserveAspectRatio="none"
            style={{ height: `${chartHeight}px` }}
          >
            {/* Grid lines */}
            <line
              x1="0"
              y1={chartHeight * 0.2}
              x2="100"
              y2={chartHeight * 0.2}
              stroke="#f3f4f6"
              strokeWidth="0.5"
              strokeDasharray="2,2"
            />
            <line
              x1="0"
              y1={chartHeight * 0.4}
              x2="100"
              y2={chartHeight * 0.4}
              stroke="#f3f4f6"
              strokeWidth="0.5"
              strokeDasharray="2,2"
            />
            <line
              x1="0"
              y1={chartHeight * 0.6}
              x2="100"
              y2={chartHeight * 0.6}
              stroke="#f3f4f6"
              strokeWidth="0.5"
              strokeDasharray="2,2"
            />
            <line
              x1="0"
              y1={chartHeight * 0.8}
              x2="100"
              y2={chartHeight * 0.8}
              stroke="#f3f4f6"
              strokeWidth="0.5"
              strokeDasharray="2,2"
            />

            {/* Area */}
            <path d={areaPath} fill="url(#gradient)" opacity="0.3" />

            {/* Line */}
            <path
              d={linePath}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />

            {/* Vertical line on hover */}
            {hoveredIndex !== null && (
              <>
                <line
                  x1={points[hoveredIndex].x}
                  y1="0"
                  x2={points[hoveredIndex].x}
                  y2={chartHeight}
                  stroke="#9ca3af"
                  strokeWidth="0.5"
                  strokeDasharray="4,4"
                />
                <circle
                  cx={points[hoveredIndex].x}
                  cy={points[hoveredIndex].y}
                  r="4"
                  fill="#3b82f6"
                  stroke="white"
                  strokeWidth="2"
                />
              </>
            )}

            {/* Gradient definition */}
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
              </linearGradient>
            </defs>
          </svg>

          {/* Tooltip */}
          {hoveredIndex !== null && (
            <div
              className="absolute bg-gray-800 text-white px-3 py-2 rounded-lg shadow-lg text-sm pointer-events-none z-10"
              style={{
                left: `${points[hoveredIndex].x}%`,
                top: `${points[hoveredIndex].y - 40}px`,
                transform: 'translateX(-50%)',
              }}
            >
              <div className="font-bold">{forecasts[hoveredIndex].time}</div>
              <div className="text-blue-300">
                降水確率: {forecasts[hoveredIndex].precipitation}%
              </div>
            </div>
          )}

          {/* X-axis labels */}
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <div>0:00</div>
            <div>4:00</div>
            <div>8:00</div>
            <div>12:00</div>
            <div>16:00</div>
            <div>20:00</div>
            <div>24:0</div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`p-4 rounded-xl border-l-4 ${
            alert.severity === 'critical'
              ? 'bg-red-50 border-red-500'
              : alert.severity === 'warning'
                ? 'bg-yellow-50 border-yellow-500'
                : 'bg-blue-50 border-blue-500'
          }`}
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl">{alert.icon}</span>
            <div className="flex-1">
              <div
                className={`font-bold mb-1 ${
                  alert.severity === 'critical'
                    ? 'text-red-700'
                    : alert.severity === 'warning'
                      ? 'text-yellow-700'
                      : 'text-blue-700'
                }`}
              >
                {alert.title}
              </div>
              <div
                className={`text-sm ${
                  alert.severity === 'critical'
                    ? 'text-red-600'
                    : alert.severity === 'warning'
                      ? 'text-yellow-600'
                      : 'text-blue-600'
                }`}
              >
                {alert.message}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
