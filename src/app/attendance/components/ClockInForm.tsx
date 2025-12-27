'use client';

import { useState } from 'react';
import { WorkLocation } from '../../types';

interface ClockInFormProps {
  workLocations: WorkLocation[];
  onSave: (workLocationId: string, clockInTime: string) => void;
  onCancel: () => void;
}

export default function ClockInForm({
  workLocations,
  onSave,
  onCancel,
}: ClockInFormProps) {
  const now = new Date();
  const defaultTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const [workLocationId, setWorkLocationId] = useState(
    workLocations[0]?.id || ''
  );
  const [clockInTime, setClockInTime] = useState(defaultTime);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!workLocationId) {
      newErrors.workLocationId = '勤務先を選択してください';
    }

    if (!clockInTime) {
      newErrors.clockInTime = '出勤時刻を入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave(workLocationId, clockInTime);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">出勤する</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 勤務先選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              勤務先を選択 <span className="text-red-500">*</span>
            </label>
            <select
              value={workLocationId}
              onChange={(e) => setWorkLocationId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
            >
              {workLocations.map((location) => {
                let rateInfo = '';
                if (location.type === '時給制' && location.hourlyRate) {
                  rateInfo = `時給 ¥${location.hourlyRate.toLocaleString()}`;
                } else if (location.type === '日給制' && location.dailyRate) {
                  rateInfo = `日給 ¥${location.dailyRate.toLocaleString()}`;
                } else if (
                  location.type === '業務委託' &&
                  location.projectRate
                ) {
                  rateInfo = `時間単価 ¥${location.projectRate.toLocaleString()}`;
                }

                return (
                  <option key={location.id} value={location.id}>
                    {location.name} ({rateInfo})
                  </option>
                );
              })}
            </select>
            {errors.workLocationId && (
              <p className="text-red-500 text-sm mt-1">
                {errors.workLocationId}
              </p>
            )}

            {/* 選択中の勤務先情報 */}
            {workLocationId && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">
                    {workLocations.find((l) => l.id === workLocationId)?.name}
                  </span>{' '}
                  での勤務を記録します
                </p>
              </div>
            )}
          </div>

          {/* 出勤時刻 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              出勤時刻 <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              value={clockInTime}
              onChange={(e) => setClockInTime(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.clockInTime && (
              <p className="text-red-500 text-sm mt-1">{errors.clockInTime}</p>
            )}
          </div>

          {/* ボタン */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              出勤する
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
