import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// メモの取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const order = searchParams.get('order') || 'desc'; // 'desc' | 'asc'

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const memos = await prisma.memo.findMany({
      where: { userId },
      orderBy: {
        createdAt: order === 'asc' ? 'asc' : 'desc',
      },
    });

    return NextResponse.json(memos);
  } catch (error) {
    console.error('Error fetching memos:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// メモの作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, content } = body;

    if (!userId || !content) {
      return NextResponse.json(
        { error: 'userId and content are required' },
        { status: 400 }
      );
    }

    const memo = await prisma.memo.create({
      data: {
        userId,
        content,
      },
    });

    return NextResponse.json(memo, { status: 201 });
  } catch (error) {
    console.error('[POST /api/memos] Error creating memo:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// メモの更新
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, content } = body;

    if (!id || !content) {
      return NextResponse.json(
        { error: 'id and content are required' },
        { status: 400 }
      );
    }

    const memo = await prisma.memo.update({
      where: { id },
      data: { content },
    });

    return NextResponse.json(memo);
  } catch (error) {
    console.error('Error updating memo:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// メモの削除
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    await prisma.memo.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting memo:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
