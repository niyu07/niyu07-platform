import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface TimeSlotProductivity {
  timeSlot: string;
  dayOfWeek: number;
  completedSessions: number;
  completionRate: number;
  averageFocusMinutes: number;
  productivityScore: number;
}

interface GoldenTime {
  timeSlot: string;
  averageProductivityScore: number;
  recommendation: string;
}

interface HeatmapData {
  timeSlotProductivity: TimeSlotProductivity[];
  goldenTime: GoldenTime;
}

/**
 * 時刻を2時間の時間帯に変換
 * 例: "2025-12-26T14:30:00.000Z" -> "14-16"
 */
function getTimeSlot(dateString: string): string {
  const date = new Date(dateString);
  const hour = date.getHours();
  const slotStart = Math.floor(hour / 2) * 2;
  const slotEnd = slotStart + 2;
  return `${String(slotStart).padStart(2, '0')}-${String(slotEnd).padStart(2, '0')}`;
}

/**
 * 曜日を取得 (0: 日曜日, 1: 月曜日, ...)
 */
function getDayOfWeek(dateString: string): number {
  return new Date(dateString).getDay();
}

/**
 * 生産性スコアを計算
 * 完了率と平均集中時間を組み合わせて0-100のスコアを算出
 */
function calculateProductivityScore(
  completionRate: number,
  averageFocusMinutes: number,
  targetMinutes: number = 25
): number {
  // 完了率: 70%の重み
  const completionScore = completionRate * 0.7;

  // 集中時間達成率: 30%の重み（目標時間に対する割合）
  const focusScore =
    Math.min((averageFocusMinutes / targetMinutes) * 100, 100) * 0.3;

  return Math.round(completionScore + focusScore);
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const userId = session.user.id;

    // クエリパラメータから期間を取得（デフォルトは過去4週間）
    const { searchParams } = new URL(request.url);
    const weeks = parseInt(searchParams.get('weeks') || '4', 10);

    // 期間の開始日を計算
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - weeks * 7);

    // 指定期間内のすべての作業セッションを取得
    const sessions = await prisma.pomodoroSession.findMany({
      where: {
        userId,
        mode: 'WORK',
        startTime: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        durationMinutes: true,
        completionStatus: true,
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    // 時間帯 × 曜日ごとにセッションをグループ化
    const groupedData: Record<
      string,
      {
        total: number;
        completed: number;
        totalMinutes: number;
        completedMinutes: number;
      }
    > = {};

    sessions.forEach(
      (session: {
        id: string;
        startTime: Date;
        endTime: Date | null;
        durationMinutes: number;
        completionStatus: string;
      }) => {
        const timeSlot = getTimeSlot(session.startTime.toISOString());
        const dayOfWeek = getDayOfWeek(session.startTime.toISOString());
        const key = `${dayOfWeek}-${timeSlot}`;

        if (!groupedData[key]) {
          groupedData[key] = {
            total: 0,
            completed: 0,
            totalMinutes: 0,
            completedMinutes: 0,
          };
        }

        groupedData[key].total += 1;

        if (session.completionStatus === 'COMPLETED') {
          groupedData[key].completed += 1;
          groupedData[key].completedMinutes += session.durationMinutes;
        }

        groupedData[key].totalMinutes += session.durationMinutes;
      }
    );

    // TimeSlotProductivity配列を構築
    const timeSlotProductivity: TimeSlotProductivity[] = [];

    Object.entries(groupedData).forEach(([key, data]) => {
      const [dayOfWeekStr, timeSlot] = key.split('-');
      const dayOfWeek = parseInt(dayOfWeekStr, 10);

      const completionRate =
        data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;

      const averageFocusMinutes =
        data.completed > 0
          ? Math.round(data.completedMinutes / data.completed)
          : 0;

      const productivityScore = calculateProductivityScore(
        completionRate,
        averageFocusMinutes
      );

      timeSlotProductivity.push({
        timeSlot,
        dayOfWeek,
        completedSessions: data.completed,
        completionRate,
        averageFocusMinutes,
        productivityScore,
      });
    });

    // ゴールデンタイムを計算（最も生産性スコアが高い時間帯）
    let goldenTime: GoldenTime = {
      timeSlot: '設定なし',
      averageProductivityScore: 0,
      recommendation: 'データが不足しています',
    };

    if (timeSlotProductivity.length > 0) {
      // 時間帯ごとの平均スコアを計算
      const timeSlotScores: Record<string, { total: number; count: number }> =
        {};

      timeSlotProductivity.forEach((slot) => {
        if (!timeSlotScores[slot.timeSlot]) {
          timeSlotScores[slot.timeSlot] = { total: 0, count: 0 };
        }
        timeSlotScores[slot.timeSlot].total += slot.productivityScore;
        timeSlotScores[slot.timeSlot].count += 1;
      });

      // 最も高い平均スコアを持つ時間帯を見つける
      let maxScore = 0;
      let maxTimeSlot = '';

      Object.entries(timeSlotScores).forEach(([timeSlot, data]) => {
        const avgScore = data.total / data.count;
        if (avgScore > maxScore) {
          maxScore = avgScore;
          maxTimeSlot = timeSlot;
        }
      });

      if (maxTimeSlot) {
        const [start, end] = maxTimeSlot.split('-');
        goldenTime = {
          timeSlot: `${start}:00 - ${end}:00`,
          averageProductivityScore: Math.round(maxScore),
          recommendation: `${start}:00 - ${end}:00 がゴールデンタイムです`,
        };
      }
    }

    const heatmapData: HeatmapData = {
      timeSlotProductivity,
      goldenTime,
    };

    return NextResponse.json(heatmapData);
  } catch (error) {
    console.error('ヒートマップデータの取得に失敗しました:', error);
    return NextResponse.json(
      { error: 'ヒートマップデータの取得に失敗しました' },
      { status: 500 }
    );
  }
}
