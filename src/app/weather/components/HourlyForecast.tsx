'use client';

import { HourlyForecast as HourlyForecastType } from '../types';
import { getWeatherIcon } from '../utils';

interface HourlyForecastProps {
  forecasts: HourlyForecastType[];
}

export default function HourlyForecast({ forecasts }: HourlyForecastProps) {
  const currentHour = new Date().getHours();

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md">
      <h2 className="text-xl font-bold text-gray-800 mb-4">24時間予報</h2>
      <div className="overflow-x-auto">
        <div className="flex gap-4 pb-2">
          {forecasts.map((forecast, index) => {
            const hour = parseInt(forecast.time.split(':')[0]);
            const isCurrentHour = hour === currentHour;

            return (
              <div
                key={index}
                className={`flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-lg min-w-[80px] ${
                  isCurrentHour
                    ? 'bg-blue-100 border-2 border-blue-500'
                    : 'bg-gray-50'
                }`}
              >
                {/* Time */}
                <div
                  className={`text-sm font-medium ${
                    isCurrentHour ? 'text-blue-600' : 'text-gray-600'
                  }`}
                >
                  {forecast.time}
                </div>

                {/* Weather Icon */}
                <div className="text-3xl">
                  {getWeatherIcon(forecast.condition)}
                </div>

                {/* Temperature */}
                <div
                  className={`text-lg font-bold ${
                    isCurrentHour ? 'text-blue-700' : 'text-gray-800'
                  }`}
                >
                  {forecast.temperature}°
                </div>

                {/* Precipitation */}
                <div className="flex items-center gap-1 text-xs text-blue-500">
                  <span>💧</span>
                  <span>{forecast.precipitation}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
