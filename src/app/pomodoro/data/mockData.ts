import {
  PomodoroSession,
  PomodoroSettings,
  DailyStats,
  WeeklyActivity,
  CategoryStats,
  TimeSlotProductivity,
  GoldenTime,
  PomodoroDashboard,
  DEFAULT_POMODORO_SETTINGS,
  CATEGORY_COLORS,
} from '../types';

// モックセッションデータ
export const mockSessions: PomodoroSession[] = [
  {
    id: 'session-1',
    startTime: '2025-12-26T09:11:00',
    endTime: '2025-12-26T09:36:00',
    mode: '作業',
    category: 'Coding',
    durationMinutes: 25,
    completionStatus: '完走',
  },
  {
    id: 'session-2',
    startTime: '2025-12-26T09:01:00',
    endTime: '2025-12-26T09:06:00',
    mode: '休憩',
    category: 'Coding',
    durationMinutes: 5,
    completionStatus: '完走',
  },
  {
    id: 'session-3',
    startTime: '2025-12-26T08:31:00',
    endTime: '2025-12-26T08:56:00',
    mode: '作業',
    category: 'Design',
    durationMinutes: 25,
    completionStatus: '完走',
  },
];

// 今日の統計データ
export const mockTodayStats: DailyStats = {
  date: '2025-12-26',
  completedSessions: 2,
  focusMinutes: 50,
  categoryBreakdown: [
    { category: 'Coding', minutes: 25 },
    { category: 'Design', minutes: 25 },
  ],
  goalAchieved: false,
};

// 週間活動データ
export const mockWeeklyActivity: WeeklyActivity = {
  weekStart: '2025-12-23',
  weekEnd: '2025-12-29',
  totalMinutes: 1680, // 28時間
  dailyStats: [
    {
      day: '月',
      minutes: 180,
      categoryBreakdown: [
        { category: 'Coding', minutes: 90 },
        { category: 'Design', minutes: 60 },
        { category: 'Study', minutes: 30 },
      ],
    },
    {
      day: '火',
      minutes: 200,
      categoryBreakdown: [
        { category: 'Coding', minutes: 100 },
        { category: 'Design', minutes: 70 },
        { category: 'Study', minutes: 30 },
      ],
    },
    {
      day: '水',
      minutes: 300,
      categoryBreakdown: [
        { category: 'Coding', minutes: 150 },
        { category: 'Design', minutes: 100 },
        { category: 'Study', minutes: 50 },
      ],
    },
    {
      day: '木',
      minutes: 240,
      categoryBreakdown: [
        { category: 'Coding', minutes: 120 },
        { category: 'Design', minutes: 80 },
        { category: 'Study', minutes: 40 },
      ],
    },
    {
      day: '金',
      minutes: 320,
      categoryBreakdown: [
        { category: 'Coding', minutes: 160 },
        { category: 'Design', minutes: 110 },
        { category: 'Study', minutes: 50 },
      ],
    },
    {
      day: '土',
      minutes: 280,
      categoryBreakdown: [
        { category: 'Coding', minutes: 140 },
        { category: 'Design', minutes: 90 },
        { category: 'Study', minutes: 50 },
      ],
    },
    {
      day: '日',
      minutes: 160,
      categoryBreakdown: [
        { category: 'Coding', minutes: 80 },
        { category: 'Design', minutes: 50 },
        { category: 'Study', minutes: 30 },
      ],
    },
  ],
  averageMinutesPerDay: 240, // 4時間/日
};

// カテゴリ別統計
export const mockCategoryStats: CategoryStats[] = [
  {
    category: 'Design',
    totalMinutes: 588, // 35%
    percentage: 35,
    sessionCount: 24,
    color: CATEGORY_COLORS.Design,
  },
  {
    category: 'Coding',
    totalMinutes: 504, // 30%
    percentage: 30,
    sessionCount: 20,
    color: CATEGORY_COLORS.Coding,
  },
  {
    category: 'Study',
    totalMinutes: 336, // 20%
    percentage: 20,
    sessionCount: 13,
    color: CATEGORY_COLORS.Study,
  },
  {
    category: 'Meeting',
    totalMinutes: 168, // 10%
    percentage: 10,
    sessionCount: 7,
    color: CATEGORY_COLORS.Meeting,
  },
  {
    category: 'Other',
    totalMinutes: 84, // 5%
    percentage: 5,
    sessionCount: 3,
    color: CATEGORY_COLORS.Other,
  },
];

