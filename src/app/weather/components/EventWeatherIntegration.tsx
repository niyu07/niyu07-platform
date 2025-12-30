'use client';

import Link from 'next/link';
import { CalendarEvent, HourlyForecast, Suggestion } from '../types';
import { getWeatherIcon } from '../utils';

interface EventWeatherIntegrationProps {
  events: CalendarEvent[];
  forecasts: HourlyForecast[];
  suggestions: Suggestion[];
  loading?: boolean;
}

export default function EventWeatherIntegration({
  events,
  forecasts,
  suggestions,
  loading = false,
}: EventWeatherIntegrationProps) {
  // Get weather for specific time
  const getWeatherAtTime = (time: string) => {
    const hour = parseInt(time.split(':')[0]);
    return forecasts.find((f) => parseInt(f.time.split(':')[0]) === hour);
  };

  // Get suggestions for event
  const getSuggestionsForEvent = (eventId: string) => {
    return suggestions.filter((s) => s.eventId === eventId);
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">📅</span>
          <h2 className="text-xl font-bold text-gray-800">今日の予定と天気</h2>
        </div>
        <Link
          href="/calendar"
          className="text-xs text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1"
        >
          カレンダーを見る
          <span>→</span>
        </Link>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">カレンダーを読み込み中...</span>
        </div>
      )}

      {!loading && events.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          今日の予定はありません
        </div>
      )}

      <div className="space-y-3">
        {!loading &&
          events.map((event) => {
            const weather = getWeatherAtTime(event.startTime);
            const eventSuggestions = getSuggestionsForEvent(event.id);
            const hasCriticalSuggestion = eventSuggestions.some(
              (s) => s.severity === 'critical'
            );
            const hasWarningSuggestion = eventSuggestions.some(
              (s) => s.severity === 'warning'
            );

            return (
              <div
                key={event.id}
                className={`border-l-4 rounded-lg p-4 ${
                  hasCriticalSuggestion
                    ? 'bg-red-50 border-red-500'
                    : hasWarningSuggestion
                      ? 'bg-yellow-50 border-yellow-500'
                      : 'bg-blue-50 border-blue-500'
                }`}
              >
                {/* Event Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg font-bold text-gray-800">
                        {event.startTime}
                      </span>
                      <span className="font-semibold text-gray-700">
                        {event.title}
                      </span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>📍</span>
                        <span>{event.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Weather Info */}
                  {weather && (
                    <div className="flex items-center gap-3 text-right">
                      <div className="text-3xl">
                        {getWeatherIcon(weather.condition)}
                      </div>
                      <div className="text-sm">
                        <div
                          className={`text-lg font-bold ${
                            hasCriticalSuggestion
                              ? 'text-red-700'
                              : hasWarningSuggestion
                                ? 'text-yellow-700'
                                : 'text-blue-700'
                          }`}
                        >
                          {weather.temperature}°C
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Suggestions */}
                {eventSuggestions.length > 0 && (
                  <div className="space-y-2 mt-3">
                    {eventSuggestions.map((suggestion) => (
                      <div
                        key={suggestion.id}
                        className={`flex items-start gap-2 text-sm ${
                          suggestion.severity === 'critical'
                            ? 'text-red-700'
                            : suggestion.severity === 'warning'
                              ? 'text-yellow-700'
                              : 'text-blue-700'
                        }`}
                      >
                        {suggestion.severity === 'critical' && (
                          <span className="flex-shrink-0">❌</span>
                        )}
                        {suggestion.severity === 'warning' && (
                          <span className="flex-shrink-0">⚠️</span>
                        )}
                        {suggestion.severity === 'info' && (
                          <span className="flex-shrink-0">💡</span>
                        )}
                        <div className="flex-1">
                          <div className="font-semibold">
                            {suggestion.message}
                          </div>
                          <div className="text-xs opacity-80 mt-0.5">
                            {suggestion.reason}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {/* General Suggestions (not tied to specific events) */}
      <div className="pt-4 border-t border-gray-200">
        <h3 className="text-sm font-bold text-gray-700 mb-3">その他の提案</h3>
        <div className="space-y-2">
          {suggestions
            .filter((s) => !s.eventId)
            .map((suggestion) => (
              <div
                key={suggestion.id}
                className={`flex items-start gap-2 p-3 rounded-lg ${
                  suggestion.severity === 'critical'
                    ? 'bg-red-50 text-red-700'
                    : suggestion.severity === 'warning'
                      ? 'bg-yellow-50 text-yellow-700'
                      : 'bg-blue-50 text-blue-700'
                }`}
              >
                {suggestion.type === 'umbrella' && <span>☔</span>}
                {suggestion.type === 'clothing' && <span>👔</span>}
                {suggestion.type === 'cancellation' && <span>❌</span>}
                {suggestion.type === 'departure' && <span>🚶</span>}
                <div className="flex-1">
                  <div className="font-semibold text-sm">
                    {suggestion.message}
                  </div>
                  <div className="text-xs opacity-80 mt-0.5">
                    {suggestion.reason}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
