import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDetailedUsage } from '@/lib/api-usage';

/**
 * OCR使用状況を取得
 * GET /api/ocr-usage
 * クエリパラメータ:
 * - months: 取得する月数（デフォルト: 6）
 */
export async function GET(request: NextRequest) {
  try {
    // 認証チェック
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ユーザー情報を取得
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const monthsParam = searchParams.get('months');
    const months = monthsParam ? parseInt(monthsParam, 10) : 6;

    // 現在の月と過去N-1ヶ月の月リストを生成（YYYY-MM形式）
    const monthList: string[] = [];
    const now = new Date();
    for (let i = 0; i < months; i++) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = targetDate.getFullYear();
      const month = String(targetDate.getMonth() + 1).padStart(2, '0');
      monthList.push(`${year}-${month}`);
    }

    // 月ごとの使用状況を取得
    const usageLogs = await prisma.apiUsageLog.findMany({
      where: {
        userId: user.id,
        month: {
          in: monthList,
        },
      },
      orderBy: {
        month: 'desc',
      },
    });

    // 月ごとにグループ化
    const monthlyUsage: Record<
      string,
      {
        month: string;
        total: number;
        limit: number;
        breakdown: Record<string, number>;
      }
    > = {};

    for (const month of monthList) {
      monthlyUsage[month] = {
        month,
        total: 0,
        limit: 900, // デフォルト上限
        breakdown: {},
      };
    }

    for (const log of usageLogs) {
      if (monthlyUsage[log.month]) {
        monthlyUsage[log.month].total += log.count;
        monthlyUsage[log.month].breakdown[log.apiType] = log.count;
        monthlyUsage[log.month].limit = log.limit; // 上限を更新
      }
    }

    // 配列に変換（月順にソート済み）
    const history = Object.values(monthlyUsage);

    // 現在の詳細使用状況を取得
    const currentUsage = await getDetailedUsage(user.id);

    return NextResponse.json({
      success: true,
      data: {
        current: {
          count: currentUsage.count,
          limit: currentUsage.limit,
          remaining: currentUsage.remaining,
          isOverLimit: currentUsage.isOverLimit,
          percentage: currentUsage.percentage,
          breakdown: currentUsage.breakdown,
        },
        history,
      },
    });
  } catch (error) {
    console.error('[GET /api/ocr-usage] Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
