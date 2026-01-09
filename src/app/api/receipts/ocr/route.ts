import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import vision from '@google-cloud/vision';
import { incrementUsage, getUsage } from '@/lib/api-usage';

/**
 * サポートされている画像形式
 * - 標準画像: JPG, PNG, GIF, BMP, WEBP, TIFF
 * - iOS画像: HEIC, HEIF
 * - ドキュメント: PDF
 */
const SUPPORTED_IMAGE_FORMATS = [
  'jpg',
  'jpeg',
  'png',
  'gif',
  'bmp',
  'webp',
  'tiff',
  'tif',
  'heic',
  'heif',
  'pdf',
];

/**
 * URLまたはファイル名から拡張子を取得
 */
function getFileExtension(url: string): string {
  const urlWithoutQuery = url.split('?')[0];
  const parts = urlWithoutQuery.split('.');
  return parts[parts.length - 1]?.toLowerCase() || '';
}

/**
 * PDF形式かチェック
 */
function isPdfFormat(ext: string): boolean {
  return ext === 'pdf';
}

// Google Cloud Vision APIクライアントの初期化
const visionClient = new vision.ImageAnnotatorClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  // または、API Keyを使用する場合
  // apiKey: process.env.GOOGLE_CLOUD_VISION_API_KEY,
});

interface OcrItem {
  name: string;
  quantity?: number;
  price?: number;
}

interface OcrResult {
  storeName: string | null;
  transactionDate: Date | null;
  totalAmount: number | null;
  taxAmount: number | null;
  paymentMethod: string | null;
  items: OcrItem[];
  rawText: string;
  confidence: number;
}

