import { useState, useEffect, useCallback } from 'react';
import { AttendanceRecord } from '@/app/types';
import { dbToUiAttendanceRecord } from '../utils/attendanceAdapter';

export function useAttendance(userId: string | null) {
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 勤怠記録を取得
  const fetchAttendanceRecords = useCallback(
    async (startDate?: string, endDate?: string) => {
      if (!userId) {
        setIsLoading(false);
        setAttendanceRecords([]);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const params = new URLSearchParams({ userId });
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        const response = await fetch(`/api/attendance?${params.toString()}`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('[useAttendance] API Error:', {
            status: response.status,
            statusText: response.statusText,
            errorData,
          });
          throw new Error(
            errorData.error ||
              errorData.details ||
              'Failed to fetch attendance records'
          );
        }

        const data = await response.json();
        const uiRecords = data.map(
          (record: {
            id: string;
            userId: string;
            workLocationId: string;
            date: string;
            clockIn: string | null;
            clockOut: string | null;
            workMinutes: number | null;
            note: string | null;
            createdAt: string;
            updatedAt: string;
          }) =>
            dbToUiAttendanceRecord({
              ...record,
              date: new Date(record.date),
              clockIn: record.clockIn ? new Date(record.clockIn) : null,
              clockOut: record.clockOut ? new Date(record.clockOut) : null,
              createdAt: new Date(record.createdAt),
              updatedAt: new Date(record.updatedAt),
            })
        );

        setAttendanceRecords(uiRecords);
      } catch (err) {
        console.error('Error fetching attendance:', err);
        setError('勤怠記録の取得に失敗しました');
        setAttendanceRecords([]); // エラー時は空配列をセット
      } finally {
        setIsLoading(false);
      }
    },
    [userId]
  );

  // 出勤打刻
  const clockIn = useCallback(
    async (workLocationId: string, clockInTime: string) => {
      if (!userId) return;

      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [hours, minutes] = clockInTime.split(':').map(Number);
        const clockInDate = new Date();
        clockInDate.setHours(hours, minutes, 0, 0);

        const response = await fetch('/api/attendance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            workLocationId,
            date: today.toISOString(),
            clockIn: clockInDate.toISOString(),
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to clock in');
        }

        const data = await response.json();
        const newRecord = dbToUiAttendanceRecord({
          ...data,
          date: new Date(data.date),
          clockIn: data.clockIn ? new Date(data.clockIn) : null,
          clockOut: data.clockOut ? new Date(data.clockOut) : null,
          createdAt: new Date(data.createdAt),
          updatedAt: new Date(data.updatedAt),
        });

        setAttendanceRecords((prev) => [newRecord, ...prev]);
      } catch (err) {
        console.error('Error clocking in:', err);
        throw err;
      }
    },
    [userId]
  );

  // 退勤打刻
  const clockOut = useCallback(
    async (recordId: string, clockOutTime: string) => {
      try {
        const record = attendanceRecords.find((r) => r.id === recordId);
        if (!record) {
          throw new Error('Record not found');
        }

        const [hours, minutes] = clockOutTime.split(':').map(Number);
        const clockOutDate = new Date();
        clockOutDate.setHours(hours, minutes, 0, 0);

        const response = await fetch('/api/attendance', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: recordId,
            clockOut: clockOutDate.toISOString(),
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to clock out');
        }

        const data: {
          id: string;
          userId: string;
          workLocationId: string;
          date: string;
          clockIn: string | null;
          clockOut: string | null;
          workMinutes: number | null;
          note: string | null;
          createdAt: string;
          updatedAt: string;
        } = await response.json();
        const updatedRecord = dbToUiAttendanceRecord({
          ...data,
          date: new Date(data.date),
          clockIn: data.clockIn ? new Date(data.clockIn) : null,
          clockOut: data.clockOut ? new Date(data.clockOut) : null,
          createdAt: new Date(data.createdAt),
          updatedAt: new Date(data.updatedAt),
        });

        setAttendanceRecords((prev) =>
          prev.map((r) => (r.id === recordId ? updatedRecord : r))
        );
      } catch (err) {
        console.error('Error clocking out:', err);
        throw err;
      }
    },
    [attendanceRecords]
  );

  // 勤怠記録を編集
  const updateRecord = useCallback(
    async (
      recordId: string,
      updates: {
        clockIn?: string;
        clockOut?: string;
        note?: string;
      }
    ) => {
      try {
        const record = attendanceRecords.find((r) => r.id === recordId);
        if (!record) {
          throw new Error('Record not found');
        }

        const body: {
          id: string;
          clockIn?: string;
          clockOut?: string;
          note?: string;
        } = { id: recordId };

        if (updates.clockIn) {
          const [hours, minutes] = updates.clockIn.split(':').map(Number);
          const clockInDate = new Date(record.date);
          clockInDate.setHours(hours, minutes, 0, 0);
          body.clockIn = clockInDate.toISOString();
        }

        if (updates.clockOut) {
          const [hours, minutes] = updates.clockOut.split(':').map(Number);
          const clockOutDate = new Date(record.date);
          clockOutDate.setHours(hours, minutes, 0, 0);
          body.clockOut = clockOutDate.toISOString();
        }

        if (updates.note !== undefined) {
          body.note = updates.note;
        }

        const response = await fetch('/api/attendance', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          throw new Error('Failed to update record');
        }

        const data = await response.json();
        const updatedRecord = dbToUiAttendanceRecord({
          ...data,
          date: new Date(data.date),
          clockIn: data.clockIn ? new Date(data.clockIn) : null,
          clockOut: data.clockOut ? new Date(data.clockOut) : null,
          createdAt: new Date(data.createdAt),
          updatedAt: new Date(data.updatedAt),
        });

        setAttendanceRecords((prev) =>
          prev.map((r) => (r.id === recordId ? updatedRecord : r))
        );
      } catch (err) {
        console.error('Error updating record:', err);
        throw err;
      }
    },
    [attendanceRecords]
  );

  // 勤怠記録を削除
  const deleteRecord = useCallback(async (recordId: string) => {
    try {
      const response = await fetch(`/api/attendance?id=${recordId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete record');
      }

      setAttendanceRecords((prev) => prev.filter((r) => r.id !== recordId));
    } catch (err) {
      console.error('Error deleting record:', err);
      throw err;
    }
  }, []);

  // 初期ロード
  useEffect(() => {
    if (userId) {
      fetchAttendanceRecords();
    }
  }, [userId, fetchAttendanceRecords]);

  return {
    attendanceRecords,
    isLoading,
    error,
    clockIn,
    clockOut,
    updateRecord,
    deleteRecord,
    refetch: fetchAttendanceRecords,
  };
}
