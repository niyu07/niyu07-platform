'use client';

import { Event, EventType } from '../types';
import { useEffect, useState } from 'react';

interface EventTimelineProps {
  events: Event[];
}

const getEventColor = (type: EventType, isCurrent: boolean): string => {
  if (isCurrent) {
    return 'bg-orange-100 border-orange-400 text-orange-900 shadow-md';
  }
  const colors = {
    lecture: 'bg-blue-100 border-blue-300 text-blue-800',
    break: 'bg-gray-100 border-gray-300 text-gray-600',
    work: 'bg-green-100 border-green-300 text-green-800',
    task: 'bg-purple-100 border-purple-300 text-purple-800',
    deadline: 'bg-red-100 border-red-300 text-red-800',
  };
  return colors[type];
};

const getEventIcon = (type: EventType): string => {
  const icons = {
    lecture: '📖',
    break: '☕',
    work: '💼',
    task: '✏️',
    deadline: '⏰',
  };
  return icons[type];
};

const isCurrentEvent = (eventTime: string, nextEventTime?: string): boolean => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeInMinutes = currentHour * 60 + currentMinute;

  const [eventHour, eventMinute] = eventTime.split(':').map(Number);
  const eventTimeInMinutes = eventHour * 60 + eventMinute;

  if (nextEventTime) {
    const [nextHour, nextMinute] = nextEventTime.split(':').map(Number);
    const nextTimeInMinutes = nextHour * 60 + nextMinute;
    return (
      currentTimeInMinutes >= eventTimeInMinutes &&
      currentTimeInMinutes < nextTimeInMinutes
    );
  }

  // 最後のイベントの場合、開始時刻から2時間以内なら現在のイベントとする
  return (
    currentTimeInMinutes >= eventTimeInMinutes &&
    currentTimeInMinutes < eventTimeInMinutes + 120
  );
};

export default function EventTimeline({ events }: EventTimelineProps) {
  const [, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // 1分ごとに更新

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">今日の予定</h2>
        <button className="text-blue-500 text-xs font-medium hover:text-blue-600 flex items-center gap-1">
          すべて見る
          <span>→</span>
        </button>
      </div>

      <div className="space-y-2.5 max-h-150 overflow-y-auto pr-2 custom-scrollbar">
        {events.map((event, index) => {
          const isCurrent = isCurrentEvent(event.time, events[index + 1]?.time);

          return (
            <div key={event.id} className="flex gap-3">
              {/* タイムラインの線 */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    isCurrent
                      ? 'bg-orange-500 border-2 border-orange-600 animate-pulse'
                      : event.type === 'break'
                        ? 'bg-gray-300 border-2 border-gray-400'
                        : event.type === 'lecture'
                          ? 'bg-blue-500 border-2 border-blue-600'
                          : event.type === 'work'
                            ? 'bg-green-500 border-2 border-green-600'
                            : 'bg-purple-500 border-2 border-purple-600'
                  }`}
                />
                {index < events.length - 1 && (
                  <div className="w-0.5 h-full min-h-[50px] bg-gray-200" />
                )}
              </div>

              {/* イベントカード */}
              <div className="flex-1 pb-3">
                <div className="flex items-start gap-2.5">
                  <div
                    className={`text-xs font-medium w-14 mt-0.5 ${isCurrent ? 'text-orange-600 font-bold' : 'text-gray-500'}`}
                  >
                    {event.time}
                  </div>
                  <div
                    className={`flex-1 rounded-lg p-3 border-l-3 ${getEventColor(event.type, isCurrent)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">
                          {getEventIcon(event.type)}
                        </span>
                        <h3 className="font-semibold text-sm">{event.title}</h3>
                      </div>
                      {event.deadline && (
                        <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                          明日まで
                        </span>
                      )}
                    </div>
                    {event.location && (
                      <div className="mt-1.5 text-xs flex items-center gap-1">
                        <span>📍</span>
                        <span>{event.location}</span>
                      </div>
                    )}
                    {event.duration && (
                      <div className="mt-1.5 text-xs text-gray-600">
                        {event.duration}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
