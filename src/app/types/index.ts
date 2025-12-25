// 優先度の型定義
export type Priority = '高' | '中' | '低';

// タスクの型定義
export interface Task {
  id: string;
  content: string;
  completed: boolean;
  priority: Priority;
  dueDate?: string;
  tags?: string[];
  memo?: string;
}

// 予定の種別
export type EventType = 'lecture' | 'break' | 'work' | 'task' | 'deadline';

// 予定の型定義
export interface Event {
  id: string;
  time: string;
  title: string;
  type: EventType;
  location?: string;
  duration?: string;
  deadline?: boolean;
}

// 天気の型定義
export interface Weather {
  location: string;
  currentTemp: number;
  feelsLike: number;
  condition: string;
  hourlyForecast: {
    time: string;
    temp: number;
    icon: string;
  }[];
}

// ポモドーロの型定義
export interface PomodoroData {
  day: string;
  count: number;
  isToday?: boolean;
}

// 支出カテゴリの型定義
export interface ExpenseCategory {
  name: string;
  amount: number;
  percentage: number;
  color: string;
}

// 支出データの型定義
export interface ExpenseData {
  total: number;
  period: string;
  categories: ExpenseCategory[];
}

// サマリーカードのデータ型
export interface SummaryData {
  todayEvents: number;
  todayTasks: {
    completed: number;
    total: number;
    percentage: number;
  };
  weeklyIncome: {
    amount: number;
    change: number;
  };
  todayStudy: {
    goal: number;
    remaining: number;
    percentage: number;
  };
  dependentLimit: {
    remaining: number;
  };
  needsAttention: boolean;
}

// ユーザー情報の型定義
export interface User {
  name: string;
  email: string;
  avatar?: string;
}
