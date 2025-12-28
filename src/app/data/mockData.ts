import {
  Task,
  Event,
  Weather,
  PomodoroData,
  ExpenseData,
  SummaryData,
  User,
  Transaction,
  MonthlyFinancialData,
  AccountingKPI,
  AccountingSettings,
  CalendarEvent,
  CalendarSettings,
  StudyLog,
  StudyLogDashboard,
  CategoryTotal,
  StudyTimeData,
  Skill,
  MonthlyGoal,
  MaterialRecommendation,
  WorkLocation,
  AttendanceRecord,
} from '../types';

// モックユーザーデータ
export const mockUser: User = {
  id: 'mock-user-1',
  name: '山田太郎',
  email: 'yamada@example.com',
};

// モック予定データ
export const mockEvents: Event[] = [
  {
    id: '1',
    time: '09:00',
    title: 'プログラミング基礎',
    type: 'lecture',
    location: '3号館201',
  },
  {
    id: '2',
    time: '10:30',
    title: 'データベース設計',
    type: 'lecture',
    location: '2号館105',
  },
  {
    id: '3',
    time: '11:00',
    title: '空き時間',
    type: 'break',
    duration: '1時間',
  },
  {
    id: '4',
    time: '12:00',
    title: 'ランチミーティング',
    type: 'work',
    location: 'カフェテリア',
  },
  {
    id: '5',
    time: '13:00',
    title: 'カフェ勤務',
    type: 'work',
    location: 'スターバックス渋谷店',
  },
  {
    id: '6',
    time: '17:00',
    title: '休憩',
    type: 'break',
    duration: '30分',
  },
  {
    id: '7',
    time: '18:00',
    title: 'Webデザイン作業',
    type: 'task',
    deadline: true,
  },
  {
    id: '8',
    time: '20:00',
    title: '英語の課題',
    type: 'task',
  },
  {
    id: '9',
    time: '21:00',
    title: '自習時間',
    type: 'task',
    duration: '2時間',
  },
];

// モックタスクデータ（後方互換性のため保持、旧形式）
export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Webサイトのデザイン修正',
    content: 'Webサイトのデザイン修正',
    status: '完了',
    completed: true,
    priority: '高',
    createdAt: '2025-12-20T09:00:00',
    updatedAt: '2025-12-22T17:00:00',
  },
  {
    id: '2',
    title: '確定申告の準備を始める',
    content: '確定申告の準備を始める',
    status: '未着手',
    completed: false,
    priority: '中',
    createdAt: '2025-12-21T10:00:00',
    updatedAt: '2025-12-21T10:00:00',
  },
  {
    id: '3',
    title: '英語の宿題を提出',
    content: '英語の宿題を提出',
    status: '未着手',
    completed: false,
    priority: '高',
    createdAt: '2025-12-22T08:00:00',
    updatedAt: '2025-12-22T08:00:00',
  },
  {
    id: '4',
    title: '買い物リスト作成',
    content: '買い物リスト作成',
    status: '完了',
    completed: true,
    priority: '低',
    createdAt: '2025-12-20T11:00:00',
    updatedAt: '2025-12-20T15:00:00',
  },
  {
    id: '5',
    title: 'クライアントにメール返信',
    content: 'クライアントにメール返信',
    status: '未着手',
    completed: false,
    priority: '高',
    createdAt: '2025-12-23T09:00:00',
    updatedAt: '2025-12-23T09:00:00',
  },
  {
    id: '6',
    title: 'プロジェクト資料の整理',
    content: 'プロジェクト資料の整理',
    status: '完了',
    completed: true,
    priority: '中',
    createdAt: '2025-12-21T13:00:00',
    updatedAt: '2025-12-22T10:00:00',
  },
  {
    id: '7',
    title: 'データベース設計書作成',
    content: 'データベース設計書作成',
    status: '未着手',
    completed: false,
    priority: '中',
    createdAt: '2025-12-22T14:00:00',
    updatedAt: '2025-12-22T14:00:00',
  },
  {
    id: '8',
    title: 'テストコードの追加',
    content: 'テストコードの追加',
    status: '完了',
    completed: true,
    priority: '低',
    createdAt: '2025-12-20T16:00:00',
    updatedAt: '2025-12-21T12:00:00',
  },
  {
    id: '9',
    title: 'ミーティング議事録作成',
    content: 'ミーティング議事録作成',
    status: '未着手',
    completed: false,
    priority: '低',
    createdAt: '2025-12-23T11:00:00',
    updatedAt: '2025-12-23T11:00:00',
  },
  {
    id: '10',
    title: 'レビュー対応',
    content: 'レビュー対応',
    status: '完了',
    completed: true,
    priority: '中',
    createdAt: '2025-12-21T15:00:00',
    updatedAt: '2025-12-22T14:00:00',
  },
  {
    id: '11',
    title: 'ドキュメント更新',
    content: 'ドキュメント更新',
    status: '未着手',
    completed: false,
    priority: '低',
    createdAt: '2025-12-23T10:00:00',
    updatedAt: '2025-12-23T10:00:00',
  },
  {
    id: '12',
    title: 'バグ修正',
    content: 'バグ修正',
    status: '未着手',
    completed: false,
    priority: '高',
    createdAt: '2025-12-23T12:00:00',
    updatedAt: '2025-12-23T12:00:00',
  },
];

