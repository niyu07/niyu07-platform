import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 月別収支データの取得
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

    // 月別データを取得
    const monthlyData = await prisma.monthlyFinancialData.findMany({
      where: {
        userId,
        year: targetYear,
      },
      orderBy: {
        month: 'asc',
      },
    });

    // 1月〜12月の全てのデータを返す（データがない月は0埋め）
    const monthNames = [
      '1月',
      '2月',
      '3月',
      '4月',
      '5月',
      '6月',
      '7月',
      '8月',
      '9月',
      '10月',
      '11月',
      '12月',
    ];
    const fullYearData = monthNames.map((monthName, index) => {
      const monthNumber = index + 1;
      const data = monthlyData.find((d) => d.month === monthNumber);

      return {
        month: monthName,
        profit: data?.profit || 0,
        revenue: data?.revenue || 0,
        expense: data?.expense || 0,
      };
    });

    return NextResponse.json(fullYearData);
  } catch (error) {
    console.error('[GET /api/accounting/monthly-data] Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
