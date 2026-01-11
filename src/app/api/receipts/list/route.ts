import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getSignedUrl } from '@/lib/upload';

/**
 * GET /api/receipts/list
 * ユーザーの領収書一覧を取得
 * クエリパラメータ:
 * - startDate: フィルタ開始日 (YYYY-MM-DD)
 * - endDate: フィルタ終了日 (YYYY-MM-DD)
 * - storeName: 店舗名での検索（部分一致）
 * - status: ステータスフィルタ ('pending' | 'processing' | 'completed' | 'failed')
 * - hasTransaction: 取引紐付け状態 ('true' | 'false' | 'all')
 */
export async function GET(request: Request) {
  try {
    // セッション確認
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: '認証が必要です' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);

    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const storeName = searchParams.get('storeName');
    const status = searchParams.get('status');

    // フィルタ構築
    const filters: {
      uploadedAt?: {
        gte?: Date;
        lte?: Date;
      };
      status?: string;
      ocrData?: {
        storeName: {
          contains: string;
          mode: 'insensitive';
        };
      };
    } = {};

    // 日付範囲フィルタ
    if (startDate || endDate) {
      filters.uploadedAt = {};
      if (startDate) {
        filters.uploadedAt.gte = new Date(startDate);
      }
      if (endDate) {
        filters.uploadedAt.lte = new Date(endDate);
      }
    }

    // ステータスフィルタ
    if (status) {
      filters.status = status;
    }

    // 店舗名フィルタ（OCRデータ内を検索）
    if (storeName) {
      filters.ocrData = {
        storeName: {
          contains: storeName,
          mode: 'insensitive',
        },
      };
    }

    const receipts = await prisma.receipt.findMany({
      where: {
        userId: session.user.id,
        ...filters,
      },
      include: {
        ocrData: true,
      },
      orderBy: {
        uploadedAt: 'desc',
      },
    });

    // 署名付きURLを生成（1時間有効）
    const receiptsWithSignedUrls = await Promise.all(
      receipts.map(async (receipt) => {
        try {
          // URLからファイルパスを抽出
          // 例: https://xxx.supabase.co/storage/v1/object/public/receipts/user/receipt/file.jpg
          // -> user/receipt/file.jpg
          const urlParts = receipt.imageUrl.split('/receipts/');
          if (urlParts.length > 1) {
            const filePath = urlParts[1];
            const signedUrl = await getSignedUrl(filePath, 3600);
            return { ...receipt, imageUrl: signedUrl };
          }
          return receipt;
        } catch (error) {
          console.error(
            'Failed to generate signed URL for receipt:',
            receipt.id,
            error
          );
          return receipt;
        }
      })
    );

    return NextResponse.json({
      success: true,
      data: receiptsWithSignedUrls,
    });
  } catch (error) {
    console.error('Receipts fetch error:', error);
    return NextResponse.json(
      { success: false, message: '領収書の取得に失敗しました' },
      { status: 500 }
    );
  }
}
