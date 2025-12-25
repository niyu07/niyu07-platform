'use client';

import { useState } from 'react';
import { CalendarEvent, CalendarEventType } from '../../types';
import { formatDate, parseISODate } from '../utils/dateUtils';
import { getEventTypeColor, getEventTypeIcon } from '../utils/eventUtils';

interface ListViewProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
}

export default function ListView({ events, onEventClick }: ListViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<CalendarEventType | '全て'>(
    '全て'
  );

  // イベントをフィルタリング
  const filteredEvents = events
    .filter((event) => {
      const matchesSearch =
        searchQuery === '' ||
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.memo?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = filterType === '全て' || event.type === filterType;

      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.startTime.localeCompare(b.startTime);
    });

  // 日付ごとにグループ化
  const eventsByDate = filteredEvents.reduce(
    (acc, event) => {
      if (!acc[event.date]) {
        acc[event.date] = [];
      }
      acc[event.date].push(event);
      return acc;
    },
    {} as Record<string, CalendarEvent[]>
  );

  const eventTypes: (CalendarEventType | '全て')[] = [
    '全て',
    '授業',
    '勤務',
    '案件',
    '学習',
    'イベント',
    '休憩',
  ];

  return (
    <div className="flex-1 bg-gray-50 overflow-auto">
      <div className="max-w-5xl mx-auto p-8">
        {/* フィルタとサーチ */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex gap-4 mb-4">
            {/* 検索ボックス */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="予定を検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <svg
                  className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* タイプフィルタ */}
          <div className="flex gap-2 flex-wrap">
            {eventTypes.map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* イベントリスト */}
        <div className="space-y-6">
          {Object.keys(eventsByDate).length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
              <div className="text-gray-400 text-5xl mb-4">📅</div>
              <p className="text-gray-600">該当する予定がありません</p>
            </div>
          ) : (
            Object.entries(eventsByDate).map(([dateStr, dayEvents]) => (
              <div key={dateStr}>
                {/* 日付ヘッダー */}
                <div className="mb-3">
                  <h3 className="text-lg font-bold text-gray-900">
                    {formatDate(parseISODate(dateStr))}
                  </h3>
                  <div className="text-sm text-gray-500">
                    {dayEvents.length}件の予定
                  </div>
                </div>

                {/* イベント */}
                <div className="space-y-3">
                  {dayEvents.map((event) => {
                    const colors = getEventTypeColor(event.type);
                    const icon = getEventTypeIcon(event.type);

                    return (
                      <div
                        key={event.id}
                        onClick={() => onEventClick?.(event)}
                        className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                      >
                        <div className="flex items-start gap-4">
                          {/* アイコンと時刻 */}
                          <div className="flex flex-col items-center min-w-[80px]">
                            <span className="text-3xl mb-1">{icon}</span>
                            <div className="text-sm font-semibold text-gray-900">
                              {event.startTime}
                            </div>
                            <div className="text-xs text-gray-500">〜</div>
                            <div className="text-sm font-semibold text-gray-900">
                              {event.endTime}
                            </div>
                          </div>

                          {/* イベント詳細 */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="text-lg font-bold text-gray-900">
                                {event.title}
                              </h4>
                              <span
                                className={`text-xs px-2 py-1 rounded ${colors.bg} ${colors.text}`}
                              >
                                {event.type}
                              </span>
                            </div>

                            {event.location && (
                              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                                <span>📍</span>
                                <span>{event.location}</span>
                              </div>
                            )}

                            {event.memo && (
                              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                <span>💭</span>
                                <span>{event.memo}</span>
                              </div>
                            )}

                            {event.tags && event.tags.length > 0 && (
                              <div className="flex gap-2 flex-wrap">
                                {event.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}

                            {event.notification && (
                              <div className="mt-2 text-xs text-gray-500">
                                🔔 開始{event.notification}分前に通知
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* 統計サマリー */}
        {filteredEvents.length > 0 && (
          <div className="mt-6 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-base font-semibold text-gray-900 mb-4">
              表示中の統計
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {filteredEvents.length}
                </div>
                <div className="text-sm text-gray-600">件の予定</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Object.keys(eventsByDate).length}
                </div>
                <div className="text-sm text-gray-600">日間</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {new Set(filteredEvents.map((e) => e.type)).size}
                </div>
                <div className="text-sm text-gray-600">種類</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
