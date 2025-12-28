// タスク管理の型定義

// 優先度の型定義
export type Priority = '高' | '中' | '低';

// タスク状態
export type TaskStatus = '未着手' | '進行中' | '完了';

// タスクカテゴリ
export type TaskCategory =
  | 'Design'
  | 'Coding'
  | 'Accounting'
  | 'Report'
  | 'Admin'
  | 'Dev'
  | 'React'
  | 'Client A'
  | 'Client B'
  | 'その他';

// タスクビューの種類
export type TaskView = 'カンバン' | 'リスト' | 'カレンダー';

// サブタスク
export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  order: number;
}

// タスクの型定義
export interface Task {
  id: string;
  title: string; // タスク名
  description?: string; // 詳細説明
  status: TaskStatus; // 状態（未着手/進行中/完了）
  priority: Priority; // 優先度
  dueDate?: string; // 期日 (YYYY/MM/DD)
  estimatedMinutes?: number; // 見積時間（分）
  actualMinutes?: number; // 実績時間（分）
  categories?: TaskCategory[]; // カテゴリ/タグ
  subtasks?: Subtask[]; // サブタスク
  completedAt?: string; // 完了日時（ISO string）
  isOverdue?: boolean; // 遅延フラグ（完了時に期限超過していた場合true）
  pomodoroSessions?: number; // ポモドーロセッション数
  linkedCalendarEventId?: string; // 連携カレンダーイベントID
  createdAt: string; // 作成日時
  updatedAt: string; // 更新日時

  // 以下は後方互換性のため
  content?: string; // titleのエイリアス
  completed?: boolean; // status === '完了'のエイリアス
  tags?: string[]; // categoriesのエイリアス
  memo?: string; // descriptionのエイリアス
}

// タスクフィルター条件
export interface TaskFilter {
  status?: TaskStatus[];
  priority?: Priority[];
  categories?: TaskCategory[];
  dueDateRange?: {
    from?: string; // YYYY/MM/DD
    to?: string; // YYYY/MM/DD
  };
  estimatedTimeRange?: {
    min?: number; // 分
    max?: number; // 分
  };
  searchText?: string;
  showOverdueOnly?: boolean;
}

// タスクソート条件
export type TaskSortField =
  | 'dueDate'
  | 'priority'
  | 'estimatedMinutes'
  | 'actualMinutes'
  | 'createdAt'
  | 'updatedAt';
export type TaskSortOrder = 'asc' | 'desc';

export interface TaskSort {
  field: TaskSortField;
  order: TaskSortOrder;
}

// タスク統計（今週）
export interface TaskStatistics {
  totalTasks: number; // 全タスク数
  completedTasks: number; // 完了タスク数
  completionRate: number; // 完了率（%）
  weekOverWeekChange: number; // 先週比（%）
  averageCompletionMinutes: number; // 平均完了時間（分）
  overdueTasks: number; // 遅延タスク数
  inProgressTasks: number; // 進行中タスク数
  pendingTasks: number; // 未着手タスク数
}

// カテゴリ別精度分析
export interface CategoryAccuracy {
  category: TaskCategory;
  totalEstimated: number; // 見積合計時間（分）
  totalActual: number; // 実績合計時間（分）
  accuracy: number; // 精度（%）= 実績/見積 × 100
  taskCount: number; // タスク数
  averageEstimated: number; // 平均見積時間
  averageActual: number; // 平均実績時間
  underestimationRate: number; // 過小評価率（精度<100%の場合の差分%）
  recommendedMultiplier: number; // 推奨係数（次回見積時の乗数）
}

// インサイトデータ
export interface TaskInsight {
  type: 'underestimation' | 'overestimation' | 'accurate' | 'warning';
  category?: TaskCategory;
  message: string; // 例: "あなたはデザイン作業を平均20%過小評価しています。"
  suggestion?: string; // 例: "次回のデザインタスクは、見積を1.2倍に設定することをおすすめします。"
  severity: 'low' | 'medium' | 'high';
}

// タスクダッシュボードデータ
export interface TaskDashboard {
  statistics: TaskStatistics;
  insights: TaskInsight[];
  categoryAccuracies: CategoryAccuracy[];
  upcomingDeadlines: Task[]; // 期日が近いタスク（3日以内）
  overdueTasksList: Task[]; // 期限切れタスク
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
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phoneNumber?: string;
  occupation?: string;
  dateOfBirth?: string; // YYYY-MM-DD
  companyName?: string; // 屋号
}

// 事業情報の型定義
export interface BusinessInfo {
  foundedDate?: string; // YYYY-MM-DD
  blueReturnNumber?: string; // 青色申告承認番号
  businessDescription?: string;
  address?: Address;
}

