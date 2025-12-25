'use client';

import { useEffect, useState } from 'react';

interface GreetingHeaderProps {
  userName: string;
  todayEvents: number;
}

export default function GreetingHeader({
  userName,
  todayEvents,
}: GreetingHeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeToNextEvent, setTimeToNextEvent] = useState('1時間30分');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    const weekday = weekdays[date.getDay()];
    return `${year}年${month}月${day}日(${weekday})`;
  };

  const formatTime = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const getGreeting = (date: Date) => {
    const hours = date.getHours();
    if (hours < 12) return 'おはようございます';
    if (hours < 18) return 'こんにちは';
    return 'こんばんは';
  };

  return (
    <div className="bg-gradient-to-br from-[#6366f1] via-[#7c3aed] to-[#8b5cf6] rounded-xl p-6 text-white shadow-md">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold mb-1.5">
            {getGreeting(currentTime)}、{userName}さん
          </h1>
          <p className="text-base opacity-90 mb-1">{formatDate(currentTime)}</p>
          <p className="text-sm opacity-80">今日も頑張りましょう！✨</p>
          <div className="mt-3 inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5">
            <span className="text-xs font-medium">📅 今日の予定: {todayEvents}件</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-5xl font-bold mb-0.5">{formatTime(currentTime)}</div>
          <div className="text-xs opacity-90">
            {currentTime.getHours() >= 12 ? 'PM' : 'AM'}
          </div>
          <div className="mt-3 text-xs opacity-80 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1">
            次の予定まで {timeToNextEvent}
          </div>
        </div>
      </div>
    </div>
  );
}
