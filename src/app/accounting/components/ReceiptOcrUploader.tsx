'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ファイルタイプチェック
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('画像ファイル（JPEG, PNG, WebP）のみアップロード可能です');
      return;
    }

    // ファイルサイズチェック（5MB）
    if (file.size > 5 * 1024 * 1024) {
      setError('ファイルサイズは5MB以下にしてください');
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

        // OCR使用可能回数をチェック
        if (!ocrUsage.canUseOcr) {
          setError(
            `OCR処理の月間上限（${ocrUsage.limit}回）に達しました。来月まで利用できません。`
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
      console.log('OCR result:', ocrData.data);

      setOcrResult(ocrData.data);
      setIsProcessing(false);

      // 使用状況を再取得
      await fetchUsage();

      // 親コンポーネントにOCR結果を通知
      if (onOcrSuccess) {
        onOcrSuccess(ocrData.data);
      }
    } catch (err) {
      console.error('OCR error:', err);
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
      setIsUploading(false);
      setIsProcessing(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* OCR使用状況 */}
      {usage && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-blue-900">OCR使用状況（今月）</h3>
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
        </div>
      )}

      {/* アップロードボタン */}
      <div>
        <button
          type="button"
          onClick={handleButtonClick}
          disabled={
            isUploading || isProcessing || (usage ? !usage.canUseOcr : false)
          }
          className="w-full px-6 py-4 bg-linear-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isUploading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>アップロード中...</span>
            </>
          ) : isProcessing ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>OCR処理中...</span>
            </>
          ) : (
            <>
              <span className="text-2xl">📸</span>
              <span>レシートを撮影してOCR処理</span>
            </>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />
        <p className="text-xs text-gray-500 mt-2 text-center">
          画像ファイル（JPEG, PNG, WebP）最大5MB
        </p>
      </div>

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

          <div className="grid grid-cols-2 gap-3 text-sm">
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
