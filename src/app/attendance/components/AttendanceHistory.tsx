'use client';

import { useState } from 'react';
import { AttendanceRecord, WorkLocation } from '../../types';
import { formatMinutesToHourMinute } from '../../calendar/utils/dateUtils';

interface AttendanceHistoryProps {
  records: AttendanceRecord[];
  workLocations: WorkLocation[];
}

export default function AttendanceHistory({
  records,
  workLocations,
}: AttendanceHistoryProps) {
  const [selectedMonth, setSelectedMonth] = useState('2025-12');
  const [selectedWorkLocation, setSelectedWorkLocation] = useState('all');

  const filteredRecords = records
    .filter((record) => {
      const recordMonth = record.date.substring(0, 7);
      if (recordMonth !== selectedMonth) return false;
      if (
        selectedWorkLocation !== 'all' &&
        record.workLocationId !== selectedWorkLocation
      )
        return false;
      return true;
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      {/* フィルター */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">勤怠履歴</h2>

        <div className="flex gap-4">
          {/* 月選択 */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="2025-12">2025年12月</option>
            <option value="2025-11">2025年11月</option>
            <option value="2025-10">2025年10月</option>
          </select>

          {/* 勤務先選択 */}
          <select
            value={selectedWorkLocation}
            onChange={(e) => setSelectedWorkLocation(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">すべての勤務先</option>
            {workLocations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* テーブル */}
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
                出勤
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                退勤
              </th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                休憩
              </th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                実働時間
              </th>
              <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">
                ステータス
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((record) => {
              const workLocation = workLocations.find(
                (loc) => loc.id === record.workLocationId
              );
              return (
                <tr
                  key={record.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                    {record.date}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900">
                    {workLocation?.name}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {record.clockInTime || '-'}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {record.clockOutTime || '-'}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 text-right">
                    {record.breakMinutes > 0
                      ? formatMinutesToHourMinute(record.breakMinutes)
                      : '-'}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 font-bold text-right">
                    {record.workMinutes
                      ? formatMinutesToHourMinute(record.workMinutes)
                      : '-'}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        record.status === '退勤済み'
                          ? 'bg-gray-100 text-gray-700'
                          : record.status === '出勤中'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {record.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredRecords.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>該当する勤怠記録がありません</p>
          </div>
        )}
      </div>
    </div>
  );
}
