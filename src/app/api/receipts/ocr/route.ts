import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import vision from '@google-cloud/vision';
import { incrementUsage, getUsage } from '@/lib/api-usage';
import { supabase, RECEIPTS_BUCKET } from '@/lib/supabase';

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
      // SupabaseのURLからファイルパスを抽出
      // 例: https://xxx.supabase.co/storage/v1/object/public/receipts/userId/receiptId/filename.jpg
      // から userId/receiptId/filename.jpg を抽出
      console.log('[POST /api/receipts/ocr] Extracting file path from URL...');
      const urlParts = imageUrl.split('/');
      const bucketsIndex = urlParts.findIndex(
        (part: string) => part === RECEIPTS_BUCKET
      );

      if (bucketsIndex === -1) {
        throw new Error('Invalid image URL: bucket name not found');
      }

      const filePath = urlParts.slice(bucketsIndex + 1).join('/');
      console.log('[POST /api/receipts/ocr] File path:', filePath);

      // Supabase Storageから画像をダウンロード
      console.log(
        '[POST /api/receipts/ocr] Downloading image from Supabase...'
      );
      const { data: imageData, error: downloadError } = await supabase.storage
        .from(RECEIPTS_BUCKET)
        .download(filePath);

      if (downloadError || !imageData) {
        console.error(
          '[POST /api/receipts/ocr] Download error:',
          downloadError
        );
        throw new Error(
          `Failed to download image from Supabase: ${downloadError?.message || 'Unknown error'}`
        );
      }

      // BlobをBufferに変換
      const arrayBuffer = await imageData.arrayBuffer();
      const imageContent = Buffer.from(arrayBuffer);
      console.log(
        `[POST /api/receipts/ocr] Downloaded image: ${(imageContent.length / 1024).toFixed(2)} KB`
      );

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

      // レスポンスデータをログ出力
      console.log('[POST /api/receipts/ocr] Response data:', {
        storeName: ocrData.storeName,
        transactionDate: ocrData.transactionDate,
        totalAmount: ocrData.totalAmount,
        taxAmount: ocrData.taxAmount,
        paymentMethod: ocrData.paymentMethod,
        confidence: ocrData.confidence,
      });

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

  // 店舗名の推定（最初の3行から最も長い行を店舗名とする）
  // ノイズ（記号や数字のみの行）を除外
  const candidateLines = lines.slice(0, 5).filter((line) => {
    // 記号や数字だけの行を除外
    const hasLetters = /[a-zA-Z\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/.test(
      line
    );
    const notOnlyNumbers = !/^\d+$/.test(line);
    return line.length > 2 && hasLetters && notOnlyNumbers;
  });

  if (candidateLines.length > 0) {
    // 最も長い行を店舗名とする
    storeName = candidateLines.reduce((longest, current) =>
      current.length > longest.length ? current : longest
    );
  }

  // 日付の抽出（YYYY/MM/DD, YYYY-MM-DD, YYYY年MM月DD日 などの形式に対応）
  const datePatterns = [
    /(\d{4})[年\/\-](\d{1,2})[月\/\-](\d{1,2})[日]?/,
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
        console.log(
          `[parseReceiptText] Found date: ${year}-${month}-${day} from line: ${line}`
        );
        break;
      }
    }
    if (transactionDate) break;
  }

  // 合計金額の抽出（「合計」「小計」「お会計」などのキーワード後の金額）
  // まず「合計」キーワードを含む行のインデックスを見つける
  let totalLineIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^合計$/i.test(lines[i].trim())) {
      totalLineIndex = i;
      console.log(
        `[parseReceiptText] Found '合計' keyword at line ${i}: ${lines[i]}`
      );
      break;
    }
  }

  // 「合計」の次の数行で金額を探す
  if (totalLineIndex !== -1) {
    for (
      let i = totalLineIndex;
      i < Math.min(totalLineIndex + 5, lines.length);
      i++
    ) {
      const line = lines[i];
      // 金額パターン: ¥421 や 421 など
      const amountMatch = line.match(/[¥￥]\s*(\d{1,3}(?:[,，]\d{3})*)/);
      if (amountMatch) {
        const amount = parseInt(amountMatch[1].replace(/[,，]/g, ''), 10);
        if (amount >= 10 && amount < 1000000) {
          totalAmount = amount;
          console.log(
            `[parseReceiptText] Found total amount: ${amount} from line ${i}: ${line}`
          );
          break;
        }
      }
    }
  }

  // 上記で見つからない場合、従来のパターンマッチングを試す
  if (totalAmount === null) {
    const totalPatterns = [
      // 「合計 ¥421」「合計¥421」のパターン
      /(?:合計|お会計|total)\s*[¥￥]?\s*(\d{1,3}(?:[,，]\d{3})*)/i,
      // 「¥421」が合計行にある場合
      /合計.*?[¥￥]\s*(\d{1,3}(?:[,，]\d{3})*)/i,
      // 数字だけの場合「合計 421」
      /合計\s*(\d{1,3}(?:[,，]\d{3})*)/i,
    ];

    for (const line of lines) {
      for (const pattern of totalPatterns) {
        const match = line.match(pattern);
        if (match) {
          const amount = parseInt(match[1].replace(/[,，]/g, ''), 10);
          // 合理的な金額範囲（10円以上、100万円未満）
          if (amount >= 10 && amount < 1000000) {
            totalAmount = amount;
            console.log(
              `[parseReceiptText] Found total amount (pattern): ${amount} from line: ${line}`
            );
            break;
          }
        }
      }
      if (totalAmount !== null) break;
    }
  }

  // 合計が見つからない場合、小計を探す
  if (totalAmount === null) {
    const subtotalPatterns = [
      /(?:小計|subtotal)\s*[¥￥]?\s*(\d{1,3}(?:[,，]\d{3})*)/i,
      /小計.*?[¥￥]\s*(\d{1,3}(?:[,，]\d{3})*)/i,
    ];

    for (const line of lines) {
      for (const pattern of subtotalPatterns) {
        const match = line.match(pattern);
        if (match) {
          const amount = parseInt(match[1].replace(/[,，]/g, ''), 10);
          if (amount >= 10 && amount < 1000000) {
            totalAmount = amount;
            console.log(
              `[parseReceiptText] Found subtotal amount: ${amount} from line: ${line}`
            );
            break;
          }
        }
      }
      if (totalAmount !== null) break;
    }
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

  // 除外キーワード（これらを含む行は品目として扱わない）
  const excludePatterns =
    /合計|小計|お会計|計|消費税|税額|外税|内税|お釣|点数|レジ|Tel|電話|住所|県|市|区|町|村|対象|軽減|rate|tax/i;

  for (const line of lines) {
    // 除外パターンにマッチする行はスキップ
    if (excludePatterns.test(line)) {
      continue;
    }

    const match = line.match(itemPattern);
    if (match) {
      const name = match[1].trim();
      const price = parseInt(match[2].replace(/[,，]/g, ''), 10);

      // 品目名が短すぎる、または記号のみの場合はスキップ
      const hasValidName =
        name.length > 0 &&
        /[a-zA-Z\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/.test(name);

      if (hasValidName && price > 0 && price < 1000000) {
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
