'use client';

import { Task, TaskStatus } from '../../types';
import TaskCard from './TaskCard';
import { groupTasksByStatus } from '../utils/taskUtils';

interface KanbanViewProps {
  tasks: Task[];
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onStatusChange?: (taskId: string, newStatus: TaskStatus) => void;
  onStartTimer?: (taskId: string) => void;
}

export default function KanbanView({
  tasks,
  onEdit,
  onDelete,
  onStatusChange,
  onStartTimer,
}: KanbanViewProps) {
  const groupedTasks = groupTasksByStatus(tasks);

  const columns: {
    status: TaskStatus;
    title: string;
    count: number;
    bgColor: string;
  }[] = [
    {
      status: '未着手',
      title: '未着手',
      count: groupedTasks.未着手.length,
      bgColor: 'bg-gray-50',
    },
    {
      status: '進行中',
      title: '進行中',
      count: groupedTasks.進行中.length,
      bgColor: 'bg-blue-50',
    },
    {
      status: '完了',
      title: '完了',
      count: groupedTasks.完了.length,
      bgColor: 'bg-green-50',
    },
  ];

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId && onStatusChange) {
      onStatusChange(taskId, targetStatus);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-6 min-w-max">
        {columns.map((column) => (
          <div
            key={column.status}
            className="flex flex-col w-80 flex-shrink-0"
            onDrop={(e) => handleDrop(e, column.status)}
            onDragOver={handleDragOver}
          >
            {/* カラムヘッダー */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">{column.title}</h3>
                <span className="bg-gray-200 text-gray-700 text-sm font-medium px-2 py-0.5 rounded-full">
                  {column.count}
                </span>
              </div>
              <button
                className="text-gray-400 hover:text-gray-600"
                title="列を追加"
              >
                +
              </button>
            </div>

            {/* タスクカード */}
            <div
              className={`flex-1 ${column.bgColor} rounded-lg p-4 space-y-3 min-h-[500px] max-h-[calc(100vh-300px)] custom-scrollbar overflow-y-auto`}
            >
              {groupedTasks[column.status].map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('taskId', task.id);
                  }}
                  className="cursor-move"
                >
                  <TaskCard
                    task={task}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onStatusChange={onStatusChange}
                    onStartTimer={onStartTimer}
                  />
                </div>
              ))}

              {groupedTasks[column.status].length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  タスクがありません
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
