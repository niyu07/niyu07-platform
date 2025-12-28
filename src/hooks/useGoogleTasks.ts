import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

export interface GoogleTask {
  id: string;
  title: string;
  notes?: string;
  status: string;
  due?: string;
  updated: string;
}

export interface GoogleTaskList {
  id: string;
  title: string;
}

/**
 * Google Tasksを操作するカスタムフック
 */
export function useGoogleTasks(taskListId: string = '@default') {
  const { status } = useSession();
  const [tasks, setTasks] = useState<GoogleTask[]>([]);
  const [taskLists, setTaskLists] = useState<GoogleTaskList[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // タスクリストを取得
  const fetchTaskLists = useCallback(async () => {
    if (status !== 'authenticated') return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/tasks/google?action=lists');
      if (!response.ok) throw new Error('Failed to fetch task lists');

      const data = await response.json();
      setTaskLists(data);
    } catch (err) {
      setError(err as Error);
      console.error('タスクリスト取得エラー:', err);
    } finally {
      setIsLoading(false);
    }
  }, [status]);

  // タスクを取得
  const fetchTasks = useCallback(async () => {
    if (status !== 'authenticated') return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `/api/tasks/google?taskListId=${taskListId}`
      );
      if (!response.ok) throw new Error('Failed to fetch tasks');

      const data = await response.json();
      setTasks(data);
    } catch (err) {
      setError(err as Error);
      console.error('タスク取得エラー:', err);
    } finally {
      setIsLoading(false);
    }
  }, [status, taskListId]);

  // タスクを作成
  const createTask = useCallback(
    async (taskData: { title: string; notes?: string; due?: string }) => {
      if (status !== 'authenticated') return;

      try {
        const response = await fetch('/api/tasks/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...taskData, taskListId }),
        });

        if (!response.ok) throw new Error('Failed to create task');

        const newTask = await response.json();
        setTasks((prev) => [newTask, ...prev]);
        return newTask;
      } catch (err) {
        console.error('タスク作成エラー:', err);
        throw err;
      }
    },
    [status, taskListId]
  );

  // タスクを完了
  const completeTask = useCallback(
    async (taskId: string) => {
      if (status !== 'authenticated') return;

      try {
        const response = await fetch('/api/tasks/google', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            taskId,
            action: 'complete',
            taskListId,
          }),
        });

        if (!response.ok) throw new Error('Failed to complete task');

        // ローカル状態から削除（完了したタスクは表示しない）
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
      } catch (err) {
        console.error('タスク完了エラー:', err);
        throw err;
      }
    },
    [status, taskListId]
  );

  // ポモドーロ情報を追加
  const addPomodoroInfo = useCallback(
    async (
      taskId: string,
      pomodoroInfo: { sessionCount: number; totalMinutes: number }
    ) => {
      if (status !== 'authenticated') return;

      try {
        const response = await fetch('/api/tasks/google', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            taskId,
            action: 'updatePomodoro',
            taskListId,
            pomodoroInfo,
          }),
        });

        if (!response.ok)
          throw new Error('Failed to update task with pomodoro info');

        const updatedTask = await response.json();
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? updatedTask : t))
        );
        return updatedTask;
      } catch (err) {
        console.error('ポモドーロ情報追加エラー:', err);
        throw err;
      }
    },
    [status, taskListId]
  );

  // タスクを削除
  const deleteTask = useCallback(
    async (taskId: string) => {
      if (status !== 'authenticated') return;

      try {
        const response = await fetch(
          `/api/tasks/google?taskId=${taskId}&taskListId=${taskListId}`,
          {
            method: 'DELETE',
          }
        );

        if (!response.ok) throw new Error('Failed to delete task');

        setTasks((prev) => prev.filter((t) => t.id !== taskId));
      } catch (err) {
        console.error('タスク削除エラー:', err);
        throw err;
      }
    },
    [status, taskListId]
  );

  // 初回マウント時にタスクを取得
  useEffect(() => {
    if (status === 'authenticated') {
      fetchTasks();
    }
  }, [status, fetchTasks]);

  return {
    tasks,
    taskLists,
    isLoading,
    error,
    isAuthenticated: status === 'authenticated',
    fetchTaskLists,
    fetchTasks,
    createTask,
    completeTask,
    addPomodoroInfo,
    deleteTask,
    refresh: fetchTasks,
  };
}
