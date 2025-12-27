import { AttendanceRecord } from '../../types';

// 時給制の給与計算
export const calculateHourlySalary = (
  records: AttendanceRecord[],
  hourlyRate: number
): number => {
  const totalMinutes = records.reduce(
    (sum, record) => sum + (record.workMinutes || 0),
    0
  );
  const totalHours = totalMinutes / 60;
  return Math.floor(totalHours * hourlyRate);
};

// 日給制の給与計算
export const calculateDailySalary = (
  records: AttendanceRecord[],
  dailyRate: number
): number => {
  const workDays = records.filter(
    (record) => record.status === '退勤済み'
  ).length;
  return dailyRate * workDays;
};

// 業務委託の給与計算（時間単価 × 時間）
export const calculateProjectSalary = (
  records: AttendanceRecord[],
  projectRate: number
): number => {
  const totalMinutes = records.reduce(
    (sum, record) => sum + (record.workMinutes || 0),
    0
  );
  const totalHours = totalMinutes / 60;
  return Math.floor(totalHours * projectRate);
};
