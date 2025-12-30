'use client';

import { useState, useEffect } from 'react';
import { AttendanceRecord } from '@/app/types';

interface EditRecordDialogProps {
  record: AttendanceRecord;
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    recordId: string,
    updates: {
      clockIn?: string;
      clockOut?: string;
      note?: string;
    }
  ) => Promise<void>;
  onDelete: (recordId: string) => Promise<void>;
}

export default function EditRecordDialog({
  record,
  isOpen,
  onClose,
  onSave,
  onDelete,
}: EditRecordDialogProps) {
  const [clockIn, setClockIn] = useState(record.clockInTime || '');
  const [clockOut, setClockOut] = useState(record.clockOutTime || '');
  const [note, setNote] = useState(record.memo || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setClockIn(record.clockInTime || '');
    setClockOut(record.clockOutTime || '');
    setNote(record.memo || '');
  }, [record]);

  if (!isOpen) return null;

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave(record.id, {
        clockIn: clockIn || undefined,
        clockOut: clockOut || undefined,
        note: note || undefined,
      });
      onClose();
    } catch (error) {
      console.error('Error saving:', error);
      alert('保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('この勤怠記録を削除しますか？')) return;

    try {
      setIsSaving(true);
      await onDelete(record.id);
      onClose();
    } catch (error) {
      console.error('Error deleting:', error);
      alert('削除に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">勤怠記録を編集</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              日付
            </label>
            <input
              type="text"
              value={record.date}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              出勤時刻
            </label>
            <input
              type="time"
              value={clockIn}
              onChange={(e) => setClockIn(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              退勤時刻
            </label>
            <input
              type="time"
              value={clockOut}
              onChange={(e) => setClockOut(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              メモ
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="備考を入力..."
            />
          </div>
        </div>

        <div className="flex items-center justify-between mt-6 gap-3">
          <button
            onClick={handleDelete}
            disabled={isSaving}
            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
          >
            削除
          </button>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSaving ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
