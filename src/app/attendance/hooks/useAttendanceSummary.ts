import { useState, useCallback } from 'react';

export interface AttendanceRecord {
  id: string;
  userId: string;
  clockIn: string;
  clockOut: string | null;
  breakMinutes: number;
  workLocationId: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceSummary {
  totalWorkMinutes: number;
  totalWorkDays: number;
  averageWorkMinutes: number;
  totalWorkHours: number;
  averageWorkHours: number;
  weeklyData: {
    [key: string]: {
      workMinutes: number;
      workDays: number;
    };
  };
  records: AttendanceRecord[];
}

export function useAttendanceSummary(userId: string | null) {
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(
    async (year: number, month: number) => {
      if (!userId) return;

      try {
        setIsLoading(true);
        setError(null);

        const params = new URLSearchParams({
          userId,
          year: year.toString(),
          month: month.toString(),
        });

        const response = await fetch(
          `/api/attendance/summary?${params.toString()}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch attendance summary');
        }

        const data = await response.json();
        setSummary(data);
      } catch (err) {
        console.error('Error fetching summary:', err);
        setError('月次サマリーの取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    },
    [userId]
  );

  return {
    summary,
    isLoading,
    error,
    fetchSummary,
  };
}
