import { useState, useEffect, useCallback } from 'react';
import { getSessions, getStats } from '../lib/api';
import { PomodoroSession, TimeSlotProductivity, GoldenTime } from '../types';

/**
 * DBからポモドーロセッション履歴を取得するカスタムフック
 */
export function usePomodoroData(userId: string) {
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // セッション履歴を取得
  const fetchSessions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 今日のデータを取得
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const data = await getSessions({
        userId,
        startDate: today.toISOString(),
      });

      // APIのレスポンスをPomodoroSession形式に変換
      const convertedSessions: PomodoroSession[] = data.map((session) => ({
        id: session.id,
        startTime: session.startTime.toString(),
        endTime: session.endTime
          ? session.endTime.toString()
          : new Date().toISOString(),
        mode: session.mode as '作業' | '休憩' | '長休憩',
        category: session.category as
          | 'Coding'
          | 'Design'
          | 'Study'
          | 'Meeting'
          | 'Other',
        durationMinutes: session.durationMinutes,
        completionStatus: session.completionStatus as '完走' | '中断',
      }));

      setSessions(convertedSessions);
    } catch (err) {
      setError(err as Error);
      console.error('セッション取得エラー:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // 初回マウント時にデータを取得
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // 手動でリフレッシュする関数
  const refresh = useCallback(() => {
    fetchSessions();
  }, [fetchSessions]);

  return {
    sessions,
    isLoading,
    error,
    refresh,
  };
}

/**
 * 統計データを取得するカスタムフック
 */
export function usePomodoroStats(
  userId: string,
  period: 'today' | 'week' | 'month' = 'today'
) {
  const [stats, setStats] = useState<{
    totalSessions: number;
    focusSessions: number;
    breakSessions: number;
    totalFocusTime: number;
    totalBreakTime: number;
    categoryStats?: Array<{
      category: string;
      totalMinutes: number;
      percentage: number;
      sessionCount: number;
    }>;
    dailyStats?: Array<{
      day: string;
      date: string;
      minutes: number;
      categoryBreakdown: Array<{
        category: string;
        minutes: number;
      }>;
    }>;
    streak?: {
      current: number;
      longest: number;
    };
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getStats(userId, period);
      setStats(data);
    } catch (err) {
      setError(err as Error);
      console.error('統計取得エラー:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, period]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const refresh = useCallback(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refresh,
  };
}

/**
 * ヒートマップデータを取得するカスタムフック
 */
export function usePomodoroHeatmap(userId: string, weeks: number = 4) {
  const [heatmapData, setHeatmapData] = useState<{
    timeSlotProductivity: TimeSlotProductivity[];
    goldenTime: GoldenTime;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchHeatmap = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `/api/pomodoro/productivity-heatmap?weeks=${weeks}`
      );

      if (!response.ok) {
        throw new Error('ヒートマップデータの取得に失敗しました');
      }

      const data = await response.json();
      setHeatmapData(data);
    } catch (err) {
      setError(err as Error);
      console.error('ヒートマップ取得エラー:', err);
    } finally {
      setIsLoading(false);
    }
  }, [weeks]);

  useEffect(() => {
    fetchHeatmap();
  }, [fetchHeatmap]);

  const refresh = useCallback(() => {
    fetchHeatmap();
  }, [fetchHeatmap]);

  return {
    heatmapData,
    isLoading,
    error,
    refresh,
  };
}
