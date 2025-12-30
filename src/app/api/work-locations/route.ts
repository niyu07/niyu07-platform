import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 勤務先一覧の取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    console.log('[GET /api/work-locations] Request params:', { userId });

    if (!userId) {
      console.error('[GET /api/work-locations] Missing userId');
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Prisma接続を確認
    try {
      await prisma.$connect();
      console.log('[GET /api/work-locations] Prisma connected successfully');
    } catch (connectError) {
      console.error(
        '[GET /api/work-locations] Prisma connection error:',
        connectError
      );
      throw connectError;
    }

    const workLocations = await prisma.workLocation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    console.log(
      '[GET /api/work-locations] Found locations:',
      workLocations.length
    );
    return NextResponse.json(workLocations);
  } catch (error) {
    console.error('[GET /api/work-locations] Error details:', {
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

// 勤務先の作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, type, hourlyRate, dailyRate, projectRate, color } =
      body;

    if (!userId || !name || !type) {
      return NextResponse.json(
        { error: 'userId, name, and type are required' },
        { status: 400 }
      );
    }

    const workLocation = await prisma.workLocation.create({
      data: {
        userId,
        name,
        type,
        hourlyRate: hourlyRate || null,
        dailyRate: dailyRate || null,
        projectRate: projectRate || null,
        color: color || '#3B82F6',
      },
    });

    return NextResponse.json(workLocation, { status: 201 });
  } catch (error) {
    console.error('Error creating work location:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 勤務先の更新
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      name,
      type,
      hourlyRate,
      dailyRate,
      projectRate,
      color,
      isActive,
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const data: {
      name?: string;
      type?: string;
      hourlyRate?: number | null;
      dailyRate?: number | null;
      projectRate?: number | null;
      color?: string;
      isActive?: boolean;
    } = {};
    if (name !== undefined) data.name = name;
    if (type !== undefined) data.type = type;
    if (hourlyRate !== undefined) data.hourlyRate = hourlyRate;
    if (dailyRate !== undefined) data.dailyRate = dailyRate;
    if (projectRate !== undefined) data.projectRate = projectRate;
    if (color !== undefined) data.color = color;
    if (isActive !== undefined) data.isActive = isActive;

    const workLocation = await prisma.workLocation.update({
      where: { id },
      data,
    });

    return NextResponse.json(workLocation);
  } catch (error) {
    console.error('Error updating work location:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 勤務先の削除
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    // 関連する勤怠記録があるか確認
    const relatedRecords = await prisma.attendanceRecord.count({
      where: { workLocationId: id },
    });

    if (relatedRecords > 0) {
      return NextResponse.json(
        {
          error:
            'この勤務先には勤怠記録が紐づいているため削除できません。無効化することをおすすめします。',
        },
        { status: 400 }
      );
    }

    await prisma.workLocation.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting work location:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