// モック天気データ
export const mockWeather: Weather = {
  location: '東京都渋谷区',
  currentTemp: 15,
  feelsLike: 13,
  condition: '晴れ',
  hourlyForecast: [
    { time: '15:00', temp: 15, icon: '☀️' },
    { time: '18:00', temp: 13, icon: '☁️' },
    { time: '21:00', temp: 10, icon: '🌙' },
  ],
};

// モックポモドーロデータ（今日は木曜日）
export const mockPomodoroData: PomodoroData[] = [
  { day: '月', count: 18 },
  { day: '火', count: 16 },
  { day: '水', count: 14 },
  { day: '木', count: 12, isToday: true },
  { day: '金', count: 0 },
  { day: '土', count: 0 },
  { day: '日', count: 0 },
];

// モック支出データ
export const mockExpenseData: ExpenseData = {
  total: 245000,
  period: '12月1日〜20日',
  categories: [
    { name: '家賃・光熱費', amount: 98000, percentage: 40, color: '#4F7FFF' },
    { name: '食費', amount: 61250, percentage: 25, color: '#4CAF50' },
    { name: '交通費', amount: 36750, percentage: 15, color: '#FF9800' },
    { name: 'その他', amount: 49000, percentage: 20, color: '#9E9E9E' },
  ],
};

// モックサマリーデータ
export const mockSummaryData: SummaryData = {
  todayEvents: 3,
  todayTasks: {
    completed: 5,
    total: 12,
    percentage: 42,
  },
  weeklyIncome: {
    amount: 85000,
    change: 12,
  },
  todayStudy: {
    goal: 3.5,
    remaining: 1.5,
    percentage: 70,
  },
  dependentLimit: {
    remaining: 180000,
  },
  needsAttention: true,
};

// モック会計データ

// モック取引データ
export const mockTransactions: Transaction[] = [
  {
    id: '1',
    date: '2024/12/20',
    type: '収入',
    category: '業務委託',
    detail: 'クライアントA Webデザイン',
    amount: 85000,
    client: '株式会社A',
    taxCategory: '課税',
    createdAt: '2024-12-20T10:00:00',
    updatedAt: '2024-12-20T10:00:00',
  },
  {
    id: '2',
    date: '2024/12/18',
    type: '経費',
    category: '消耗品費',
    detail: '参考書籍「React入門」',
    amount: 3200,
    taxCategory: '課税',
    createdAt: '2024-12-18T14:30:00',
    updatedAt: '2024-12-18T14:30:00',
  },
  {
    id: '3',
    date: '2024/12/15',
    type: '経費',
    category: '通信費',
    detail: 'AWSサーバー費用',
    amount: 1500,
    taxCategory: '課税',
    createdAt: '2024-12-15T09:00:00',
    updatedAt: '2024-12-15T09:00:00',
  },
  {
    id: '4',
    date: '2024/12/12',
    type: '収入',
    category: '業務委託',
    detail: 'クライアントB ロゴ作成',
    amount: 45000,
    client: '株式会社B',
    taxCategory: '課税',
    createdAt: '2024-12-12T11:00:00',
    updatedAt: '2024-12-12T11:00:00',
  },
  {
    id: '5',
    date: '2024/12/10',
    type: '経費',
    category: '会議費',
    detail: '打ち合わせ（カフェ）',
    amount: 850,
    taxCategory: '課税',
    createdAt: '2024-12-10T15:20:00',
    updatedAt: '2024-12-10T15:20:00',
  },
  {
    id: '6',
    date: '2024/11/25',
    type: '収入',
    category: '業務委託',
    detail: 'クライアントC LP制作',
    amount: 120000,
    client: '株式会社C',
    taxCategory: '課税',
    createdAt: '2024-11-25T16:00:00',
    updatedAt: '2024-11-25T16:00:00',
  },
  {
    id: '7',
    date: '2024/11/20',
    type: '経費',
    category: '地代家賃',
    detail: '事務所家賃（11月分）',
    amount: 80000,
    taxCategory: '課税',
    createdAt: '2024-11-20T10:00:00',
    updatedAt: '2024-11-20T10:00:00',
  },
  {
    id: '8',
    date: '2024/11/15',
    type: '経費',
    category: '水道光熱費',
    detail: '電気代（10月分）',
    amount: 8500,
    taxCategory: '課税',
    createdAt: '2024-11-15T09:30:00',
    updatedAt: '2024-11-15T09:30:00',
  },
  {
    id: '9',
    date: '2024/11/10',
    type: '収入',
    category: '業務委託',
    detail: 'クライアントA バナー制作',
    amount: 35000,
    client: '株式会社A',
    taxCategory: '課税',
    createdAt: '2024-11-10T14:00:00',
    updatedAt: '2024-11-10T14:00:00',
  },
  {
    id: '10',
    date: '2024/11/05',
    type: '経費',
    category: '通信費',
    detail: 'インターネット料金',
    amount: 5500,
    taxCategory: '課税',
    createdAt: '2024-11-05T10:00:00',
    updatedAt: '2024-11-05T10:00:00',
  },
];

