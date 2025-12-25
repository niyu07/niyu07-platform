import {
  Task,
  Event,
  Weather,
  PomodoroData,
  ExpenseData,
  SummaryData,
  User,
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