// 時間帯別生産性データ（ヒートマップ用）
export const mockTimeSlotProductivity: TimeSlotProductivity[] = [
  // 月曜日
  {
    timeSlot: '08-10',
    dayOfWeek: 1,
    completedSessions: 2,
    completionRate: 100,
    averageFocusMinutes: 25,
    productivityScore: 85,
  },
  {
    timeSlot: '10-12',
    dayOfWeek: 1,
    completedSessions: 3,
    completionRate: 90,
    averageFocusMinutes: 24,
    productivityScore: 80,
  },
  {
    timeSlot: '12-14',
    dayOfWeek: 1,
    completedSessions: 2,
    completionRate: 80,
    averageFocusMinutes: 22,
    productivityScore: 70,
  },
  {
    timeSlot: '14-16',
    dayOfWeek: 1,
    completedSessions: 4,
    completionRate: 95,
    averageFocusMinutes: 25,
    productivityScore: 95,
  },
  {
    timeSlot: '16-18',
    dayOfWeek: 1,
    completedSessions: 2,
    completionRate: 85,
    averageFocusMinutes: 23,
    productivityScore: 75,
  },
  {
    timeSlot: '18-20',
    dayOfWeek: 1,
    completedSessions: 1,
    completionRate: 70,
    averageFocusMinutes: 20,
    productivityScore: 60,
  },

  // 火曜日
  {
    timeSlot: '08-10',
    dayOfWeek: 2,
    completedSessions: 1,
    completionRate: 80,
    averageFocusMinutes: 22,
    productivityScore: 70,
  },
  {
    timeSlot: '10-12',
    dayOfWeek: 2,
    completedSessions: 4,
    completionRate: 95,
    averageFocusMinutes: 25,
    productivityScore: 90,
  },
  {
    timeSlot: '12-14',
    dayOfWeek: 2,
    completedSessions: 3,
    completionRate: 85,
    averageFocusMinutes: 23,
    productivityScore: 75,
  },
  {
    timeSlot: '14-16',
    dayOfWeek: 2,
    completedSessions: 3,
    completionRate: 90,
    averageFocusMinutes: 24,
    productivityScore: 85,
  },
  {
    timeSlot: '16-18',
    dayOfWeek: 2,
    completedSessions: 4,
    completionRate: 90,
    averageFocusMinutes: 24,
    productivityScore: 85,
  },
  {
    timeSlot: '18-20',
    dayOfWeek: 2,
    completedSessions: 2,
    completionRate: 75,
    averageFocusMinutes: 21,
    productivityScore: 65,
  },

  // 水曜日
  {
    timeSlot: '08-10',
    dayOfWeek: 3,
    completedSessions: 2,
    completionRate: 85,
    averageFocusMinutes: 23,
    productivityScore: 75,
  },
  {
    timeSlot: '10-12',
    dayOfWeek: 3,
    completedSessions: 2,
    completionRate: 80,
    averageFocusMinutes: 22,
    productivityScore: 70,
  },
  {
    timeSlot: '12-14',
    dayOfWeek: 3,
    completedSessions: 1,
    completionRate: 70,
    averageFocusMinutes: 20,
    productivityScore: 60,
  },
  {
    timeSlot: '14-16',
    dayOfWeek: 3,
    completedSessions: 2,
    completionRate: 80,
    averageFocusMinutes: 22,
    productivityScore: 70,
  },
  {
    timeSlot: '16-18',
    dayOfWeek: 3,
    completedSessions: 5,
    completionRate: 95,
    averageFocusMinutes: 25,
    productivityScore: 95,
  },
  {
    timeSlot: '18-20',
    dayOfWeek: 3,
    completedSessions: 3,
    completionRate: 85,
    averageFocusMinutes: 23,
    productivityScore: 75,
  },

  // 木曜日
  {
    timeSlot: '08-10',
    dayOfWeek: 4,
    completedSessions: 2,
    completionRate: 85,
    averageFocusMinutes: 23,
    productivityScore: 75,
  },
  {
    timeSlot: '10-12',
    dayOfWeek: 4,
    completedSessions: 3,
    completionRate: 90,
    averageFocusMinutes: 24,
    productivityScore: 85,
  },
  {
    timeSlot: '12-14',
    dayOfWeek: 4,
    completedSessions: 2,
    completionRate: 80,
    averageFocusMinutes: 22,
    productivityScore: 70,
  },
  {
    timeSlot: '14-16',
    dayOfWeek: 4,
    completedSessions: 4,
    completionRate: 95,
    averageFocusMinutes: 25,
    productivityScore: 95,
  },
  {
    timeSlot: '16-18',
    dayOfWeek: 4,
    completedSessions: 2,
    completionRate: 85,
    averageFocusMinutes: 23,
    productivityScore: 75,
  },
  {
    timeSlot: '18-20',
    dayOfWeek: 4,
    completedSessions: 1,
    completionRate: 75,
    averageFocusMinutes: 21,
    productivityScore: 65,
  },

  // 金曜日
  {
    timeSlot: '08-10',
    dayOfWeek: 5,
    completedSessions: 3,
    completionRate: 90,
    averageFocusMinutes: 24,
    productivityScore: 85,
  },
  {
    timeSlot: '10-12',
    dayOfWeek: 5,
    completedSessions: 2,
    completionRate: 85,
    averageFocusMinutes: 23,
    productivityScore: 75,
  },
  {
    timeSlot: '12-14',
    dayOfWeek: 5,
    completedSessions: 2,
    completionRate: 80,
    averageFocusMinutes: 22,
    productivityScore: 70,
  },
  {
    timeSlot: '14-16',
    dayOfWeek: 5,
    completedSessions: 5,
    completionRate: 100,
    averageFocusMinutes: 25,
    productivityScore: 100,
  },
  {
    timeSlot: '16-18',
    dayOfWeek: 5,
    completedSessions: 3,
    completionRate: 90,
    averageFocusMinutes: 24,
    productivityScore: 85,
  },
  {
    timeSlot: '18-20',
    dayOfWeek: 5,
    completedSessions: 2,
    completionRate: 80,
    averageFocusMinutes: 22,
    productivityScore: 70,
  },

  // 土曜日
  {
    timeSlot: '08-10',
    dayOfWeek: 6,
    completedSessions: 4,
    completionRate: 95,
    averageFocusMinutes: 25,
    productivityScore: 90,
  },
  {
    timeSlot: '10-12',
    dayOfWeek: 6,
    completedSessions: 3,
    completionRate: 90,
    averageFocusMinutes: 24,
    productivityScore: 85,
  },
  {
    timeSlot: '12-14',
    dayOfWeek: 6,
    completedSessions: 1,
    completionRate: 75,
    averageFocusMinutes: 21,
    productivityScore: 65,
  },
  {
    timeSlot: '14-16',
    dayOfWeek: 6,
    completedSessions: 3,
    completionRate: 90,
    averageFocusMinutes: 24,
    productivityScore: 85,
  },
  {
    timeSlot: '16-18',
    dayOfWeek: 6,
    completedSessions: 2,
    completionRate: 85,
    averageFocusMinutes: 23,
    productivityScore: 75,
  },
  {
    timeSlot: '18-20',
    dayOfWeek: 6,
    completedSessions: 3,
    completionRate: 85,
    averageFocusMinutes: 23,
    productivityScore: 75,
  },

  // 日曜日
  {
    timeSlot: '08-10',
    dayOfWeek: 0,
    completedSessions: 2,
    completionRate: 80,
    averageFocusMinutes: 22,
    productivityScore: 70,
  },
  {
    timeSlot: '10-12',
    dayOfWeek: 0,
    completedSessions: 2,
    completionRate: 80,
    averageFocusMinutes: 22,
    productivityScore: 70,
  },
  {
    timeSlot: '12-14',
    dayOfWeek: 0,
    completedSessions: 1,
    completionRate: 70,
    averageFocusMinutes: 20,
    productivityScore: 60,
  },
  {
    timeSlot: '14-16',
    dayOfWeek: 0,
    completedSessions: 1,
    completionRate: 75,
    averageFocusMinutes: 21,
    productivityScore: 65,
  },
  {
    timeSlot: '16-18',
    dayOfWeek: 0,
    completedSessions: 1,
    completionRate: 75,
    averageFocusMinutes: 21,
    productivityScore: 65,
  },
  {
    timeSlot: '18-20',
    dayOfWeek: 0,
    completedSessions: 1,
    completionRate: 70,
    averageFocusMinutes: 20,
    productivityScore: 60,
  },
];

// ゴールデンタイム
export const mockGoldenTime: GoldenTime = {
  timeSlot: '14:00 - 16:00',
  averageProductivityScore: 91,
  recommendation: '14:00 - 16:00 がゴールデンタイムです',
};

// ポモドーロダッシュボード全体データ
export const mockPomodoroDashboard: PomodoroDashboard = {
  today: mockTodayStats,
  thisWeek: mockWeeklyActivity,
  categoryStats: mockCategoryStats,
  goldenTime: mockGoldenTime,
  timeSlotProductivity: mockTimeSlotProductivity,
  recentSessions: mockSessions,
  currentStreak: 7,
  longestStreak: 7,
  isNewRecord: true,
};

// デフォルト設定（エクスポート）
export const mockPomodoroSettings: PomodoroSettings = DEFAULT_POMODORO_SETTINGS;
