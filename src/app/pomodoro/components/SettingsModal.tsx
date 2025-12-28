'use client';

import { useState } from 'react';
import { PomodoroSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: PomodoroSettings;
  onSave: (settings: PomodoroSettings) => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSave,
}: SettingsModalProps) {
  const [localSettings, setLocalSettings] =
    useState<PomodoroSettings>(settings);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">ポモドーロ設定</h2>

        <div className="space-y-4">
          {/* 作業時間 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              作業時間（分）
            </label>
            <input
              type="number"
              min="1"
              max="120"
              value={localSettings.workDuration}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  workDuration: parseInt(e.target.value) || 25,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 短い休憩 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              短い休憩（分）
            </label>
            <input
              type="number"
              min="1"
              max="60"
              value={localSettings.breakDuration}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  breakDuration: parseInt(e.target.value) || 5,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 長い休憩 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              長い休憩（分）
            </label>
            <input
              type="number"
              min="1"
              max="120"
              value={localSettings.longBreakDuration}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  longBreakDuration: parseInt(e.target.value) || 15,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 長い休憩までのサイクル数 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              長い休憩までのサイクル数
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={localSettings.cyclesBeforeLongBreak}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  cyclesBeforeLongBreak: parseInt(e.target.value) || 4,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 1日の目標セッション数 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              1日の目標セッション数
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={localSettings.dailyGoal}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  dailyGoal: parseInt(e.target.value) || 4,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 自動開始設定 */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="autoStartBreak"
              checked={localSettings.autoStartBreak}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  autoStartBreak: e.target.checked,
                })
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="autoStartBreak"
              className="ml-2 text-sm text-gray-700"
            >
              休憩を自動開始
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="autoStartWork"
              checked={localSettings.autoStartWork}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  autoStartWork: e.target.checked,
                })
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="autoStartWork"
              className="ml-2 text-sm text-gray-700"
            >
              作業を自動開始
            </label>
          </div>

          {/* 通知設定 */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="soundEnabled"
              checked={localSettings.soundEnabled}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  soundEnabled: e.target.checked,
                })
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="soundEnabled"
              className="ml-2 text-sm text-gray-700"
            >
              音通知を有効化
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="desktopNotificationEnabled"
              checked={localSettings.desktopNotificationEnabled}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  desktopNotificationEnabled: e.target.checked,
                })
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="desktopNotificationEnabled"
              className="ml-2 text-sm text-gray-700"
            >
              デスクトップ通知を有効化
            </label>
          </div>
        </div>

        {/* ボタン */}
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
