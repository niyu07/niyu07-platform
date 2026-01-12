'use client';

import { useState } from 'react';

interface UsageLimitEditorProps {
  currentLimit: number;
  onLimitUpdated: () => void;
}

export default function UsageLimitEditor({
  currentLimit,
  onLimitUpdated,
}: UsageLimitEditorProps) {
  const [newLimit, setNewLimit] = useState(currentLimit);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/ocr-usage/limit', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ limit: newLimit }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || '上限の変更に失敗しました');
      }

      setSuccessMessage('上限を変更しました');
      setIsEditing(false);
      onLimitUpdated();

      // 成功メッセージを3秒後に消す
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Error updating limit:', err);
      setError(err instanceof Error ? err.message : '不明なエラー');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setNewLimit(currentLimit);
    setIsEditing(false);
    setError(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        使用上限の変更
      </h2>

      {!isEditing ? (
        <div>
          <p className="text-gray-600 mb-4">
            現在の上限:{' '}
            <span className="font-bold text-2xl text-gray-900">
              {currentLimit.toLocaleString()}
            </span>{' '}
            回/月
          </p>
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            上限を変更する
          </button>
        </div>
      ) : (
        <div>
          <div className="mb-4">
            <label
              htmlFor="limit-input"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              新しい上限（回/月）
            </label>
            <input
              id="limit-input"
              type="number"
              min="0"
              max="10000"
              value={newLimit}
              onChange={(e) => setNewLimit(parseInt(e.target.value, 10) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSaving}
            />
            <p className="text-sm text-gray-500 mt-1">
              推奨: 900回（Google Cloud無料枠の90%）
            </p>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={isSaving || newLimit === currentLimit}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSaving ? '保存中...' : '保存'}
            </button>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors disabled:cursor-not-allowed"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-green-800 text-sm">✓ {successMessage}</p>
        </div>
      )}

      {/* 説明 */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="font-semibold text-gray-800 mb-2">上限設定について</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Google Cloud Vision API の無料枠は月1,000回です</li>
          <li>• デフォルトでは安全マージンとして900回に設定しています</li>
          <li>• 上限を超えるとOCR機能が使用できなくなります</li>
          <li>• 使用量は毎月1日に自動的にリセットされます</li>
        </ul>
      </div>
    </div>
  );
}
