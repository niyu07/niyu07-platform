import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { addPomodoroToCalendar } from '@/lib/google-calendar';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      mode,
      category,
      durationMinutes,
      completionStatus,
      startTime,
      endTime,
      taskId,
      syncToCalendar, // カレンダー同期フラグ
    } = body;

    // バリデーション
    if (!userId || !mode || !category || !durationMinutes) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const sessionStartTime = startTime ? new Date(startTime) : new Date();
    const sessionEndTime = endTime ? new Date(endTime) : new Date();

    // セッションを作成
    const session = await prisma.pomodoroSession.create({
      data: {
        userId,
        mode,
        category,
        durationMinutes,
        completionStatus: completionStatus || '完走',
        startTime: sessionStartTime,
        endTime: sessionEndTime,
        taskId,
      },
    });

    // Googleカレンダーに同期（オプション）
    let calendarEventId = null;
    if (syncToCalendar && completionStatus === '完走' && mode === '作業') {
      try {
        const calendarEvent = await addPomodoroToCalendar(userId, {
          startTime: sessionStartTime,
          endTime: sessionEndTime,
          mode,
          category,
          durationMinutes,
        });
        calendarEventId = calendarEvent.id;
        console.log('✅ Googleカレンダーに同期しました:', calendarEventId);
      } catch (calendarError) {
        console.error(
          '⚠️ カレンダー同期エラー（セッションは保存済み）:',
          calendarError
        );
        // カレンダー同期エラーでもセッションは保存されている
      }
    }

    return NextResponse.json({ ...session, calendarEventId }, { status: 201 });
  } catch (error) {
    console.error('Error creating pomodoro session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // クエリ条件を構築
    const where: {
      userId: string;
      startTime?: {
        gte?: Date;
        lte?: Date;
      };
    } = { userId };

    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) {
        where.startTime.gte = new Date(startDate);
      }
      if (endDate) {
        where.startTime.lte = new Date(endDate);
      }
    }

    // セッションを取得
    const sessions = await prisma.pomodoroSession.findMany({
      where,
      orderBy: {
        startTime: 'desc',
      },
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Error fetching pomodoro sessions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
