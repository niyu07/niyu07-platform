import { useState } from 'react';
import {
  PomodoroTimerState,
  PomodoroMode,
  PomodoroCategory,
  TimerDirection,
} from '../types';

interface TimerCardProps {
  timerState: PomodoroTimerState;
  formattedTime: string;
  timerDirection: TimerDirection;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSkip: () => void;
  onModeChange: (mode: PomodoroMode) => void;
  onCategoryChange: (category: PomodoroCategory) => void;
  onToggleTimerDirection: () => void;
}

export default function TimerCard({
  timerState,
  formattedTime,
  timerDirection,
  onStart,
  onPause,
  onReset,
  onSkip,
  onModeChange,
  onCategoryChange,
  onToggleTimerDirection,
}: TimerCardProps) {
  const { mode, status, currentCategory, currentCycle } = timerState;
  const [showSettings, setShowSettings] = useState(false);

  // カテゴリラベルの日本語マッピング
  const categoryLabels: Record<PomodoroCategory, string> = {
    Design: 'デザイン',
    Coding: 'コーディング',
    Study: '学習',
    Meeting: 'ミーティング',
    Other: 'その他',
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* ヘッダー */}
      <div className="bg-gradient-to-br from-red-400 via-red-500 to-orange-500 p-8 text-white relative">
        {/* 設定アイコン */}
        <div className="absolute top-4 right-4">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
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
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>

          {/* 設定ドロップダウン */}
          {showSettings && (
            <div className="absolute top-12 right-0 bg-white rounded-lg shadow-lg py-2 min-w-50 z-10">
              <button
                onClick={() => {
                  onToggleTimerDirection();
                  setShowSettings(false);
                }}
                className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 transition-colors flex items-center justify-between"
              >
                <span className="text-sm">
                  {timerDirection === 'countdown'
                    ? 'カウントダウン'
                    : 'カウントアップ'}
                </span>
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7h12M8 12h12m-12 5h12"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* タイトルとモード */}
        <div className="text-center mb-8">
          <h2 className="text-lg font-semibold mb-2 opacity-90">FOCUS</h2>
          <div className="inline-block bg-white/20 px-4 py-1 rounded-full text-sm">
            セッション {currentCycle}/4
          </div>
        </div>

        {/* メインタイマー */}
        <div className="relative w-80 h-80 mx-auto">
          {/* 外側のリング */}
          <div className="absolute inset-0 rounded-full border-4 border-white/30"></div>

          {/* 時間表示 */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-7xl font-bold tracking-tight">
              {formattedTime}
            </div>
            {/* カテゴリ表示 */}
            <div className="mt-4 px-4 py-2 bg-white/20 rounded-full text-sm">
              {categoryLabels[currentCategory]}
            </div>
          </div>
        </div>

        {/* コントロールボタン */}
        <div className="flex items-center justify-center gap-4 mt-8">
          {/* リセット/戻るボタン */}
          <button
            onClick={onReset}
            className="w-14 h-14 rounded-full bg-white/20 hover:bg-white/30 transition-all flex items-center justify-center"
            title="リセット"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>

          {/* 開始/一時停止ボタン */}
          <button
            onClick={status === 'running' ? onPause : onStart}
            className="w-20 h-20 rounded-full bg-white hover:bg-white/90 transition-all flex items-center justify-center shadow-lg"
          >
            {status === 'running' ? (
              <svg
                className="w-10 h-10 text-red-500"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg
                className="w-10 h-10 text-red-500 ml-1"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* スキップボタン */}
          <button
            onClick={onSkip}
            className="w-14 h-14 rounded-full bg-white/20 hover:bg-white/30 transition-all flex items-center justify-center"
            title="スキップ"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7.58 16.89l5.77-4.07c.56-.4.56-1.24 0-1.63L7.58 7.11C6.91 6.65 6 7.12 6 7.93v8.14c0 .81.91 1.28 1.58.82zM16 7v10c0 .55.45 1 1 1s1-.45 1-1V7c0-.55-.45-1-1-1s-1 .45-1 1z" />
            </svg>
          </button>
        </div>
      </div>

      {/* モード切替タブ */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => onModeChange('作業')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            mode === '作業'
              ? 'text-red-600 border-b-2 border-red-600 bg-red-50'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          作業 25分
        </button>
        <button
          onClick={() => onModeChange('休憩')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            mode === '休憩'
              ? 'text-red-600 border-b-2 border-red-600 bg-red-50'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          休憩 5分
        </button>
        <button
          onClick={() => onModeChange('長休憩')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            mode === '長休憩'
              ? 'text-red-600 border-b-2 border-red-600 bg-red-50'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          長休憩 15分
        </button>
      </div>

      {/* カテゴリ選択 */}
      <div className="p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          カテゴリを選択
        </label>
        <div className="grid grid-cols-5 gap-2">
          {(
            [
              'Design',
              'Coding',
              'Study',
              'Meeting',
              'Other',
            ] as PomodoroCategory[]
          ).map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                currentCategory === cat
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {categoryLabels[cat]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
