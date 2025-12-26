'use client';

import { useState } from 'react';
import { HourlyForecast, CurrentWeather } from '../types';

interface TemperatureChartProps {
  forecasts: HourlyForecast[];
  currentWeather: CurrentWeather;
}

export default function TemperatureChart({ forecasts }: TemperatureChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const temperatures = forecasts.map((f) => f.temperature);
  const feelsLikeTemps = forecasts.map((f) => {
    // Mock feels like temperature (slightly lower than actual)
    return f.temperature - 2;
  });

  const maxTemp = Math.max(...temperatures);
  const minTemp = Math.min(...temperatures);
  const tempRange = maxTemp - minTemp;
  const chartHeight = 200;

  // Calculate points for the temperature line
  const tempPoints = forecasts.map((forecast, index) => {
    const x = (index / (forecasts.length - 1)) * 100;
    const normalizedTemp = (forecast.temperature - minTemp) / tempRange;
    const y = chartHeight - normalizedTemp * chartHeight;
    return { x, y };
  });

  // Calculate points for the feels-like line
  const feelsLikePoints = feelsLikeTemps.map((temp, index) => {
    const x = (index / (forecasts.length - 1)) * 100;
    const normalizedTemp = (temp - minTemp) / tempRange;
    const y = chartHeight - normalizedTemp * chartHeight;
    return { x, y };
  });

  // Create SVG paths
  const tempPath = tempPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`)
    .join(' ');
  const feelsLikePath = feelsLikePoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`)
    .join(' ');

  // Calculate temperature difference
  const tempDiff = maxTemp - minTemp;

  // Handle mouse move on chart
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;

    // Find closest point
    let closestIndex = 0;
    let minDistance = Math.abs(tempPoints[0].x - x);

    for (let i = 1; i < tempPoints.length; i++) {
      const distance = Math.abs(tempPoints[i].x - x);
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
      <h2 className="text-xl font-bold text-gray-800">気温の変化</h2>

      {/* Chart */}
      <div className="relative">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-500">
          <div>{Math.round(maxTemp + 4)}°</div>
          <div>{Math.round(maxTemp)}°</div>
          <div>{Math.round((maxTemp + minTemp) / 2)}°</div>
          <div>{Math.round(minTemp)}°</div>
          <div>{Math.round(minTemp - 4)}°</div>
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
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
              <line
                key={i}
                x1="0"
                y1={chartHeight * ratio}
                x2="100"
                y2={chartHeight * ratio}
                stroke="#f3f4f6"
                strokeWidth="0.5"
                strokeDasharray="2,2"
              />
            ))}

            {/* Actual temperature line */}
            <path
              d={tempPath}
              fill="none"
              stroke="#ef4444"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
            />

            {/* Feels-like temperature line */}
            <path
              d={feelsLikePath}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="1.5"
              strokeDasharray="3,3"
              vectorEffect="non-scaling-stroke"
            />

            {/* Vertical line and points on hover */}
            {hoveredIndex !== null && (
              <>
                <line
                  x1={tempPoints[hoveredIndex].x}
                  y1="0"
                  x2={tempPoints[hoveredIndex].x}
                  y2={chartHeight}
                  stroke="#9ca3af"
                  strokeWidth="0.5"
                  strokeDasharray="4,4"
                />
                <circle
                  cx={tempPoints[hoveredIndex].x}
                  cy={tempPoints[hoveredIndex].y}
                  r="4"
                  fill="#ef4444"
                  stroke="white"
                  strokeWidth="2"
                />
                <circle
                  cx={feelsLikePoints[hoveredIndex].x}
                  cy={feelsLikePoints[hoveredIndex].y}
                  r="4"
                  fill="#3b82f6"
                  stroke="white"
                  strokeWidth="2"
                />
              </>
            )}
          </svg>

          {/* Tooltip */}
          {hoveredIndex !== null && (
            <div
              className="absolute bg-gray-800 text-white px-3 py-2 rounded-lg shadow-lg text-sm pointer-events-none z-10"
              style={{
                left: `${tempPoints[hoveredIndex].x}%`,
                top: `${Math.min(tempPoints[hoveredIndex].y, feelsLikePoints[hoveredIndex].y) - 60}px`,
                transform: 'translateX(-50%)',
              }}
            >
              <div className="font-bold">{forecasts[hoveredIndex].time}</div>
              <div className="text-red-300">
                気温: {forecasts[hoveredIndex].temperature}°C
              </div>
              <div className="text-blue-300">
                体感: {feelsLikeTemps[hoveredIndex]}°C
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

      {/* Legend */}
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-red-500"></div>
          <span className="text-gray-600">実際の気温</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-blue-500 border-dashed"></div>
          <span className="text-gray-600">体感温度</span>
        </div>
      </div>

      {/* Temperature difference info */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-xl">
        <div className="flex items-start gap-3">
          <span className="text-2xl">ℹ️</span>
          <div className="flex-1">
            <div className="font-bold text-blue-700 mb-1">
              今日の気温差: {tempDiff}°C
            </div>
            <div className="text-sm text-blue-600">
              朝晩は冷え込みます、上着をお忘れなく
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