/**
 * レシート画像からOCR処理を実行し、構造化データを抽出する
 * POST /api/receipts/ocr
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

    const body = await request.json();
    const { receiptId, imageUrl } = body;

    console.log('[POST /api/receipts/ocr] Request:', { receiptId, imageUrl });

    // 必須パラメータチェック
    if (!receiptId || !imageUrl) {
      return NextResponse.json(
        { error: 'receiptId and imageUrl are required' },
        { status: 400 }
      );
    }

    // レシート情報を取得して、ユーザーの所有権を確認
    const receipt = await prisma.receipt.findUnique({
      where: { id: receiptId },
    });

    if (!receipt) {
      return NextResponse.json({ error: 'Receipt not found' }, { status: 404 });
    }

    if (receipt.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // API使用量チェック
    const usage = await getUsage(user.id, 'vision');
    if (usage.isOverLimit) {
      return NextResponse.json(
        {
          error: 'API usage limit exceeded',
          message: `月間OCR処理上限（${usage.limit}回）に達しました。来月まで利用できません。`,
          usage: {
            count: usage.count,
            limit: usage.limit,
            remaining: usage.remaining,
          },
        },
        { status: 429 } // Too Many Requests
      );
    }

    // レシートのステータスを「処理中」に更新
    await prisma.receipt.update({
      where: { id: receiptId },
      data: { status: 'processing' },
    });

    try {
      // Google Cloud Vision APIでOCR処理を実行
      console.log(
        '[POST /api/receipts/ocr] Performing OCR on image:',
        imageUrl
      );

      // ファイル形式を判定
      const fileExt = getFileExtension(imageUrl);
      console.log(
        '[POST /api/receipts/ocr] File format:',
        fileExt.toUpperCase()
      );

      // サポートされている形式かチェック
      if (!SUPPORTED_IMAGE_FORMATS.includes(fileExt)) {
        throw new Error(
          `Unsupported file format: ${fileExt}. ` +
            `Supported formats: ${SUPPORTED_IMAGE_FORMATS.join(', ').toUpperCase()}`
        );
      }

      // 画像データを取得
      let imageContent: Buffer | string;

      if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        // URLの場合は画像をダウンロード
        console.log('[POST /api/receipts/ocr] Downloading image from URL...');
        const response = await fetch(imageUrl);
        if (!response.ok) {
          throw new Error(`Failed to download image: HTTP ${response.status}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        imageContent = Buffer.from(arrayBuffer);
        console.log(
          `[POST /api/receipts/ocr] Downloaded image: ${(imageContent.length / 1024).toFixed(2)} KB`
        );
      } else {
        // ローカルファイルパスの場合（通常は使用されないが、念のため）
        imageContent = imageUrl;
      }

      // OCR処理を実行
      console.log('[POST /api/receipts/ocr] Starting OCR processing...');

      let result;
      if (isPdfFormat(fileExt)) {
        // PDFの場合は専用のAPI呼び出し
        console.log(
          '[POST /api/receipts/ocr] Using document text detection for PDF...'
        );
        [result] = await visionClient.documentTextDetection({
          image: { content: imageContent },
        });
      } else {
        // 画像の場合は通常のOCR
        [result] = await visionClient.textDetection({
          image: { content: imageContent },
        });
      }

      const detections = result.textAnnotations;

      if (!detections || detections.length === 0) {
        throw new Error('No text detected in the image');
      }

      // 全テキストを取得（最初の要素が全体のテキスト）
      const rawText = detections[0]?.description || '';
      console.log('[POST /api/receipts/ocr] Raw OCR text:', rawText);

      // OCR処理が成功したので使用量を増加
      await incrementUsage(user.id, 'vision');

      // OCR結果を構造化データに変換
      const ocrResult = parseReceiptText(rawText);

      // OCRデータをデータベースに保存
      const ocrData = await prisma.receiptOcrData.create({
        data: {
          receiptId,
          storeName: ocrResult.storeName,
          transactionDate: ocrResult.transactionDate,
          totalAmount: ocrResult.totalAmount,
          taxAmount: ocrResult.taxAmount,
          paymentMethod: ocrResult.paymentMethod,
          items: ocrResult.items as unknown as Parameters<
            typeof prisma.receiptOcrData.create
          >[0]['data']['items'],
          rawText: ocrResult.rawText,
          confidence: ocrResult.confidence,
        },
      });

      // レシートのステータスを「完了」に更新
      await prisma.receipt.update({
        where: { id: receiptId },
        data: { status: 'completed' },
      });

      console.log(
        '[POST /api/receipts/ocr] OCR processing completed:',
        ocrData.id
      );

      return NextResponse.json(
        {
          success: true,
          data: ocrData,
        },
        { status: 201 }
      );
    } catch (ocrError) {
      // OCR処理エラー時はステータスを「失敗」に更新
      await prisma.receipt.update({
        where: { id: receiptId },
        data: { status: 'failed' },
      });

      console.error(
        '[POST /api/receipts/ocr] OCR processing failed:',
        ocrError
      );
      throw ocrError;
    }
  } catch (error) {
    console.error('[POST /api/receipts/ocr] Error:', error);
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
 * OCRで抽出したテキストから構造化データを生成
 * この関数は日本語レシートに特化した簡易的なパーサーです
 * 本番環境では、より高度な自然言語処理やAI/MLモデルを使用することを推奨します
 */