// モック月別収支データ
export const mockMonthlyFinancialData: MonthlyFinancialData[] = [
  { month: '1月', profit: 35000, revenue: 50000, expense: 15000 },
  { month: '2月', profit: 45000, revenue: 75000, expense: 30000 },
  { month: '3月', profit: 55000, revenue: 90000, expense: 35000 },
  { month: '4月', profit: 45000, revenue: 75000, expense: 30000 },
  { month: '5月', profit: 70000, revenue: 100000, expense: 30000 },
  { month: '6月', profit: 65000, revenue: 110000, expense: 45000 },
  { month: '7月', profit: 55000, revenue: 95000, expense: 40000 },
  { month: '8月', profit: 50000, revenue: 85000, expense: 35000 },
  { month: '9月', profit: 60000, revenue: 105000, expense: 45000 },
  { month: '10月', profit: 75000, revenue: 135000, expense: 60000 },
  { month: '11月', profit: 85000, revenue: 150000, expense: 65000 },
  { month: '12月', profit: 90000, revenue: 130000, expense: 40000 },
];

// モック会計KPIデータ
export const mockAccountingKPI: AccountingKPI = {
  yearRevenue: 920000,
  yearRevenueChange: 15.2,
  yearExpense: 340000,
  expenseRate: 37,
  businessIncome: 230000, // 920000 - 340000 - 350000(青色控除) = 230000
  dependentRemaining: 180000,
};

// モック会計設定
export const mockAccountingSettings: AccountingSettings = {
  fiscalYearStart: 1,
  blueReturnDeduction: 650000,
  basicDeduction: 480000,
  dependentIncomeLimit: 480000,
  currencyFormat: '¥',
  displayFormat: 'normal',
  customIncomeCategories: [],
  customExpenseCategories: [],
};

// モックカレンダーデータ

