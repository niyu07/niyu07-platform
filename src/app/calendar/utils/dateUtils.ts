import { CalendarEvent, FreeTime, DayScheduleSummary } from '../../types';

// 日付フォーマット関数
export const formatDate = (date: Date): string => {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  const weekday = weekdays[date.getDay()];
  return `${month}月${day}日(${weekday})`;
};

export const formatDateLong = (date: Date): string => {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  const weekday = weekdays[date.getDay()];
  return `${date.getFullYear()}年${month}月${day}日(${weekday})`;
};

export const formatYearMonth = (date: Date): string => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  return `${year}年${month}月`;
};

export const formatTime = (time: string): string => {
  // HH:MM format をそのまま返す
  return time;
};

// YYYY-MM-DD形式に変換
export const formatDateISO = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// YYYY-MM-DD形式からDateオブジェクトに変換
export const parseISODate = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

// 曜日名を取得（日本語）
export const getWeekdayName = (date: Date): string => {
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  return weekdays[date.getDay()];
};

// 月の最初の日を取得
export const getFirstDayOfMonth = (year: number, month: number): Date => {
  return new Date(year, month, 1);
};

// 月の最後の日を取得
export const getLastDayOfMonth = (year: number, month: number): Date => {
  return new Date(year, month + 1, 0);
};

// 月のカレンダーグリッドを生成（前月・翌月の日付を含む）
export const generateMonthCalendar = (
  year: number,
  month: number
): Date[][] => {
  const firstDay = getFirstDayOfMonth(year, month);
  const lastDay = getLastDayOfMonth(year, month);
  const firstDayOfWeek = firstDay.getDay(); // 0: 日曜日
  const lastDate = lastDay.getDate();

  const calendar: Date[][] = [];
  let week: Date[] = [];

  // 前月の日付で埋める
  const prevMonthLastDay = new Date(year, month, 0);
  const prevMonthLastDate = prevMonthLastDay.getDate();
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    week.push(new Date(year, month - 1, prevMonthLastDate - i));
  }

  // 当月の日付
  for (let date = 1; date <= lastDate; date++) {
    week.push(new Date(year, month, date));
    if (week.length === 7) {
      calendar.push(week);
      week = [];
    }
  }

  // 翌月の日付で埋める
  if (week.length > 0) {
    const remaining = 7 - week.length;
    for (let date = 1; date <= remaining; date++) {
      week.push(new Date(year, month + 1, date));
    }
    calendar.push(week);
  }

  return calendar;
};

// 週の開始日を取得
export const getWeekStart = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // 月曜日始まり
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

// 週の配列を生成（月曜〜日曜）
export const generateWeek = (startDate: Date): Date[] => {
  const week: Date[] = [];
  const start = new Date(startDate);
  for (let i = 0; i < 7; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    week.push(date);
  }
  return week;
};

// 時刻から分に変換
export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

// 分から時刻に変換
export const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

// 2つの時刻の差を分で取得
export const getTimeDifferenceInMinutes = (
  startTime: string,
  endTime: string
): number => {
  return timeToMinutes(endTime) - timeToMinutes(startTime);
};

// 分を時間表記に変換（例: 90 → "1時間30分"）
export const formatMinutesToHourMinute = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0 && mins > 0) {
    return `${hours}時間${mins}分`;
  } else if (hours > 0) {
    return `${hours}時間`;
  } else {
    return `${mins}分`;
  }
};

// 特定の日付のイベントを取得
export const getEventsForDate = (
  events: CalendarEvent[],
  date: Date
): CalendarEvent[] => {
  const dateStr = formatDateISO(date);
  return events.filter((event) => event.date === dateStr);
};

// 空き時間を計算
export const calculateFreeTimes = (
  events: CalendarEvent[],
  date: Date,
  workingHours: { start: string; end: string }
): FreeTime[] => {
  const dateStr = formatDateISO(date);
  const dayEvents = getEventsForDate(events, date);

  if (dayEvents.length === 0) {
    // イベントがない場合は全体が空き時間
    const totalMinutes = getTimeDifferenceInMinutes(
      workingHours.start,
      workingHours.end
    );
    return [
      {
        id: `free-${dateStr}-1`,
        date: dateStr,
        startTime: workingHours.start,
        endTime: workingHours.end,
        durationMinutes: totalMinutes,
        suggestedUse: '作業',
      },
    ];
  }

  // イベントを時刻順にソート
  const sortedEvents = [...dayEvents].sort((a, b) =>
    a.startTime.localeCompare(b.startTime)
  );

  const freeTimes: FreeTime[] = [];
  let currentTime = workingHours.start;

  sortedEvents.forEach((event, index) => {
    // イベント開始前の空き時間
    if (currentTime < event.startTime) {
      const durationMinutes = getTimeDifferenceInMinutes(
        currentTime,
        event.startTime
      );
      if (durationMinutes >= 30) {
        // 30分以上の空き時間のみ記録
        freeTimes.push({
          id: `free-${dateStr}-${index + 1}`,
          date: dateStr,
          startTime: currentTime,
          endTime: event.startTime,
          durationMinutes,
          suggestedUse: getSuggestedUse(currentTime, durationMinutes),
        });
      }
    }
    currentTime = event.endTime > currentTime ? event.endTime : currentTime;
  });

  // 最後のイベント後の空き時間
  if (currentTime < workingHours.end) {
    const durationMinutes = getTimeDifferenceInMinutes(
      currentTime,
      workingHours.end
    );
    if (durationMinutes >= 30) {
      freeTimes.push({
        id: `free-${dateStr}-last`,
        date: dateStr,
        startTime: currentTime,
        endTime: workingHours.end,
        durationMinutes,
        suggestedUse: getSuggestedUse(currentTime, durationMinutes),
      });
    }
  }

  return freeTimes;
};

// 空き時間の推奨用途を判定
const getSuggestedUse = (
  startTime: string,
  durationMinutes: number
): '昼休み' | '移動' | '作業' | '休憩' => {
  const startMinutes = timeToMinutes(startTime);
  const noon = timeToMinutes('12:00');
  const afternoon = timeToMinutes('14:00');

  // 昼時（12:00〜14:00の間）
  if (startMinutes >= noon && startMinutes < afternoon) {
    return '昼休み';
  }

  // 時間が短い（30分〜60分）
  if (durationMinutes < 60) {
    return '休憩';
  }

  // 1時間以上
  return '作業';
};

// 日次スケジュールサマリーを生成
export const generateDayScheduleSummary = (
  events: CalendarEvent[],
  date: Date,
  workingHours: { start: string; end: string }
): DayScheduleSummary => {
  const dateStr = formatDateISO(date);
  const dayEvents = getEventsForDate(events, date);
  const freeTimes = calculateFreeTimes(events, date, workingHours);

  const totalBusyMinutes = dayEvents.reduce((total, event) => {
    return total + getTimeDifferenceInMinutes(event.startTime, event.endTime);
  }, 0);

  const totalFreeMinutes = freeTimes.reduce((total, freeTime) => {
    return total + freeTime.durationMinutes;
  }, 0);

  return {
    date: dateStr,
    eventCount: dayEvents.length,
    totalBusyMinutes,
    totalFreeMinutes,
    events: dayEvents,
    freeTimes,
  };
};

// 今日かどうかを判定
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

// 同じ日付かどうかを判定
export const isSameDate = (date1: Date, date2: Date): boolean => {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
};

// 同じ月かどうかを判定
export const isSameMonth = (
  date: Date,
  year: number,
  month: number
): boolean => {
  return date.getFullYear() === year && date.getMonth() === month;
};
