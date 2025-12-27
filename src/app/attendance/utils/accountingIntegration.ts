import { Transaction, MonthlyAttendanceSummary } from '../../types';

// 月次給与 → 会計取引に変換
export const convertSalaryToTransaction = (
  summary: MonthlyAttendanceSummary,
  workLocationName: string,
  salary: number
): Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> => {
  const [year, month] = summary.month.split('-');
  const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();

  return {
    date: `${year}/${month}/${String(lastDay).padStart(2, '0')}`,
    type: '収入',
    category: '業務委託',
    detail: `${workLocationName} 給与（${year}年${month}月）`,
    amount: salary,
    client: workLocationName,
    taxCategory: '課税',
  };
};

// 勤務先別に会計取引を生成
export const exportSalaryToAccounting = (
  summary: MonthlyAttendanceSummary
): Transaction[] => {
  return summary.workLocationBreakdown.map((breakdown) => {
    const baseTransaction = convertSalaryToTransaction(
      summary,
      breakdown.workLocationName,
      breakdown.salary
    );
    return {
      ...baseTransaction,
      id: `trans-${Date.now()}-${breakdown.workLocationId}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });
};
