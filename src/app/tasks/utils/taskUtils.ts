import {
  Task,
  TaskStatistics,
  CategoryAccuracy,
  TaskInsight,
  TaskDashboard,
  TaskFilter,
  TaskSort,
  TaskCategory,
  Priority,
  TaskStatus,
} from '../../types';

/**
 * 日付をYYYY/MM/DD形式にフォーマット
 */
export function formatDateYMD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
}

/**
 * YYYY/MM/DD文字列をDateオブジェクトに変換
 */
export function parseYMDDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('/').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * 今日の日付を取得（YYYY/MM/DD形式）
 */
export function getTodayYMD(): string {
  return formatDateYMD(new Date());
}

/**
 * 期日までの残り日数を計算
 * @returns 残り日数（負の値は過ぎた日数）
 */
export function getDaysUntilDue(dueDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = parseYMDDate(dueDate);
  due.setHours(0, 0, 0, 0);
  const diffTime = due.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * 期日ラベルを生成（例: "今日", "あと2日", "遅延"）
 */
export function getDueDateLabel(dueDate?: string): string {
  if (!dueDate) return '';

  const daysUntil = getDaysUntilDue(dueDate);

  if (daysUntil < 0) return '遅延';
  if (daysUntil === 0) return '今日';
  if (daysUntil === 1) return '明日';
  return `あと${daysUntil}日`;
}

/**
 * 期日の緊急度を判定
 */
export function getDueDateUrgency(
  dueDate?: string
): 'overdue' | 'today' | 'soon' | 'normal' | 'none' {
  if (!dueDate) return 'none';

  const daysUntil = getDaysUntilDue(dueDate);

  if (daysUntil < 0) return 'overdue';
  if (daysUntil === 0) return 'today';
  if (daysUntil <= 3) return 'soon';
  return 'normal';
}

/**
 * 分を時間表記に変換（例: 180 → "3h", 90 → "1.5h"）
 */
export function formatMinutesToHours(minutes: number): string {
  const hours = minutes / 60;
  return hours % 1 === 0 ? `${hours}h` : `${hours.toFixed(1)}h`;
}

/**
 * 優先度の色を取得
 */
export function getPriorityColor(priority: Priority): {
  bg: string;
  text: string;
  border: string;
} {
  switch (priority) {
    case '高':
      return {
        bg: 'bg-red-50',
        text: 'text-red-600',
        border: 'border-red-200',
      };
    case '中':
      return {
        bg: 'bg-orange-50',
        text: 'text-orange-600',
        border: 'border-orange-200',
      };
    case '低':
      return {
        bg: 'bg-gray-50',
        text: 'text-gray-600',
        border: 'border-gray-200',
      };
  }
}

/**
 * タスク状態の色を取得
 */
export function getStatusColor(status: TaskStatus): {
  bg: string;
  text: string;
  border: string;
} {
  switch (status) {
    case '未着手':
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        border: 'border-gray-300',
      };
    case '進行中':
      return {
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        border: 'border-blue-300',
      };
    case '完了':
      return {
        bg: 'bg-green-100',
        text: 'text-green-700',
        border: 'border-green-300',
      };
  }
}

/**
 * タスクリストを状態別にグループ化
 */
export function groupTasksByStatus(tasks: Task[]): {
  未着手: Task[];
  進行中: Task[];
  完了: Task[];
} {
  return {
    未着手: tasks.filter((t) => t.status === '未着手'),
    進行中: tasks.filter((t) => t.status === '進行中'),
    完了: tasks.filter((t) => t.status === '完了'),
  };
}

/**
 * タスクフィルタリング
 */
export function filterTasks(tasks: Task[], filter: TaskFilter): Task[] {
  let filtered = [...tasks];

  // ステータスフィルタ
  if (filter.status && filter.status.length > 0) {
    filtered = filtered.filter((t) => filter.status!.includes(t.status));
  }

  // 優先度フィルタ
  if (filter.priority && filter.priority.length > 0) {
    filtered = filtered.filter((t) => filter.priority!.includes(t.priority));
  }

  // カテゴリフィルタ
  if (filter.categories && filter.categories.length > 0) {
    filtered = filtered.filter((t) =>
      t.categories?.some((c) => filter.categories!.includes(c))
    );
  }

  // 期日範囲フィルタ
  if (filter.dueDateRange) {
    filtered = filtered.filter((t) => {
      if (!t.dueDate) return false;
      const taskDate = parseYMDDate(t.dueDate);

      if (filter.dueDateRange!.from) {
        const fromDate = parseYMDDate(filter.dueDateRange!.from);
        if (taskDate < fromDate) return false;
      }

      if (filter.dueDateRange!.to) {
        const toDate = parseYMDDate(filter.dueDateRange!.to);
        if (taskDate > toDate) return false;
      }

      return true;
    });
  }

  // 見積時間範囲フィルタ
  if (filter.estimatedTimeRange) {
    filtered = filtered.filter((t) => {
      if (!t.estimatedMinutes) return false;

      if (filter.estimatedTimeRange!.min !== undefined) {
        if (t.estimatedMinutes < filter.estimatedTimeRange!.min) return false;
      }

      if (filter.estimatedTimeRange!.max !== undefined) {
        if (t.estimatedMinutes > filter.estimatedTimeRange!.max) return false;
      }

      return true;
    });
  }

  // 検索テキストフィルタ
  if (filter.searchText) {
    const searchLower = filter.searchText.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.title.toLowerCase().includes(searchLower) ||
        t.description?.toLowerCase().includes(searchLower) ||
        t.categories?.some((c) => c.toLowerCase().includes(searchLower))
    );
  }

  // 遅延のみ表示
  if (filter.showOverdueOnly) {
    filtered = filtered.filter((t) => {
      if (!t.dueDate) return false;
      return getDaysUntilDue(t.dueDate) < 0;
    });
  }

  return filtered;
}

