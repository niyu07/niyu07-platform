'use client';

import { CalendarEvent } from '../../types';

interface EventDetailModalProps {
  event: CalendarEvent;
  onClose: () => void;
  onEdit?: (event: CalendarEvent) => void;
  onDelete?: (eventId: string) => void;
}

export default function EventDetailModal({
  event,
  onClose,
  onEdit,
  onDelete,
}: EventDetailModalProps) {
  const getTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      授業: 'bg-blue-100 text-blue-700',
      勤務: 'bg-purple-100 text-purple-700',
      案件: 'bg-red-100 text-red-700',
      学習: 'bg-green-100 text-green-700',
      イベント: 'bg-yellow-100 text-yellow-700',
      休憩: 'bg-gray-100 text-gray-700',
    };
    return colors[type] || colors['休憩'];
  };

  const formatTime = (time?: string): string => {
    if (!time) return '';
    return time;
  };

  const getNotificationText = (minutes?: number): string => {
    if (!minutes) return 'なし';
    if (minutes === 5) return '5分前';
    if (minutes === 10) return '10分前';
    if (minutes === 30) return '30分前';
    if (minutes === 60) return '1時間前';
    return `${minutes}分前`;
  };

  const handleDelete = () => {
    if (confirm('このイベントを削除しますか?')) {
      onDelete?.(event.id);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {event.title}
              </h2>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(event.type)}`}
              >
                {event.type}
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* 本文 */}
        <div className="p-6 space-y-6">
          {/* 日時情報 */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📅</span>
              <div>
                <p className="text-sm text-gray-500">日付</p>
                <p className="text-gray-900 font-medium">{event.date}</p>
              </div>
            </div>

            {event.startTime && event.endTime && (
              <div className="flex items-center gap-3">
                <span className="text-2xl">🕐</span>
                <div>
                  <p className="text-sm text-gray-500">時間</p>
                  <p className="text-gray-900 font-medium">
                    {formatTime(event.startTime)} - {formatTime(event.endTime)}
                  </p>
                </div>
              </div>
            )}

            {event.location && (
              <div className="flex items-center gap-3">
                <span className="text-2xl">📍</span>
                <div>
                  <p className="text-sm text-gray-500">場所</p>
                  <p className="text-gray-900 font-medium">{event.location}</p>
                </div>
              </div>
            )}
          </div>

          {/* メモ */}
          {event.memo && (
            <div>
              <p className="text-sm text-gray-500 mb-2">メモ</p>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-900 whitespace-pre-wrap">
                  {event.memo}
                </p>
              </div>
            </div>
          )}

          {/* タグ */}
          {event.tags && event.tags.length > 0 && (
            <div>
              <p className="text-sm text-gray-500 mb-2">タグ</p>
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 繰り返し設定 */}
          {event.recurrence && (
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔄</span>
              <div>
                <p className="text-sm text-gray-500">繰り返し</p>
                <p className="text-gray-900 font-medium">
                  {event.recurrence.pattern}
                  {event.recurrence.endDate &&
                    ` - ${event.recurrence.endDate}まで`}
                </p>
              </div>
            </div>
          )}

          {/* 通知 */}
          {event.notification && (
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔔</span>
              <div>
                <p className="text-sm text-gray-500">通知</p>
                <p className="text-gray-900 font-medium">
                  {getNotificationText(event.notification)}
                </p>
              </div>
            </div>
          )}

          {/* メタ情報 */}
          <div className="border-t border-gray-200 pt-4 space-y-1">
            <p className="text-xs text-gray-500">
              作成日: {new Date(event.createdAt).toLocaleString('ja-JP')}
            </p>
            <p className="text-xs text-gray-500">
              最終更新: {new Date(event.updatedAt).toLocaleString('ja-JP')}
            </p>
          </div>
        </div>

        {/* フッター */}
        <div className="border-t border-gray-200 p-6 bg-gray-50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {event.htmlLink && (
              <a
                href={event.htmlLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors"
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
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                Google Calendarで開く
              </a>
            )}
          </div>
          <div className="flex items-center gap-3">
            {onDelete && (
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
              >
                削除
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => {
                  onEdit(event);
                  onClose();
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                編集
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
