import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// レポート用のデータを取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const reportType = searchParams.get('type'); // 'pl' | 'category' | 'monthly'

    console.log('[GET /api/accounting/reports] Request params:', {
      userId,
      startDate,
      endDate,
      reportType,
    });

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate and endDate are required' },
        { status: 400 }
      );
    }

    // userIdがemailの場合、User IDに変換
    const user = await prisma.user.findUnique({
      where: { email: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const actualUserId = user.id;

    // 日付範囲を設定
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // レポートタイプに応じてデータを取得
    if (reportType === 'pl') {
      // 損益計算書（P/L）
      const plData = await generateProfitLossReport(actualUserId, start, end);
      return NextResponse.json(plData);
    } else if (reportType === 'category') {
      // カテゴリ別集計
      const categoryData = await generateCategoryReport(
        actualUserId,
        start,
        end
      );
      return NextResponse.json(categoryData);
    } else if (reportType === 'monthly') {
      // 月次推移レポート
      const monthlyData = await generateMonthlyReport(actualUserId, start, end);
      return NextResponse.json(monthlyData);
    } else {
      // すべてのレポートデータを取得（デフォルト）
      const [plData, categoryData, monthlyData] = await Promise.all([
        generateProfitLossReport(actualUserId, start, end),
        generateCategoryReport(actualUserId, start, end),
        generateMonthlyReport(actualUserId, start, end),
      ]);

      return NextResponse.json({
        profitLoss: plData,
        category: categoryData,
        monthly: monthlyData,
      });
    }
  } catch (error) {
    console.error('[GET /api/accounting/reports] Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// 損益計算書（P/L）レポートを生成
async function generateProfitLossReport(
  userId: string,
  startDate: Date,
  endDate: Date
) {
  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      client: true,
    },
  });

  let totalRevenue = 0;
  let totalExpense = 0;
  const revenueByCategory: Record<string, number> = {};
  const expenseByCategory: Record<string, number> = {};
  const revenueByClient: Record<
    string,
    { amount: number; transactions: number }
  > = {};

  transactions.forEach((transaction) => {
    if (transaction.type === '収入') {
      totalRevenue += transaction.amount;
      revenueByCategory[transaction.category] =
        (revenueByCategory[transaction.category] || 0) + transaction.amount;

      // 取引先別売上
      const clientName = transaction.client?.name || 'その他';
      if (!revenueByClient[clientName]) {
        revenueByClient[clientName] = { amount: 0, transactions: 0 };
      }
      revenueByClient[clientName].amount += transaction.amount;
      revenueByClient[clientName].transactions += 1;
    } else if (transaction.type === '経費') {
      totalExpense += transaction.amount;
      expenseByCategory[transaction.category] =
        (expenseByCategory[transaction.category] || 0) + transaction.amount;
    }
  });

  const profit = totalRevenue - totalExpense;
  const profitMargin =
    totalRevenue > 0 ? Math.round((profit / totalRevenue) * 100) : 0;

  // 取引先別売上をソート（TOP 10）
  const topClients = Object.entries(revenueByClient)
    .map(([client, data]) => ({
      client,
      amount: data.amount,
      transactions: data.transactions,
      contribution:
        totalRevenue > 0 ? Math.round((data.amount / totalRevenue) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10)
    .map((client, index) => ({
      rank: index + 1,
      ...client,
    }));

  return {
    totalRevenue,
    totalExpense,
    profit,
    profitMargin,
    revenueByCategory,
    expenseByCategory,
    topClients,
  };
}

// カテゴリ別集計レポートを生成
async function generateCategoryReport(
  userId: string,
  startDate: Date,
  endDate: Date
) {
  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  const categoryBreakdown: Record<
    string,
    { revenue: number; expense: number; count: number }
  > = {};

  transactions.forEach((transaction) => {
    if (!categoryBreakdown[transaction.category]) {
      categoryBreakdown[transaction.category] = {
        revenue: 0,
        expense: 0,
        count: 0,
      };
    }

    if (transaction.type === '収入') {
      categoryBreakdown[transaction.category].revenue += transaction.amount;
    } else if (transaction.type === '経費') {
      categoryBreakdown[transaction.category].expense += transaction.amount;
    }
    categoryBreakdown[transaction.category].count += 1;
  });

  // カテゴリ別データを配列に変換し、経費金額でソート
  const categories = Object.entries(categoryBreakdown)
    .map(([category, data]) => ({
      category,
      revenue: data.revenue,
      expense: data.expense,
      net: data.revenue - data.expense,
      count: data.count,
    }))
    .sort((a, b) => b.expense - a.expense);

  const totalExpense = categories.reduce((sum, cat) => sum + cat.expense, 0);

  // 経費カテゴリ別内訳（パーセンテージ付き）
  const expenseCategories = categories
    .filter((cat) => cat.expense > 0)
    .map((cat, index) => ({
      category: cat.category,
      amount: cat.expense,
      percentage:
        totalExpense > 0 ? Math.round((cat.expense / totalExpense) * 100) : 0,
      color: getCategoryColor(index),
    }));

  return {
    categories,
    expenseCategories,
    totalExpense,
  };
}

// 月次推移レポートを生成
async function generateMonthlyReport(
  userId: string,
  startDate: Date,
  endDate: Date
) {
  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: {
      date: 'asc',
    },
  });

  const monthlyData: Record<
    string,
    { revenue: number; expense: number; profit: number }
  > = {};

  transactions.forEach((transaction) => {
    const date = new Date(transaction.date);
    const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!monthlyData[yearMonth]) {
      monthlyData[yearMonth] = {
        revenue: 0,
        expense: 0,
        profit: 0,
      };
    }

    if (transaction.type === '収入') {
      monthlyData[yearMonth].revenue += transaction.amount;
    } else if (transaction.type === '経費') {
      monthlyData[yearMonth].expense += transaction.amount;
    }
  });

  // 利益を計算
  Object.keys(monthlyData).forEach((yearMonth) => {
    monthlyData[yearMonth].profit =
      monthlyData[yearMonth].revenue - monthlyData[yearMonth].expense;
  });

  // 月次データを配列に変換し、日付順にソート
  const monthlyArray = Object.entries(monthlyData)
    .map(([yearMonth, data]) => {
      const [year, month] = yearMonth.split('-');
      return {
        yearMonth,
        year: parseInt(year, 10),
        month: parseInt(month, 10),
        monthLabel: `${month}月`,
        ...data,
      };
    })
    .sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });

  return monthlyArray;
}

// カテゴリカラーを取得（インデックスベース）
function getCategoryColor(index: number): string {
  const colors = [
    '#4F7FFF',
    '#10b981',
    '#a855f7',
    '#f97316',
    '#eab308',
    '#ec4899',
    '#06b6d4',
    '#84cc16',
    '#f43f5e',
    '#9ca3af',
  ];
  return colors[index % colors.length];
}
