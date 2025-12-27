'use client';

import { MonthlyAttendanceSummary } from '../../types';

interface SalaryCalculatorProps {
  summary: MonthlyAttendanceSummary;
  onExportToAccounting: () => void;
}

export default function SalaryCalculator({
  summary,
  onExportToAccounting,
}: SalaryCalculatorProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">給与計算</h2>
        <button
          onClick={onExportToAccounting}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors text-sm"
        >
          会計に反映
        </button>
      </div>

      <div className="space-y-6">
        {/* 勤務先別給与明細 */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            勤務先別給与明細（{summary.month}）
          </h3>

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
                    基本給
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
                      className="border-b border-gray-100"
                    >
                      <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                        {item.workLocationName}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 text-right">
                        {hours}時間{minutes > 0 && `${minutes}分`}
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
                <tr className="bg-blue-50 font-bold">
                  <td className="py-4 px-4 text-sm text-gray-900">総支給額</td>
                  <td className="py-4 px-4 text-sm text-gray-900 text-right">
                    {Math.floor(summary.totalWorkMinutes / 60)}時間
                    {summary.totalWorkMinutes % 60 > 0 &&
                      `${summary.totalWorkMinutes % 60}分`}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-900 text-right">
                    {summary.totalWorkDays}日
                  </td>
                  <td className="py-4 px-4 text-lg text-green-700 font-bold text-right">
                    ¥{summary.totalSalary.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 注意事項 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <span className="font-semibold">注意:</span>{' '}
            この金額は基本給のみです。深夜手当や休日手当は含まれていません。
          </p>
        </div>
      </div>
    </div>
  );
}
