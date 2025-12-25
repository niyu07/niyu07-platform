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

// 会計管理の型定義

// 取引種別
export type TransactionType = '収入' | '経費';

// 税区分
export type TaxCategory = '課税' | '不課税' | '免税' | '対象外';

// 収入カテゴリ
export type IncomeCategory = '業務委託' | '広告' | '販売' | 'その他';

// 経費カテゴリ
export type ExpenseAccountCategory =
  | '消耗品費'
  | '通信費'
  | '会議費'
  | '旅費交通費'
  | '外注費'
  | '地代家賃'
  | '水道光熱費'
  | '交際費'
  | '雑費';

// 取引の型定義
export interface Transaction {
  id: string;
  date: string; // YYYY/MM/DD
  type: TransactionType;
  category: IncomeCategory | ExpenseAccountCategory;
  detail: string;
  amount: number; // 正値で保持、表示時に種別に応じて符号を付与
  client?: string; // 取引先
  taxCategory?: TaxCategory;
  memo?: string;
  attachments?: string[]; // ファイルパス
  createdAt: string;
  updatedAt: string;
}

// 月別収支データ
export interface MonthlyFinancialData {
  month: string; // "1月" - "12月"
  profit: number; // 利益
  revenue: number; // 売上
  expense: number; // 経費
}

// 会計KPIデータ
export interface AccountingKPI {
  yearRevenue: number; // 今年の売上
  yearRevenueChange: number; // 前期比（%）
  yearExpense: number; // 今年の経費
  expenseRate: number; // 経費率（%）
  businessIncome: number; // 事業所得（青色控除後）
  dependentRemaining: number; // 扶養枠の残り
}

// 扶養シミュレーター入力データ
export interface TaxSimulatorInput {
  targetYear: number;
  currentRevenue: number; // 現在までの売上
  currentExpense: number; // 現在までの経費
  plannedRevenue: number; // 予定売上
  plannedExpense: number; // 予定経費
  blueReturnDeduction: number; // 青色申告特別控除
  basicDeduction: number; // 基礎控除
}

// 扶養シミュレーター出力データ
export interface TaxSimulatorOutput {
  estimatedBusinessIncome: number; // 推定事業所得（控除後）
  estimatedTaxableIncome: number; // 推定課税所得
  dependentStatus: '扶養内' | '超過リスク' | '超過';
  remainingIncomeCapacity: number; // 残り収入可能額
  monthlyProjection: {
    month: string;
    projected: number;
  }[];
}

// レポートデータ
export interface ReportData {
  period: string;
  totalRevenue: number;
  totalExpense: number;
  profit: number;
  profitMargin: number; // 利益率（%）
  categoryBreakdown: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  clientRevenue: {
    client: string;
    amount: number;
    transactions: number;
    contribution: number; // 貢献度（%）
  }[];
  taxBreakdown: {
    taxCategory: TaxCategory;
    amount: number;
  }[];
}

// 確定申告データ
export interface TaxFilingData {
  year: number;
  totalRevenue: number;
  totalExpense: number;
  businessIncome: number;
  blueReturnDeduction: number;
  taxableIncome: number;
  accountMapping: {
    category: string;
    filingItem: string; // 申告様式の行項目
    amount: number;
  }[];
  isLocked: boolean; // 期間ロック
}

// 会計設定
export interface AccountingSettings {
  fiscalYearStart: number; // 期首月（1-12）
  blueReturnDeduction: number; // 青色申告特別控除額
  basicDeduction: number; // 基礎控除
  dependentIncomeLimit: number; // 扶養ライン目安
  currencyFormat: '¥' | 'JPY';
  displayFormat: 'normal' | 'k' | '万';
  customIncomeCategories: string[];
  customExpenseCategories: string[];
}

// カレンダーの型定義

// カレンダービューの種類
export type CalendarView = '月' | '週' | '日' | 'リスト';

// カレンダーイベントの種別
export type CalendarEventType =
  | '授業'
  | '勤務'
  | '案件'
  | '学習'
  | 'イベント'
  | '休憩';

// 通知タイミング
export type NotificationTiming = 5 | 10 | 30 | 60;

// カレンダーイベント
export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  type: CalendarEventType;
  location?: string;
  memo?: string;
  tags?: string[];
  notification?: NotificationTiming; // 開始前の通知（分）
  recurrence?: {
    pattern: '毎週' | '隔週';
    endDate?: string; // YYYY-MM-DD
  };
  createdAt: string;
  updatedAt: string;
}

// 空き時間
export interface FreeTime {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  durationMinutes: number;
  suggestedUse: '昼休み' | '移動' | '作業' | '休憩';
  suggestedTasks?: string[]; // タスクIDの配列
}

// 日次スケジュールサマリー
export interface DayScheduleSummary {
  date: string; // YYYY-MM-DD
  eventCount: number;
  totalBusyMinutes: number;
  totalFreeMinutes: number;
  events: CalendarEvent[];
  freeTimes: FreeTime[];
}

// 週次分析
export interface WeekAnalysis {
  weekStart: string; // YYYY-MM-DD
  weekEnd: string; // YYYY-MM-DD
  dailyBusyMinutes: {
    date: string;
    busyMinutes: number;
  }[];
  leastBusyDay: string; // 曜日名
  mostBusyDay: string; // 曜日名
  totalEvents: number;
  totalFreeMinutes: number;
  recommendation: string; // 例: "水曜に深い作業を入れるのがおすすめです"
}

// カレンダー設定
export interface CalendarSettings {
  weekStartsOn: 0 | 1; // 0: 日曜日, 1: 月曜日
  defaultView: CalendarView;
  defaultNotification: NotificationTiming;
  workingHours: {
    start: string; // HH:MM
    end: string; // HH:MM
  };
  showWeekNumbers: boolean;
}

// 時限設定
export interface ClassPeriod {
  id: string;
  name: string; // 例: "1限", "2限"
  startTime: string; // HH:MM
  endTime: string; // HH:MM
}

// 時間割テンプレート
export interface TimeTableTemplate {
  id: string;
  dayOfWeek: number; // 0: 日曜日, 1: 月曜日, ..., 6: 土曜日
  periodId: string; // ClassPeriod の id
  title: string;
  type: CalendarEventType;
  location?: string;
  memo?: string;
  tags?: string[];
  notification?: NotificationTiming;
}

// 学期設定
export interface Semester {
  id: string;
  name: string; // 例: "2024年度 後期"
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

// 休暇設定
export interface Holiday {
  id: string;
  name: string; // 例: "冬休み", "春休み"
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}
