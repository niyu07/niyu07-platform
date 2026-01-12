import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getSignedUrl } from '@/lib/upload';

/**
 * GET /api/accounting/export
 * 年次データエクスポート用データ取得
 * クエリパラメータ:
 * - year: エクスポート対象年（YYYY形式）
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: '認証が必要です' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get('year');

    if (!yearParam) {
      return NextResponse.json(
        { success: false, message: '年の指定が必要です' },
        { status: 400 }
      );
    }

    const year = parseInt(yearParam, 10);
    if (isNaN(year) || year < 2000 || year > 2100) {
      return NextResponse.json(
        { success: false, message: '有効な年を指定してください' },
        { status: 400 }
      );
    }

    // 指定年の期間を計算（1月1日〜12月31日）
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59, 999);

    // 取引データを取得
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        client: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    // 領収書データを取得（OCR結果含む）
    const receipts = await prisma.receipt.findMany({
      where: {
        userId: session.user.id,
        status: 'completed',
        ocrData: {
          transactionDate: {
            gte: startDate,
            lte: endDate,
          },
        },
      },
      include: {
        ocrData: true,
      },
      orderBy: {
        uploadedAt: 'asc',
      },
    });

    // 領収書画像の署名付きURLを生成
    const receiptsWithSignedUrls = await Promise.all(
      receipts.map(async (receipt) => {
        try {
          const urlParts = receipt.imageUrl.split('/receipts/');
          if (urlParts.length > 1) {
            const filePath = urlParts[1];
            const signedUrl = await getSignedUrl(filePath, 3600);
            return { ...receipt, imageUrl: signedUrl };
          }
          return receipt;
        } catch (error) {
          console.error(
            'Failed to generate signed URL for receipt:',
            receipt.id,
            error
          );
          return receipt;
        }
      })
    );

    // 月別集計データを計算
    const monthlyData = [];
    for (let month = 0; month < 12; month++) {
      const monthTransactions = transactions.filter((t) => {
        const date = new Date(t.date);
        return date.getMonth() === month;
      });

      const revenue = monthTransactions
        .filter((t) => t.type === '収入')
        .reduce((sum, t) => sum + t.amount, 0);

      const expense = monthTransactions
        .filter((t) => t.type === '経費')
        .reduce((sum, t) => sum + t.amount, 0);

      monthlyData.push({
        month: month + 1,
        revenue,
        expense,
        profit: revenue - expense,
        transactionCount: monthTransactions.length,
      });
    }

    // カテゴリ別集計
    const categoryData: Record<
      string,
      { revenue: number; expense: number; count: number }
    > = {};

    transactions.forEach((t) => {
      if (!categoryData[t.category]) {
        categoryData[t.category] = { revenue: 0, expense: 0, count: 0 };
      }
      if (t.type === '収入') {
        categoryData[t.category].revenue += t.amount;
      } else {
        categoryData[t.category].expense += t.amount;
      }
      categoryData[t.category].count += 1;
    });

    // 年間合計
    const totalRevenue = transactions
      .filter((t) => t.type === '収入')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions
      .filter((t) => t.type === '経費')
      .reduce((sum, t) => sum + t.amount, 0);

    return NextResponse.json({
      success: true,
      data: {
        year,
        summary: {
          totalRevenue,
          totalExpense,
          totalProfit: totalRevenue - totalExpense,
          transactionCount: transactions.length,
          receiptCount: receipts.length,
        },
        transactions,
        receipts: receiptsWithSignedUrls,
        monthlyData,
        categoryData,
      },
    });
  } catch (error) {
    console.error('Export data fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'データの取得に失敗しました' },
      { status: 500 }
    );
  }
}
