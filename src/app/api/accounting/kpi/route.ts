import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// KPIデータの取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const year = searchParams.get('year');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const targetYear = year ? parseInt(year, 10) : new Date().getFullYear();

    // 年度の開始日と終了日
    const startOfYear = new Date(targetYear, 0, 1);
    const endOfYear = new Date(targetYear, 11, 31, 23, 59, 59, 999);

    // 今年の取引を取得
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: startOfYear,
          lte: endOfYear,
        },
      },
    });

    // 収入と経費を計算
    let yearRevenue = 0;
    let yearExpense = 0;

    transactions.forEach((transaction) => {
      if (transaction.type === '収入') {
        yearRevenue += transaction.amount;
      } else if (transaction.type === '経費') {
        yearExpense += transaction.amount;
      }
    });

    // 会計設定を取得
    const settings = await prisma.accountingSettings.findUnique({
      where: { userId },
    });

    const blueReturnDeduction = settings?.blueReturnDeduction || 650000;
    const dependentIncomeLimit = settings?.dependentIncomeLimit || 480000;

    // 事業所得（青色控除後）
    const businessIncome = Math.max(
      0,
      yearRevenue - yearExpense - blueReturnDeduction
    );

    // 扶養枠の残り
    const dependentRemaining = Math.max(
      0,
      dependentIncomeLimit - businessIncome
    );

    // 経費率
    const expenseRate =
      yearRevenue > 0 ? Math.round((yearExpense / yearRevenue) * 100) : 0;

    // 前年比を計算（簡易版：前年のデータがあれば計算）
    const lastYear = targetYear - 1;
    const lastYearStart = new Date(lastYear, 0, 1);
    const lastYearEnd = new Date(lastYear, 11, 31, 23, 59, 59, 999);

    const lastYearTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: lastYearStart,
          lte: lastYearEnd,
        },
      },
    });

    let lastYearRevenue = 0;
    lastYearTransactions.forEach((transaction) => {
      if (transaction.type === '収入') {
        lastYearRevenue += transaction.amount;
      }
    });

    const yearRevenueChange =
      lastYearRevenue > 0
        ? parseFloat(
            (((yearRevenue - lastYearRevenue) / lastYearRevenue) * 100).toFixed(
              1
            )
          )
        : 0;

    const kpi = {
      yearRevenue,
      yearRevenueChange,
      yearExpense,
      expenseRate,
      businessIncome,
      dependentRemaining,
    };

    return NextResponse.json(kpi);
  } catch (error) {
    console.error('[GET /api/accounting/kpi] Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
