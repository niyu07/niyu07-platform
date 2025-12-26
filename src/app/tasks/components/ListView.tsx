'use client';

import { Task } from '../../types';
import {
  getDueDateLabel,
  getDueDateUrgency,
  calculateSubtaskProgress,
} from '../utils/taskUtils';

interface ListViewProps {
  tasks: Task[];
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onStatusChange?: (taskId: string, newStatus: Task['status']) => void;
}

export default function ListView({
  tasks,
  onEdit,
  onDelete,
  onStatusChange,
}: ListViewProps) {
  const getStatusBadge = (status: Task['status']) => {
    const styles = {
      未着手: 'bg-gray-100 text-gray-700',
      進行中: 'bg-blue-100 text-blue-700',
      完了: 'bg-green-100 text-green-700',
    };
    return styles[status];
  };

  const getPriorityBadge = (priority: Task['priority']) => {
    const styles = {
      高: 'bg-red-100 text-red-700',
      中: 'bg-orange-100 text-orange-700',
      低: 'bg-gray-100 text-gray-600',
    };
    return styles[priority];
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* テーブルヘッダー */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input type="checkbox" className="rounded" />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                優先度
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                タスク名
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                締切
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                タグ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                進捗
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                状態
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tasks.map((task) => {
              const dueDateLabel = getDueDateLabel(task.dueDate);
              const dueDateUrgency = getDueDateUrgency(task.dueDate);
              const subtaskProgress = calculateSubtaskProgress(task);

              return (
                <tr
                  key={task.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {/* チェックボックス */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input type="checkbox" className="rounded" />
                  </td>

                  {/* 優先度 */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadge(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </span>
                  </td>

                  {/* タスク名 */}
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {task.title}
                        </div>
                        {task.description && (
                          <div className="text-sm text-gray-500 truncate max-w-md">
                            {task.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* 締切 */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {task.dueDate ? (
                      <div className="flex flex-col gap-1">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            dueDateUrgency === 'overdue'
                              ? 'bg-red-100 text-red-700'
                              : dueDateUrgency === 'today'
                                ? 'bg-orange-100 text-orange-700'
                                : dueDateUrgency === 'soon'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {dueDateLabel}
                        </span>
                        <span className="text-xs text-gray-500">
                          {task.dueDate}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>

                  {/* タグ */}
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {task.categories?.slice(0, 2).map((category, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700"
                        >
                          {category}
                        </span>
                      ))}
                      {task.categories && task.categories.length > 2 && (
                        <span className="text-xs text-gray-400">
                          +{task.categories.length - 2}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* 進捗 */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {subtaskProgress.total > 0 ? (
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${subtaskProgress.percentage}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-600">
                          {subtaskProgress.completed}/{subtaskProgress.total}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>

                  {/* 状態 */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={task.status}
                      onChange={(e) =>
                        onStatusChange &&
                        onStatusChange(
                          task.id,
                          e.target.value as Task['status']
                        )
                      }
                      className={`text-sm rounded-md px-2 py-1 border-0 font-medium cursor-pointer ${getStatusBadge(
                        task.status
                      )}`}
                    >
                      <option value="未着手">未着手</option>
                      <option value="進行中">進行中</option>
                      <option value="完了">完了</option>
                    </select>
                  </td>

                  {/* 操作 */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(task)}
                          className="text-blue-600 hover:text-blue-900"
                          title="編集"
                        >
                          ✏️
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(task.id)}
                          className="text-red-600 hover:text-red-900"
                          title="削除"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {tasks.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            タスクがありません
          </div>
        )}
      </div>
    </div>
  );
}
