import { useState, useEffect, useCallback, useRef } from 'react';
import {
  PomodoroMode,
  PomodoroCategory,
  PomodoroTimerState,
  PomodoroSettings,
  PomodoroSession,
  DEFAULT_POMODORO_SETTINGS,
} from '../types';

export function usePomodoro(
  settings: PomodoroSettings = DEFAULT_POMODORO_SETTINGS
) {
  const [timerState, setTimerState] = useState<PomodoroTimerState>({
    mode: '作業',
    status: 'idle',
    remainingSeconds: settings.workDuration * 60,
    currentCategory: 'Coding',
    currentCycle: 1,
  });

  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const [timerDirection, setTimerDirection] = useState(settings.timerDirection);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const sessionStartTimeRef = useRef<string | null>(null);

  // タイマー完了時の処理
  const handleTimerComplete = useCallback(() => {
    const { mode, currentCategory, currentCycle } = timerState;

    // セッション記録
    if (sessionStartTimeRef.current && mode !== '休憩') {
      const session: PomodoroSession = {
        id: `session-${Date.now()}`,
        startTime: sessionStartTimeRef.current,
        endTime: new Date().toISOString(),
        mode,
        category: currentCategory,
        durationMinutes:
          mode === '作業' ? settings.workDuration : settings.longBreakDuration,
        completionStatus: '完走',
      };
      setSessions((prev) => [session, ...prev]);
    }

    // 通知
    if (settings.soundEnabled) {
      // 音通知処理（実装は省略）
      console.log('🔔 タイマー終了！');
    }

    if (settings.desktopNotificationEnabled && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('ポモドーロタイマー', {
          body:
            mode === '作業'
              ? '作業完了！休憩しましょう。'
              : '休憩終了！作業を再開しましょう。',
        });
      }
    }

    // 次のモードへ遷移
    let nextMode: PomodoroMode;
    let nextCycle = currentCycle;

    if (mode === '作業') {
      // 作業完了 → 休憩 or 長休憩
      if (currentCycle >= settings.cyclesBeforeLongBreak) {
        nextMode = '長休憩';
        nextCycle = 1; // サイクルリセット
      } else {
        nextMode = '休憩';
        nextCycle = currentCycle + 1;
      }
    } else {
      // 休憩完了 → 作業
      nextMode = '作業';
    }

    const nextDuration =
      nextMode === '作業'
        ? settings.workDuration
        : nextMode === '休憩'
          ? settings.breakDuration
          : settings.longBreakDuration;

    setTimerState({
      mode: nextMode,
      status:
        nextMode === '休憩' && settings.autoStartBreak ? 'running' : 'idle',
      remainingSeconds: nextDuration * 60,
      currentCategory,
      currentCycle: nextCycle,
    });

    // 自動開始
    if (
      (nextMode === '休憩' && settings.autoStartBreak) ||
      (nextMode === '作業' && settings.autoStartWork)
    ) {
      sessionStartTimeRef.current = new Date().toISOString();
    } else {
      sessionStartTimeRef.current = null;
    }
  }, [timerState, settings]);

  // タイマーが終了したかチェック
  useEffect(() => {
    const duration =
      timerState.mode === '作業'
        ? settings.workDuration
        : timerState.mode === '休憩'
          ? settings.breakDuration
          : settings.longBreakDuration;
    const totalSeconds = duration * 60;

    const isComplete =
      timerDirection === 'countdown'
        ? timerState.remainingSeconds === 0
        : elapsedSeconds >= totalSeconds;

    if (isComplete && timerState.status === 'running') {
      handleTimerComplete();
    }
  }, [
    timerState.remainingSeconds,
    timerState.status,
    timerState.mode,
    elapsedSeconds,
    timerDirection,
    settings,
    handleTimerComplete,
  ]);

  // タイマーを進める
  useEffect(() => {
    if (timerState.status === 'running') {
      intervalRef.current = setInterval(() => {
        if (timerDirection === 'countdown') {
          setTimerState((prev) => ({
            ...prev,
            remainingSeconds: Math.max(0, prev.remainingSeconds - 1),
          }));
        } else {
          // countup mode
          setElapsedSeconds((prev) => prev + 1);
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timerState.status, timerDirection]);

  // タイマー開始
  const start = useCallback(() => {
    setTimerState((prev) => ({ ...prev, status: 'running' }));
    if (!sessionStartTimeRef.current) {
      sessionStartTimeRef.current = new Date().toISOString();
    }
  }, []);

  // タイマー一時停止
  const pause = useCallback(() => {
    setTimerState((prev) => ({ ...prev, status: 'paused' }));
  }, []);

  // タイマーリセット
  const reset = useCallback(() => {
    const duration =
      timerState.mode === '作業'
        ? settings.workDuration
        : timerState.mode === '休憩'
          ? settings.breakDuration
          : settings.longBreakDuration;

    setTimerState((prev) => ({
      ...prev,
      status: 'idle',
      remainingSeconds: duration * 60,
    }));
    setElapsedSeconds(0);
    sessionStartTimeRef.current = null;
  }, [timerState.mode, settings]);

  // スキップ
  const skip = useCallback(() => {
    // 現在のセッションを中断として記録
    if (sessionStartTimeRef.current && timerState.mode === '作業') {
      const session: PomodoroSession = {
        id: `session-${Date.now()}`,
        startTime: sessionStartTimeRef.current,
        endTime: new Date().toISOString(),
        mode: timerState.mode,
        category: timerState.currentCategory,
        durationMinutes: Math.floor(
          (settings.workDuration * 60 - timerState.remainingSeconds) / 60
        ),
        completionStatus: '中断',
      };
      setSessions((prev) => [session, ...prev]);
    }

    handleTimerComplete();
  }, [timerState, settings, handleTimerComplete]);

  // モード切り替え
  const changeMode = useCallback(
    (mode: PomodoroMode) => {
      const duration =
        mode === '作業'
          ? settings.workDuration
          : mode === '休憩'
            ? settings.breakDuration
            : settings.longBreakDuration;

      setTimerState((prev) => ({
        ...prev,
        mode,
        status: 'idle',
        remainingSeconds: duration * 60,
      }));
      setElapsedSeconds(0);
      sessionStartTimeRef.current = null;
    },
    [settings]
  );

  // カテゴリ変更
  const changeCategory = useCallback((category: PomodoroCategory) => {
    setTimerState((prev) => ({ ...prev, currentCategory: category }));
  }, []);

  // 時間延長（+5分）
  const extend = useCallback(() => {
    setTimerState((prev) => ({
      ...prev,
      remainingSeconds: prev.remainingSeconds + 5 * 60,
    }));
  }, []);

  // タイマー方向の切り替え
  const toggleTimerDirection = useCallback(() => {
    const newDirection =
      timerDirection === 'countdown' ? 'countup' : 'countdown';
    setTimerDirection(newDirection);
    setElapsedSeconds(0);
    const duration =
      timerState.mode === '作業'
        ? settings.workDuration
        : timerState.mode === '休憩'
          ? settings.breakDuration
          : settings.longBreakDuration;
    setTimerState((prev) => ({
      ...prev,
      status: 'idle',
      remainingSeconds: duration * 60,
    }));
    sessionStartTimeRef.current = null;
  }, [timerDirection, timerState.mode, settings]);

  // 残り時間を分:秒形式で取得
  const getFormattedTime = useCallback(() => {
    const displaySeconds =
      timerDirection === 'countdown'
        ? timerState.remainingSeconds
        : elapsedSeconds;
    const minutes = Math.floor(displaySeconds / 60);
    const seconds = displaySeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [timerState.remainingSeconds, elapsedSeconds, timerDirection]);

  return {
    timerState,
    sessions,
    timerDirection,
    start,
    pause,
    reset,
    skip,
    extend,
    changeMode,
    changeCategory,
    toggleTimerDirection,
    getFormattedTime,
  };
}
