'use client';

import { CurrentWeather, Location } from '../types';
import { getWeatherLabel } from '../utils';

interface CurrentWeatherCardProps {
  weather: CurrentWeather;
  location: Location;
}

// Weather icon component - moved outside to avoid creating components during render
function WeatherIcon({ condition }: { condition: string }) {
  if (condition === 'clear') {
    return (
      <div className="relative w-32 h-32 flex items-center justify-center">
        {/* Sun rays */}
        <div className="absolute inset-0">
          <div className="absolute w-1 h-6 bg-white rounded-full top-0 left-1/2 -translate-x-1/2" />
          <div className="absolute w-1 h-6 bg-white rounded-full bottom-0 left-1/2 -translate-x-1/2" />
          <div className="absolute w-6 h-1 bg-white rounded-full left-0 top-1/2 -translate-y-1/2" />
          <div className="absolute w-6 h-1 bg-white rounded-full right-0 top-1/2 -translate-y-1/2" />
          <div className="absolute w-1 h-6 bg-white rounded-full top-2 left-2 rotate-45 origin-bottom-right" />
          <div className="absolute w-1 h-6 bg-white rounded-full top-2 right-2 -rotate-45 origin-bottom-left" />
          <div className="absolute w-1 h-6 bg-white rounded-full bottom-2 left-2 -rotate-45 origin-top-right" />
          <div className="absolute w-1 h-6 bg-white rounded-full bottom-2 right-2 rotate-45 origin-top-left" />
        </div>
        {/* Sun circle */}
        <div className="w-16 h-16 rounded-full bg-white shadow-lg" />
      </div>
    );
  }

  // Default icon for other conditions
  return (
    <div className="w-32 h-32 flex items-center justify-center text-white">
      <div className="text-7xl">☁️</div>
    </div>
  );
}

export default function CurrentWeatherCard({
  weather,
  location,
}: CurrentWeatherCardProps) {
  const weatherLabel = getWeatherLabel(weather.condition);

  return (
    <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl p-8 text-white shadow-xl">
      <div className="grid grid-cols-2 gap-8">
        {/* Left: Location, Icon, Temperature */}
        <div className="space-y-6">
          {/* Location and DateTime */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-white/90">
              <span>📍</span>
              <span className="font-medium">{location.name}</span>
            </div>
            <div className="text-sm text-white/70">
              {new Date(weather.timestamp).toLocaleDateString('ja-JP', {
                month: '2-digit',
                day: '2-digit',
                weekday: 'short',
              })}{' '}
              {new Date(weather.timestamp).toLocaleTimeString('ja-JP', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>

          {/* Weather Icon and Temperature */}
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              <WeatherIcon condition={weather.condition} />
            </div>
            <div className="space-y-2">
              <div className="text-7xl font-bold">{weather.temperature}°</div>
              <div className="text-xl font-medium">{weatherLabel}</div>
              <div className="text-sm text-white/80">
                体感 {weather.feelsLike}°
              </div>
            </div>
          </div>
        </div>

        {/* Right: Weather Details */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 space-y-4">
          <WeatherDetail
            icon="💧"
            label="湿度"
            value={`${weather.humidity}%`}
          />
          <WeatherDetail
            icon="💨"
            label="風速"
            value={`${weather.windSpeed}m/s ${weather.windDirection}`}
          />
          <WeatherDetail
            icon="👁️"
            label="視程"
            value={`${weather.visibility}km`}
          />
          <WeatherDetail
            icon="☔"
            label="降水確率"
            value={`${weather.precipitation}%`}
          />
          <WeatherDetail icon="🌅" label="日の出" value={weather.sunrise} />
          <WeatherDetail icon="🌇" label="日の入り" value={weather.sunset} />
          <WeatherDetail
            icon="🌙"
            label="月齢"
            value={`${weather.moonPhase}日`}
          />
        </div>
      </div>
    </div>
  );
}

function WeatherDetail({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-xl">{icon}</span>
        <span className="text-sm text-white/80">{label}</span>
      </div>
      <span className="font-semibold text-white">{value}</span>
    </div>
  );
}