// 住所の型定義
export interface Address {
  postalCode: string; // XXX-XXXX
  prefecture: string;
  city: string;
  street: string;
  building?: string;
}

// 扶養者情報の型定義
export interface DependentInfo {
  parentIncomeRange?: '0-103' | '103-150' | '150-201' | '201+';
  usingStudentPensionExemption: boolean;
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

// 学習ログの型定義

// 学習カテゴリ
export type StudyCategory =
  | 'Programming'
  | 'Design'
  | 'English'
  | 'Math'
  | 'Other';

// 学習記録
export interface StudyLog {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  category: StudyCategory;
  durationMinutes: number; // 学習時間（分）
  content: string; // 学習内容
  material?: string; // 使用教材（任意）
  rating?: number; // 習得度（1-5）
  createdAt: string;
  updatedAt: string;
}

// カテゴリ別累計
export interface CategoryTotal {
  category: StudyCategory;
  totalHours: number; // 累計時間
  level: number; // レベル
  color: string; // グラフ表示用の色
}

// 学習時間の推移データ
export interface StudyTimeData {
  date: string; // 日付ラベル（12/14など）
  hours: number; // 学習時間
  average: number; // 平均線用の値
}

// スキル
export interface Skill {
  id: string;
  name: string;
  category: StudyCategory;
  progress: number; // 習得率（0-100）
  isUnlocked: boolean; // 解放済みかどうか
  dependencies?: string[]; // 依存スキルのID配列
}

// 月次目標
export interface MonthlyGoal {
  category: StudyCategory;
  current: number; // 現在の時間
  target: number; // 目標時間
  percentage: number; // 達成率
}

// 教材レコメンド
export interface MaterialRecommendation {
  id: string;
  title: string;
  type: '講座' | '書籍' | '動画' | 'その他';
  category: StudyCategory;
  reason: string; // レコメンド理由
  url?: string;
}

// 学習ログダッシュボード
export interface StudyLogDashboard {
  today: {
    hours: number;
    goalHours: number;
    remaining: number;
  };
  weekly: {
    hours: number;
    weekOverWeekChange: number; // 先週比（時間）
    weekOverWeekPercentage: number; // 先週比（%）
  };
  streak: {
    days: number;
    isNewRecord: boolean;
  };
  total: {
    hours: number;
    level: number;
    title: string; // 称号（例: "Master Learner"）
  };
  weeklyData: StudyTimeData[]; // 週次チャート用データ
  monthlyData: StudyTimeData[]; // 月次チャート用データ
  yearlyData: StudyTimeData[]; // 年次チャート用データ
  categoryTotals: CategoryTotal[]; // カテゴリ別累計
  skills: Skill[]; // スキルツリー
  todayLogs: StudyLog[]; // 今日のログ
  monthlyGoals: MonthlyGoal[]; // 月次目標
  recommendations: MaterialRecommendation[]; // 教材レコメンド
  encouragementMessage?: string; // 応援メッセージ
}

// 勤怠管理の型定義

// 勤務先の種類
export type WorkLocationType = '時給制' | '日給制' | '業務委託';

// 勤務先マスタ
export interface WorkLocation {
  id: string;
  name: string;
  type: WorkLocationType;
  hourlyRate?: number; // 時給（時給制の場合）
  dailyRate?: number; // 日給（日給制の場合）
  projectRate?: number; // 単価（業務委託の場合、時間単価）
  color: string; // UI表示用カラー
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 勤怠記録ステータス
export type AttendanceStatus = '未出勤' | '出勤中' | '退勤済み';

// 勤怠記録
export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  workLocationId: string;
  status: AttendanceStatus;
  clockInTime?: string; // HH:MM（出勤時刻）
  clockOutTime?: string; // HH:MM（退勤時刻）
  breakMinutes: number; // 休憩時間（分）
  workMinutes?: number; // 実働時間（分）= (退勤 - 出勤) - 休憩
  memo?: string;
  createdAt: string;
  updatedAt: string;
}

// 月次勤怠サマリー
export interface MonthlyAttendanceSummary {
  month: string; // YYYY-MM
  totalWorkMinutes: number; // 総勤務時間（分）
  totalWorkDays: number; // 出勤日数
  totalSalary: number; // 推定収入（円）
  workLocationBreakdown: {
    workLocationId: string;
    workLocationName: string;
    workMinutes: number;
    workDays: number;
    salary: number;
  }[];
}

// 週間勤務時間データ（グラフ用）
export interface WeeklyWorkData {
  dayOfWeek: string; // "月" - "日"
  workMinutes: number; // その曜日の勤務時間（分）
  date: string; // YYYY-MM-DD（ツールチップ用）
}