// モックカレンダーイベント（2025年12月を中心に）
export const mockCalendarEvents: CalendarEvent[] = [
  // 12月25日（木）の予定
  {
    id: 'cal-1',
    title: 'プログラミング基礎',
    date: '2025-12-25',
    startTime: '09:00',
    endTime: '12:00',
    type: '授業',
    location: '3号館201教室',
    memo: '第13回：データベース基礎',
    tags: ['授業', 'プログラミング'],
    notification: 10,
    recurrence: {
      pattern: '毎週',
      endDate: '2026-01-30',
    },
    createdAt: '2025-12-01T10:00:00',
    updatedAt: '2025-12-01T10:00:00',
  },
  {
    id: 'cal-2',
    title: 'カフェバイト',
    date: '2025-12-25',
    startTime: '13:00',
    endTime: '18:00',
    type: '勤務',
    location: 'スターバックス渋谷店',
    notification: 30,
    tags: ['勤務'],
    createdAt: '2025-12-01T10:00:00',
    updatedAt: '2025-12-01T10:00:00',
  },
  {
    id: 'cal-3',
    title: 'Webデザイン案件',
    date: '2025-12-25',
    startTime: '20:00',
    endTime: '22:00',
    type: '案件',
    location: '自宅',
    memo: 'クライアントA：LP デザイン修正',
    tags: ['案件', 'デザイン'],
    notification: 10,
    createdAt: '2025-12-01T10:00:00',
    updatedAt: '2025-12-01T10:00:00',
  },
  // 12月26日（金）の予定
  {
    id: 'cal-4',
    title: '英語',
    date: '2025-12-26',
    startTime: '10:30',
    endTime: '12:00',
    type: '授業',
    location: '2号館105教室',
    notification: 10,
    tags: ['授業', '英語'],
    recurrence: {
      pattern: '毎週',
      endDate: '2026-01-30',
    },
    createdAt: '2025-12-01T10:00:00',
    updatedAt: '2025-12-01T10:00:00',
  },
  // 12月23日（火）の予定
  {
    id: 'cal-5',
    title: 'データベース設計',
    date: '2025-12-23',
    startTime: '09:00',
    endTime: '11:00',
    type: '授業',
    location: '1号館301教室',
    notification: 10,
    tags: ['授業', 'データベース'],
    recurrence: {
      pattern: '毎週',
      endDate: '2026-01-30',
    },
    createdAt: '2025-12-01T10:00:00',
    updatedAt: '2025-12-01T10:00:00',
  },
  {
    id: 'cal-6',
    title: 'カフェバイト',
    date: '2025-12-23',
    startTime: '13:00',
    endTime: '17:00',
    type: '勤務',
    location: 'スターバックス渋谷店',
    notification: 30,
    tags: ['勤務'],
    createdAt: '2025-12-01T10:00:00',
    updatedAt: '2025-12-01T10:00:00',
  },
  // 12月24日（水）の予定
  {
    id: 'cal-7',
    title: 'React開発',
    date: '2025-12-24',
    startTime: '10:00',
    endTime: '12:00',
    type: '学習',
    location: '図書館',
    memo: 'React Hooks の復習',
    tags: ['学習', 'プログラミング'],
    notification: 10,
    createdAt: '2025-12-01T10:00:00',
    updatedAt: '2025-12-01T10:00:00',
  },
  {
    id: 'cal-8',
    title: 'クリスマスイブパーティー',
    date: '2025-12-24',
    startTime: '19:00',
    endTime: '22:00',
    type: 'イベント',
    location: '友人宅',
    notification: 60,
    tags: ['イベント'],
    createdAt: '2025-12-01T10:00:00',
    updatedAt: '2025-12-01T10:00:00',
  },
  // 12月27日（土）の予定
  {
    id: 'cal-9',
    title: 'ポートフォリオサイト制作',
    date: '2025-12-27',
    startTime: '10:00',
    endTime: '16:00',
    type: '案件',
    location: '自宅',
    memo: '個人プロジェクト',
    tags: ['案件', '開発'],
    notification: 10,
    createdAt: '2025-12-01T10:00:00',
    updatedAt: '2025-12-01T10:00:00',
  },
  // 12月22日（月）の予定
  {
    id: 'cal-10',
    title: 'アルゴリズム演習',
    date: '2025-12-22',
    startTime: '13:00',
    endTime: '15:00',
    type: '授業',
    location: '3号館205教室',
    notification: 10,
    tags: ['授業', 'アルゴリズム'],
    recurrence: {
      pattern: '毎週',
      endDate: '2026-01-30',
    },
    createdAt: '2025-12-01T10:00:00',
    updatedAt: '2025-12-01T10:00:00',
  },
  {
    id: 'cal-11',
    title: 'ジム',
    date: '2025-12-22',
    startTime: '18:00',
    endTime: '19:30',
    type: 'イベント',
    location: 'フィットネスクラブ',
    notification: 30,
    tags: ['運動'],
    recurrence: {
      pattern: '毎週',
    },
    createdAt: '2025-12-01T10:00:00',
    updatedAt: '2025-12-01T10:00:00',
  },
  // 1月の予定（いくつか）
  {
    id: 'cal-12',
    title: 'プログラミング基礎',
    date: '2026-01-08',
    startTime: '09:00',
    endTime: '12:00',
    type: '授業',
    location: '3号館201教室',
    notification: 10,
    tags: ['授業', 'プログラミング'],
    createdAt: '2025-12-01T10:00:00',
    updatedAt: '2025-12-01T10:00:00',
  },
  {
    id: 'cal-13',
    title: '新年会',
    date: '2026-01-05',
    startTime: '18:00',
    endTime: '21:00',
    type: 'イベント',
    location: '居酒屋',
    notification: 60,
    tags: ['イベント'],
    createdAt: '2025-12-01T10:00:00',
    updatedAt: '2025-12-01T10:00:00',
  },
];

// モックカレンダー設定
export const mockCalendarSettings: CalendarSettings = {
  weekStartsOn: 0, // 日曜日始まり
  defaultView: '月',
  defaultNotification: 10,
  workingHours: {
    start: '09:00',
    end: '18:00',
  },
  showWeekNumbers: false,
};

