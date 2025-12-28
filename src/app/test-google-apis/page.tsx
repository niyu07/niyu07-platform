'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

interface TaskList {
  id: string;
  title: string;
}

interface Task {
  id: string;
  title: string;
  notes?: string;
  status?: string;
}

interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
}

export default function TestGoogleAPIsPage() {
  const { data: session } = useSession();
  const [taskLists, setTaskLists] = useState<TaskList[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const fetchTaskLists = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/tasks');
      const data = await response.json();
      console.log('タスクリスト:', data);
      setTaskLists(data.taskLists || []);
    } catch (error) {
      console.error('タスクリスト取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async (taskListId: string = '@default') => {
    setLoading(true);
    try {
      const response = await fetch(`/api/tasks?taskListId=${taskListId}`);
      const data = await response.json();
      console.log('タスク:', data);
      setTasks(data.tasks || []);
    } catch (error) {
      console.error('タスク取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNewTask = async () => {
    if (!newTaskTitle.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTaskTitle }),
      });
      const data = await response.json();
      console.log('作成したタスク:', data);
      setNewTaskTitle('');
      // タスク一覧を再取得
      fetchTasks();
    } catch (error) {
      console.error('タスク作成エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCalendarEvents = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/calendar/events');
      const data = await response.json();
      console.log('カレンダーイベント:', data);
      setEvents(data.events || []);
    } catch (error) {
      console.error('カレンダーイベント取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">ログインが必要です</h1>
          <a
            href="/auth/signin"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            ログイン
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Google APIs テスト</h1>

        <div className="grid grid-cols-1 gap-6">
          {/* Google Tasks テスト */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Google Tasks API</h2>

            <div className="space-y-4">
              <div>
                <button
                  onClick={fetchTaskLists}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {loading ? '読み込み中...' : 'タスクリスト一覧を取得'}
                </button>
              </div>

              {taskLists.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">タスクリスト:</h3>
                  <ul className="space-y-2">
                    {taskLists.map((list) => (
                      <li
                        key={list.id}
                        className="p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                        onClick={() => fetchTasks(list.id)}
                      >
                        {list.title}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-4">
                <button
                  onClick={() => fetchTasks('@default')}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
                >
                  デフォルトタスクを取得
                </button>
              </div>

              {tasks.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">タスク一覧:</h3>
                  <ul className="space-y-2">
                    {tasks.map((task) => (
                      <li key={task.id} className="p-2 bg-gray-50 rounded">
                        <div className="font-medium">{task.title}</div>
                        {task.notes && (
                          <div className="text-sm text-gray-600">
                            {task.notes}
                          </div>
                        )}
                        <div className="text-xs text-gray-400 mt-1">
                          Status: {task.status}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-4">
                <h3 className="font-semibold mb-2">新しいタスクを作成:</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="タスクのタイトル"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    onKeyPress={(e) => e.key === 'Enter' && createNewTask()}
                  />
                  <button
                    onClick={createNewTask}
                    disabled={loading || !newTaskTitle.trim()}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400"
                  >
                    作成
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Google Calendar テスト */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Google Calendar API</h2>

            <div className="space-y-4">
              <div>
                <button
                  onClick={fetchCalendarEvents}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {loading ? '読み込み中...' : '今日のイベントを取得'}
                </button>
              </div>

              {events.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">今日のイベント:</h3>
                  <ul className="space-y-2">
                    {events.map((event) => (
                      <li key={event.id} className="p-2 bg-gray-50 rounded">
                        <div className="font-medium">{event.summary}</div>
                        {event.description && (
                          <div className="text-sm text-gray-600">
                            {event.description}
                          </div>
                        )}
                        <div className="text-xs text-gray-400 mt-1">
                          {event.start?.dateTime || event.start?.date}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
