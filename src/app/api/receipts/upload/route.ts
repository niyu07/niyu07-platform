import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uploadFile, deleteFile } from '@/lib/upload';
import { getUsage } from '@/lib/api-usage';

/**
 * レシート画像をアップロードしてReceiptレコードを作成
 * POST /api/receipts/upload
 */
export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ユーザー情報を取得
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Google API使用可能回数を事前チェック（統合管理）
    const usage = await getUsage(user.id);

    // FormDataからファイルを取得
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    console.log('[POST /api/receipts/upload] Uploading file:', file.name);

    // ファイルをSupabase Storageにアップロード
    // receiptId用に一時IDを生成（アップロード後にReceiptレコード作成）
    const tempReceiptId = `temp_${Date.now()}`;
    const uploadedFile = await uploadFile(file, user.id, tempReceiptId);

    // Receiptレコードを作成
    const receipt = await prisma.receipt.create({
      data: {
        userId: user.id,
        imageUrl: uploadedFile.publicUrl,
        status: 'pending',
      },
    });

    console.log('[POST /api/receipts/upload] Receipt created:', receipt.id);

    return NextResponse.json(
      {
        success: true,
        data: {
          receiptId: receipt.id,
          imageUrl: receipt.imageUrl,
          status: receipt.status,
          uploadedAt: receipt.uploadedAt,
          // OCR使用可能回数情報も返す
          ocrUsage: {
            count: usage.count,
            limit: usage.limit,
            remaining: usage.remaining,
            canUseOcr: !usage.isOverLimit,
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/receipts/upload] Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * レシートを削除
 * DELETE /api/receipts/upload?receiptId=xxx
 */
export async function DELETE(request: NextRequest) {
  try {
    // 認証チェック
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ユーザー情報を取得
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const receiptId = searchParams.get('receiptId');

    if (!receiptId) {
      return NextResponse.json(
        { error: 'receiptId is required' },
        { status: 400 }
      );
    }

    // レシート情報を取得
    const receipt = await prisma.receipt.findUnique({
      where: { id: receiptId },
      include: {
        ocrData: true,
      },
    });

    if (!receipt) {
      return NextResponse.json({ error: 'Receipt not found' }, { status: 404 });
    }

    // ユーザーの所有権を確認
    if (receipt.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Supabase Storageからファイルを削除
    const filePath = receipt.imageUrl.split('/').slice(-3).join('/'); // userId/receiptId/filename
    await deleteFile(filePath);

    // OCRデータとReceiptレコードを削除（Cascadeで自動削除される）
    await prisma.receipt.delete({
      where: { id: receiptId },
    });

    console.log('[DELETE /api/receipts/upload] Receipt deleted:', receiptId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/receipts/upload] Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * ユーザーのレシート一覧を取得
 * GET /api/receipts/upload
 */
export async function GET(_request: NextRequest) {
  try {
    // 認証チェック
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ユーザー情報を取得
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // レシート一覧を取得
    const receipts = await prisma.receipt.findMany({
      where: { userId: user.id },
      include: {
        ocrData: true,
      },
      orderBy: {
        uploadedAt: 'desc',
      },
    });

    // Google API使用状況も取得（統合管理）
    const usage = await getUsage(user.id);

    return NextResponse.json({
      success: true,
      data: {
        receipts,
        ocrUsage: {
          count: usage.count,
          limit: usage.limit,
          remaining: usage.remaining,
          canUseOcr: !usage.isOverLimit,
          percentage: usage.percentage,
        },
      },
    });
  } catch (error) {
    console.error('[GET /api/receipts/upload] Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