// モックタスク管理データ（デザイン仕様に準拠）
// 2025年12月26日（木）を「今日」として設定
export const mockTaskManagementData: Task[] = [
  // 未着手（2件）
  {
    id: 'task-1',
    title: 'Webサイトデザイン修正',
    description: 'クライアントAのWebサイトのデザイン修正依頼対応',
    status: '未着手',
    priority: '高',
    dueDate: '2025/12/26', // 今日
    estimatedMinutes: 180, // 3h
    categories: ['Design', 'Client A'],
    subtasks: [
      {
        id: 'st-1-1',
        title: 'ヘッダーデザイン修正',
        completed: true,
        order: 1,
      },
      {
        id: 'st-1-2',
        title: 'フッターデザイン修正',
        completed: true,
        order: 2,
      },
      { id: 'st-1-3', title: 'カラースキーム調整', completed: false, order: 3 },
      { id: 'st-1-4', title: 'レスポンシブ対応', completed: false, order: 4 },
      { id: 'st-1-5', title: 'デザインレビュー', completed: false, order: 5 },
    ],
    createdAt: '2025-12-23T09:00:00',
    updatedAt: '2025-12-25T15:30:00',
  },
  {
    id: 'task-2',
    title: '週次レポート作成',
    description: '先週の業務レポートをまとめる',
    status: '未着手',
    priority: '低',
    dueDate: '2025/12/26', // 今日（あと0日）
    estimatedMinutes: 60, // 1h
    categories: ['Report'],
    createdAt: '2025-12-24T10:00:00',
    updatedAt: '2025-12-24T10:00:00',
  },
  // 進行中（1件）
  {
    id: 'task-3',
    title: '会計データの入力',
    description: '12月分の収支データを会計システムに入力',
    status: '進行中',
    priority: '中',
    dueDate: '2025/12/28', // あと2日
    estimatedMinutes: 120, // 2h
    actualMinutes: 30, // 実績30分（進行中）
    categories: ['Accounting', 'Admin'],
    subtasks: [
      { id: 'st-3-1', title: '収入データ入力', completed: true, order: 1 },
      { id: 'st-3-2', title: '経費データ入力', completed: false, order: 2 },
    ],
    pomodoroSessions: 1, // 25分×1セッション
    createdAt: '2025-12-26T08:00:00',
    updatedAt: '2025-12-26T09:30:00',
  },
  // 完了（1件・遅延フラグあり）
  {
    id: 'task-4',
    title: 'Reactコンポーネント実装',
    description: '新しいReactコンポーネントを実装してテストを書く',
    status: '完了',
    priority: '高',
    dueDate: '2025/12/22', // 期限：12/22
    estimatedMinutes: 180, // 見積：3h
    actualMinutes: 240, // 実績：4h（過小評価）
    categories: ['Dev', 'React'],
    completedAt: '2025-12-25T18:00:00', // 12/25に完了（遅延）
    isOverdue: true, // 遅延フラグ
    pomodoroSessions: 8, // 25分×8セッション = 200分（実績時間と一致しない場合あり）
    createdAt: '2025-12-20T09:00:00',
    updatedAt: '2025-12-25T18:00:00',
  },
  // 追加のタスク（統計・インサイト計算用）
  {
    id: 'task-5',
    title: 'UIプロトタイプ作成',
    description: 'Figmaで新機能のUIプロトタイプを作成',
    status: '完了',
    priority: '中',
    dueDate: '2025/12/20',
    estimatedMinutes: 120, // 2h
    actualMinutes: 150, // 2.5h（過小評価25%）
    categories: ['Design'],
    completedAt: '2025-12-20T16:30:00',
    createdAt: '2025-12-18T10:00:00',
    updatedAt: '2025-12-20T16:30:00',
  },
  {
    id: 'task-6',
    title: 'APIエンドポイント実装',
    description: 'RESTful APIの新エンドポイントを実装',
    status: '完了',
    priority: '高',
    dueDate: '2025/12/21',
    estimatedMinutes: 240, // 4h
    actualMinutes: 230, // 3.8h（精度高い）
    categories: ['Coding', 'Dev'],
    completedAt: '2025-12-21T17:00:00',
    createdAt: '2025-12-19T09:00:00',
    updatedAt: '2025-12-21T17:00:00',
  },
  {
    id: 'task-7',
    title: 'テストケース作成',
    description: 'ユニットテストとE2Eテストを作成',
    status: '完了',
    priority: '中',
    dueDate: '2025/12/22',
    estimatedMinutes: 180, // 3h
    actualMinutes: 170, // 2.8h（精度高い）
    categories: ['Coding'],
    completedAt: '2025-12-22T15:00:00',
    createdAt: '2025-12-20T10:00:00',
    updatedAt: '2025-12-22T15:00:00',
  },
  {
    id: 'task-8',
    title: 'ロゴデザイン提案',
    description: 'クライアントB向けのロゴデザイン案を3つ作成',
    status: '完了',
    priority: '高',
    dueDate: '2025/12/19',
    estimatedMinutes: 150, // 2.5h
    actualMinutes: 180, // 3h（過小評価20%）
    categories: ['Design', 'Client B'],
    completedAt: '2025-12-19T18:00:00',
    createdAt: '2025-12-17T09:00:00',
    updatedAt: '2025-12-19T18:00:00',
  },
  {
    id: 'task-9',
    title: 'データベース最適化',
    description: 'クエリのパフォーマンスを改善',
    status: '完了',
    priority: '中',
    dueDate: '2025/12/23',
    estimatedMinutes: 120, // 2h
    actualMinutes: 115, // 1.9h（精度高い）
    categories: ['Coding'],
    completedAt: '2025-12-23T14:00:00',
    createdAt: '2025-12-21T10:00:00',
    updatedAt: '2025-12-23T14:00:00',
  },
  // 今後のタスク（期日が近い）
  {
    id: 'task-10',
    title: '月次報告書作成',
    description: '12月の月次報告書を作成',
    status: '未着手',
    priority: '高',
    dueDate: '2025/12/27', // 明日
    estimatedMinutes: 90,
    categories: ['Report', 'Admin'],
    createdAt: '2025-12-25T10:00:00',
    updatedAt: '2025-12-25T10:00:00',
  },
  {
    id: 'task-11',
    title: 'クライアントミーティング準備',
    description: 'プレゼン資料の作成と練習',
    status: '未着手',
    priority: '高',
    dueDate: '2025/12/29', // あと3日
    estimatedMinutes: 120,
    categories: ['Admin', 'Client A'],
    createdAt: '2025-12-25T11:00:00',
    updatedAt: '2025-12-25T11:00:00',
  },
  // 遅延タスク
  {
    id: 'task-12',
    title: 'セキュリティ監査対応',
    description: 'セキュリティ監査で指摘された項目の修正',
    status: '未着手',
    priority: '高',
    dueDate: '2025/12/24', // 遅延（2日前）
    estimatedMinutes: 180,
    categories: ['Coding', 'Dev'],
    createdAt: '2025-12-22T09:00:00',
    updatedAt: '2025-12-22T09:00:00',
  },
];

