'use client';

import { CalendarEvent } from '../../types';
import {
  generateWeek,
  getWeekStart,
  getEventsForDate,
  getTimeDifferenceInMinutes,
  formatDateISO,
} from '../utils/dateUtils';

interface WeekActivityHeatmapProps {
  currentDate: Date;
  events: CalendarEvent[];
}

export default function WeekActivityHeatmap({
  currentDate,
  events,
}: WeekActivityHeatmapProps) {
  const weekStart = getWeekStart(currentDate);
  const week = generateWeek(weekStart);

  // 各日の忙しさ度を計算（時間単位）
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

  // 最も空いている日を見つける
  const leastBusyDay = dailyActivity.reduce((min, day) =>
    day.hours < min.hours ? day : min
  );

  // ヒートマップの色を取得（0-8時間をマッピング）
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

  // 時間帯（9時から21時まで、2時間刻み）
  const timeSlots = ['09', '11', '13', '15', '17', '19', '21'];
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];

  // 各日・各時間帯にイベントがあるかチェック
  const hasEventInSlot = (date: Date, hour: number): boolean => {
    const dayEvents = getEventsForDate(events, date);
    return dayEvents.some((event) => {
      const startHour = parseInt(event.startTime.split(':')[0]);
      const endHour = parseInt(event.endTime.split(':')[0]);
      return startHour <= hour && hour < endHour;
    });
  };

  return (
    <div className="bg-white border-l border-gray-200 w-80 flex-shrink-0 overflow-y-auto">
      <div className="p-6">
        {/* タイトル */}
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
              <>
                <div
                  key={`time-${timeSlot}`}
                  className="text-xs text-gray-500 flex items-center justify-end pr-1"
                >
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
              </>
            ))}
          </div>
        </div>

        {/* 水曜日が最も空いています */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="text-xs text-blue-800">
            {weekdays[leastBusyDay.date.getDay()]}
            曜日が最も空いています（{leastBusyDay.hours.toFixed(1)}時間）
          </div>
        </div>

        {/* 統計 */}
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

        {/* 時間軸一括登録ボタン */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
            時間割一括登録
          </button>
        </div>
      </div>
    </div>
  );
}
