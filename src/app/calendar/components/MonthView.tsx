'use client';

import { CalendarEvent } from '../../types';
import {
  generateMonthCalendar,
  getEventsForDate,
  isToday,
  isSameMonth,
} from '../utils/dateUtils';
import { getEventTypeBgColor } from '../utils/eventUtils';

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onDateClick: (date: Date) => void;
}

export default function MonthView({
  currentDate,
  events,
  onDateClick,
}: MonthViewProps) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const calendar = generateMonthCalendar(year, month);

  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];

  return (
    <div className="flex-1 bg-white">
      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {weekdays.map((day, index) => (
          <div
            key={day}
            className={`py-3 text-center text-sm font-semibold ${
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
      </div>

      {/* カレンダーグリッド */}
      <div className="flex-1">
        {calendar.map((week, weekIndex) => (
          <div
            key={weekIndex}
            className="grid grid-cols-7 border-b border-gray-200"
          >
            {week.map((date, dayIndex) => {
              const dateEvents = getEventsForDate(events, date);
              const isCurrentMonth = isSameMonth(date, year, month);
              const isTodayDate = isToday(date);

              return (
                <div
                  key={dayIndex}
                  onClick={() => onDateClick(date)}
                  className={`min-h-[120px] border-r border-gray-200 p-2 cursor-pointer hover:bg-gray-50 transition-colors ${
                    !isCurrentMonth ? 'bg-gray-50' : ''
                  }`}
                >
                  {/* 日付 */}
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 text-sm font-medium rounded-full ${
                        isTodayDate
                          ? 'bg-blue-600 text-white'
                          : !isCurrentMonth
                            ? 'text-gray-400'
                            : dayIndex === 0
                              ? 'text-red-600'
                              : dayIndex === 6
                                ? 'text-blue-600'
                                : 'text-gray-900'
                      }`}
                    >
                      {date.getDate()}
                    </span>
                    {dateEvents.length > 0 && (
                      <span className="text-xs text-gray-500">
                        {dateEvents.length}件
                      </span>
                    )}
                  </div>

                  {/* イベント一覧（最大3件まで表示） */}
                  <div className="space-y-1">
                    {dateEvents.slice(0, 3).map((event) => {
                      const bgColor = getEventTypeBgColor(event.type);
                      return (
                        <div
                          key={event.id}
                          className={`text-xs px-2 py-1 rounded text-white truncate ${bgColor}`}
                          title={`${event.startTime} ${event.title}`}
                        >
                          {event.startTime} {event.title.substring(0, 10)}
                          {event.title.length > 10 ? '...' : ''}
                        </div>
                      );
                    })}
                    {dateEvents.length > 3 && (
                      <div className="text-xs text-gray-500 px-2">
                        +{dateEvents.length - 3}件
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
