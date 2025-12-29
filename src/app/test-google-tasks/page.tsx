'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useGoogleTasks } from '@/hooks/useGoogleTasks';

export default function TestGoogleTasksPage() {
  const { data: session, status } = useSession();
  const {
    tasks,
    taskLists,
    isLoading,
    error,
    fetchTaskLists,
    fetchTasks,
    createTask,
    updateTask,
    completeTask,
    deleteTask,
  } = useGoogleTasks('@default');

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (message: string) => {
    setTestResults((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const handleFetchTaskLists = async () => {
    try {
      addTestResult('タスクリスト取得開始...');
      await fetchTaskLists();
      addTestResult('✅ タスクリスト取得成功');
    } catch (err) {
      addTestResult(`❌ エラー: ${err}`);
    }
  };

  const handleFetchTasks = async () => {
    try {
      addTestResult('タスク取得開始...');
      await fetchTasks();
      addTestResult('✅ タスク取得成功');
    } catch (err) {
      addTestResult(`❌ エラー: ${err}`);
    }
  };

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) {
      addTestResult('❌ タスク名を入力してください');
      return;
    }

    try {
      addTestResult(`タスク作成開始: "${newTaskTitle}"`);
      await createTask({
        title: newTaskTitle,
        notes: 'テストから作成されたタスク',
        due: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });
      addTestResult('✅ タスク作成成功');
      setNewTaskTitle('');
    } catch (err) {
      addTestResult(`❌ エラー: ${err}`);
    }
  };

  const handleCompleteTask = async (taskId: string, taskTitle: string) => {
    try {
      addTestResult(`タスク完了: "${taskTitle}"`);
      await completeTask(taskId);
      addTestResult('✅ タスク完了成功');
    } catch (err) {
      addTestResult(`❌ エラー: ${err}`);
    }
  };

  const handleDeleteTask = async (taskId: string, taskTitle: string) => {
    if (!confirm(`"${taskTitle}" を削除しますか？`)) return;

    try {
      addTestResult(`タスク削除: "${taskTitle}"`);
      await deleteTask(taskId);
      addTestResult('✅ タスク削除成功');
    } catch (err) {
      addTestResult(`❌ エラー: ${err}`);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">読み込み中...</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">認証が必要です</h1>
          <p className="mb-4">Google Tasks APIをテストするにはログインしてください</p>
          <a
            href="/api/auth/signin"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            ログイン
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Google Tasks API テスト</h1>

        {/* ユーザー情報 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">認証情報</h2>
          <p>ユーザー: {session?.user?.name}</p>
          <p>メール: {session?.user?.email}</p>
          <p className="text-sm text-gray-600 mt-2">
            セッション状態: {status}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* 左側: コントロール */}
          <div className="space-y-6">
            {/* タスクリスト取得 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">1. タスクリスト取得</h2>
              <button
                onClick={handleFetchTaskLists}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                タスクリスト取得
              </button>
              <div className="mt-4">
                <p className="font-semibold">取得結果: {taskLists.length}件</p>
                <ul className="mt-2 space-y-1">
                  {taskLists.map((list) => (
                    <li key={list.id} className="text-sm">
                      📋 {list.title} (ID: {list.id})
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* タスク取得 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">2. タスク取得</h2>
              <button
                onClick={handleFetchTasks}
                disabled={isLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
              >
                タスク取得
              </button>
              <div className="mt-4">
                <p className="font-semibold">取得結果: {tasks.length}件</p>
              </div>
            </div>

            {/* タスク作成 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">3. タスク作成</h2>
              <div className="space-y-3">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="新しいタスク名"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <button
                  onClick={handleCreateTask}
                  disabled={isLoading || !newTaskTitle.trim()}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
                >
                  タスク作成
                </button>
              </div>
            </div>

            {/* エラー表示 */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-semibold">エラー:</p>
                <p className="text-red-600 text-sm">{error.message}</p>
              </div>
            )}
          </div>

          {/* 右側: タスク一覧とログ */}
          <div className="space-y-6">
            {/* タスク一覧 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">タスク一覧</h2>
              {isLoading ? (
                <p className="text-gray-600">読み込み中...</p>
              ) : tasks.length === 0 ? (
                <p className="text-gray-600">タスクがありません</p>
              ) : (
                <ul className="space-y-2">
                  {tasks.map((task) => (
                    <li
                      key={task.id}
                      className="border border-gray-200 rounded-lg p-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold">{task.title}</p>
                          {task.notes && (
                            <p className="text-sm text-gray-600 mt-1">
                              {task.notes}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            状態: {task.status}
                          </p>
                        </div>
                        <div className="flex gap-2 ml-2">
                          <button
                            onClick={() =>
                              handleCompleteTask(task.id || '', task.title)
                            }
                            className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                          >
                            完了
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteTask(task.id || '', task.title)
                            }
                            className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                          >
                            削除
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* テストログ */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">テストログ</h2>
              <div className="bg-gray-50 rounded p-4 h-64 overflow-y-auto">
                {testResults.length === 0 ? (
                  <p className="text-gray-600 text-sm">
                    ログはここに表示されます
                  </p>
                ) : (
                  <ul className="space-y-1">
                    {testResults.map((result, index) => (
                      <li key={index} className="text-xs font-mono">
                        {result}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <button
                onClick={() => setTestResults([])}
                className="mt-2 px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
              >
                ログクリア
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
