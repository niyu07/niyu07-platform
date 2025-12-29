'use client';

import { CalendarEvent } from '../../types';
import {
  generateWeek,
  getWeekStart,
  getEventsForDate,
  isToday,
  getWeekdayName,
  timeToMinutes,
} from '../utils/dateUtils';
import { getEventTypeColor } from '../utils/eventUtils';
import { CalendarColorMap } from '@/hooks/useCalendarColors';

interface WeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  calendarColors?: CalendarColorMap;
}

export default function WeekView({
  currentDate,
  events,
  onEventClick,
  calendarColors,
}: WeekViewProps) {
  const weekStart = getWeekStart(currentDate);
  const week = generateWeek(weekStart);

  // 表示する時間帯（8:00〜22:00）
  const hours = Array.from({ length: 15 }, (_, i) => i + 8);

  // イベントの位置とサイズを計算
  const getEventStyle = (event: CalendarEvent) => {
    const startMinutes = timeToMinutes(event.startTime);
    const endMinutes = timeToMinutes(event.endTime);
    const duration = endMinutes - startMinutes;

    const top = ((startMinutes - 8 * 60) / 60) * 64; // 1時間 = 64px
    const height = (duration / 60) * 64;

    return {
      top: `${top}px`,
      height: `${height}px`,
    };
  };

  return (
    <div className="flex-1 bg-white overflow-auto">
      <div className="flex">
        {/* 時刻列 */}
        <div className="w-20 flex-shrink-0 border-r border-gray-200">
          <div className="h-12 border-b border-gray-200"></div>
          {hours.map((hour) => (
            <div key={hour} className="h-16 border-b border-gray-200 pr-2 pt-1">
              <span className="text-xs text-gray-500 text-right block">
                {String(hour).padStart(2, '0')}:00
              </span>
            </div>
          ))}
        </div>

        {/* 日付列 */}
        {week.map((date, dayIndex) => {
          const dateEvents = getEventsForDate(events, date);
          const isTodayDate = isToday(date);

          return (
            <div
              key={dayIndex}
              className="flex-1 border-r border-gray-200 relative"
            >
              {/* 日付ヘッダー */}
              <div
                className={`h-12 border-b border-gray-200 flex flex-col items-center justify-center ${
                  isTodayDate ? 'bg-blue-50' : ''
                }`}
              >
                <div
                  className={`text-xs font-medium ${
                    dayIndex === 0
                      ? 'text-red-600'
                      : dayIndex === 6
                        ? 'text-blue-600'
                        : 'text-gray-600'
                  }`}
                >
                  {getWeekdayName(date)}
                </div>
                <div
                  className={`text-lg font-bold ${
                    isTodayDate
                      ? 'w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center'
                      : dayIndex === 0
                        ? 'text-red-600'
                        : dayIndex === 6
                          ? 'text-blue-600'
                          : 'text-gray-900'
                  }`}
                >
                  {date.getDate()}
                </div>
              </div>

              {/* 時間グリッド */}
              <div className="relative">
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="h-16 border-b border-gray-200"
                  ></div>
                ))}

                {/* イベント */}
                {dateEvents.map((event) => {
                  const style = getEventStyle(event);
                  const calendarColor =
                    event.calendarId && calendarColors?.[event.calendarId];
                  const colors = getEventTypeColor(event.type);

                  return (
                    <div
                      key={event.id}
                      onClick={() => onEventClick?.(event)}
                      className={`absolute left-1 right-1 ${calendarColor ? 'bg-white' : colors.bg} ${calendarColor ? '' : colors.border} border-l-4 rounded px-2 py-1 cursor-pointer hover:shadow-md transition-shadow overflow-hidden`}
                      style={{
                        ...style,
                        ...(calendarColor
                          ? {
                              backgroundColor: calendarColor + '20',
                              borderLeftColor: calendarColor,
                            }
                          : {}),
                      }}
                    >
                      <div
                        className={`text-xs font-semibold ${calendarColor ? '' : colors.text}`}
                        style={calendarColor ? { color: calendarColor } : {}}
                      >
                        {event.startTime}
                      </div>
                      <div
                        className={`text-sm font-medium ${calendarColor ? 'text-gray-900' : colors.text} truncate`}
                      >
                        {event.title}
                      </div>
                      {event.location && (
                        <div
                          className={`text-xs ${calendarColor ? 'text-gray-600' : colors.text} opacity-75 truncate`}
                        >
                          📍 {event.location}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
