'use client';

import { DailyForecast } from '../types';
import { getWeatherIcon } from '../utils';

interface WeeklyForecastProps {
  forecasts: DailyForecast[];
}

export default function WeeklyForecast({ forecasts }: WeeklyForecastProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-md">
      <h2 className="text-xl font-bold text-gray-800 mb-4">週間予報</h2>
      <div className="grid grid-cols-7 gap-3">
        {forecasts.map((forecast, index) => {
          const today = new Date().toISOString().split('T')[0];
          const isToday = forecast.date === today;

          return (
            <div
              key={index}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all ${
                isToday
                  ? 'bg-blue-100 border-2 border-blue-500'
                  : 'bg-gray-50 hover:bg-gray-100'
              } ${forecast.isHoliday ? 'border-red-200' : ''}`}
            >
              {/* Date */}
              <div className="text-center">
                <div
                  className={`text-xs font-medium ${
                    isToday
                      ? 'text-blue-600'
                      : forecast.isHoliday
                        ? 'text-red-500'
                        : 'text-gray-500'
                  }`}
                >
                  {forecast.displayDate.split(' ')[0]}
                </div>
                <div
                  className={`text-xs ${
                    isToday
                      ? 'text-blue-600'
                      : forecast.isHoliday
                        ? 'text-red-400'
                        : 'text-gray-400'
                  }`}
                >
                  {forecast.displayDate.split(' ')[1]}
                </div>
              </div>

              {/* Weather Icon */}
              <div className="text-4xl">
                {getWeatherIcon(forecast.condition)}
              </div>

              {/* Weather Condition Label */}
              <div className="text-xs text-gray-600 text-center font-medium">
                {forecast.condition === 'clear' && '晴れ'}
                {forecast.condition === 'partly-cloudy' && '晴れ時々曇り'}
                {forecast.condition === 'cloudy' && '曇り'}
                {forecast.condition === 'rain' && '雨'}
              </div>

              {/* Temperature */}
              <div className="flex items-baseline gap-1">
                <span
                  className={`text-lg font-bold ${
                    isToday ? 'text-blue-700' : 'text-red-500'
                  }`}
                >
                  {forecast.maxTemp}°
                </span>
                <span className="text-xs text-gray-400">/</span>
                <span
                  className={`text-sm ${
                    isToday ? 'text-blue-500' : 'text-blue-500'
                  }`}
                >
                  {forecast.minTemp}°
                </span>
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
  );
}
