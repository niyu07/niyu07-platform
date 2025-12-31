import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 取引先一覧の取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const isActive = searchParams.get('isActive');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const where: {
      userId: string;
      isActive?: boolean;
    } = { userId };

    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    const clients = await prisma.client.findMany({
      where,
      include: {
        transactions: {
          orderBy: {
            date: 'desc',
          },
          take: 5, // 最新5件の取引
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(clients);
  } catch (error) {
    console.error('[GET /api/accounting/clients] Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// 取引先の作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, type, contactEmail, contactPhone, address, memo } =
      body;

    if (!userId || !name) {
      return NextResponse.json(
        { error: 'userId and name are required' },
        { status: 400 }
      );
    }

    const client = await prisma.client.create({
      data: {
        userId,
        name,
        type: type || '法人',
        contactEmail: contactEmail || null,
        contactPhone: contactPhone || null,
        address: address || null,
        memo: memo || null,
      },
    });

    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error('[POST /api/accounting/clients] Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
