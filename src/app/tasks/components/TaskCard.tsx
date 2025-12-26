'use client';

import { Task } from '../../types';
import {
  getDueDateLabel,
  getDueDateUrgency,
  getPriorityColor,
  formatMinutesToHours,
  calculateSubtaskProgress,
} from '../utils/taskUtils';

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onStatusChange?: (taskId: string, newStatus: Task['status']) => void;
  onStartTimer?: (taskId: string) => void;
  showActions?: boolean;
}

export default function TaskCard({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  onStartTimer,
  showActions = true,
}: TaskCardProps) {
  const priorityColors = getPriorityColor(task.priority);
  const dueDateLabel = getDueDateLabel(task.dueDate);
  const dueDateUrgency = getDueDateUrgency(task.dueDate);
  const subtaskProgress = calculateSubtaskProgress(task);

  // 期日の色スタイル
  const getDueDateStyle = () => {
    switch (dueDateUrgency) {
      case 'overdue':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'today':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'soon':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-300';
    }
  };

  // 遅延バッジ
  const renderOverdueBadge = () => {
    if (!task.isOverdue && task.status === '完了') {
      return (
        <div className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
          <span>遅延</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* ヘッダー: 優先度バッジ */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-1 rounded text-xs font-medium border ${priorityColors.bg} ${priorityColors.text} ${priorityColors.border}`}
          >
            {task.priority}
          </span>
          {renderOverdueBadge()}
        </div>

        {showActions && (
          <div className="flex items-center gap-1">
            {onEdit && (
              <button
                onClick={() => onEdit(task)}
                className="p-1 hover:bg-gray-100 rounded"
                title="編集"
              >
                ✏️
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(task.id)}
                className="p-1 hover:bg-gray-100 rounded"
                title="削除"
              >
                🗑️
              </button>
            )}
          </div>
        )}
      </div>

      {/* タイトル */}
      <h3 className="font-medium text-gray-900 mb-2">{task.title}</h3>

      {/* 期日 */}
      {task.dueDate && (
        <div className="flex items-center gap-2 mb-2">
          <span
            className={`text-xs px-2 py-1 rounded border ${getDueDateStyle()}`}
          >
            {dueDateLabel}
          </span>
          <span className="text-xs text-gray-500">{task.dueDate}</span>
        </div>
      )}

      {/* 見積 / 実績時間 */}
      <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
        {task.estimatedMinutes && (
          <div className="flex items-center gap-1">
            <span>見積:</span>
            <span className="font-medium">
              {formatMinutesToHours(task.estimatedMinutes)}
            </span>
          </div>
        )}
        {task.actualMinutes && (
          <div className="flex items-center gap-1">
            <span>実績:</span>
            <span className="font-medium">
              {formatMinutesToHours(task.actualMinutes)}
            </span>
          </div>
        )}
      </div>

      {/* カテゴリ/タグ */}
      {task.categories && task.categories.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.categories.map((category, index) => (
            <span
              key={index}
              className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded"
            >
              {category}
            </span>
          ))}
        </div>
      )}

      {/* サブタスク進捗 */}
      {task.subtasks && task.subtasks.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>サブタスク</span>
            <span>
              {subtaskProgress.completed}/{subtaskProgress.total}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${subtaskProgress.percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* アクション */}
      {showActions && (
        <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
          {task.status !== '完了' && onStatusChange && (
            <>
              {task.status === '未着手' && (
                <button
                  onClick={() => onStatusChange(task.id, '進行中')}
                  className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700"
                >
                  開始
                </button>
              )}
              {task.status === '進行中' && (
                <button
                  onClick={() => onStatusChange(task.id, '完了')}
                  className="text-xs bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700"
                >
                  完了
                </button>
              )}
            </>
          )}

          {task.status !== '完了' && onStartTimer && (
            <button
              onClick={() => onStartTimer(task.id)}
              className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-200"
              title="ポモドーロタイマー開始"
            >
              🍅 タイマー
            </button>
          )}
        </div>
      )}
    </div>
  );
}