// 学習ログのモックデータ
// 現在日: 2025年12月26日（木）

// 今日の学習ログ
export const mockTodayStudyLogs: StudyLog[] = [
  {
    id: 'log-1',
    date: '2025-12-26',
    time: '16:30',
    category: 'Programming',
    durationMinutes: 150, // 2h 30m
    content: 'ReactのuseEffectについて学習。依存配列の挙動を確認。',
    material: 'Udemy React講座',
    rating: 4,
    createdAt: '2025-12-26T16:30:00',
    updatedAt: '2025-12-26T19:00:00',
  },
  {
    id: 'log-2',
    date: '2025-12-26',
    time: '11:00',
    category: 'English',
    durationMinutes: 60, // 1h
    content: 'TOEIC リーディング対策 Part5',
    material: '公式問題集',
    rating: 3,
    createdAt: '2025-12-26T11:00:00',
    updatedAt: '2025-12-26T12:00:00',
  },
];

// 週次学習時間データ（12/14〜12/20）
export const mockWeeklyStudyData: StudyTimeData[] = [
  { date: '12/14', hours: 3.5, average: 3.8 },
  { date: '12/15', hours: 4.0, average: 3.8 },
  { date: '12/16', hours: 2.0, average: 3.8 },
  { date: '12/17', hours: 5.0, average: 3.8 },
  { date: '12/18', hours: 3.5, average: 3.8 },
  { date: '12/19', hours: 6.5, average: 3.8 },
  { date: '12/20', hours: 4.0, average: 3.8 },
];

// カテゴリ別累計データ
export const mockCategoryTotals: CategoryTotal[] = [
  {
    category: 'Programming',
    totalHours: 99.2,
    level: 12,
    color: '#4F7FFF',
  },
  {
    category: 'Design',
    totalHours: 62.0,
    level: 8,
    color: '#4CAF50',
  },
  {
    category: 'English',
    totalHours: 49.6,
    level: 7,
    color: '#9C27B0',
  },
  {
    category: 'Math',
    totalHours: 24.8,
    level: 4,
    color: '#FF9800',
  },
  {
    category: 'Other',
    totalHours: 12.4,
    level: 2,
    color: '#9E9E9E',
  },
];

// スキルツリーデータ
export const mockSkills: Skill[] = [
  {
    id: 'skill-1',
    name: 'HTML/CSS',
    category: 'Programming',
    progress: 100,
    isUnlocked: true,
  },
  {
    id: 'skill-2',
    name: 'JavaScript',
    category: 'Programming',
    progress: 80,
    isUnlocked: true,
    dependencies: ['skill-1'],
  },
  {
    id: 'skill-3',
    name: 'React',
    category: 'Programming',
    progress: 65,
    isUnlocked: true,
    dependencies: ['skill-2'],
  },
  {
    id: 'skill-4',
    name: 'Node.js',
    category: 'Programming',
    progress: 45,
    isUnlocked: true,
    dependencies: ['skill-2'],
  },
  {
    id: 'skill-5',
    name: 'Next.js',
    category: 'Programming',
    progress: 0,
    isUnlocked: false,
    dependencies: ['skill-3'],
  },
];

