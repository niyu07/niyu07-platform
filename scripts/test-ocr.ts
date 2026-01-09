/**
 * Google Cloud Vision API OCRテストスクリプト
 *
 * 使い方:
 * npx tsx scripts/test-ocr.ts <画像URL または ローカルパス>
 *
 * 例:
 * npx tsx scripts/test-ocr.ts https://example.com/receipt.jpg
 * npx tsx scripts/test-ocr.ts ./test-images/receipt.jpg
 */

import vision from '@google-cloud/vision';
import fs from 'fs';
import https from 'https';
import http from 'http';
import path from 'path';
import sharp from 'sharp';

const visionClient = new vision.ImageAnnotatorClient({
  keyFilename:
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    './credentials/google-cloud-key.json',
});

/**
 * ファイル拡張子から形式を判定
 */
function getFileExtension(filePath: string): string {
  return path.extname(filePath).toLowerCase().replace('.', '');
}

/**
 * サポートされている画像形式かチェック
 */
function isSupportedImageFormat(ext: string): boolean {
  const supportedFormats = [
    'jpg',
    'jpeg',
    'png',
    'gif',
    'bmp',
    'webp',
    'ico',
    'tiff',
    'tif',
    'raw',
    'heic',
    'heif',
  ];
  return supportedFormats.includes(ext);
}

/**
 * PDF形式かチェック
 */
function isPdfFormat(ext: string): boolean {
  return ext === 'pdf';
}

/**
 * HEIC/HEIF形式かチェック
 */
function isHeicFormat(ext: string): boolean {
  return ext === 'heic' || ext === 'heif';
}

/**
 * HEIC/HEIFをJPGに変換
 */
async function convertHeicToJpg(buffer: Buffer): Promise<Buffer> {
  console.log('   HEIC/HEIF形式を検出しました。JPGに変換中...');
  return await sharp(buffer).jpeg({ quality: 90 }).toBuffer();
}

/**
 * URLから画像をダウンロードしてBufferとして返す
 */
async function downloadImage(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const parsedUrl = new URL(url);

    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    };

    protocol
      .get(options, (response) => {
        if (response.statusCode === 301 || response.statusCode === 302) {
          // リダイレクトの場合
          if (response.headers.location) {
            downloadImage(response.headers.location)
              .then(resolve)
              .catch(reject);
            return;
          }
        }

        if (response.statusCode !== 200) {
          reject(
            new Error(
              `画像のダウンロードに失敗しました。HTTPステータス: ${response.statusCode}`
            )
          );
          return;
        }

        const chunks: Buffer[] = [];
        response.on('data', (chunk) => chunks.push(chunk));
        response.on('end', () => resolve(Buffer.concat(chunks)));
        response.on('error', reject);
      })
      .on('error', reject);
  });
}

