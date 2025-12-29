'use client';

import { CalendarEvent } from '../../types';
import {
  formatDateLong,
  generateDayScheduleSummary,
  formatMinutesToHourMinute,
} from '../utils/dateUtils';
import { getEventTypeColor, getEventTypeIcon } from '../utils/eventUtils';
import { CalendarColorMap } from '@/hooks/useCalendarColors';

interface DayViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  workingHours: { start: string; end: string };
  onEventClick?: (event: CalendarEvent) => void;
  calendarColors?: CalendarColorMap;
}

export default function DayView({
  currentDate,
  events,
  workingHours,
  onEventClick,
  calendarColors,
}: DayViewProps) {
  const summary = generateDayScheduleSummary(events, currentDate, workingHours);

  return (
    <div className="flex-1 bg-gray-50 overflow-auto">
      <div className="max-w-5xl mx-auto p-8">
        {/* ヘッダー */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {formatDateLong(currentDate)}
          </h2>
          <div className="text-sm text-gray-600">
            予定 {summary.eventCount}件 | 空き時間{' '}
            {formatMinutesToHourMinute(summary.totalFreeMinutes)}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* メイン: タイムライン */}
          <div className="col-span-2 space-y-4">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                今日のスケジュール
              </h3>

              {summary.events.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  今日の予定はありません
                </div>
              ) : (
                <div className="space-y-3">
                  {summary.events
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                    .map((event) => {
                      const calendarColor =
                        event.calendarId && calendarColors?.[event.calendarId];
                      const colors = getEventTypeColor(event.type);
                      const icon = getEventTypeIcon(event.type);

                      return (
                        <div
                          key={event.id}
                          onClick={() => onEventClick?.(event)}
                          className={`${calendarColor ? 'bg-white' : colors.bg} ${calendarColor ? '' : colors.border} border-l-4 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow`}
                          style={
                            calendarColor
                              ? {
                                  backgroundColor: calendarColor + '20',
                                  borderLeftColor: calendarColor,
                                }
                              : undefined
                          }
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">{icon}</span>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span
                                  className={`text-sm font-semibold ${calendarColor ? 'text-gray-900' : colors.text}`}
                                >
                                  {event.startTime} - {event.endTime}
                                </span>
                                <span
                                  className={`text-xs px-2 py-1 rounded ${calendarColor ? 'text-white' : `${colors.bg} ${colors.text}`}`}
                                  style={
                                    calendarColor
                                      ? { backgroundColor: calendarColor }
                                      : undefined
                                  }
                                >
                                  {event.type}
                                </span>
                              </div>
                              <h4
                                className={`text-base font-bold ${calendarColor ? 'text-gray-900' : colors.text} mb-2`}
                              >
                                {event.title}
                              </h4>
                              {event.location && (
                                <div
                                  className={`text-sm ${calendarColor ? 'text-gray-600' : colors.text} opacity-75 mb-1`}
                                >
                                  📍 {event.location}
                                </div>
                              )}
                              {event.memo && (
                                <div
                                  className={`text-sm ${calendarColor ? 'text-gray-600' : colors.text} opacity-75`}
                                >
                                  💭 {event.memo}
                                </div>
                              )}
                              {event.tags && event.tags.length > 0 && (
                                <div className="flex gap-1 mt-2">
                                  {event.tags.map((tag) => (
                                    <span
                                      key={tag}
                                      className={`text-xs px-2 py-0.5 rounded-full ${calendarColor ? 'bg-gray-100 text-gray-700' : `bg-white ${colors.text}`}`}
                                    >
                                      #{tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>

          {/* サイドバー: 空き時間とタスク提案 */}
          <div className="space-y-4">
            {/* 空き時間カード */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span>⏰</span>
                空き時間
              </h3>

              {summary.freeTimes.length === 0 ? (
                <div className="text-sm text-gray-500 text-center py-4">
                  空き時間がありません
                </div>
              ) : (
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
              )}
            </div>

            {/* タスク提案カード */}
            {summary.freeTimes.length > 0 && (
              <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
                <h3 className="text-base font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <span>💡</span>
                  おすすめ
                </h3>
                <div className="space-y-2">
                  {summary.freeTimes
                    .filter((ft) => ft.durationMinutes >= 60)
                    .map((freeTime, index) => (
                      <div
                        key={index}
                        className="text-sm text-blue-800 leading-relaxed"
                      >
                        {freeTime.startTime}-{freeTime.endTime}の
                        {formatMinutesToHourMinute(freeTime.durationMinutes)}で
                        {freeTime.suggestedUse === '作業'
                          ? '『タスク』を進めませんか？'
                          : freeTime.suggestedUse === '昼休み'
                            ? 'ランチ休憩をとりましょう'
                            : '休憩を取りましょう'}
                      </div>
                    ))}
                  {summary.freeTimes.filter((ft) => ft.durationMinutes >= 60)
                    .length === 0 && (
                    <div className="text-sm text-blue-700">
                      長めの空き時間がありません
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* サマリー統計 */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h3 className="text-base font-semibold text-gray-900 mb-3">
                今日の統計
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">予定件数</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {summary.eventCount}件
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">予定時間</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatMinutesToHourMinute(summary.totalBusyMinutes)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">空き時間</span>
                  <span className="text-sm font-semibold text-green-600">
                    {formatMinutesToHourMinute(summary.totalFreeMinutes)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