/**
 * タスクソート
 */
export function sortTasks(tasks: Task[], sort: TaskSort): Task[] {
  const sorted = [...tasks];

  sorted.sort((a, b) => {
    let compareValue = 0;

    switch (sort.field) {
      case 'dueDate':
        const aDate = a.dueDate ? parseYMDDate(a.dueDate).getTime() : Infinity;
        const bDate = b.dueDate ? parseYMDDate(b.dueDate).getTime() : Infinity;
        compareValue = aDate - bDate;
        break;

      case 'priority':
        const priorityOrder = { 高: 0, 中: 1, 低: 2 };
        compareValue = priorityOrder[a.priority] - priorityOrder[b.priority];
        break;

      case 'estimatedMinutes':
        compareValue = (a.estimatedMinutes || 0) - (b.estimatedMinutes || 0);
        break;

      case 'actualMinutes':
        compareValue = (a.actualMinutes || 0) - (b.actualMinutes || 0);
        break;

      case 'createdAt':
        compareValue =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;

      case 'updatedAt':
        compareValue =
          new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        break;
    }

    return sort.order === 'asc' ? compareValue : -compareValue;
  });

  return sorted;
}

/**
 * タスク統計を計算
 */
export function calculateTaskStatistics(tasks: Task[]): TaskStatistics {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === '完了').length;
  const inProgressTasks = tasks.filter((t) => t.status === '進行中').length;
  const pendingTasks = tasks.filter((t) => t.status === '未着手').length;
  const overdueTasks = tasks.filter((t) => {
    if (!t.dueDate) return false;
    return getDaysUntilDue(t.dueDate) < 0 && t.status !== '完了';
  }).length;

  const completionRate =
    totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // 完了タスクの平均時間を計算
  const completedWithActual = tasks.filter(
    (t) => t.status === '完了' && t.actualMinutes
  );
  const averageCompletionMinutes =
    completedWithActual.length > 0
      ? completedWithActual.reduce(
          (sum, t) => sum + (t.actualMinutes || 0),
          0
        ) / completedWithActual.length
      : 0;

  // 先週比を計算（仮の値、実際は前週データと比較）
  const weekOverWeekChange = 10; // TODO: 実際の前週データとの比較ロジック

  return {
    totalTasks,
    completedTasks,
    completionRate: Math.round(completionRate),
    weekOverWeekChange,
    averageCompletionMinutes: Math.round(averageCompletionMinutes),
    overdueTasks,
    inProgressTasks,
    pendingTasks,
  };
}

/**
 * カテゴリ別精度分析
 */
export function calculateCategoryAccuracy(tasks: Task[]): CategoryAccuracy[] {
  // 完了済みで見積・実績両方があるタスクのみ
  const completedTasksWithTime = tasks.filter(
    (t) =>
      t.status === '完了' &&
      t.estimatedMinutes &&
      t.actualMinutes &&
      t.categories
  );

  // カテゴリごとにグループ化
  const categoryMap = new Map<TaskCategory, Task[]>();

  completedTasksWithTime.forEach((task) => {
    task.categories?.forEach((category) => {
      if (!categoryMap.has(category)) {
        categoryMap.set(category, []);
      }
      categoryMap.get(category)!.push(task);
    });
  });

  // 各カテゴリの精度を計算
  const accuracies: CategoryAccuracy[] = [];

  categoryMap.forEach((categoryTasks, category) => {
    const totalEstimated = categoryTasks.reduce(
      (sum, t) => sum + (t.estimatedMinutes || 0),
      0
    );
    const totalActual = categoryTasks.reduce(
      (sum, t) => sum + (t.actualMinutes || 0),
      0
    );
    const taskCount = categoryTasks.length;

    const accuracy =
      totalEstimated > 0 ? (totalActual / totalEstimated) * 100 : 100;
    const averageEstimated = totalEstimated / taskCount;
    const averageActual = totalActual / taskCount;

    // 過小評価率（精度>100%の場合は0）
    const underestimationRate = accuracy > 100 ? Math.round(accuracy - 100) : 0;

    // 推奨係数（精度が低い場合は次回見積を増やす、上限1.5倍）
    let recommendedMultiplier = 1.0;
    if (accuracy > 100) {
      recommendedMultiplier = Math.min(accuracy / 100, 1.5);
    } else if (accuracy < 100) {
      recommendedMultiplier = 1.0; // 過大評価の場合は調整しない
    }

    accuracies.push({
      category,
      totalEstimated: Math.round(totalEstimated),
      totalActual: Math.round(totalActual),
      accuracy: Math.round(accuracy),
      taskCount,
      averageEstimated: Math.round(averageEstimated),
      averageActual: Math.round(averageActual),
      underestimationRate,
      recommendedMultiplier: Math.round(recommendedMultiplier * 10) / 10,
    });
  });

  // 精度が低い順にソート
  return accuracies.sort((a, b) => a.accuracy - b.accuracy);
}

