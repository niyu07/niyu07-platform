'use client';

import { useState } from 'react';
import { AttendanceRecord } from '../../types';

interface ClockOutFormProps {
  record: AttendanceRecord;
  onSave: (clockOutTime: string, breakMinutes: number) => void;
  onCancel: () => void;
}

export default function ClockOutForm({
  record,
  onSave,
  onCancel,
}: ClockOutFormProps) {
  const now = new Date();
  const defaultTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const [clockOutTime, setClockOutTime] = useState(defaultTime);
  const [breakMinutes, setBreakMinutes] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!clockOutTime) {
      newErrors.clockOutTime = '退勤時刻を入力してください';
    }

    if (record.clockInTime && clockOutTime <= record.clockInTime) {
      newErrors.clockOutTime = '退勤時刻は出勤時刻より後である必要があります';
    }

    if (breakMinutes < 0) {
      newErrors.breakMinutes = '休憩時間は0以上である必要があります';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave(clockOutTime, breakMinutes);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">退勤する</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 出勤時刻表示 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">出勤時刻</p>
            <p className="text-lg font-bold text-gray-900">
              {record.clockInTime}
            </p>
          </div>

          {/* 退勤時刻 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              退勤時刻 <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              value={clockOutTime}
              onChange={(e) => setClockOutTime(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            {errors.clockOutTime && (
              <p className="text-red-500 text-sm mt-1">{errors.clockOutTime}</p>
            )}
          </div>

          {/* 休憩時間 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              休憩時間（分）
            </label>
            <input
              type="number"
              value={breakMinutes}
              onChange={(e) => setBreakMinutes(parseInt(e.target.value) || 0)}
              min="0"
              step="15"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            {errors.breakMinutes && (
              <p className="text-red-500 text-sm mt-1">{errors.breakMinutes}</p>
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
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
            >
              退勤する
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
