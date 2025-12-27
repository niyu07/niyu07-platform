'use client';

import { MonthlyAttendanceSummary } from '../../types';

interface MonthlySummaryCardsProps {
  summary: MonthlyAttendanceSummary;
}

export default function MonthlySummaryCards({
  summary,
}: MonthlySummaryCardsProps) {
  const totalWorkHours = Math.floor(summary.totalWorkMinutes / 60);
  const totalWorkMinutesRemainder = summary.totalWorkMinutes % 60;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* 総勤務時間カード */}
      <div className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="bg-white/20 rounded-lg p-3 text-2xl">⏰</div>
        </div>
        <div className="mt-4">
          <p className="text-sm text-white/80">総勤務時間</p>
          <p className="text-3xl font-bold mt-1">
            {totalWorkHours}時間
            {totalWorkMinutesRemainder > 0 && `${totalWorkMinutesRemainder}分`}
          </p>
          <p className="text-sm text-white/70 mt-2">今月の累計勤務時間</p>
        </div>
      </div>

      {/* 出勤日数カード */}
      <div className="bg-gradient-to-br from-green-400 to-green-500 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="bg-white/20 rounded-lg p-3 text-2xl">📅</div>
        </div>
        <div className="mt-4">
          <p className="text-sm text-white/80">出勤日数</p>
          <p className="text-3xl font-bold mt-1">{summary.totalWorkDays}日</p>
          <p className="text-sm text-white/70 mt-2">
            平均{' '}
            {summary.totalWorkDays > 0
              ? (summary.totalWorkMinutes / 60 / summary.totalWorkDays).toFixed(
                  1
                )
              : 0}
            h/日
          </p>
        </div>
      </div>

      {/* 推定収入カード */}
      <div className="bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="bg-white/20 rounded-lg p-3 text-2xl">💰</div>
        </div>
        <div className="mt-4">
          <p className="text-sm text-white/80">推定収入</p>
          <p className="text-3xl font-bold mt-1">
            ¥{summary.totalSalary.toLocaleString()}
          </p>
          <p className="text-sm text-white/70 mt-2">
            時給 ¥
            {summary.totalWorkMinutes > 0
              ? Math.floor(
                  summary.totalSalary / (summary.totalWorkMinutes / 60)
                ).toLocaleString()
              : 0}
          </p>
        </div>
      </div>
    </div>
  );
}
