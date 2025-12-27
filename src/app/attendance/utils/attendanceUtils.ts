import {
  AttendanceRecord,
  WorkLocation,
  MonthlyAttendanceSummary,
  WeeklyWorkData,
} from '../../types';
import {
  timeToMinutes,
  formatDateISO,
  getWeekStart,
  generateWeek,
} from '../../calendar/utils/dateUtils';
import {
  calculateHourlySalary,
  calculateDailySalary,
  calculateProjectSalary,
} from './salaryUtils';

// 実働時間を計算（退勤 - 出勤 - 休憩）
export const calculateWorkMinutes = (
  clockInTime: string,
  clockOutTime: string,
  breakMinutes: number
): number => {
  const start = timeToMinutes(clockInTime);
  const end = timeToMinutes(clockOutTime);
  const totalMinutes = end - start;
  return Math.max(0, totalMinutes - breakMinutes);
};

// 今日の勤怠記録を取得
export const getTodayRecord = (
  records: AttendanceRecord[]
): AttendanceRecord | undefined => {
  const today = formatDateISO(new Date());
  return records.find((record) => record.date === today);
};

// 特定月の勤怠記録を取得
export const getRecordsForMonth = (
  records: AttendanceRecord[],
  month: string // YYYY-MM
): AttendanceRecord[] => {
  return records.filter((record) => record.date.startsWith(month));
};

// 月次サマリーを計算
export const calculateMonthlySummary = (
  records: AttendanceRecord[],
  workLocations: WorkLocation[],
  month: string
): MonthlyAttendanceSummary => {
  const monthRecords = getRecordsForMonth(records, month);

  // 総勤務時間
  const totalWorkMinutes = monthRecords.reduce(
    (sum, record) => sum + (record.workMinutes || 0),
    0
  );

  // 出勤日数（退勤済みのみカウント）
  const totalWorkDays = monthRecords.filter(
    (record) => record.status === '退勤済み'
  ).length;

  // 勤務先別集計
  const workLocationBreakdown = workLocations.map((location) => {
    const locationRecords = monthRecords.filter(
      (record) =>
        record.workLocationId === location.id && record.status === '退勤済み'
    );

    const workMinutes = locationRecords.reduce(
      (sum, record) => sum + (record.workMinutes || 0),
      0
    );

    const workDays = locationRecords.length;

    // 給与計算
    let salary = 0;
    if (location.type === '時給制' && location.hourlyRate) {
      salary = calculateHourlySalary(locationRecords, location.hourlyRate);
    } else if (location.type === '日給制' && location.dailyRate) {
      salary = calculateDailySalary(locationRecords, location.dailyRate);
    } else if (location.type === '業務委託' && location.projectRate) {
      salary = calculateProjectSalary(locationRecords, location.projectRate);
    }

    return {
      workLocationId: location.id,
      workLocationName: location.name,
      workMinutes,
      workDays,
      salary,
    };
  });

  // 総収入
  const totalSalary = workLocationBreakdown.reduce(
    (sum, item) => sum + item.salary,
    0
  );

  return {
    month,
    totalWorkMinutes,
    totalWorkDays,
    totalSalary,
    workLocationBreakdown,
  };
};

// 週間勤務時間データを生成（グラフ用）
export const calculateWeeklyData = (
  records: AttendanceRecord[],
  month: string
): WeeklyWorkData[] => {
  const monthRecords = getRecordsForMonth(records, month);

  // 当月の最終週を取得（今日を含む週）
  const today = new Date();
  const weekStart = getWeekStart(today);
  const weekDates = generateWeek(weekStart);

  const weekdays = ['月', '火', '水', '木', '金', '土', '日'];

  return weekDates.map((date, index) => {
    const dateStr = formatDateISO(date);
    const dayRecords = monthRecords.filter((record) => record.date === dateStr);

    const workMinutes = dayRecords.reduce(
      (sum, record) => sum + (record.workMinutes || 0),
      0
    );

    return {
      dayOfWeek: weekdays[index],
      workMinutes,
      date: dateStr,
    };
  });
};
