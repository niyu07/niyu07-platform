'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Task, TaskView, TaskFilter, TaskSort } from '../types';
import { mockUser } from '../data/mockData';
import { useGoogleTasks } from '@/hooks/useGoogleTasks';
import {
  convertGoogleTasksToAppTasks,
  convertAppTaskToGoogleTaskCreate,
  convertAppTaskToGoogleTaskUpdate,
} from './utils/googleTasksAdapter';
import Sidebar from '../components/Sidebar';
import KanbanView from './components/KanbanView';
import ListView from './components/ListView';
import CalendarView from './components/CalendarView';
import TaskForm from './components/TaskForm';
import TaskDashboardComponent from './components/TaskDashboard';
import MemoList from './components/MemoList';
import {
  filterTasks,
  sortTasks,
  generateTaskDashboard,
} from './utils/taskUtils';

export default function TasksPage() {
  const router = useRouter();
  const { status: authStatus, data: session } = useSession();
  const {
    tasks: googleTasks,
    isLoading,
    error,
    createTask: createGoogleTask,
    updateTask: updateGoogleTask,
    deleteTask: deleteGoogleTask,
  } = useGoogleTasks('@default');
  const [currentView, setCurrentView] = useState<TaskView>('カンバン');
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [taskFromMemo, setTaskFromMemo] = useState<{ title: string; description: string; memoId: string } | null>(null);
  const [filter] = useState<TaskFilter>({});
  const [sort] = useState<TaskSort>({
    field: 'dueDate',
    order: 'asc',
  });
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [memoDeleteTrigger, setMemoDeleteTrigger] = useState(0);

  // Google Tasksのデータをアプリのタスク形式に変換
  const tasks = useMemo(
    () => convertGoogleTasksToAppTasks(googleTasks),
    [googleTasks]
  );

  // フィルタ・ソート適用
  const processedTasks = useMemo(() => {
    let result = tasks;
    result = filterTasks(result, filter);
    result = sortTasks(result, sort);
    return result;
  }, [tasks, filter, sort]);

  // ダッシュボードデータ生成
  const dashboard = useMemo(() => {
    return generateTaskDashboard(tasks);
  }, [tasks]);

  // サマリー計算
  const summary = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === '完了').length;
    const remaining = total - completed;
    return { total, completed, remaining };
  }, [tasks]);

  // タスク作成
  const handleCreateTask = async (
    taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    try {
      const googleTaskData = convertAppTaskToGoogleTaskCreate(taskData);
      await createGoogleTask(googleTaskData);

      // メモから作成した場合は、メモを削除
      if (taskFromMemo) {
        try {
          await fetch(`/api/memos?id=${taskFromMemo.memoId}`, {
            method: 'DELETE',
          });
          setMemoDeleteTrigger(prev => prev + 1); // メモリストを更新
          window.dispatchEvent(new CustomEvent('memoDeleted'));
        } catch (error) {
          console.error('メモ削除エラー:', error);
        }
        setTaskFromMemo(null);
      }

      setShowNewTaskForm(false);
    } catch (error) {
      console.error('タスク作成エラー:', error);
      alert('タスクの作成に失敗しました');
    }
  };

  // タスク更新
  const handleUpdateTask = async (
    taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    if (!editingTask) return;

    try {
      const googleTaskData = convertAppTaskToGoogleTaskUpdate(taskData);
      await updateGoogleTask(editingTask.id, googleTaskData);
      setEditingTask(undefined);
      setShowNewTaskForm(false);
    } catch (error) {
      console.error('タスク更新エラー:', error);
      alert('タスクの更新に失敗しました');
    }
  };

  // タスク削除
  const handleDeleteTask = async (taskId: string) => {
    if (confirm('このタスクを削除しますか?')) {
      try {
        await deleteGoogleTask(taskId);
      } catch (error) {
        console.error('タスク削除エラー:', error);
        alert('タスクの削除に失敗しました');
      }
    }
  };

  // ステータス変更
  const handleStatusChange = async (
    taskId: string,
    newStatus: Task['status']
  ) => {
    try {
      const googleTaskData = convertAppTaskToGoogleTaskUpdate({
        status: newStatus,
      });
      await updateGoogleTask(taskId, googleTaskData);
    } catch (error) {
      console.error('ステータス更新エラー:', error);
      alert('ステータスの更新に失敗しました');
    }
  };

  // タイマー開始（ポモドーロ連携）
  const handleStartTimer = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      // タスク情報をクエリパラメータとして渡す
      const params = new URLSearchParams({
        taskId: task.id,
        taskTitle: task.title,
      });
      router.push(`/pomodoro?${params.toString()}`);
    }
  };

  // メモをタスクに変換（タスクフォームを開く）
  const handleConvertMemoToTask = (memo: { id: string; content: string }) => {
    // メモの内容からタイトルと説明を生成
    const title = memo.content.length > 50 ? memo.content.substring(0, 50) + '...' : memo.content;
    const description = memo.content;

    setTaskFromMemo({ title, description, memoId: memo.id });
    setShowNewTaskForm(true);
  };

  // ビューアイコン
  const getViewIcon = (view: TaskView) => {
    switch (view) {
      case 'カンバン':
        return '📋';
      case 'リスト':
        return '📝';
      case 'カレンダー':
        return '📅';
    }
  };

  // 認証チェック
  if (authStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">読み込み中...</div>
      </div>
    );
  }

  if (authStatus === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">認証が必要です</h1>
          <p className="mb-4">Google Tasksを使用するにはログインしてください</p>
          <Link
            href="/api/auth/signin"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-block"
          >
            ログイン
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar user={mockUser} currentPage="タスク" />

      <div className="ml-64 p-8">
        {/* ヘッダー */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            タスク管理{' '}
            {isLoading && (
              <span className="text-sm text-gray-500">(読み込み中...)</span>
            )}
          </h1>
          <div className="text-sm text-gray-600">
            全 {summary.total}件 | 完了 {summary.completed}件 | 残り{' '}
            {summary.remaining}件
          </div>
          {error && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              エラー: {error.message}
            </div>
          )}
        </div>

        {/* メモリスト */}
        <MemoList
          userId={session?.user?.id || mockUser.id}
          onConvertToTask={handleConvertMemoToTask}
          onMemoDeleted={() => setMemoDeleteTrigger(prev => prev + 1)}
        />

        {/* 操作バー */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between">
            {/* ビュー切り替え */}
            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
              {(['カンバン', 'リスト', 'カレンダー'] as TaskView[]).map(
                (view) => (
                  <button
                    key={view}
                    onClick={() => setCurrentView(view)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      currentView === view
                        ? 'bg-white text-blue-600 shadow'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <span className="mr-2">{getViewIcon(view)}</span>
                    {view}
                  </button>
                )
              )}
            </div>

            {/* 右側ボタン */}
            <div className="flex items-center gap-3">
              {/* フィルター */}
              <div className="relative">
                <button
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <span>🔍</span>
                  <span className="text-sm">フィルター</span>
                </button>
                {/* フィルターメニューは後で実装 */}
              </div>

              {/* ソート */}
              <div className="relative">
                <button
                  onClick={() => setShowSortMenu(!showSortMenu)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <span>⬆️</span>
                  <span className="text-sm">ソート</span>
                </button>
                {/* ソートメニューは後で実装 */}
              </div>

              {/* 新規タスク */}
              <button
                onClick={() => setShowNewTaskForm(true)}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                <span>+</span>
                <span className="text-sm font-medium">新規タスク</span>
              </button>
            </div>
          </div>
        </div>

        {/* メインコンテンツエリア */}
        <div className="flex gap-6">
          {/* タスクビュー（フレキシブル幅） */}
          <div className="flex-1 min-w-0">
            {currentView === 'カンバン' && (
              <KanbanView
                tasks={processedTasks}
                onEdit={(task) => {
                  setEditingTask(task);
                  setShowNewTaskForm(true);
                }}
                onDelete={handleDeleteTask}
                onStatusChange={handleStatusChange}
                onStartTimer={handleStartTimer}
              />
            )}

            {currentView === 'リスト' && (
              <ListView
                tasks={processedTasks}
                onEdit={(task) => {
                  setEditingTask(task);
                  setShowNewTaskForm(true);
                }}
                onDelete={handleDeleteTask}
                onStatusChange={handleStatusChange}
              />
            )}

            {currentView === 'カレンダー' && (
              <CalendarView
                tasks={processedTasks}
                onEdit={(task) => {
                  setEditingTask(task);
                  setShowNewTaskForm(true);
                }}
                onDateClick={(date) => {
                  console.log('Date clicked:', date);
                  // 日付クリック時の処理（将来的にその日のタスク一覧表示など）
                }}
              />
            )}
          </div>

          {/* ダッシュボード（固定幅） */}
          <div className="w-96 flex-shrink-0">
            <TaskDashboardComponent dashboard={dashboard} />
          </div>
        </div>
      </div>

      {/* タスクフォーム */}
      <TaskForm
        key={editingTask?.id || taskFromMemo?.memoId || 'new'}
        task={
          editingTask ||
          (taskFromMemo
            ? {
                id: 'temp',
                title: taskFromMemo.title,
                description: taskFromMemo.description,
                status: '未着手' as const,
                priority: '中' as const,
                categories: ['その他' as const],
                estimatedMinutes: 25,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }
            : undefined)
        }
        isOpen={showNewTaskForm}
        onClose={() => {
          setShowNewTaskForm(false);
          setEditingTask(undefined);
          setTaskFromMemo(null);
        }}
        onSave={editingTask ? handleUpdateTask : handleCreateTask}
      />
    </div>
  );
}
