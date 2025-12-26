'use client';

import { Task, Priority, TaskStatus, TaskCategory, Subtask } from '../../types';
import { useState } from 'react';
import SubtaskList from './SubtaskList';
import { formatDateYMD, getTodayYMD } from '../utils/taskUtils';

interface TaskFormProps {
  task?: Task; // 編集の場合は既存タスクを渡す
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export default function TaskForm({
  task,
  isOpen,
  onClose,
  onSave,
}: TaskFormProps) {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [status, setStatus] = useState<TaskStatus>(task?.status || '未着手');
  const [priority, setPriority] = useState<Priority>(task?.priority || '中');
  const [dueDate, setDueDate] = useState(task?.dueDate || '');
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(
    task?.estimatedMinutes || 60
  );
  const [categories, setCategories] = useState<TaskCategory[]>(
    task?.categories || []
  );
  const [categoryInput, setCategoryInput] = useState('');
  const [subtasks, setSubtasks] = useState<Subtask[]>(task?.subtasks || []);
  const [autoCreateCalendarEvent, setAutoCreateCalendarEvent] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAddCategory = (category: string) => {
    const trimmed = category.trim();
    if (trimmed && !categories.includes(trimmed as TaskCategory)) {
      setCategories([...categories, trimmed as TaskCategory]);
      setCategoryInput('');
    }
  };

  const handleRemoveCategory = (category: TaskCategory) => {
    setCategories(categories.filter((c) => c !== category));
  };

  const handleAddSubtask = (subtaskTitle: string) => {
    const newSubtask: Subtask = {
      id: `st-${Date.now()}`,
      title: subtaskTitle,
      completed: false,
      order: subtasks.length + 1,
    };
    setSubtasks([...subtasks, newSubtask]);
  };

  const handleToggleSubtask = (subtaskId: string) => {
    setSubtasks(
      subtasks.map((st) =>
        st.id === subtaskId ? { ...st, completed: !st.completed } : st
      )
    );
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    setSubtasks(subtasks.filter((st) => st.id !== subtaskId));
  };

  // 今日・明日ボタン
  const setToday = () => {
    setDueDate(getTodayYMD());
  };

  const setTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDueDate(formatDateYMD(tomorrow));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'タスク名は必須です';
    }

    if (estimatedMinutes <= 0) {
      newErrors.estimatedMinutes = '見積時間は1分以上である必要があります';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
      title: title.trim(),
      description: description.trim() || undefined,
      status,
      priority,
      dueDate: dueDate || undefined,
      estimatedMinutes: estimatedMinutes || undefined,
      actualMinutes: task?.actualMinutes,
      categories: categories.length > 0 ? categories : undefined,
      subtasks: subtasks.length > 0 ? subtasks : undefined,
      completedAt: task?.completedAt,
      isOverdue: task?.isOverdue,
      pomodoroSessions: task?.pomodoroSessions,
      linkedCalendarEventId: task?.linkedCalendarEventId,
    };

    onSave(taskData);
    onClose();
  };

  const handleSaveDraft = () => {
    console.log('Draft saved (functionality to be implemented)');
    alert('下書きを保存しました');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* ヘッダー */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-xl font-semibold text-gray-900">
            {task ? 'タスク編集' : '新しいタスク'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* フォーム本体 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* タスク名 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              タスク名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="タスク名を入力..."
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* 説明 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              説明
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="詳細な説明を入力..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* 期日と見積時間（横並び） */}
          <div className="grid grid-cols-2 gap-4">
            {/* 期日 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                締切
              </label>
              <input
                type="text"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                placeholder="yyyy/mm/dd"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={setToday}
                  className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  今日
                </button>
                <button
                  type="button"
                  onClick={setTomorrow}
                  className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  明日
                </button>
              </div>
            </div>

            {/* 見積時間 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                見積時間（分）
              </label>
              <input
                type="number"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                placeholder="例: 60"
                min="1"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.estimatedMinutes ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
                <span>⏱️</span>
                <span>例: 60</span>
              </p>
              {errors.estimatedMinutes && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.estimatedMinutes}
                </p>
              )}
            </div>
          </div>

          {/* 優先度 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              優先度
            </label>
            <div className="flex gap-3">
              {(['高', '中', '低'] as Priority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                    priority === p
                      ? p === '高'
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : p === '中'
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-500 bg-gray-50 text-gray-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span
                      className={`w-3 h-3 rounded-full ${
                        p === '高'
                          ? 'bg-red-500'
                          : p === '中'
                            ? 'bg-orange-500'
                            : 'bg-gray-500'
                      }`}
                    />
                    <span className="font-medium">
                      {p} -{' '}
                      {p === '高' ? 'High' : p === '中' ? 'Medium' : 'Low'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* タグ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              タグ
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {categories.map((category) => (
                <span
                  key={category}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                >
                  {category}
                  <button
                    type="button"
                    onClick={() => handleRemoveCategory(category)}
                    className="hover:text-blue-900"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCategory(categoryInput);
                  }
                }}
                placeholder="タグを入力してEnter..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* サブタスク */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              サブタスク
            </label>
            <SubtaskList
              subtasks={subtasks}
              onToggle={handleToggleSubtask}
              onAdd={handleAddSubtask}
              onDelete={handleDeleteSubtask}
              editable
            />
          </div>

          {/* カレンダー連携 */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="auto-calendar"
              checked={autoCreateCalendarEvent}
              onChange={(e) => setAutoCreateCalendarEvent(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="auto-calendar" className="text-sm text-gray-700">
              自動的にカレンダーに予定を作成する
            </label>
          </div>

          {/* フッターボタン */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              キャンセル
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                下書き保存
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                作成
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
