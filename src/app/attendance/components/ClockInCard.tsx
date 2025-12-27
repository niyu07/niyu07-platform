'use client';

import { useState, useEffect } from 'react';
import { AttendanceStatus, AttendanceRecord, WorkLocation } from '../../types';
import ClockInForm from './ClockInForm';
import ClockOutForm from './ClockOutForm';

interface ClockInCardProps {
  currentStatus: AttendanceStatus;
  todayRecord?: AttendanceRecord;
  workLocations: WorkLocation[];
  onClockIn: (workLocationId: string, clockInTime: string) => void;
  onClockOut: (
    recordId: string,
    clockOutTime: string,
    breakMinutes: number
  ) => void;
}

export default function ClockInCard({
  currentStatus,
  todayRecord,
  workLocations,
  onClockIn,
  onClockOut,
}: ClockInCardProps) {
  const [showClockInForm, setShowClockInForm] = useState(false);
  const [showClockOutForm, setShowClockOutForm] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMounted, setIsMounted] = useState(false);

  // クライアントサイドマウント確認（ハイドレーションエラー回避）
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 現在時刻の更新（出勤中のタイマー用）
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 経過時間の計算（派生状態として計算）
  const elapsedTime = (() => {
    if (currentStatus === '出勤中' && todayRecord?.clockInTime) {
      const [hours, minutes] = todayRecord.clockInTime.split(':').map(Number);
      const clockInDate = new Date();
      clockInDate.setHours(hours, minutes, 0, 0);

      const diff = currentTime.getTime() - clockInDate.getTime();
      const totalSeconds = Math.floor(diff / 1000);

      return {
        hours: Math.floor(totalSeconds / 3600),
        minutes: Math.floor((totalSeconds % 3600) / 60),
        seconds: totalSeconds % 60,
      };
    }
    return { hours: 0, minutes: 0, seconds: 0 };
  })();

  const getCardColor = () => {
    switch (currentStatus) {
      case '未出勤':
        return 'from-blue-400 to-blue-600';
      case '出勤中':
        return 'from-green-400 to-green-600';
      case '退勤済み':
        return 'from-gray-400 to-gray-500';
    }
  };

  const formatTime = (num: number) => String(num).padStart(2, '0');

  return (
    <>
      <div
        className={`bg-gradient-to-br ${getCardColor()} rounded-2xl p-12 text-white shadow-2xl min-h-[600px] flex flex-col items-center justify-center`}
      >
        {/* ステータスバッジ */}
        <div className="mb-8">
          <div className="bg-white/20 backdrop-blur-sm px-8 py-3 rounded-full flex items-center gap-3">
            <span className="w-3 h-3 bg-white rounded-full"></span>
            <span className="font-bold text-xl">{currentStatus}</span>
          </div>
        </div>

        {/* 未出勤状態 */}
        {currentStatus === '未出勤' && (
          <div className="flex flex-col items-center justify-center flex-1 w-full max-w-md">
            {/* 時計アイコン */}
            <div className="mb-12">
              <svg
                width="160"
                height="160"
                viewBox="0 0 160 160"
                fill="none"
                className="opacity-90"
              >
                <circle
                  cx="80"
                  cy="80"
                  r="75"
                  stroke="white"
                  strokeWidth="6"
                  fill="transparent"
                />
                <line
                  x1="80"
                  y1="80"
                  x2="80"
                  y2="40"
                  stroke="white"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                <line
                  x1="80"
                  y1="80"
                  x2="110"
                  y2="80"
                  stroke="white"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* 勤務先選択エリア */}
            <div className="w-full mb-8">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 flex items-center gap-4">
                <span className="text-2xl">💼</span>
                <span className="text-xl font-medium">
                  {workLocations[0]?.name || '勤務先を選択'}
                </span>
                <span className="ml-auto text-2xl opacity-60">▼</span>
              </div>
            </div>

            {/* 出勤ボタン */}
            <button
              onClick={() => setShowClockInForm(true)}
              className="bg-white/90 text-green-600 px-16 py-6 rounded-2xl font-bold hover:bg-white transition-all text-2xl shadow-xl flex items-center gap-4 hover:scale-105 transform"
            >
              <span className="text-3xl">▶</span>
              出勤する
            </button>
          </div>
        )}

        {/* 出勤中状態 */}
        {currentStatus === '出勤中' && todayRecord && (
          <div className="flex flex-col items-center justify-center flex-1 w-full max-w-2xl">
            {/* タイマー表示 */}
            <div className="mb-12">
              <div className="text-[120px] font-bold leading-none tracking-tight font-mono">
                {isMounted ? (
                  <>
                    {formatTime(elapsedTime.hours)}:
                    {formatTime(elapsedTime.minutes)}:
                    {formatTime(elapsedTime.seconds)}
                  </>
                ) : (
                  '00:00:00'
                )}
              </div>
            </div>

            {/* START TIME と DURATION */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-12 w-full max-w-lg">
              <div className="grid grid-cols-2 divide-x divide-white/20">
                <div className="text-center px-6">
                  <p className="text-sm uppercase tracking-wider mb-2 opacity-80">
                    Start Time
                  </p>
                  <p className="text-3xl font-bold">
                    {todayRecord.clockInTime}
                  </p>
                </div>
                <div className="text-center px-6">
                  <p className="text-sm uppercase tracking-wider mb-2 opacity-80">
                    Duration
                  </p>
                  <p className="text-3xl font-bold">
                    {isMounted ? (
                      <>
                        {elapsedTime.hours}h {elapsedTime.minutes}m
                      </>
                    ) : (
                      '0h 0m'
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* 勤務先表示 */}
            <div className="w-full max-w-lg mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 flex items-center gap-4">
                <span className="text-2xl">💼</span>
                <span className="text-xl font-medium">
                  {
                    workLocations.find(
                      (loc) => loc.id === todayRecord.workLocationId
                    )?.name
                  }
                </span>
                <span className="ml-auto text-2xl opacity-40">▼</span>
              </div>
            </div>

            {/* 退勤ボタン */}
            <button
              onClick={() => setShowClockOutForm(true)}
              className="bg-red-500 hover:bg-red-600 text-white px-16 py-6 rounded-2xl font-bold transition-all text-2xl shadow-xl flex items-center gap-4 hover:scale-105 transform"
            >
              <span className="text-3xl">■</span>
              退勤する
            </button>
          </div>
        )}

        {/* 退勤済み状態 */}
        {currentStatus === '退勤済み' && todayRecord && (
          <div className="flex flex-col items-center justify-center flex-1 w-full max-w-md">
            <div className="mb-8">
              <p className="text-3xl font-bold mb-8">
                本日の勤務は終了しました
              </p>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8">
                <div className="grid grid-cols-2 gap-6 text-center">
                  <div>
                    <p className="text-sm opacity-80 mb-2">出勤時刻</p>
                    <p className="text-3xl font-bold">
                      {todayRecord.clockInTime}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm opacity-80 mb-2">退勤時刻</p>
                    <p className="text-3xl font-bold">
                      {todayRecord.clockOutTime}
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-xl opacity-80 text-center mb-8">
                お疲れさまでした
              </p>
            </div>

            <button
              onClick={() => setShowClockInForm(true)}
              className="bg-white/80 text-gray-700 px-12 py-5 rounded-2xl font-bold hover:bg-white transition-all text-xl shadow-lg flex items-center gap-3"
            >
              <span className="text-2xl">▶</span>
              再出勤する
            </button>
          </div>
        )}
      </div>

      {/* 出勤フォームモーダル */}
      {showClockInForm && (
        <ClockInForm
          workLocations={workLocations.filter((loc) => loc.isActive)}
          onSave={(workLocationId, clockInTime) => {
            onClockIn(workLocationId, clockInTime);
            setShowClockInForm(false);
          }}
          onCancel={() => setShowClockInForm(false)}
        />
      )}

      {/* 退勤フォームモーダル */}
      {showClockOutForm && todayRecord && (
        <ClockOutForm
          record={todayRecord}
          onSave={(clockOutTime, breakMinutes) => {
            onClockOut(todayRecord.id, clockOutTime, breakMinutes);
            setShowClockOutForm(false);
          }}
          onCancel={() => setShowClockOutForm(false)}
        />
      )}
    </>
  );
}
