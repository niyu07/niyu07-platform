import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  checkGoogleAuthStatus,
  clearInvalidGoogleAuth,
} from '@/lib/google-auth';
import { prisma } from '@/lib/prisma';

/**
 * Google認証状態を確認
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      );
    }

    const status = await checkGoogleAuthStatus(user.id);

    return NextResponse.json(status);
  } catch (error) {
    console.error('❌ Google認証状態確認エラー:', error);
    return NextResponse.json(
      { error: '認証状態の確認中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

/**
 * 無効なGoogle認証情報を削除
 */
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      );
    }

    const cleared = await clearInvalidGoogleAuth(user.id);

    return NextResponse.json({
      success: cleared,
      message: cleared
        ? 'Google認証情報を削除しました'
        : '削除する認証情報が見つかりませんでした',
    });
  } catch (error) {
    console.error('❌ Google認証情報削除エラー:', error);
    return NextResponse.json(
      { error: '認証情報の削除中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
