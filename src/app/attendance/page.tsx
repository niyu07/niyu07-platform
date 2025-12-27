'use client';

import { useState } from 'react';
import { AttendanceRecord, WorkLocation } from '../types';
import {
  mockAttendanceRecords,
  mockWorkLocations,
  mockCalendarEvents,
} from '../data/mockData';
import AttendanceDashboard from './components/AttendanceDashboard';
import AttendanceHistory from './components/AttendanceHistory';
import SalaryCalculator from './components/SalaryCalculator';
import CalendarImport from './components/CalendarImport';
import {
  calculateMonthlySummary,
  calculateWorkMinutes,
} from './utils/attendanceUtils';
import { exportSalaryToAccounting } from './utils/accountingIntegration';
import { formatDateISO } from '../calendar/utils/dateUtils';

type TabType = 'ダッシュボード' | '勤怠履歴' | '給与計算' | 'カレンダー連携';

export default function AttendancePage() {
  const [activeTab, setActiveTab] = useState<TabType>('ダッシュボード');
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >(mockAttendanceRecords);
  const [workLocations] = useState<WorkLocation[]>(mockWorkLocations);

  const tabs: TabType[] = [
    'ダッシュボード',
    '勤怠履歴',
    '給与計算',
    'カレンダー連携',
  ];

  // 出勤打刻ハンドラー
  const handleClockIn = (workLocationId: string, clockInTime: string) => {
    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      date: formatDateISO(new Date()),
      workLocationId,
      status: '出勤中',
      clockInTime,
      breakMinutes: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setAttendanceRecords([...attendanceRecords, newRecord]);
  };

  // 退勤打刻ハンドラー
  const handleClockOut = (
    recordId: string,
    clockOutTime: string,
    breakMinutes: number
  ) => {
    setAttendanceRecords(
      attendanceRecords.map((record) => {
        if (record.id === recordId) {
          const workMinutes = calculateWorkMinutes(
            record.clockInTime!,
            clockOutTime,
            breakMinutes
          );
          return {
            ...record,
            status: '退勤済み',
            clockOutTime,
            breakMinutes,
            workMinutes,
            updatedAt: new Date().toISOString(),
          };
        }
        return record;
      })
    );
  };

  // カレンダーインポートハンドラー
  const handleImportFromCalendar = (importedRecords: AttendanceRecord[]) => {
    setAttendanceRecords([...attendanceRecords, ...importedRecords]);
    setActiveTab('ダッシュボード');
    alert(`${importedRecords.length}件の勤怠記録をインポートしました`);
  };

  // 会計連携ハンドラー
  const handleExportToAccounting = () => {
    const summary = calculateMonthlySummary(
      attendanceRecords,
      workLocations,
      '2025-12'
    );
    const transactions = exportSalaryToAccounting(summary);
    // 実際のアプリでは mockTransactions に追加する
    alert(`${transactions.length}件の取引を会計システムに登録しました`);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'ダッシュボード':
        return (
          <AttendanceDashboard
            records={attendanceRecords}
            workLocations={workLocations}
            onClockIn={handleClockIn}
            onClockOut={handleClockOut}
          />
        );
      case '勤怠履歴':
        return (
          <AttendanceHistory
            records={attendanceRecords}
            workLocations={workLocations}
          />
        );
      case '給与計算':
        const summary = calculateMonthlySummary(
          attendanceRecords,
          workLocations,
          '2025-12'
        );
        return (
          <SalaryCalculator
            summary={summary}
            onExportToAccounting={handleExportToAccounting}
          />
        );
      case 'カレンダー連携':
        return (
          <CalendarImport
            calendarEvents={mockCalendarEvents}
            workLocations={workLocations}
            onImport={handleImportFromCalendar}
          />
        );
      default:
        return (
          <AttendanceDashboard
            records={attendanceRecords}
            workLocations={workLocations}
            onClockIn={handleClockIn}
            onClockOut={handleClockOut}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1400px] mx-auto p-6">
        {/* ヘッダー */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">勤怠管理</h1>
          <p className="text-gray-600">
            出退勤の記録、給与計算、勤務時間の可視化を一元管理します。
          </p>
        </div>

        {/* タブナビゲーション */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 whitespace-nowrap font-medium transition-colors border-b-2 ${
                  activeTab === tab
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-600 border-transparent hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* コンテンツエリア */}
        <div>{renderContent()}</div>
      </div>
    </div>
  );
}