// 月次目標データ
export const mockMonthlyGoals: MonthlyGoal[] = [
  {
    category: 'Programming',
    current: 28,
    target: 40,
    percentage: 70,
  },
  {
    category: 'English',
    current: 15,
    target: 20,
    percentage: 75,
  },
];

// 教材レコメンドデータ
export const mockRecommendations: MaterialRecommendation[] = [
  {
    id: 'rec-1',
    title: 'Next.js完全ガイド',
    type: '講座',
    category: 'Programming',
    reason: 'React習得済みのため',
    url: '#',
  },
  {
    id: 'rec-2',
    title: '英文法Perfect Guide',
    type: '書籍',
    category: 'English',
    reason: 'TOEIC対策に最適',
  },
];

// 学習ログダッシュボードのモックデータ
export const mockStudyLogDashboard: StudyLogDashboard = {
  today: {
    hours: 3.5,
    goalHours: 5.0,
    remaining: 1.5,
  },
  weekly: {
    hours: 18,
    weekOverWeekChange: 3,
    weekOverWeekPercentage: 20,
  },
  streak: {
    days: 12,
    isNewRecord: true,
  },
  total: {
    hours: 248,
    level: 15,
    title: 'Master Learner',
  },
  weeklyData: mockWeeklyStudyData,
  monthlyData: [], // 必要に応じて追加
  yearlyData: [], // 必要に応じて追加
  categoryTotals: mockCategoryTotals,
  skills: mockSkills,
  todayLogs: mockTodayStudyLogs,
  monthlyGoals: mockMonthlyGoals,
  recommendations: mockRecommendations,
  encouragementMessage: 'このペースなら目標達成できます！',
};

// 勤怠管理のモックデータ

// 勤務先マスタ
export const mockWorkLocations: WorkLocation[] = [
  {
    id: 'wl-1',
    name: 'スターバックス渋谷店',
    type: '時給制',
    hourlyRate: 1200,
    color: '#4F7FFF',
    isActive: true,
    createdAt: '2025-01-01T00:00:00',
    updatedAt: '2025-01-01T00:00:00',
  },
  {
    id: 'wl-2',
    name: 'Web制作案件A',
    type: '業務委託',
    projectRate: 3000,
    color: '#4CAF50',
    isActive: true,
    createdAt: '2025-01-01T00:00:00',
    updatedAt: '2025-01-01T00:00:00',
  },
  {
    id: 'wl-3',
    name: '塾講師',
    type: '時給制',
    hourlyRate: 2500,
    color: '#FF9800',
    isActive: true,
    createdAt: '2025-01-01T00:00:00',
    updatedAt: '2025-01-01T00:00:00',
  },
];