async function testOCR(imagePath: string) {
  console.log('🔍 Google Cloud Vision API OCRテスト開始\n');
  console.log(`📄 画像: ${imagePath}\n`);

  try {
    // 認証情報の確認
    console.log('✅ 認証情報を確認中...');
    const projectId = await visionClient.getProjectId();
    console.log(`   プロジェクトID: ${projectId}\n`);

    // ファイル形式を判定
    const fileExt = getFileExtension(imagePath);
    console.log(`📋 ファイル形式: ${fileExt.toUpperCase()}\n`);

    // サポートされている形式かチェック
    if (!isSupportedImageFormat(fileExt) && !isPdfFormat(fileExt)) {
      throw new Error(
        `サポートされていないファイル形式です: ${fileExt}\n` +
          `サポート形式: JPG, PNG, GIF, BMP, WEBP, HEIC, HEIF, PDF, TIFF, RAW`
      );
    }

    // 画像データを準備
    let imageContent: Buffer;

    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      // URLの場合はダウンロード
      console.log('📥 画像をダウンロード中...');
      imageContent = await downloadImage(imagePath);
      console.log(`   サイズ: ${(imageContent.length / 1024).toFixed(2)} KB\n`);
    } else {
      // ローカルファイルの場合
      if (!fs.existsSync(imagePath)) {
        throw new Error(`ファイルが見つかりません: ${imagePath}`);
      }
      imageContent = fs.readFileSync(imagePath);
      console.log(`   サイズ: ${(imageContent.length / 1024).toFixed(2)} KB\n`);
    }

    // HEIC/HEIF形式の場合はJPGに変換
    if (isHeicFormat(fileExt)) {
      try {
        imageContent = await convertHeicToJpg(imageContent);
        console.log(
          '   変換完了。新しいサイズ: ' +
            `${(imageContent.length / 1024).toFixed(2)} KB\n`
        );
      } catch (conversionError) {
        console.error('\n❌ HEIC/HEIF形式の変換に失敗しました\n');
        console.error('💡 解決方法:');
        console.error(
          '   1. iPhoneの設定 > カメラ > フォーマット を「互換性優先」に変更'
        );
        console.error(
          '   2. または、画像アプリでJPG/PNG形式に変換してから再試行'
        );
        console.error(
          '   3. または、オンライン変換ツールを使用: https://convertio.co/ja/heic-jpg/\n'
        );
        throw conversionError;
      }
    }

    // OCR処理実行
    console.log('🤖 OCR処理を実行中...');

    let result;
    if (isPdfFormat(fileExt)) {
      // PDFの場合は専用のAPI呼び出し
      console.log('   PDF形式を検出しました。PDF専用処理を使用します...');
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
      console.log('❌ テキストが検出されませんでした');

      // エラー情報があれば表示
      if (result.error) {
        console.log('⚠️  APIエラー:', result.error);
      }

      return;
    }

    console.log('✅ OCR処理完了\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 抽出されたテキスト:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(detections[0]?.description || '');
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 検出されたテキストブロック数: ${detections.length - 1}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 個別のテキストブロックを表示（最大10個まで）
    if (detections.length > 1) {
      console.log('🔤 検出された個別テキストブロック（最大10個）:\n');
      detections.slice(1, 11).forEach((text, index) => {
        console.log(`   ${index + 1}. "${text.description}"`);
      });
      console.log('');
    }

    console.log(
      '✅ テスト成功！Google Cloud Vision APIは正常に動作しています。\n'
    );
  } catch (error) {
    console.error('❌ エラーが発生しました:\n');
    if (error instanceof Error) {
      console.error(`   エラーメッセージ: ${error.message}\n`);

      // よくあるエラーのヘルプ
      if (error.message.includes('PERMISSION_DENIED')) {
        console.error(
          '💡 ヒント: Cloud Vision APIが有効化されていない可能性があります。'
        );
        console.error(
          '   Google Cloud Consoleで「Cloud Vision API」を有効にしてください。'
        );
        console.error(
          '   https://console.cloud.google.com/apis/library/vision.googleapis.com\n'
        );
      } else if (error.message.includes('UNAUTHENTICATED')) {
        console.error('💡 ヒント: 認証情報が正しくない可能性があります。');
        console.error(
          '   GOOGLE_APPLICATION_CREDENTIALS環境変数を確認してください。\n'
        );
      } else if (error.message.includes('NOT_FOUND')) {
        console.error('💡 ヒント: 画像ファイルが見つかりません。');
        console.error('   URLまたはファイルパスを確認してください。\n');
      }
    }
    process.exit(1);
  }
}

// コマンドライン引数から画像パスを取得
const imagePath = process.argv[2];

if (!imagePath) {
  console.error(
    '❌ 使い方: npx tsx scripts/test-ocr.ts <画像URL または ローカルパス>\n'
  );
  console.error('例:');
  console.error(
    '  npx tsx scripts/test-ocr.ts https://example.com/receipt.jpg'
  );
  console.error('  npx tsx scripts/test-ocr.ts ./test-images/receipt.jpg\n');
  process.exit(1);
}

testOCR(imagePath);
