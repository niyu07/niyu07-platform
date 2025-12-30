// データベースとUIの型変換アダプター

import { AttendanceRecord } from '@/app/types';

// Prismaの型（データベース）
export interface DbAttendanceRecord {
  id: string;
  userId: string;
  workLocationId: string;
  date: Date;
  clockIn: Date | null;
  clockOut: Date | null;
  workMinutes: number | null;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
  workLocation?: {
    id: string;
    name: string;
  };
}

// データベース → UI型への変換
export function dbToUiAttendanceRecord(
  dbRecord: DbAttendanceRecord
): AttendanceRecord {
  const clockInTime = dbRecord.clockIn
    ? formatTime(dbRecord.clockIn)
    : undefined;
  const clockOutTime = dbRecord.clockOut
    ? formatTime(dbRecord.clockOut)
    : undefined;

  // ステータスを判定
  let status: '未出勤' | '出勤中' | '退勤済み' = '未出勤';
  if (clockInTime && clockOutTime) {
    status = '退勤済み';
  } else if (clockInTime) {
    status = '出勤中';
  }

  return {
    id: dbRecord.id,
    date: formatDate(dbRecord.date),
    workLocationId: dbRecord.workLocationId,
    status,
    clockInTime,
    clockOutTime,
    breakMinutes: 0, // 後で休憩時間機能を追加する場合に使用
    workMinutes: dbRecord.workMinutes ?? undefined,
    memo: dbRecord.note ?? undefined,
    createdAt: dbRecord.createdAt.toISOString(),
    updatedAt: dbRecord.updatedAt.toISOString(),
  };
}

// UI → データベース型への変換
export function uiToDbAttendanceRecord(
  uiRecord: Partial<AttendanceRecord>,
  userId: string
): {
  userId: string;
  date: Date;
  clockIn?: Date;
  clockOut?: Date;
  workMinutes?: number;
  note?: string;
} {
  const date = uiRecord.date ? parseDate(uiRecord.date) : new Date();
  date.setHours(0, 0, 0, 0);

  const result: {
    userId: string;
    date: Date;
    clockIn?: Date;
    clockOut?: Date;
    workMinutes?: number;
    note?: string;
  } = {
    userId,
    date,
  };

  if (uiRecord.clockInTime) {
    result.clockIn = parseDateTime(uiRecord.date!, uiRecord.clockInTime);
  }

  if (uiRecord.clockOutTime) {
    result.clockOut = parseDateTime(uiRecord.date!, uiRecord.clockOutTime);
  }

  if (uiRecord.workMinutes !== undefined) {
    result.workMinutes = uiRecord.workMinutes;
  }

  if (uiRecord.memo) {
    result.note = uiRecord.memo;
  }

  return result;
}

// 日付フォーマット: Date → YYYY-MM-DD
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 時刻フォーマット: Date → HH:MM
function formatTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

// 日付パース: YYYY-MM-DD → Date
function parseDate(dateStr: string): Date {
  return new Date(dateStr);
}

// 日時パース: YYYY-MM-DD + HH:MM → Date
function parseDateTime(dateStr: string, timeStr: string): Date {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date(dateStr);
  date.setHours(hours, minutes, 0, 0);
  return date;
}
