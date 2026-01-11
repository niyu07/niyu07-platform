import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getSignedUrl } from '@/lib/upload';

/**
 * GET /api/receipts/[id]
 * 特定の領収書の詳細を取得
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: '認証が必要です' },
        { status: 401 }
      );
    }

    const params = await context.params;

    const receipt = await prisma.receipt.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        ocrData: true,
      },
    });

    if (!receipt) {
      return NextResponse.json(
        { success: false, message: '領収書が見つかりません' },
        { status: 404 }
      );
    }

    // 署名付きURLを生成
    try {
      const urlParts = receipt.imageUrl.split('/receipts/');
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        const signedUrl = await getSignedUrl(filePath, 3600);
        receipt.imageUrl = signedUrl;
      }
    } catch (error) {
      console.error('Failed to generate signed URL:', error);
    }

    return NextResponse.json({
      success: true,
      data: receipt,
    });
  } catch (error) {
    console.error('Receipt fetch error:', error);
    return NextResponse.json(
      { success: false, message: '領収書の取得に失敗しました' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/receipts/[id]
 * 領収書のOCRデータを更新
 */
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: '認証が必要です' },
        { status: 401 }
      );
    }

    const params = await context.params;

    const body = await request.json();
    const {
      storeName,
      transactionDate,
      totalAmount,
      taxAmount,
      paymentMethod,
    } = body;

    // 領収書の所有者確認
    const receipt = await prisma.receipt.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        ocrData: true,
      },
    });

    if (!receipt) {
      return NextResponse.json(
        { success: false, message: '領収書が見つかりません' },
        { status: 404 }
      );
    }

    // OCRデータを更新
    if (receipt.ocrData) {
      await prisma.receiptOcrData.update({
        where: { id: receipt.ocrData.id },
        data: {
          storeName,
          transactionDate: transactionDate ? new Date(transactionDate) : null,
          totalAmount,
          taxAmount,
          paymentMethod,
        },
      });
    } else {
      // OCRデータが存在しない場合は作成
      await prisma.receiptOcrData.create({
        data: {
          receiptId: receipt.id,
          storeName,
          transactionDate: transactionDate ? new Date(transactionDate) : null,
          totalAmount,
          taxAmount,
          paymentMethod,
          items: [],
        },
      });
    }

    // 更新後のデータを取得
    const updatedReceipt = await prisma.receipt.findFirst({
      where: { id: params.id },
      include: { ocrData: true },
    });

    return NextResponse.json({
      success: true,
      data: updatedReceipt,
    });
  } catch (error) {
    console.error('Receipt update error:', error);
    return NextResponse.json(
      { success: false, message: '領収書の更新に失敗しました' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/receipts/[id]
 * 領収書を削除
 */
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: '認証が必要です' },
        { status: 401 }
      );
    }

    const params = await context.params;

    // 領収書の所有者確認
    const receipt = await prisma.receipt.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!receipt) {
      return NextResponse.json(
        { success: false, message: '領収書が見つかりません' },
        { status: 404 }
      );
    }

    // 領収書を削除（OCRデータはカスケード削除される）
    await prisma.receipt.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: '領収書を削除しました',
    });
  } catch (error) {
    console.error('Receipt delete error:', error);
    return NextResponse.json(
      { success: false, message: '領収書の削除に失敗しました' },
      { status: 500 }
    );
  }
}
