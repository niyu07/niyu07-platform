'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import LocationSelector from './components/LocationSelector';
import CurrentWeatherCard from './components/CurrentWeatherCard';
import HourlyForecast from './components/HourlyForecast';
import WeeklyForecast from './components/WeeklyForecast';
import PrecipitationChart from './components/PrecipitationChart';
import TemperatureChart from './components/TemperatureChart';
import EventWeatherIntegration from './components/EventWeatherIntegration';
import { mockLocations, mockSuggestions, mockWeatherAlerts } from './mockData';
import {
  Location,
  CurrentWeather,
  HourlyForecast as HourlyForecastType,
  DailyForecast,
  CalendarEvent,
} from './types';
import {
  adaptCurrentWeather,
  adaptHourlyForecast,
  adaptDailyForecast,
} from './weatherAdapter';
import { adaptGoogleCalendarEvents } from './calendarAdapter';

export default function WeatherPage() {
  const [locations, setLocations] = useState(mockLocations);
  const [currentLocationId, setCurrentLocationId] = useState('tokyo-shibuya');
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather | null>(
    null
  );
  const [hourlyForecast, setHourlyForecast] = useState<HourlyForecastType[]>(
    []
  );
  const [dailyForecast, setDailyForecast] = useState<DailyForecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [calendarLoading, setCalendarLoading] = useState(false);

  const currentLocation = locations.find((loc) => loc.id === currentLocationId);

  // 天気データを取得する関数
  const fetchWeatherData = async () => {
    if (!currentLocation) return;

    setLoading(true);
    try {
      // 現在の天気を取得
      const currentRes = await fetch(
        `/api/weather/current?lat=${currentLocation.latitude}&lon=${currentLocation.longitude}`
      );
      const currentData = await currentRes.json();
      console.log('Current weather data:', currentData);

      // エラーチェック
      if (currentData.error) {
        console.warn(
          'Weather API error:',
          currentData.error,
          '- Using mock data for demonstration'
        );
        // モックデータをインポート
        const { mockCurrentWeather, mockHourlyForecast, mockDailyForecast } =
          await import('./mockData');
        setCurrentWeather(mockCurrentWeather);
        setHourlyForecast(mockHourlyForecast);
        setDailyForecast(mockDailyForecast);
        setLastUpdated(new Date());
        setLoading(false);
        return;
      }

      // 予報を取得
      const forecastRes = await fetch(
        `/api/weather/forecast?lat=${currentLocation.latitude}&lon=${currentLocation.longitude}`
      );
      const forecastData = await forecastRes.json();
      console.log('Forecast data:', forecastData);

      // データを変換
      setCurrentWeather(adaptCurrentWeather(currentData, currentLocation.id));

      // エラーがある場合は空配列を設定
      if (forecastData.error) {
        console.error('Forecast error:', forecastData.error);
        setHourlyForecast([]);
        setDailyForecast([]);
      } else {
        setHourlyForecast(adaptHourlyForecast(forecastData.forecasts));
        setDailyForecast(adaptDailyForecast(forecastData.forecasts));
      }
      setLastUpdated(new Date());
    } catch (error) {
      console.error('天気データの取得エラー:', error);
      // エラー時もモックデータを使用
      const { mockCurrentWeather, mockHourlyForecast, mockDailyForecast } =
        await import('./mockData');
      setCurrentWeather(mockCurrentWeather);
      setHourlyForecast(mockHourlyForecast);
      setDailyForecast(mockDailyForecast);
    } finally {
      setLoading(false);
    }
  };

  // 初回読み込みと地点変更時にデータを取得
  useEffect(() => {
    fetchWeatherData();
    fetchCalendarEvents();
  }, [currentLocation]);

  // 30分ごとに自動更新
  useEffect(() => {
    const interval = setInterval(
      () => {
        fetchWeatherData();
      },
      30 * 60 * 1000
    ); // 30分 = 30 * 60 * 1000ミリ秒

    return () => clearInterval(interval);
  }, [currentLocation]);

  // カレンダーイベントを取得する関数
  const fetchCalendarEvents = async () => {
    setCalendarLoading(true);
    try {
      const res = await fetch('/api/calendar/events');
      if (res.ok) {
        const data = await res.json();
        // Google Calendar APIのイベントをWeatherページの型に変換
        const adaptedEvents = adaptGoogleCalendarEvents(data.events || []);
        setCalendarEvents(adaptedEvents);
      } else {
        console.error('カレンダーイベントの取得に失敗しました');
        setCalendarEvents([]);
      }
    } catch (error) {
      console.error('カレンダーイベントの取得エラー:', error);
      setCalendarEvents([]);
    } finally {
      setCalendarLoading(false);
    }
  };

  // 手動更新ハンドラー
  const handleRefresh = () => {
    fetchWeatherData();
    fetchCalendarEvents();
  };

  const handleLocationChange = (locationId: string) => {
    setCurrentLocationId(locationId);
  };

  const handleLocationAdd = () => {
    // In a real app, this would open a dialog to add a new location
    const newLocation: Location = {
      id: `location-${Date.now()}`,
      name: '新しい地点',
      latitude: 0,
      longitude: 0,
      isFavorite: false,
      order: locations.length,
    };
    setLocations([...locations, newLocation]);
  };

  const handleLocationRemove = (locationId: string) => {
    setLocations(locations.filter((loc) => loc.id !== locationId));
  };

  const handleLocationReorder = (newLocations: Location[]) => {
    setLocations(newLocations);
  };

  const handleLocationToggleFavorite = (locationId: string) => {
    setLocations(
      locations.map((loc) =>
        loc.id === locationId ? { ...loc, isFavorite: !loc.isFavorite } : loc
      )
    );
  };

  const user = {
    id: 'user-1',
    name: '山田太郎',
    email: 'yamada@example.com',
    avatar: '',
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar user={user} currentPage="天気" />
      <main className="flex-1 ml-64 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-8 space-y-6">
          {/* Header with Location Selector and Refresh Button */}
          <div className="relative">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <LocationSelector
                  locations={locations}
                  currentLocationId={currentLocationId}
                  onLocationChange={handleLocationChange}
                  onLocationAdd={handleLocationAdd}
                  onLocationRemove={handleLocationRemove}
                  onLocationReorder={handleLocationReorder}
                  onLocationToggleFavorite={handleLocationToggleFavorite}
                />
              </div>
              <div className="flex items-center gap-3">
                {lastUpdated && (
                  <span className="text-sm text-gray-500">
                    最終更新:{' '}
                    {lastUpdated.toLocaleTimeString('ja-JP', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                )}
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  title="天気情報を更新"
                >
                  <svg
                    className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  <span>更新</span>
                </button>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          )}

          {/* Current Weather */}
          {!loading && currentLocation && currentWeather && (
            <CurrentWeatherCard
              weather={currentWeather}
              location={currentLocation}
            />
          )}

          {/* 24 Hour Forecast */}
          {!loading && hourlyForecast.length > 0 && (
            <HourlyForecast forecasts={hourlyForecast} />
          )}

          {/* Weekly Forecast */}
          {!loading && dailyForecast.length > 0 && (
            <WeeklyForecast forecasts={dailyForecast} />
          )}

          {/* Two Column Layout for Charts */}
          {!loading && hourlyForecast.length > 0 && currentWeather && (
            <div className="grid grid-cols-2 gap-6">
              {/* Precipitation Chart */}
              <PrecipitationChart
                forecasts={hourlyForecast}
                alerts={mockWeatherAlerts}
              />

              {/* Temperature Chart */}
              <TemperatureChart
                forecasts={hourlyForecast}
                currentWeather={currentWeather}
              />
            </div>
          )}

          {/* Event Weather Integration */}
          {!loading && hourlyForecast.length > 0 && (
            <EventWeatherIntegration
              events={calendarEvents}
              forecasts={hourlyForecast}
              suggestions={mockSuggestions}
              loading={calendarLoading}
            />
          )}
        </div>
      </main>
    </div>
  );
}
