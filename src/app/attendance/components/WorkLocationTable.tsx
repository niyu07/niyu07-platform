'use client';

import { MonthlyAttendanceSummary } from '../../types';

interface WorkLocationTableProps {
  summary: MonthlyAttendanceSummary;
}

export default function WorkLocationTable({ summary }: WorkLocationTableProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-4">勤務先別集計</h2>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                勤務先
              </th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                勤務時間
              </th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                日数
              </th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                収入
              </th>
            </tr>
          </thead>
          <tbody>
            {summary.workLocationBreakdown.map((item) => {
              const hours = Math.floor(item.workMinutes / 60);
              const minutes = item.workMinutes % 60;

              return (
                <tr
                  key={item.workLocationId}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                    {item.workLocationName}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 text-right">
                    {hours}時間
                    {minutes > 0 && `${minutes}分`}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 text-right">
                    {item.workDays}日
                  </td>
                  <td className="py-3 px-4 text-sm text-green-600 font-bold text-right">
                    ¥{item.salary.toLocaleString()}
                  </td>
                </tr>
              );
            })}

            {/* 合計行 */}
            <tr className="bg-gray-50 font-bold">
              <td className="py-3 px-4 text-sm text-gray-900">合計</td>
              <td className="py-3 px-4 text-sm text-gray-900 text-right">
                {Math.floor(summary.totalWorkMinutes / 60)}時間
                {summary.totalWorkMinutes % 60 > 0 &&
                  `${summary.totalWorkMinutes % 60}分`}
              </td>
              <td className="py-3 px-4 text-sm text-gray-900 text-right">
                {summary.totalWorkDays}日
              </td>
              <td className="py-3 px-4 text-sm text-green-700 font-bold text-right">
                ¥{summary.totalSalary.toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
