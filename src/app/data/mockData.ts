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
} from '../types';

// モックユーザーデータ
export const mockUser: User = {
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

// モックタスクデータ
export const mockTasks: Task[] = [
  {
    id: '1',
    content: 'Webサイトのデザイン修正',
    completed: true,
    priority: '高',
  },
  {
    id: '2',
    content: '確定申告の準備を始める',
    completed: false,
    priority: '中',
  },
  {
    id: '3',
    content: '英語の宿題を提出',
    completed: false,
    priority: '高',
  },
  {
    id: '4',
    content: '買い物リスト作成',
    completed: true,
    priority: '低',
  },
  {
    id: '5',
    content: 'クライアントにメール返信',
    completed: false,
    priority: '高',
  },
  {
    id: '6',
    content: 'プロジェクト資料の整理',
    completed: true,
    priority: '中',
  },
  {
    id: '7',
    content: 'データベース設計書作成',
    completed: false,
    priority: '中',
  },
  {
    id: '8',
    content: 'テストコードの追加',
    completed: true,
    priority: '低',
  },
  {
    id: '9',
    content: 'ミーティング議事録作成',
    completed: false,
    priority: '低',
  },
  {
    id: '10',
    content: 'レビュー対応',
    completed: true,
    priority: '中',
  },
  {
    id: '11',
    content: 'ドキュメント更新',
    completed: false,
    priority: '低',
  },
  {
    id: '12',
    content: 'バグ修正',
    completed: false,
    priority: '高',
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
