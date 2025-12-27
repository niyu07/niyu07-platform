import { CalendarEvent, AttendanceRecord } from '../../types';
import { getTimeDifferenceInMinutes } from '../../calendar/utils/dateUtils';

// カレンダーイベント → 勤怠記録に変換
export const convertCalendarEventToAttendance = (
  event: CalendarEvent,
  workLocationId: string
): Omit<AttendanceRecord, 'id' | 'createdAt' | 'updatedAt'> => {
  const workMinutes = getTimeDifferenceInMinutes(
    event.startTime,
    event.endTime
  );

  return {
    date: event.date,
    workLocationId,
    status: '退勤済み',
    clockInTime: event.startTime,
    clockOutTime: event.endTime,
    breakMinutes: 0, // デフォルト値、後で手動修正可能
    workMinutes,
  };
};

// 勤務イベント一括インポート
export const importAttendanceFromCalendar = (
  calendarEvents: CalendarEvent[],
  workLocationMap: Record<string, string> // location名 -> workLocationId のマップ
): AttendanceRecord[] => {
  return calendarEvents
    .filter((event) => event.type === '勤務')
    .map((event) => {
      const workLocationId = workLocationMap[event.location || ''] || 'wl-1'; // デフォルトは1番目の勤務先
      const baseRecord = convertCalendarEventToAttendance(
        event,
        workLocationId
      );
      return {
        ...baseRecord,
        id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });
};
