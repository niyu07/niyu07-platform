import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const period = searchParams.get('period') || 'today'; // today, week, month

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // 期間の開始日時を計算
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        const dayOfWeek = now.getDay();
        const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // 月曜日始まり
        startDate = new Date(now.getFullYear(), now.getMonth(), diff);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    // セッションを取得
    const sessions = await prisma.pomodoroSession.findMany({
      where: {
        userId,
        startTime: {
          gte: startDate,
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    // 基本統計
    const totalSessions = sessions.length;
    const focusSessions = sessions.filter((s) => s.mode === '作業');
    const totalFocusTime = focusSessions.reduce(
      (sum, s) => sum + s.durationMinutes,
      0
    );
    const totalBreakTime = sessions
      .filter((s) => s.mode === '休憩' || s.mode === '長休憩')
      .reduce((sum, s) => sum + s.durationMinutes, 0);

    // カテゴリ別集計
    const categoryMap = new Map<
      string,
      { minutes: number; sessionCount: number }
    >();
    focusSessions.forEach((session) => {
      const category = session.category || 'Other';
      const current = categoryMap.get(category) || {
        minutes: 0,
        sessionCount: 0,
      };
      categoryMap.set(category, {
        minutes: current.minutes + session.durationMinutes,
        sessionCount: current.sessionCount + 1,
      });
    });

    const categoryStats = Array.from(categoryMap.entries()).map(
      ([category, data]) => ({
        category,
        totalMinutes: data.minutes,
        percentage:
          totalFocusTime > 0 ? (data.minutes / totalFocusTime) * 100 : 0,
        sessionCount: data.sessionCount,
      })
    );

    // 週次データの場合、日別の詳細を計算
    let dailyStats = null;
    if (period === 'week') {
      const weekDays = ['月', '火', '水', '木', '金', '土', '日'];
      const dailyMap = new Map<string, typeof sessions>();

      // 日付ごとにセッションをグループ化
      sessions.forEach((session) => {
        const date = new Date(session.startTime);
        const dateKey = date.toISOString().split('T')[0];
        const existing = dailyMap.get(dateKey) || [];
        dailyMap.set(dateKey, [...existing, session]);
      });

      // 週の全日付を生成
      const weekStart = new Date(startDate);
      dailyStats = Array.from({ length: 7 }, (_, i) => {
        const currentDate = new Date(weekStart);
        currentDate.setDate(weekStart.getDate() + i);
        const dateKey = currentDate.toISOString().split('T')[0];
        const daySessions = dailyMap.get(dateKey) || [];
        const focusSessionsForDay = daySessions.filter(
          (s) => s.mode === '作業'
        );

        // カテゴリ別集計
        const categoryBreakdown = new Map<string, number>();
        focusSessionsForDay.forEach((session) => {
          const category = session.category || 'Other';
          categoryBreakdown.set(
            category,
            (categoryBreakdown.get(category) || 0) + session.durationMinutes
          );
        });

        return {
          day: weekDays[i],
          date: dateKey,
          minutes: focusSessionsForDay.reduce(
            (sum, s) => sum + s.durationMinutes,
            0
          ),
          categoryBreakdown: Array.from(categoryBreakdown.entries()).map(
            ([category, minutes]) => ({
              category,
              minutes,
            })
          ),
        };
      });
    }

    // ストリーク計算（今日を含む連続実施日数）
    const streak = await calculateStreak(userId);

    // 統計データを計算
    const stats = {
      totalSessions,
      focusSessions: focusSessions.length,
      breakSessions: sessions.filter(
        (s) => s.mode === '休憩' || s.mode === '長休憩'
      ).length,
      totalFocusTime,
      totalBreakTime,
      categoryStats,
      dailyStats,
      streak,
      sessions: sessions.map((s) => ({
        id: s.id,
        mode: s.mode,
        category: s.category,
        durationMinutes: s.durationMinutes,
        startTime: s.startTime,
        endTime: s.endTime,
        completionStatus: s.completionStatus,
      })),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching pomodoro stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * 連続実施日数を計算
 */
async function calculateStreak(userId: string): Promise<{
  current: number;
  longest: number;
}> {
  // 過去90日分のセッションを取得
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const sessions = await prisma.pomodoroSession.findMany({
    where: {
      userId,
      mode: '作業',
      completionStatus: '完走',
      startTime: {
        gte: ninetyDaysAgo,
      },
    },
    orderBy: {
      startTime: 'desc',
    },
  });

  // 日付ごとにグループ化
  const datesWithSessions = new Set<string>();
  sessions.forEach((session) => {
    const date = new Date(session.startTime);
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    datesWithSessions.add(dateKey);
  });

  // 現在のストリークを計算
  let currentStreak = 0;
  const today = new Date();
  for (let i = 0; i < 90; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    const dateKey = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;

    if (datesWithSessions.has(dateKey)) {
      currentStreak++;
    } else {
      break;
    }
  }

  // 最長ストリークを計算
  let longestStreak = 0;
  let tempStreak = 0;
  const sortedDates = Array.from(datesWithSessions).sort();

  for (let i = 0; i < sortedDates.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const prevDate = new Date(sortedDates[i - 1]);
      const currDate = new Date(sortedDates[i]);
      const diffDays = Math.floor(
        (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  return {
    current: currentStreak,
    longest: longestStreak,
  };
}
