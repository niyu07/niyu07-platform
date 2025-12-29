import { Task, TaskStatus, Priority } from '@/app/types';
import { GoogleTask } from '@/hooks/useGoogleTasks';

/**
 * Google TasksのステータスをアプリのTaskStatusに変換
 */
function convertGoogleTaskStatus(googleStatus?: string): TaskStatus {
  if (googleStatus === 'completed') return '完了';
  return '未着手';
}

/**
 * アプリのTaskStatusをGoogle Tasksのステータスに変換
 */
function convertToGoogleTaskStatus(
  appStatus: TaskStatus
): 'needsAction' | 'completed' {
  return appStatus === '完了' ? 'completed' : 'needsAction';
}

/**
 * Google TaskをアプリのTask型に変換
 */
export function convertGoogleTaskToAppTask(googleTask: GoogleTask): Task {
  const status = convertGoogleTaskStatus(googleTask.status);

  // Google Tasksの期日をYYYY/MM/DD形式に変換（アプリの期待する形式）
  let formattedDueDate: string | undefined = undefined;
  if (googleTask.due) {
    const dueDate = new Date(googleTask.due);
    const year = dueDate.getFullYear();
    const month = String(dueDate.getMonth() + 1).padStart(2, '0');
    const day = String(dueDate.getDate()).padStart(2, '0');
    formattedDueDate = `${year}/${month}/${day}`;
  }

  return {
    id: googleTask.id || '',
    title: googleTask.title,
    description: googleTask.notes,
    status,
    priority: '中' as Priority, // Google Tasksには優先度がないのでデフォルト値
    dueDate: formattedDueDate,
    categories: [],
    subtasks: [],
    completedAt: googleTask.completed,
    createdAt: googleTask.updated || new Date().toISOString(),
    updatedAt: googleTask.updated || new Date().toISOString(),
    // Google Tasks固有の情報を保持
    memo: googleTask.notes,
    content: googleTask.title,
    completed: status === '完了',
  };
}

/**
 * アプリのTaskをGoogle Taskの作成データに変換
 */
export function convertAppTaskToGoogleTaskCreate(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): {
  title: string;
  notes?: string;
  due?: string;
  status?: 'needsAction' | 'completed';
} {
  // YYYY/MM/DD形式をYYYY-MM-DD形式に変換してからISOに変換
  let dueISO: string | undefined = undefined;
  if (task.dueDate) {
    const dateParts = task.dueDate.split('/');
    if (dateParts.length === 3) {
      // YYYY/MM/DD形式の場合
      const isoDateStr = `${dateParts[0]}-${dateParts[1]}-${dateParts[2]}`;
      dueISO = new Date(isoDateStr).toISOString();
    } else {
      // すでにYYYY-MM-DD形式の場合など
      dueISO = new Date(task.dueDate).toISOString();
    }
  }

  return {
    title: task.title,
    notes: task.description || task.memo,
    due: dueISO,
    status: convertToGoogleTaskStatus(task.status),
  };
}

/**
 * アプリのTaskをGoogle Taskの更新データに変換
 */
export function convertAppTaskToGoogleTaskUpdate(task: Partial<Task>): {
  title?: string;
  notes?: string;
  due?: string;
  status?: 'needsAction' | 'completed';
} {
  const updateData: {
    title?: string;
    notes?: string;
    due?: string;
    status?: 'needsAction' | 'completed';
  } = {};

  if (task.title !== undefined) {
    updateData.title = task.title;
  }

  if (task.description !== undefined || task.memo !== undefined) {
    updateData.notes = task.description || task.memo;
  }

  if (task.dueDate !== undefined) {
    if (task.dueDate) {
      // YYYY/MM/DD形式をYYYY-MM-DD形式に変換してからISOに変換
      const dateParts = task.dueDate.split('/');
      if (dateParts.length === 3) {
        const isoDateStr = `${dateParts[0]}-${dateParts[1]}-${dateParts[2]}`;
        updateData.due = new Date(isoDateStr).toISOString();
      } else {
        updateData.due = new Date(task.dueDate).toISOString();
      }
    } else {
      updateData.due = undefined;
    }
  }

  if (task.status !== undefined) {
    updateData.status = convertToGoogleTaskStatus(task.status);
  }

  return updateData;
}

/**
 * 複数のGoogle TasksをアプリのTask配列に変換
 */
export function convertGoogleTasksToAppTasks(googleTasks: GoogleTask[]): Task[] {
  return googleTasks.map(convertGoogleTaskToAppTask);
}
