import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * 使用上限を変更
 * PATCH /api/ocr-usage/limit
 * ボディ:
 * - limit: number (新しい上限値)
 */
export async function PATCH(request: NextRequest) {
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

    const body = await request.json();
    const { limit } = body;

    // バリデーション
    if (typeof limit !== 'number' || limit < 0 || limit > 10000) {
      return NextResponse.json(
        { error: '上限値は0〜10,000の範囲で指定してください' },
        { status: 400 }
      );
    }

    // 現在の月を取得
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const currentMonth = `${year}-${month}`;

    // 当月の全てのAPIタイプの使用量レコードの上限を更新
    const updateResult = await prisma.apiUsageLog.updateMany({
      where: {
        userId: user.id,
        month: currentMonth,
      },
      data: {
        limit,
      },
    });

    console.log(
      `[PATCH /api/ocr-usage/limit] Updated ${updateResult.count} records for user ${user.id} to limit ${limit}`
    );

    // まだレコードが存在しない場合、新しいレコードを作成しておく
    // （各APIタイプ用のプレースホルダー）
    if (updateResult.count === 0) {
      const apiTypes = ['vision', 'calendar', 'tasks', 'gmail'];
      for (const apiType of apiTypes) {
        await prisma.apiUsageLog.upsert({
          where: {
            userId_apiType_month: {
              userId: user.id,
              apiType,
              month: currentMonth,
            },
          },
          update: {
            limit,
          },
          create: {
            userId: user.id,
            apiType,
            month: currentMonth,
            count: 0,
            limit,
          },
        });
      }
      console.log(
        `[PATCH /api/ocr-usage/limit] Created new usage logs for user ${user.id} with limit ${limit}`
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        limit,
        updatedRecords: updateResult.count,
      },
    });
  } catch (error) {
    console.error('[PATCH /api/ocr-usage/limit] Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
