import { Weather } from '../types';

interface WeatherCardProps {
  weather: Weather;
}

export default function WeatherCard({ weather }: WeatherCardProps) {
  return (
    <div className="bg-linear-to-br from-blue-400 to-blue-500 rounded-xl p-5 text-white shadow-md">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs opacity-90 font-medium">{weather.location}</div>
        <span className="text-3xl">☀️</span>
      </div>

      <div className="mb-4">
        <div className="text-5xl font-bold mb-1">{weather.currentTemp}°C</div>
        <div className="text-base opacity-90 font-medium">
          {weather.condition}
        </div>
        <div className="text-xs opacity-75 mt-0.5">
          体感 {weather.feelsLike}°C
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 border-t border-white/20 pt-3">
        {weather.hourlyForecast.map((forecast, index) => (
          <div key={index} className="text-center">
            <div className="text-xs opacity-75 mb-0.5">{forecast.time}</div>
            <div className="text-xl mb-0.5">{forecast.icon}</div>
            <div className="text-sm font-medium">{forecast.temp}°</div>
          </div>
        ))}
      </div>
    </div>
  );
}
