import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 勤怠記録の取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    console.log('[GET /api/attendance] Request params:', {
      userId,
      startDate,
      endDate,
    });

    if (!userId) {
      console.error('[GET /api/attendance] Missing userId');
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // クエリ条件を構築
    const where: {
      userId: string;
      date?: {
        gte?: Date;
        lte?: Date;
      };
    } = { userId };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    console.log('[GET /api/attendance] Query where clause:', where);

    // Prisma接続を確認
    try {
      await prisma.$connect();
      console.log('[GET /api/attendance] Prisma connected successfully');
    } catch (connectError) {
      console.error(
        '[GET /api/attendance] Prisma connection error:',
        connectError
      );
      throw connectError;
    }

    // 勤怠記録を取得
    const records = await prisma.attendanceRecord.findMany({
      where,
      include: {
        workLocation: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    console.log('[GET /api/attendance] Found records:', records.length);
    return NextResponse.json(records);
  } catch (error) {
    console.error('[GET /api/attendance] Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// 勤怠記録の作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, workLocationId, date, clockIn, clockOut, note } = body;

    if (!userId || !date || !workLocationId) {
      return NextResponse.json(
        { error: 'userId, workLocationId, and date are required' },
        { status: 400 }
      );
    }

    // 日付を正規化（時刻情報を削除）
    const recordDate = new Date(date);
    recordDate.setHours(0, 0, 0, 0);

    // 勤務時間を自動計算
    let workMinutes = null;
    if (clockIn && clockOut) {
      const clockInTime = new Date(clockIn);
      const clockOutTime = new Date(clockOut);
      workMinutes = Math.floor(
        (clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60)
      );
    }

    // 既存レコードをチェック
    const existingRecord = await prisma.attendanceRecord.findUnique({
      where: {
        userId_date: {
          userId,
          date: recordDate,
        },
      },
    });

    if (existingRecord) {
      return NextResponse.json(
        { error: 'Record already exists for this date' },
        { status: 409 }
      );
    }

    // 勤怠記録を作成
    const record = await prisma.attendanceRecord.create({
      data: {
        userId,
        workLocationId,
        date: recordDate,
        clockIn: clockIn ? new Date(clockIn) : null,
        clockOut: clockOut ? new Date(clockOut) : null,
        workMinutes,
        note,
      },
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error('Error creating attendance record:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 勤怠記録の更新
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, clockIn, clockOut, note } = body;

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    // 勤務時間を自動計算
    let workMinutes = null;
    if (clockIn && clockOut) {
      const clockInTime = new Date(clockIn);
      const clockOutTime = new Date(clockOut);
      workMinutes = Math.floor(
        (clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60)
      );
    }

    // 勤怠記録を更新
    const record = await prisma.attendanceRecord.update({
      where: { id },
      data: {
        clockIn: clockIn ? new Date(clockIn) : null,
        clockOut: clockOut ? new Date(clockOut) : null,
        workMinutes,
        note,
      },
    });

    return NextResponse.json(record);
  } catch (error) {
    console.error('Error updating attendance record:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 勤怠記録の削除
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    // 勤怠記録を削除
    await prisma.attendanceRecord.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting attendance record:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