function parseReceiptText(rawText: string): OcrResult {
  const lines = rawText.split('\n').map((line) => line.trim());

  let storeName: string | null = null;
  let transactionDate: Date | null = null;
  let totalAmount: number | null = null;
  let taxAmount: number | null = null;
  let paymentMethod: string | null = null;
  const items: OcrItem[] = [];

  // 店舗名の推定（最初の非空行を店舗名とする簡易実装）
  for (const line of lines) {
    if (line.length > 0) {
      storeName = line;
      break;
    }
  }

  // 日付の抽出（YYYY/MM/DD, YYYY-MM-DD, YYYY年MM月DD日 などの形式に対応）
  const datePatterns = [
    /(\d{4})[\/\-年](\d{1,2})[\/\-月](\d{1,2})[日]?/,
    /(\d{2})[\/\-](\d{1,2})[\/\-](\d{1,2})/,
  ];

  for (const line of lines) {
    for (const pattern of datePatterns) {
      const match = line.match(pattern);
      if (match) {
        const year = match[1].length === 2 ? `20${match[1]}` : match[1];
        const month = match[2].padStart(2, '0');
        const day = match[3].padStart(2, '0');
        transactionDate = new Date(`${year}-${month}-${day}`);
        break;
      }
    }
    if (transactionDate) break;
  }

  // 合計金額の抽出（「合計」「小計」「お会計」などのキーワード後の金額）
  const totalPatterns = [
    /(?:合計|小計|お会計|計|total)[^\d]*[¥￥]?(\d{1,3}(?:[,，]\d{3})*)/i,
    /(?:合計|小計|お会計|計|total)[^\d]*(\d{1,3}(?:[,，]\d{3})*)[円]?/i,
  ];

  for (const line of lines) {
    for (const pattern of totalPatterns) {
      const match = line.match(pattern);
      if (match) {
        totalAmount = parseInt(match[1].replace(/[,，]/g, ''), 10);
        break;
      }
    }
    if (totalAmount !== null) break;
  }

  // 消費税額の抽出
  const taxPatterns = [
    /(?:消費税|税額|tax)[^\d]*[¥￥]?(\d{1,3}(?:[,，]\d{3})*)/i,
    /(?:消費税|税額|tax)[^\d]*(\d{1,3}(?:[,，]\d{3})*)[円]?/i,
  ];

  for (const line of lines) {
    for (const pattern of taxPatterns) {
      const match = line.match(pattern);
      if (match) {
        taxAmount = parseInt(match[1].replace(/[,，]/g, ''), 10);
        break;
      }
    }
    if (taxAmount !== null) break;
  }

  // 支払い方法の抽出
  const paymentPatterns = [
    /(?:支払|お支払|payment)[^\d]*[:：]?\s*(現金|クレジット|カード|電子マネー|QR|paypay|nanaco|suica)/i,
    /(現金|クレジット|カード|電子マネー|QR|paypay|nanaco|suica)\s*(?:払い|支払)/i,
  ];

  for (const line of lines) {
    for (const pattern of paymentPatterns) {
      const match = line.match(pattern);
      if (match) {
        paymentMethod = match[1];
        break;
      }
    }
    if (paymentMethod) break;
  }

  // 品目の抽出（簡易実装: 金額が含まれる行を品目として扱う）
  // より高度な実装では、商品名と金額のペアをより正確に抽出する必要があります
  const itemPattern = /([^¥￥\d]+)\s*[¥￥]?(\d{1,3}(?:[,，]\d{3})*)/;

  for (const line of lines) {
    const match = line.match(itemPattern);
    if (match && !line.match(/合計|小計|お会計|計|消費税|税額/i)) {
      const name = match[1].trim();
      const price = parseInt(match[2].replace(/[,，]/g, ''), 10);

      if (name.length > 0 && price > 0) {
        items.push({
          name,
          price,
        });
      }
    }
  }

  // 信頼度スコアの計算（簡易実装: 抽出できたフィールド数で判定）
  let confidence = 0.0;
  if (storeName) confidence += 0.2;
  if (transactionDate) confidence += 0.2;
  if (totalAmount !== null) confidence += 0.3;
  if (taxAmount !== null) confidence += 0.1;
  if (items.length > 0) confidence += 0.2;

  return {
    storeName,
    transactionDate,
    totalAmount,
    taxAmount,
    paymentMethod,
    items,
    rawText,
    confidence,
  };
}

/**
 * OCR結果を取得
 * GET /api/receipts/ocr?receiptId=xxx
 */
export async function GET(request: NextRequest) {
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

    // レシート情報を取得して、ユーザーの所有権を確認
    const receipt = await prisma.receipt.findUnique({
      where: { id: receiptId },
      include: {
        ocrData: true,
      },
    });

    if (!receipt) {
      return NextResponse.json({ error: 'Receipt not found' }, { status: 404 });
    }

    if (receipt.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!receipt.ocrData) {
      return NextResponse.json(
        { error: 'OCR data not found for this receipt' },
        { status: 404 }
      );
    }

    return NextResponse.json(receipt.ocrData);
  } catch (error) {
    console.error('[GET /api/receipts/ocr] Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
