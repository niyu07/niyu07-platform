import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    // テストユーザーを作成
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'テストユーザー',
      },
    });

    // ポモドーロ設定を作成
    const settings = await prisma.pomodoroSettings.create({
      data: {
        userId: user.id,
        workDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        sessionsUntilLongBreak: 4,
        dailyGoal: 8,
        autoStartBreak: false,
        autoStartWork: false,
        soundEnabled: true,
      },
    });

    // テストセッションを作成
    const sessions = await prisma.pomodoroSession.createMany({
      data: [
        {
          userId: user.id,
          startTime: new Date('2025-12-28T09:00:00'),
          endTime: new Date('2025-12-28T09:25:00'),
          mode: '作業',
          category: 'Coding',
          durationMinutes: 25,
          completionStatus: '完走',
        },
        {
          userId: user.id,
          startTime: new Date('2025-12-28T09:30:00'),
          endTime: new Date('2025-12-28T09:35:00'),
          mode: '休憩',
          category: 'Coding',
          durationMinutes: 5,
          completionStatus: '完走',
        },
        {
          userId: user.id,
          startTime: new Date('2025-12-28T09:40:00'),
          endTime: new Date('2025-12-28T10:05:00'),
          mode: '作業',
          category: 'Design',
          durationMinutes: 25,
          completionStatus: '完走',
        },
      ],
    });

    return NextResponse.json({
      success: true,
      message: 'テストデータを作成しました',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        settings: {
          id: settings.id,
          dailyGoal: settings.dailyGoal,
        },
        sessionsCount: sessions.count,
      },
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'テストデータの作成に失敗しました',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// 既存のテストデータを削除
export async function DELETE() {
  try {
    // テストユーザーを削除（カスケードで関連データも削除される）
    await prisma.user.deleteMany({
      where: {
        email: 'test@example.com',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'テストデータを削除しました',
    });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'テストデータの削除に失敗しました',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