/**
 * インサイト生成
 */
export function generateInsights(
  tasks: Task[],
  categoryAccuracies: CategoryAccuracy[]
): TaskInsight[] {
  const insights: TaskInsight[] = [];

  // カテゴリ別の過小評価インサイト
  categoryAccuracies.forEach((acc) => {
    if (acc.accuracy > 100 && acc.underestimationRate >= 15) {
      // 15%以上の過小評価
      const severity: 'low' | 'medium' | 'high' =
        acc.underestimationRate >= 30
          ? 'high'
          : acc.underestimationRate >= 20
            ? 'medium'
            : 'low';

      insights.push({
        type: 'underestimation',
        category: acc.category,
        message: `あなたは${acc.category}作業を平均${acc.underestimationRate}%過小評価しています。`,
        suggestion: `次回の${acc.category}タスクは、見積を${acc.recommendedMultiplier}倍に設定することをおすすめします。`,
        severity,
      });
    } else if (acc.accuracy >= 90 && acc.accuracy <= 110) {
      // 精度が高い
      insights.push({
        type: 'accurate',
        category: acc.category,
        message: `${acc.category}の見積精度は優れています（${acc.accuracy}%）。`,
        severity: 'low',
      });
    }
  });

  // 遅延タスクの警告
  const overdueTasks = tasks.filter((t) => {
    if (!t.dueDate || t.status === '完了') return false;
    return getDaysUntilDue(t.dueDate) < 0;
  });

  if (overdueTasks.length > 0) {
    insights.push({
      type: 'warning',
      message: `${overdueTasks.length}件のタスクが期限を過ぎています。`,
      suggestion: '優先度を見直し、完了予定を再設定することをおすすめします。',
      severity: 'high',
    });
  }

  return insights;
}

/**
 * タスクダッシュボードデータ生成
 */
export function generateTaskDashboard(tasks: Task[]): TaskDashboard {
  const statistics = calculateTaskStatistics(tasks);
  const categoryAccuracies = calculateCategoryAccuracy(tasks);
  const insights = generateInsights(tasks, categoryAccuracies);

  // 期日が近いタスク（未完了で3日以内）
  const upcomingDeadlines = tasks
    .filter((t) => {
      if (t.status === '完了' || !t.dueDate) return false;
      const daysUntil = getDaysUntilDue(t.dueDate);
      return daysUntil >= 0 && daysUntil <= 3;
    })
    .sort((a, b) => {
      const aDate = a.dueDate ? parseYMDDate(a.dueDate).getTime() : Infinity;
      const bDate = b.dueDate ? parseYMDDate(b.dueDate).getTime() : Infinity;
      return aDate - bDate;
    });

  // 期限切れタスク
  const overdueTasksList = tasks
    .filter((t) => {
      if (t.status === '完了' || !t.dueDate) return false;
      return getDaysUntilDue(t.dueDate) < 0;
    })
    .sort((a, b) => {
      const aDate = a.dueDate ? parseYMDDate(a.dueDate).getTime() : 0;
      const bDate = b.dueDate ? parseYMDDate(b.dueDate).getTime() : 0;
      return aDate - bDate;
    });

  return {
    statistics,
    insights,
    categoryAccuracies,
    upcomingDeadlines,
    overdueTasksList,
  };
}

/**
 * サブタスクの進捗を計算
 */
export function calculateSubtaskProgress(task: Task): {
  completed: number;
  total: number;
  percentage: number;
} {
  if (!task.subtasks || task.subtasks.length === 0) {
    return { completed: 0, total: 0, percentage: 0 };
  }

  const total = task.subtasks.length;
  const completed = task.subtasks.filter((st) => st.completed).length;
  const percentage = Math.round((completed / total) * 100);

  return { completed, total, percentage };
}
