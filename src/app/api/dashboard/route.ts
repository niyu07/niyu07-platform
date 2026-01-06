import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getAllTasks } from '@/lib/google-tasks';
import { getTodayEvents } from '@/lib/google-calendar';
import { getCurrentWeather } from '@/lib/weather';

// イベントの型定義
interface CalendarEvent {
  id?: string | null;
  summary?: string | null;
  start?: {
    dateTime?: string | null;
    date?: string | null;
  } | null;
  end?: {
    dateTime?: string | null;
    date?: string | null;
  } | null;
  location?: string | null;
}

// タスクの型定義
interface GoogleTask {
  id?: string | null;
  title?: string | null;
  status?: string | null;
  due?: string | null;
  updated?: string | null;
}

// ホーム画面用のダッシュボードデータを一括取得
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // 1. ユーザー情報
    const user = {
      id: session.user.id,
      name: session.user.name || '',
      email: session.user.email || '',
    };

    // 2. 今日の予定を取得（Google Calendar）
    let todayEvents: Array<{
      id: string;
      time: string;
      title: string;
      type: 'lecture' | 'break' | 'work' | 'task' | 'deadline';
      location?: string;
      duration?: number;
      deadline: boolean;
    }> = [];
    try {
      console.log('[Dashboard] Fetching calendar events for user:', userId);
      const calendarEvents = await getTodayEvents(userId);
      console.log(
        '[Dashboard] Retrieved calendar events:',
        calendarEvents.length
      );

      // Google Calendarのイベント形式を、EventTimelineコンポーネントが期待する形式に変換
      todayEvents = calendarEvents.map((event: CalendarEvent) => {
        const startTime = event.start?.dateTime || event.start?.date;

        // 開始時刻を HH:MM 形式に変換
        let timeStr = '00:00';
        if (startTime) {
          const date = new Date(startTime);
          timeStr = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        }

        // イベントタイプを判定（簡易版）
        let eventType: 'lecture' | 'break' | 'work' | 'task' | 'deadline' =
          'task';
        const summary = (event.summary || '').toLowerCase();
        if (summary.includes('授業') || summary.includes('lecture')) {
          eventType = 'lecture';
        } else if (summary.includes('休憩') || summary.includes('break')) {
          eventType = 'break';
        } else if (
          summary.includes('勤務') ||
          summary.includes('バイト') ||
          summary.includes('work')
        ) {
          eventType = 'work';
        }

        return {
          id: event.id || `event-${Math.random()}`,
          time: timeStr,
          title: event.summary || '(タイトルなし)',
          type: eventType,
          location: event.location || undefined,
          duration: undefined,
          deadline: false,
        };
      });
    } catch (error) {
      console.error('[Dashboard] Error fetching calendar events:', error);
      if (error instanceof Error) {
        console.error('[Dashboard] Error message:', error.message);
        console.error('[Dashboard] Error stack:', error.stack);
      }
    }

    // 3. タスクを取得（Google Tasks）
    let todayTasks: Array<{
      id: string;
      title: string;
      content: string;
      status: string;
      completed: boolean;
      priority: string;
      createdAt: string;
      updatedAt: string;
    }> = [];
    let todayTasksCompleted = 0;
    let todayTasksTotal = 0;
    let todayTasksPercentage = 0;

    try {
      const allTasks = await getAllTasks(userId);

      // 今日のタスク（期限が今日または過去）
      const filteredTasks = allTasks.filter((task: GoogleTask) => {
        if (!task.due) return false;
        const dueDate = new Date(task.due);
        return dueDate <= now;
      });

      // Google Tasksの形式を、TaskListコンポーネントが期待する形式に変換
      todayTasks = filteredTasks.map((task: GoogleTask) => {
        const isCompleted = task.status === 'completed';

        return {
          id: task.id || `task-${Math.random()}`,
          title: task.title || '(タイトルなし)',
          content: task.title || '(タイトルなし)',
          status: isCompleted ? '完了' : '未着手',
          completed: isCompleted,
          priority: '中', // Google Tasksには優先度がないのでデフォルト値
          createdAt: task.updated || new Date().toISOString(),
          updatedAt: task.updated || new Date().toISOString(),
        };
      });

      todayTasksCompleted = todayTasks.filter((task) => task.completed).length;
      todayTasksTotal = todayTasks.length;
      todayTasksPercentage =
        todayTasksTotal > 0
          ? Math.round((todayTasksCompleted / todayTasksTotal) * 100)
          : 0;
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }

    // 4. 天気情報を取得
    let weather = null;
    try {
      weather = await getCurrentWeather('Tokyo,JP');
    } catch (error) {
      // APIキーが未設定または無効な場合は、天気情報なしで続行
      console.warn(
        'Weather API is unavailable:',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }

    // 5. ポモドーロデータ（今週）
    const weekStart = new Date(today);
    const dayOfWeek = weekStart.getDay();
    const diff = weekStart.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    weekStart.setDate(diff);
    weekStart.setHours(0, 0, 0, 0);

    const pomodoroSessions = await prisma.pomodoroSession.findMany({
      where: {
        userId,
        startTime: {
          gte: weekStart,
        },
        mode: '作業',
        completionStatus: '完走',
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    // 日別にグループ化
    const weekDays = ['月', '火', '水', '木', '金', '土', '日'];
    const dailyPomodoro = Array.from({ length: 7 }, (_, i) => {
      const currentDate = new Date(weekStart);
      currentDate.setDate(weekStart.getDate() + i);
      const dateKey = currentDate.toISOString().split('T')[0];

      const daySessions = pomodoroSessions.filter((session) => {
        const sessionDate = new Date(session.startTime)
          .toISOString()
          .split('T')[0];
        return sessionDate === dateKey;
      });

      const isToday = dateKey === today.toISOString().split('T')[0];

      return {
        day: weekDays[i],
        count: daySessions.length,
        isToday,
      };
    });

    // 6. 支出データ（今月）
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59
    );

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        type: '経費',
        date: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    });

    // カテゴリ別に集計
    const categoryMap = new Map<string, number>();
    let totalExpense = 0;

    transactions.forEach((transaction) => {
      const category = transaction.category || 'その他';
      categoryMap.set(
        category,
        (categoryMap.get(category) || 0) + transaction.amount
      );
      totalExpense += transaction.amount;
    });

    const expenseCategories = Array.from(categoryMap.entries()).map(
      ([name, amount]) => ({
        name,
        amount,
        percentage:
          totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0,
        color: getCategoryColor(name),
      })
    );

    const expenseData = {
      total: totalExpense,
      period: `${now.getMonth() + 1}月1日〜${now.getDate()}日`,
      categories: expenseCategories,
    };

    // 7. サマリーデータ
    // 会計KPI
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const yearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

    const yearTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: yearStart,
          lte: yearEnd,
        },
      },
    });

    let yearRevenue = 0;
    let yearExpense = 0;

    yearTransactions.forEach((transaction) => {
      if (transaction.type === '収入') {
        yearRevenue += transaction.amount;
      } else if (transaction.type === '経費') {
        yearExpense += transaction.amount;
      }
    });

    const settings = await prisma.accountingSettings.findUnique({
      where: { userId },
    });

    const blueReturnDeduction = settings?.blueReturnDeduction || 650000;
    const dependentIncomeLimit = settings?.dependentIncomeLimit || 480000;

    const businessIncome = Math.max(
      0,
      yearRevenue - yearExpense - blueReturnDeduction
    );
    const dependentRemaining = Math.max(
      0,
      dependentIncomeLimit - businessIncome
    );

    // 週間収入（過去7日）
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);

    const weekTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        type: '収入',
        date: {
          gte: weekAgo,
          lte: now,
        },
      },
    });

    const weeklyIncome = weekTransactions.reduce((sum, t) => sum + t.amount, 0);

    // 前週との比較
    const twoWeeksAgo = new Date(today);
    twoWeeksAgo.setDate(today.getDate() - 14);

    const previousWeekTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        type: '収入',
        date: {
          gte: twoWeeksAgo,
          lt: weekAgo,
        },
      },
    });

    const previousWeekIncome = previousWeekTransactions.reduce(
      (sum, t) => sum + t.amount,
      0
    );

    const weeklyIncomeChange =
      previousWeekIncome > 0
        ? Math.round(
            ((weeklyIncome - previousWeekIncome) / previousWeekIncome) * 100
          )
        : 0;

    // 今日の学習時間（ポモドーロセッションから計算）
    const todayPomodoroSessions = pomodoroSessions.filter((session) => {
      const sessionDate = new Date(session.startTime)
        .toISOString()
        .split('T')[0];
      return sessionDate === today.toISOString().split('T')[0];
    });

    const todayStudyMinutes = todayPomodoroSessions.reduce(
      (sum, session) => sum + session.durationMinutes,
      0
    );
    const todayStudyHours = todayStudyMinutes / 60;
    const todayStudyGoal = 3.5; // デフォルト目標（設定から取得するように後で改善）
    const todayStudyRemaining = Math.max(0, todayStudyGoal - todayStudyHours);
    const todayStudyPercentage = Math.min(
      100,
      Math.round((todayStudyHours / todayStudyGoal) * 100)
    );

    // 注意が必要かどうか（扶養控除が残り少ない、タスクの遅延など）
    const needsAttention =
      dependentRemaining < 100000 || // 扶養控除残りが10万円以下
      todayTasksCompleted < todayTasksTotal / 2; // タスク完了率が50%未満

    const summaryData = {
      todayEvents: todayEvents.length,
      todayTasks: {
        completed: todayTasksCompleted,
        total: todayTasksTotal,
        percentage: todayTasksPercentage,
      },
      weeklyIncome: {
        amount: weeklyIncome,
        change: weeklyIncomeChange,
      },
      todayStudy: {
        goal: todayStudyGoal,
        remaining: todayStudyRemaining,
        percentage: todayStudyPercentage,
      },
      dependentLimit: {
        remaining: dependentRemaining,
      },
      needsAttention,
    };

    // 8. 習慣データ
    // 学習ログ設定から習慣を取得
    const studyLogSettings = await prisma.studyLogSettings.findUnique({
      where: { userId },
      include: {
        habits: true,
      },
    });

    const todayStr = today.toISOString().split('T')[0];
    const todayDayOfWeek = today.getDay(); // 0: 日曜日 - 6: 土曜日

    // 今日のアクティブな習慣のみをフィルタリング
    const todayHabits =
      studyLogSettings?.habits.filter((habit) => {
        return (
          habit.isActive &&
          habit.targetDays &&
          Array.isArray(habit.targetDays) &&
          habit.targetDays.includes(todayDayOfWeek)
        );
      }) || [];

    // 今日の習慣完了記録を取得
    const habitCompletions = await prisma.habitCompletion.findMany({
      where: {
        userId,
        date: todayStr,
        habitId: {
          in: todayHabits.map((h) => h.id),
        },
      },
    });

    const habitsData = {
      habits: todayHabits,
      completions: habitCompletions,
    };

    // ダッシュボードデータをまとめて返す
    const dashboard = {
      user,
      summaryData,
      todayEvents: todayEvents.slice(0, 10), // 最大10件
      todayTasks: todayTasks.slice(0, 10), // 最大10件
      weather,
      pomodoroData: dailyPomodoro,
      expenseData,
      habits: habitsData,
    };

    return NextResponse.json(dashboard);
  } catch (error) {
    console.error('[GET /api/dashboard] Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// カテゴリごとの色を返す関数
function getCategoryColor(category: string): string {
  const colorMap: Record<string, string> = {
    '家賃・光熱費': '#4F7FFF',
    地代家賃: '#4F7FFF',
    水道光熱費: '#4F7FFF',
    食費: '#4CAF50',
    交通費: '#FF9800',
    会議費: '#FF9800',
    通信費: '#9C27B0',
    消耗品費: '#E91E63',
    その他: '#9E9E9E',
  };

  return colorMap[category] || '#9E9E9E';
}
