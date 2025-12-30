import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 月次サマリーの取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    if (!userId || !year || !month) {
      return NextResponse.json(
        { error: 'userId, year, and month are required' },
        { status: 400 }
      );
    }

    // 月の開始日と終了日を計算
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);

    // 勤怠記録を取得
    const records = await prisma.attendanceRecord.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    // サマリー計算
    const totalWorkMinutes = records.reduce(
      (sum, record) => sum + (record.workMinutes || 0),
      0
    );
    const totalWorkDays = records.filter(
      (record) => record.clockIn && record.clockOut
    ).length;
    const averageWorkMinutes =
      totalWorkDays > 0 ? Math.floor(totalWorkMinutes / totalWorkDays) : 0;

    // 週ごとの集計
    const weeklyData: {
      [key: string]: {
        workMinutes: number;
        workDays: number;
      };
    } = {};

    records.forEach((record) => {
      const recordDate = new Date(record.date);
      const weekNumber = Math.ceil(recordDate.getDate() / 7);
      const weekKey = `week${weekNumber}`;

      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = { workMinutes: 0, workDays: 0 };
      }

      if (record.workMinutes) {
        weeklyData[weekKey].workMinutes += record.workMinutes;
        weeklyData[weekKey].workDays += 1;
      }
    });

    return NextResponse.json({
      totalWorkMinutes,
      totalWorkDays,
      averageWorkMinutes,
      totalWorkHours: Math.floor(totalWorkMinutes / 60),
      averageWorkHours: Math.floor(averageWorkMinutes / 60),
      weeklyData,
      records,
    });
  } catch (error) {
    console.error('Error fetching attendance summary:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
