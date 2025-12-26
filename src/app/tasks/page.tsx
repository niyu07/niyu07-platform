'use client';

import { useState, useMemo } from 'react';
import { Task, TaskView, TaskFilter, TaskSort } from '../types';
import { mockTaskManagementData, mockUser } from '../data/mockData';
import Sidebar from '../components/Sidebar';
import KanbanView from './components/KanbanView';
import ListView from './components/ListView';
import CalendarView from './components/CalendarView';
import TaskForm from './components/TaskForm';
import TaskDashboardComponent from './components/TaskDashboard';
import {
  filterTasks,
  sortTasks,
  generateTaskDashboard,
} from './utils/taskUtils';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(mockTaskManagementData);
  const [currentView, setCurrentView] = useState<TaskView>('カンバン');
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [filter] = useState<TaskFilter>({});
  const [sort] = useState<TaskSort>({
    field: 'dueDate',
    order: 'asc',
  });
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);

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
  const handleCreateTask = (
    taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTasks([...tasks, newTask]);
  };

  // タスク更新
  const handleUpdateTask = (
    taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    if (!editingTask) return;

    const updatedTask: Task = {
      ...taskData,
      id: editingTask.id,
      createdAt: editingTask.createdAt,
      updatedAt: new Date().toISOString(),
    };
    setTasks(tasks.map((t) => (t.id === editingTask.id ? updatedTask : t)));
    setEditingTask(undefined);
  };

  // タスク削除
  const handleDeleteTask = (taskId: string) => {
    if (confirm('このタスクを削除しますか?')) {
      setTasks(tasks.filter((t) => t.id !== taskId));
    }
  };

  // ステータス変更
  const handleStatusChange = (taskId: string, newStatus: Task['status']) => {
    setTasks(
      tasks.map((t) => {
        if (t.id === taskId) {
          const updatedTask = {
            ...t,
            status: newStatus,
            updatedAt: new Date().toISOString(),
          };
          // 完了時の処理
          if (newStatus === '完了') {
            updatedTask.completedAt = new Date().toISOString();
            // 期限チェック
            if (t.dueDate) {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const dueDate = new Date(t.dueDate);
              dueDate.setHours(0, 0, 0, 0);
              if (today > dueDate) {
                updatedTask.isOverdue = true;
              }
            }
          }
          return updatedTask;
        }
        return t;
      })
    );
  };

  // タイマー開始（ポモドーロ連携）
  const handleStartTimer = (taskId: string) => {
    alert(
      `タスク ID: ${taskId} のタイマーを開始します。\n（ポモドーロタイマー機能と連携）`
    );
    console.log('Start pomodoro timer for task:', taskId);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar user={mockUser} currentPage="タスク" />

      <div className="ml-64 p-8">
        {/* ヘッダー */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">タスク管理</h1>
          <div className="text-sm text-gray-600">
            全 {summary.total}件 | 完了 {summary.completed}件 | 残り{' '}
            {summary.remaining}件
          </div>
        </div>

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
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
        key={editingTask?.id || 'new'}
        task={editingTask}
        isOpen={showNewTaskForm}
        onClose={() => {
          setShowNewTaskForm(false);
          setEditingTask(undefined);
        }}
        onSave={editingTask ? handleUpdateTask : handleCreateTask}
      />
    </div>
  );
}
