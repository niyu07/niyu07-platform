'use client';

import { CalendarEvent } from '../../types';
import {
  generateDayScheduleSummary,
  formatMinutesToHourMinute,
  getWeekdayName,
} from '../utils/dateUtils';
import { getEventTypeColor } from '../utils/eventUtils';

interface DaySidePanelProps {
  selectedDate: Date;
  events: CalendarEvent[];
  workingHours: { start: string; end: string };
}

export default function DaySidePanel({
  selectedDate,
  events,
  workingHours,
}: DaySidePanelProps) {
  const summary = generateDayScheduleSummary(
    events,
    selectedDate,
    workingHours
  );

  const month = selectedDate.getMonth() + 1;
  const day = selectedDate.getDate();
  const weekday = getWeekdayName(selectedDate);

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex-shrink-0 overflow-y-auto">
      <div className="p-6">
        {/* 日付ヘッダー */}
        <div className="mb-6">
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {month}月{day}日 ({weekday})
          </div>
          <div className="text-sm text-gray-600">
            予定 {summary.eventCount}件 | 空き時間{' '}
            {formatMinutesToHourMinute(summary.totalFreeMinutes)}
          </div>
        </div>

        {/* 今日の予定 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <svg
                className="w-4 h-4 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              予定
            </h3>
          </div>

          {summary.events.length === 0 ? (
            <div className="text-sm text-gray-500 text-center py-8 bg-gray-50 rounded-lg">
              予定はありません
            </div>
          ) : (
            <div className="space-y-2">
              {summary.events
                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                .map((event) => {
                  const colors = getEventTypeColor(event.type);
                  return (
                    <div
                      key={event.id}
                      className={`${colors.bg} border-l-4 ${colors.border} rounded-lg p-3`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-xs font-semibold ${colors.text}`}
                        >
                          {event.startTime} - {event.endTime}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${colors.bg} ${colors.text} font-medium`}
                        >
                          {event.type}
                        </span>
                      </div>
                      <div className={`text-sm font-bold ${colors.text} mb-1`}>
                        {event.title}
                      </div>
                      {event.location && (
                        <div className={`text-xs ${colors.text} opacity-75`}>
                          📍 {event.location}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* 今日の空き時間 */}
        {summary.freeTimes.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                今日の空き時間
              </h3>
            </div>

            <div className="space-y-2">
              {summary.freeTimes.map((freeTime) => (
                <div
                  key={freeTime.id}
                  className="bg-green-50 border border-green-200 rounded-lg p-3"
                >
                  <div className="text-sm font-semibold text-green-800 mb-1">
                    {freeTime.startTime} - {freeTime.endTime}
                  </div>
                  <div className="text-xs text-green-700">
                    {formatMinutesToHourMinute(freeTime.durationMinutes)} •{' '}
                    {freeTime.suggestedUse}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* タスク提案 */}
        {summary.freeTimes.some((ft) => ft.durationMinutes >= 120) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
              💡 おすすめ
            </div>
            <div className="space-y-2">
              {summary.freeTimes
                .filter((ft) => ft.durationMinutes >= 120)
                .slice(0, 1)
                .map((freeTime, index) => (
                  <div key={index} className="text-sm text-blue-800">
                    {freeTime.startTime}-{freeTime.endTime}の2時間で「Web
                    デザイン」を進めませんか？
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
