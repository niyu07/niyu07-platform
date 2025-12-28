import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // データベース接続テスト
    await prisma.$connect();

    // ユーザー数をカウント（テーブルが存在するか確認）
    const userCount = await prisma.user.count();

    return NextResponse.json({
      success: true,
      message: 'データベース接続成功！',
      data: {
        userCount,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'データベース接続エラー',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
