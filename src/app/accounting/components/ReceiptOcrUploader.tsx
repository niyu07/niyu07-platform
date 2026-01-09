'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

/**
 * レシートOCRアップローダーコンポーネント
 *
 * 機能:
 * - ドラッグ&ドロップでのファイルアップロード
 * - モバイルカメラ連携 (capture="environment")
 * - クリップボード貼り付け (Ctrl+V / Cmd+V)
 * - アップロードプレビュー機能
 * - レスポンシブデザイン対応
 *
 * TODO: モバイル版の実機テストを公開後に実施
 * - カメラ起動の動作確認
 * - ドラッグ&ドロップのタッチ操作確認
 * - クリップボード貼り付けの動作確認
 * - プレビュー表示の確認
 */

interface OcrResult {
  storeName: string | null;
  transactionDate: string | null;
  totalAmount: number | null;
  taxAmount: number | null;
  paymentMethod: string | null;
  items: Array<{ name: string; price?: number }>;
  rawText: string;
  confidence: number;
}

interface OcrUsage {
  count: number;
  limit: number;
  remaining: number;
  canUseOcr: boolean;
  percentage: number;
}

interface ReceiptOcrUploaderProps {
  onOcrSuccess?: (ocrData: OcrResult) => void;
}

export default function ReceiptOcrUploader({
  onOcrSuccess,
}: ReceiptOcrUploaderProps) {
  useSession(); // Authentication check
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null);
  const [error, setError] = useState<string>('');
  const [usage, setUsage] = useState<OcrUsage | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // OCR使用状況を取得
  const fetchUsage = async () => {
    try {
      const response = await fetch('/api/receipts/upload');
      if (!response.ok) throw new Error('使用状況の取得に失敗しました');

      const data = await response.json();
      if (data.success && data.data.ocrUsage) {
        setUsage(data.data.ocrUsage);
      }
    } catch (err) {
      console.error('Usage fetch error:', err);
    }
  };

  // 初回マウント時に使用状況を取得
  useEffect(() => {
    fetchUsage();
  }, []);

  // クリップボード貼り付けイベントリスナーを設定
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            processFile(file);
          }
          break;
        }
      }
    };

    // dropZoneがフォーカス可能な場合のみペーストイベントをリッスン
    const dropZone = dropZoneRef.current;
    if (dropZone) {
      dropZone.addEventListener('paste', handlePaste as EventListener);
      return () => {
        dropZone.removeEventListener('paste', handlePaste as EventListener);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ファイル検証とプレビュー生成
  const validateAndPreviewFile = (file: File): boolean => {
    // ファイルタイプチェック
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('画像ファイル（JPEG, PNG, WebP）のみアップロード可能です');
      return false;
    }

    // ファイルサイズチェック（5MB）
    if (file.size > 5 * 1024 * 1024) {
      setError('ファイルサイズは5MB以下にしてください');
      return false;
    }

    // プレビュー画像を生成
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    return true;
  };

  // ファイル処理（アップロードとOCR）
  const processFile = async (file: File) => {
    if (!validateAndPreviewFile(file)) {
      return;
    }

    setError('');
    setOcrResult(null);

    try {
      // 1. 画像をアップロード
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch('/api/receipts/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const uploadError = await uploadResponse.json();
        throw new Error(uploadError.message || 'アップロードに失敗しました');
      }

      const uploadData = await uploadResponse.json();
      const { receiptId, imageUrl, ocrUsage } = uploadData.data;

      console.log('Receipt uploaded:', { receiptId, imageUrl });

      // 使用状況を更新
      if (ocrUsage) {
        setUsage(ocrUsage);

        // Google API使用可能回数をチェック
        if (!ocrUsage.canUseOcr) {
          setError(
            `Google API使用量が月間上限（${ocrUsage.limit}回）に達しました。来月まで利用できません。`
          );
          setIsUploading(false);
          return;
        }
      }

      // 2. OCR処理を実行
      setIsUploading(false);
      setIsProcessing(true);

      const ocrResponse = await fetch('/api/receipts/ocr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ receiptId, imageUrl }),
      });

      if (!ocrResponse.ok) {
        const ocrError = await ocrResponse.json();
        throw new Error(ocrError.message || 'OCR処理に失敗しました');
      }

      const ocrData = await ocrResponse.json();
      console.log('OCR result full response:', ocrData);
      console.log('OCR result data:', ocrData.data);
      console.log('OCR result data details:', {
        storeName: ocrData.data.storeName,
        transactionDate: ocrData.data.transactionDate,
        totalAmount: ocrData.data.totalAmount,
        taxAmount: ocrData.data.taxAmount,
        confidence: ocrData.data.confidence,
      });

      setOcrResult(ocrData.data);
      setIsProcessing(false);

      // 使用状況を再取得
      await fetchUsage();

      // 親コンポーネントにOCR結果を通知
      console.log('Calling onOcrSuccess with data:', ocrData.data);
      if (onOcrSuccess) {
        onOcrSuccess(ocrData.data);
        console.log('onOcrSuccess callback executed');
      } else {
        console.warn('onOcrSuccess callback is not defined');
      }
    } catch (err) {
      console.error('OCR error:', err);
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
      setIsUploading(false);
      setIsProcessing(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  // ドラッグ&ドロップハンドラー
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // 子要素から出た時に誤ってfalseにならないようにチェック
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await processFile(files[0]);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleClearPreview = () => {
    setPreviewUrl(null);
    setOcrResult(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div
      ref={dropZoneRef}
      tabIndex={0}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="space-y-4 outline-none"
      aria-label="レシートアップロードエリア（クリップボードから貼り付け可能）"
    >
      {/* Google API使用状況 */}
      {usage && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-blue-900">
              Google API使用状況（今月）
            </h3>
            <span className="text-sm text-blue-700">
              {usage.count} / {usage.limit} 回
            </span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                usage.percentage >= 90
                  ? 'bg-red-500'
                  : usage.percentage >= 70
                    ? 'bg-yellow-500'
                    : 'bg-blue-600'
              }`}
              style={{ width: `${usage.percentage}%` }}
            />
          </div>
          <p className="text-xs text-blue-600 mt-2">
            残り {usage.remaining} 回利用可能
            {usage.percentage >= 90 && ' ⚠️ 上限に近づいています'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            ※ OCR、カレンダー、タスクなどすべてのGoogle APIの合計
          </p>
        </div>
      )}

      {/* プレビュー表示 */}
      {previewUrl && (
        <div className="relative bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
          <button
            type="button"
            onClick={handleClearPreview}
            className="absolute top-2 right-2 z-10 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
            aria-label="プレビューをクリア"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <div className="flex justify-center">
            <div className="relative w-full max-w-md">
              <Image
                src={previewUrl}
                alt="レシートプレビュー"
                width={400}
                height={600}
                className="rounded-lg shadow-md object-contain w-full h-auto"
                unoptimized
              />
            </div>
          </div>
          <p className="text-sm text-gray-600 text-center mt-2">
            アップロード済み
          </p>
        </div>
      )}

      {/* ドラッグ&ドロップエリア / アップロードボタン */}
      <div
        onClick={handleButtonClick}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer
          ${isDragging ? 'border-blue-500 bg-blue-50 scale-105' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}
          ${isUploading || isProcessing || (usage && !usage.canUseOcr) ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
        `}
      >
        {isUploading ? (
          <div className="space-y-3">
            <div className="w-12 h-12 mx-auto border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-blue-600 font-medium">アップロード中...</p>
          </div>
        ) : isProcessing ? (
          <div className="space-y-3">
            <div className="w-12 h-12 mx-auto border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-purple-600 font-medium">OCR処理中...</p>
            <p className="text-sm text-gray-500">レシートを解析しています</p>
          </div>
        ) : (
          <>
            <div className="text-6xl mb-4">{isDragging ? '📥' : '📸'}</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {isDragging ? 'ここにドロップ' : 'レシートをアップロード'}
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p className="font-medium">以下の方法でアップロードできます：</p>
              <ul className="space-y-1">
                <li className="flex items-center justify-center gap-2">
                  <span>🖱️</span>
                  <span>クリックしてファイル選択</span>
                </li>
                <li className="flex items-center justify-center gap-2 md:hidden">
                  <span>📷</span>
                  <span>カメラで撮影</span>
                </li>
                <li className="flex items-center justify-center gap-2">
                  <span>🎯</span>
                  <span>ドラッグ&ドロップ</span>
                </li>
                <li className="flex items-center justify-center gap-2">
                  <span>📋</span>
                  <span>Ctrl+V または Cmd+V で貼り付け</span>
                </li>
              </ul>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              対応形式: JPEG, PNG, WebP（最大5MB）
            </p>
          </>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
          disabled={
            isUploading || isProcessing || (usage ? !usage.canUseOcr : false)
          }
        />
      </div>

      {/* ヒント */}
      {!previewUrl && !isUploading && !isProcessing && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div className="flex-1 text-sm text-gray-700">
              <p className="font-medium mb-1">ヒント:</p>
              <ul className="space-y-1 text-xs">
                <li>• モバイルの場合、タップするとカメラが起動します</li>
                <li>
                  • スクリーンショットをコピーして Ctrl+V で貼り付けできます
                </li>
                <li>• レシート全体がはっきり写っていると精度が向上します</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* エラー表示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">⚠️ {error}</p>
        </div>
      )}

      {/* OCR結果表示 */}
      {ocrResult && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
          <h3 className="font-medium text-green-900 flex items-center gap-2">
            <span>✅</span>
            <span>OCR処理完了</span>
            <span className="text-xs text-green-600">
              （信頼度: {Math.round(ocrResult.confidence * 100)}%）
            </span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {ocrResult.storeName && (
              <div>
                <span className="text-gray-600">店舗名:</span>
                <p className="font-medium text-gray-900">
                  {ocrResult.storeName}
                </p>
              </div>
            )}

            {ocrResult.transactionDate && (
              <div>
                <span className="text-gray-600">日付:</span>
                <p className="font-medium text-gray-900">
                  {new Date(ocrResult.transactionDate).toLocaleDateString(
                    'ja-JP'
                  )}
                </p>
              </div>
            )}

            {ocrResult.totalAmount !== null && (
              <div>
                <span className="text-gray-600">合計金額:</span>
                <p className="font-medium text-gray-900">
                  ¥{ocrResult.totalAmount.toLocaleString()}
                </p>
              </div>
            )}

            {ocrResult.taxAmount !== null && (
              <div>
                <span className="text-gray-600">消費税:</span>
                <p className="font-medium text-gray-900">
                  ¥{ocrResult.taxAmount.toLocaleString()}
                </p>
              </div>
            )}

            {ocrResult.paymentMethod && (
              <div>
                <span className="text-gray-600">支払い方法:</span>
                <p className="font-medium text-gray-900">
                  {ocrResult.paymentMethod}
                </p>
              </div>
            )}
          </div>

          {ocrResult.items.length > 0 && (
            <div>
              <span className="text-sm text-gray-600">品目:</span>
              <ul className="mt-1 space-y-1">
                {ocrResult.items.slice(0, 5).map((item, index) => (
                  <li
                    key={index}
                    className="text-sm text-gray-900 flex justify-between"
                  >
                    <span>{item.name}</span>
                    {item.price && <span>¥{item.price.toLocaleString()}</span>}
                  </li>
                ))}
                {ocrResult.items.length > 5 && (
                  <li className="text-xs text-gray-500">
                    他 {ocrResult.items.length - 5} 件...
                  </li>
                )}
              </ul>
            </div>
          )}

          <details className="text-xs">
            <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
              抽出されたテキスト全文を表示
            </summary>
            <pre className="mt-2 p-2 bg-white rounded border border-green-200 overflow-x-auto whitespace-pre-wrap text-gray-700">
              {ocrResult.rawText}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
