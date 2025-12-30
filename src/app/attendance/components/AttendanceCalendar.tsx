'use client';

import { useState } from 'react';
import { AttendanceRecord } from '@/app/types';
import { formatMinutesToHourMinute } from '../../calendar/utils/dateUtils';

interface AttendanceCalendarProps {
  records: AttendanceRecord[];
}

export default function AttendanceCalendar({
  records,
}: AttendanceCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // 月の日数を取得
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay();

  // カレンダーの日付配列を生成
  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  // 月を変更
  const changeMonth = (delta: number) => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1)
    );
  };

  // 日付の勤怠記録を取得
  const getRecordForDate = (day: number): AttendanceRecord | undefined => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return records.find((r) => r.date === dateStr);
  };

  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          {year}年{month + 1}月
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => changeMonth(-1)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            前月
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            今月
          </button>
          <button
            onClick={() => changeMonth(1)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            翌月
          </button>
        </div>
      </div>

      {/* カレンダーグリッド */}
      <div className="grid grid-cols-7 gap-2">
        {/* 曜日ヘッダー */}
        {weekDays.map((day, index) => (
          <div
            key={day}
            className={`text-center font-medium text-sm py-2 ${
              index === 0
                ? 'text-red-600'
                : index === 6
                  ? 'text-blue-600'
                  : 'text-gray-600'
            }`}
          >
            {day}
          </div>
        ))}

        {/* 日付セル */}
        {calendarDays.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const record = getRecordForDate(day);
          const isToday =
            new Date().toDateString() ===
            new Date(year, month, day).toDateString();

          return (
            <div
              key={day}
              className={`aspect-square border rounded-lg p-2 transition-colors ${
                isToday
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex flex-col h-full">
                <div
                  className={`text-sm font-medium ${
                    isToday ? 'text-blue-600' : 'text-gray-900'
                  }`}
                >
                  {day}
                </div>
                {record && (
                  <div className="flex-1 mt-1 text-xs">
                    {record.status === '退勤済み' && record.workMinutes ? (
                      <div className="bg-green-100 text-green-700 px-1 py-0.5 rounded text-center font-medium">
                        {formatMinutesToHourMinute(record.workMinutes)}
                      </div>
                    ) : record.status === '出勤中' ? (
                      <div className="bg-yellow-100 text-yellow-700 px-1 py-0.5 rounded text-center font-medium">
                        出勤中
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 凡例 */}
      <div className="mt-6 flex gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
          <span>退勤済み</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-100 border border-yellow-200 rounded"></div>
          <span>出勤中</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-50 border border-blue-500 rounded"></div>
          <span>今日</span>
        </div>
      </div>
    </div>
  );
}
