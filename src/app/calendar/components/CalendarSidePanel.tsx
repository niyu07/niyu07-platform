'use client';

import React from 'react';
import { CalendarEvent } from '../../types';
import {
  generateDayScheduleSummary,
  formatMinutesToHourMinute,
  getWeekdayName,
  generateWeek,
  getWeekStart,
  getEventsForDate,
  getTimeDifferenceInMinutes,
  formatDateISO,
} from '../utils/dateUtils';
import { getEventTypeColor } from '../utils/eventUtils';

interface CalendarSidePanelProps {
  selectedDate: Date;
  currentDate: Date;
  events: CalendarEvent[];
  workingHours: { start: string; end: string };
  onOpenTimeTable: () => void;
}

export default function CalendarSidePanel({
  selectedDate,
  currentDate,
  events,
  workingHours,
  onOpenTimeTable,
}: CalendarSidePanelProps) {
  const summary = generateDayScheduleSummary(
    events,
    selectedDate,
    workingHours
  );

  const month = selectedDate.getMonth() + 1;
  const day = selectedDate.getDate();
  const weekday = getWeekdayName(selectedDate);

  // 週の忙しさ計算
  const weekStart = getWeekStart(currentDate);
  const week = generateWeek(weekStart);
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];

  const dailyActivity = week.map((date) => {
    const dayEvents = getEventsForDate(events, date);
    const totalMinutes = dayEvents.reduce((total, event) => {
      return total + getTimeDifferenceInMinutes(event.startTime, event.endTime);
    }, 0);
    const hours = totalMinutes / 60;
    return {
      date,
      hours,
      eventCount: dayEvents.length,
    };
  });

  const leastBusyDay = dailyActivity.reduce((min, day) =>
    day.hours < min.hours ? day : min
  );

  const getHeatmapColor = (hours: number): string => {
    if (hours === 0) return 'bg-gray-100';
    if (hours < 2) return 'bg-blue-200';
    if (hours < 4) return 'bg-blue-300';
    if (hours < 6) return 'bg-blue-400';
    if (hours < 8) return 'bg-blue-500';
    return 'bg-blue-600';
  };

  const getTextColor = (hours: number): string => {
    if (hours === 0) return 'text-gray-600';
    if (hours < 4) return 'text-blue-800';
    return 'text-white';
  };

  const timeSlots = ['09', '11', '13', '15', '17', '19', '21'];

  const hasEventInSlot = (date: Date, hour: number): boolean => {
    const dayEvents = getEventsForDate(events, date);
    return dayEvents.some((event) => {
      const startHour = parseInt(event.startTime.split(':')[0]);
      const endHour = parseInt(event.endTime.split(':')[0]);
      return startHour <= hour && hour < endHour;
    });
  };

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
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
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

        {/* 今週の忙しさ */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            今週の忙しさ
          </h3>

          {/* ヒートマップグリッド */}
          <div className="mb-4">
            <div className="grid grid-cols-8 gap-1">
              {/* ヘッダー行（時刻） */}
              <div className="text-xs text-gray-500"></div>
              {weekdays.map((day, index) => (
                <div
                  key={index}
                  className={`text-xs text-center font-medium ${
                    index === 0
                      ? 'text-red-600'
                      : index === 6
                        ? 'text-blue-600'
                        : 'text-gray-700'
                  }`}
                >
                  {day}
                </div>
              ))}

              {/* データ行 */}
              {timeSlots.map((timeSlot) => (
                <React.Fragment key={`row-${timeSlot}`}>
                  <div className="text-xs text-gray-500 flex items-center justify-end pr-1">
                    {timeSlot}
                  </div>
                  {week.map((date, dayIndex) => {
                    const hour = parseInt(timeSlot);
                    const hasEvent = hasEventInSlot(date, hour);
                    return (
                      <div
                        key={`${formatDateISO(date)}-${timeSlot}`}
                        className={`aspect-square rounded ${
                          hasEvent ? 'bg-blue-500' : 'bg-gray-100'
                        }`}
                        title={`${weekdays[dayIndex]} ${timeSlot}:00`}
                      />
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* 最も空いている日 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="text-xs text-blue-800">
              {weekdays[leastBusyDay.date.getDay()]}
              曜日が最も空いています（{leastBusyDay.hours.toFixed(1)}時間）
            </div>
          </div>

          {/* 統計バー */}
          <div className="space-y-2">
            {dailyActivity.map((day, index) => {
              const bgColor = getHeatmapColor(day.hours);
              const textColor = getTextColor(day.hours);
              return (
                <div
                  key={index}
                  className={`${bgColor} rounded-lg p-2 flex items-center justify-between`}
                >
                  <span className={`text-xs font-medium ${textColor}`}>
                    {weekdays[index]}
                  </span>
                  <span className={`text-xs ${textColor}`}>
                    {day.eventCount}件 • {day.hours.toFixed(1)}h
                  </span>
                </div>
              );
            })}
          </div>

          {/* 時間割一括登録ボタン */}
          <div className="mt-6">
            <button
              onClick={onOpenTimeTable}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              時間割一括登録
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