// 勤怠記録（12月分）
export const mockAttendanceRecords: AttendanceRecord[] = [
  // 12月23日（月）- スタバ
  {
    id: 'att-1',
    date: '2025-12-23',
    workLocationId: 'wl-1',
    status: '退勤済み',
    clockInTime: '13:00',
    clockOutTime: '17:00',
    breakMinutes: 0,
    workMinutes: 240,
    createdAt: '2025-12-23T13:00:00',
    updatedAt: '2025-12-23T17:00:00',
  },
  // 12月23日（月）- Web案件
  {
    id: 'att-2',
    date: '2025-12-23',
    workLocationId: 'wl-2',
    status: '退勤済み',
    clockInTime: '19:00',
    clockOutTime: '22:00',
    breakMinutes: 0,
    workMinutes: 180,
    createdAt: '2025-12-23T19:00:00',
    updatedAt: '2025-12-23T22:00:00',
  },
  // 12月24日（火）- Web案件
  {
    id: 'att-3',
    date: '2025-12-24',
    workLocationId: 'wl-2',
    status: '退勤済み',
    clockInTime: '14:00',
    clockOutTime: '18:00',
    breakMinutes: 0,
    workMinutes: 240,
    createdAt: '2025-12-24T14:00:00',
    updatedAt: '2025-12-24T18:00:00',
  },
  // 12月25日（水）- スタバ
  {
    id: 'att-4',
    date: '2025-12-25',
    workLocationId: 'wl-1',
    status: '退勤済み',
    clockInTime: '13:00',
    clockOutTime: '18:00',
    breakMinutes: 60,
    workMinutes: 240,
    createdAt: '2025-12-25T13:00:00',
    updatedAt: '2025-12-25T18:00:00',
  },
  // 12月26日（木）- 塾講師
  {
    id: 'att-5',
    date: '2025-12-26',
    workLocationId: 'wl-3',
    status: '退勤済み',
    clockInTime: '17:00',
    clockOutTime: '21:00',
    breakMinutes: 0,
    workMinutes: 240,
    createdAt: '2025-12-26T17:00:00',
    updatedAt: '2025-12-26T21:00:00',
  },
  // 12月27日（金）- 今日、出勤中
  {
    id: 'att-6',
    date: '2025-12-27',
    workLocationId: 'wl-1',
    status: '出勤中',
    clockInTime: '13:00',
    breakMinutes: 0,
    createdAt: '2025-12-27T13:00:00',
    updatedAt: '2025-12-27T13:00:00',
  },
  // 12月16日（月）- スタバ
  {
    id: 'att-7',
    date: '2025-12-16',
    workLocationId: 'wl-1',
    status: '退勤済み',
    clockInTime: '13:00',
    clockOutTime: '18:00',
    breakMinutes: 60,
    workMinutes: 240,
    createdAt: '2025-12-16T13:00:00',
    updatedAt: '2025-12-16T18:00:00',
  },
  // 12月17日（火）- 塾講師
  {
    id: 'att-8',
    date: '2025-12-17',
    workLocationId: 'wl-3',
    status: '退勤済み',
    clockInTime: '17:00',
    clockOutTime: '21:00',
    breakMinutes: 0,
    workMinutes: 240,
    createdAt: '2025-12-17T17:00:00',
    updatedAt: '2025-12-17T21:00:00',
  },
  // 12月18日（水）- スタバ
  {
    id: 'att-9',
    date: '2025-12-18',
    workLocationId: 'wl-1',
    status: '退勤済み',
    clockInTime: '09:00',
    clockOutTime: '18:00',
    breakMinutes: 60,
    workMinutes: 480,
    createdAt: '2025-12-18T09:00:00',
    updatedAt: '2025-12-18T18:00:00',
  },
  // 12月19日（木）- Web案件
  {
    id: 'att-10',
    date: '2025-12-19',
    workLocationId: 'wl-2',
    status: '退勤済み',
    clockInTime: '10:00',
    clockOutTime: '17:00',
    breakMinutes: 30,
    workMinutes: 390,
    createdAt: '2025-12-19T10:00:00',
    updatedAt: '2025-12-19T17:00:00',
  },
  // 12月20日（金）- スタバ
  {
    id: 'att-11',
    date: '2025-12-20',
    workLocationId: 'wl-1',
    status: '退勤済み',
    clockInTime: '13:00',
    clockOutTime: '18:00',
    breakMinutes: 0,
    workMinutes: 300,
    createdAt: '2025-12-20T13:00:00',
    updatedAt: '2025-12-20T18:00:00',
  },
  // 12月21日（土）- Web案件
  {
    id: 'att-12',
    date: '2025-12-21',
    workLocationId: 'wl-2',
    status: '退勤済み',
    clockInTime: '13:00',
    clockOutTime: '14:30',
    breakMinutes: 0,
    workMinutes: 90,
    createdAt: '2025-12-21T13:00:00',
    updatedAt: '2025-12-21T14:30:00',
  },
  // 12月9日（月）- スタバ
  {
    id: 'att-13',
    date: '2025-12-09',
    workLocationId: 'wl-1',
    status: '退勤済み',
    clockInTime: '13:00',
    clockOutTime: '17:00',
    breakMinutes: 0,
    workMinutes: 240,
    createdAt: '2025-12-09T13:00:00',
    updatedAt: '2025-12-09T17:00:00',
  },
  // 12月10日（火）- 塾講師
  {
    id: 'att-14',
    date: '2025-12-10',
    workLocationId: 'wl-3',
    status: '退勤済み',
    clockInTime: '17:00',
    clockOutTime: '21:00',
    breakMinutes: 0,
    workMinutes: 240,
    createdAt: '2025-12-10T17:00:00',
    updatedAt: '2025-12-10T21:00:00',
  },
  // 12月11日（水）- スタバ
  {
    id: 'att-15',
    date: '2025-12-11',
    workLocationId: 'wl-1',
    status: '退勤済み',
    clockInTime: '13:00',
    clockOutTime: '18:00',
    breakMinutes: 60,
    workMinutes: 240,
    createdAt: '2025-12-11T13:00:00',
    updatedAt: '2025-12-11T18:00:00',
  },
  // 12月12日（木）- Web案件
  {
    id: 'att-16',
    date: '2025-12-12',
    workLocationId: 'wl-2',
    status: '退勤済み',
    clockInTime: '14:00',
    clockOutTime: '19:00',
    breakMinutes: 0,
    workMinutes: 300,
    createdAt: '2025-12-12T14:00:00',
    updatedAt: '2025-12-12T19:00:00',
  },
  // 12月13日（金）- 塾講師
  {
    id: 'att-17',
    date: '2025-12-13',
    workLocationId: 'wl-3',
    status: '退勤済み',
    clockInTime: '17:00',
    clockOutTime: '21:00',
    breakMinutes: 0,
    workMinutes: 240,
    createdAt: '2025-12-13T17:00:00',
    updatedAt: '2025-12-13T21:00:00',
  },
];
