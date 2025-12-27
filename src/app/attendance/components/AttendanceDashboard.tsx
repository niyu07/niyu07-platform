'use client';

import { AttendanceRecord, WorkLocation, AttendanceStatus } from '../../types';
import {
  getTodayRecord,
  calculateMonthlySummary,
  calculateWeeklyData,
} from '../utils/attendanceUtils';
import ClockInCard from './ClockInCard';
import MonthlySummaryCards from './MonthlySummaryCards';
import WeeklyWorkChart from './WeeklyWorkChart';
import WorkLocationTable from './WorkLocationTable';
import { formatMinutesToHourMinute } from '../../calendar/utils/dateUtils';

interface AttendanceDashboardProps {
  records: AttendanceRecord[];
  workLocations: WorkLocation[];
  onClockIn: (workLocationId: string, clockInTime: string) => void;
  onClockOut: (
    recordId: string,
    clockOutTime: string,
    breakMinutes: number
  ) => void;
}

export default function AttendanceDashboard({
  records,
  workLocations,
  onClockIn,
  onClockOut,
}: AttendanceDashboardProps) {
  const selectedMonth = '2025-12';

  // 今日の勤怠記録を取得
  const todayRecord = getTodayRecord(records);
  const currentStatus: AttendanceStatus = todayRecord?.status || '未出勤';

  // 月次サマリーを計算
  const monthlySummary = calculateMonthlySummary(
    records,
    workLocations,
    selectedMonth
  );

  // 週間データを計算
  const weeklyData = calculateWeeklyData(records, selectedMonth);

  // 最近の勤怠履歴（5件）
  const recentRecords = records
    .filter((r) => r.status === '退勤済み')
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* 出勤打刻カード */}
      <ClockInCard
        currentStatus={currentStatus}
        todayRecord={todayRecord}
        workLocations={workLocations}
        onClockIn={onClockIn}
        onClockOut={onClockOut}
      />

      {/* 月次サマリーカード（3枚） */}
      <MonthlySummaryCards summary={monthlySummary} />

      {/* 2カラムレイアウト */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 週間勤務時間グラフ */}
        <WeeklyWorkChart weeklyData={weeklyData} />

        {/* 勤務先別集計テーブル */}
        <WorkLocationTable summary={monthlySummary} />
      </div>

      {/* 最近の勤怠履歴 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">最近の勤怠履歴</h2>

        {recentRecords.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>勤怠記録がありません</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    日付
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    勤務先
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    勤務時間
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                    実働時間
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentRecords.map((record) => {
                  const workLocation = workLocations.find(
                    (loc) => loc.id === record.workLocationId
                  );
                  return (
                    <tr
                      key={record.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                        {record.date}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {workLocation?.name}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {record.clockInTime} - {record.clockOutTime}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900 font-bold text-right">
                        {record.workMinutes
                          ? formatMinutesToHourMinute(record.workMinutes)
                          : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
