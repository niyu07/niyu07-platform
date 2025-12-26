// ポモドーロタイマー関連の型定義

// ポモドーロモード
export type PomodoroMode = '作業' | '休憩' | '長休憩';

// ポモドーロタイマー状態
export type PomodoroStatus = 'idle' | 'running' | 'paused';

// タイマーの方向
export type TimerDirection = 'countdown' | 'countup';

// カテゴリ
export type PomodoroCategory =
  | 'Design'
  | 'Coding'
  | 'Study'
  | 'Meeting'
  | 'Other';

// セッション完了状態
export type SessionCompletionStatus = '完走' | '中断';

// ポモドーロセッション
export interface PomodoroSession {
  id: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  mode: PomodoroMode;
  category: PomodoroCategory;
  durationMinutes: number; // 実際の継続時間
  completionStatus: SessionCompletionStatus;
  taskId?: string; // 連携タスクID
  memo?: string;
}

// タイマー設定
export interface PomodoroSettings {
  workDuration: number; // 作業時間（分）
  breakDuration: number; // 休憩時間（分）
  longBreakDuration: number; // 長休憩時間（分）
  cyclesBeforeLongBreak: number; // 長休憩前のサイクル数
  dailyGoal: number; // 1日の目標セッション数
  autoStartBreak: boolean; // 自動で休憩開始
  autoStartWork: boolean; // 自動で作業開始
  soundEnabled: boolean; // 音通知
  desktopNotificationEnabled: boolean; // デスクトップ通知
  timerDirection: TimerDirection; // タイマーの方向（カウントダウン/カウントアップ）
}

// タイマー状態
export interface PomodoroTimerState {
  mode: PomodoroMode;
  status: PomodoroStatus;
  remainingSeconds: number;
  currentCategory: PomodoroCategory;
  currentCycle: number; // 現在のサイクル（1-4）
  currentSessionId?: string;
}

// 日別集計
export interface DailyStats {
  date: string; // YYYY-MM-DD
  completedSessions: number; // 完了セッション数
  focusMinutes: number; // 集中時間（分）
  categoryBreakdown: {
    category: PomodoroCategory;
    minutes: number;
  }[];
  goalAchieved: boolean; // 目標達成
}

// 週間活動データ
export interface WeeklyActivity {
  weekStart: string; // YYYY-MM-DD
  weekEnd: string; // YYYY-MM-DD
  totalMinutes: number; // 合計時間
  dailyStats: {
    day: string; // 曜日名（月、火、...）
    minutes: number;
    categoryBreakdown: {
      category: PomodoroCategory;
      minutes: number;
    }[];
  }[];
  averageMinutesPerDay: number;
}

// カテゴリ別集計
export interface CategoryStats {
  category: PomodoroCategory;
  totalMinutes: number;
  percentage: number; // 全体に対する割合（%）
  sessionCount: number;
  color: string; // チャート表示用の色
}

// 時間帯別生産性データ
export interface TimeSlotProductivity {
  timeSlot: string; // '08-10', '10-12', etc.
  dayOfWeek: number; // 0: 日曜日, 1: 月曜日, ..., 6: 土曜日
  completedSessions: number;
  completionRate: number; // 完走率（%）
  averageFocusMinutes: number;
  productivityScore: number; // 生産性スコア
}

// ゴールデンタイム分析
export interface GoldenTime {
  timeSlot: string; // '14:00 - 16:00'
  dayOfWeek?: number; // 特定の曜日の場合
  averageProductivityScore: number;
  recommendation: string;
}

// ポモドーロダッシュボードデータ
export interface PomodoroDashboard {
  today: DailyStats;
  thisWeek: WeeklyActivity;
  categoryStats: CategoryStats[];
  goldenTime: GoldenTime | null;
  timeSlotProductivity: TimeSlotProductivity[];
  recentSessions: PomodoroSession[];
  currentStreak: number; // 連続実施日数
  longestStreak: number; // 最長連続日数
  isNewRecord: boolean; // 新記録かどうか
}

// バッジタイプ
export type BadgeType = 'goal' | 'streak' | 'perfect' | 'milestone';

// バッジ
export interface Badge {
  type: BadgeType;
  title: string;
  message: string;
  icon: string;
}

// カテゴリ色マッピング
export const CATEGORY_COLORS: Record<PomodoroCategory, string> = {
  Design: '#3B82F6', // 青
  Coding: '#8B5CF6', // 紫
  Study: '#F59E0B', // オレンジ
  Meeting: '#10B981', // 緑
  Other: '#6B7280', // グレー
};

// デフォルト設定
export const DEFAULT_POMODORO_SETTINGS: PomodoroSettings = {
  workDuration: 25,
  breakDuration: 5,
  longBreakDuration: 15,
  cyclesBeforeLongBreak: 4,
  dailyGoal: 4,
  autoStartBreak: true,
  autoStartWork: false,
  soundEnabled: true,
  desktopNotificationEnabled: true,
  timerDirection: 'countdown',
};
