'use client';

import { useState } from 'react';
import { WorkLocation } from '@/app/types';

interface WorkLocationSettingsProps {
  workLocations: WorkLocation[];
  onAdd: (
    location: Omit<WorkLocation, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<void>;
  onUpdate: (id: string, updates: Partial<WorkLocation>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function WorkLocationSettings({
  workLocations,
  onAdd,
  onUpdate,
  onDelete,
}: WorkLocationSettingsProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '時給制' as '時給制' | '日給制' | '業務委託',
    hourlyRate: '',
    dailyRate: '',
    projectRate: '',
    color: '#3B82F6',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      type: '時給制',
      hourlyRate: '',
      dailyRate: '',
      projectRate: '',
      color: '#3B82F6',
    });
  };

  const handleAdd = async () => {
    if (!formData.name) {
      alert('勤務先名を入力してください');
      return;
    }

    try {
      await onAdd({
        name: formData.name,
        type: formData.type,
        hourlyRate: formData.hourlyRate
          ? parseInt(formData.hourlyRate)
          : undefined,
        dailyRate: formData.dailyRate
          ? parseInt(formData.dailyRate)
          : undefined,
        projectRate: formData.projectRate
          ? parseInt(formData.projectRate)
          : undefined,
        color: formData.color,
        isActive: true,
      });
      resetForm();
      setIsAdding(false);
    } catch (error) {
      console.error('Error adding work location:', error);
      alert('勤務先の追加に失敗しました');
    }
  };

  const handleEdit = (location: WorkLocation) => {
    setEditingId(location.id);
    setFormData({
      name: location.name,
      type: location.type,
      hourlyRate: location.hourlyRate?.toString() || '',
      dailyRate: location.dailyRate?.toString() || '',
      projectRate: location.projectRate?.toString() || '',
      color: location.color,
    });
  };

  const handleUpdate = async () => {
    if (!editingId) return;

    try {
      await onUpdate(editingId, {
        name: formData.name,
        type: formData.type,
        hourlyRate: formData.hourlyRate
          ? parseInt(formData.hourlyRate)
          : undefined,
        dailyRate: formData.dailyRate
          ? parseInt(formData.dailyRate)
          : undefined,
        projectRate: formData.projectRate
          ? parseInt(formData.projectRate)
          : undefined,
        color: formData.color,
      });
      resetForm();
      setEditingId(null);
    } catch (error) {
      console.error('Error updating work location:', error);
      alert('勤務先の更新に失敗しました');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('この勤務先を削除しますか？')) return;

    try {
      await onDelete(id);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '勤務先の削除に失敗しました';
      alert(errorMessage);
    }
  };

  const handleToggleActive = async (location: WorkLocation) => {
    try {
      await onUpdate(location.id, { isActive: !location.isActive });
    } catch (error) {
      console.error('Error toggling active status:', error);
      alert('ステータスの変更に失敗しました');
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">勤務先設定</h2>
        {!isAdding && !editingId && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + 勤務先を追加
          </button>
        )}
      </div>

      {/* 追加・編集フォーム */}
      {(isAdding || editingId) && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h3 className="text-lg font-semibold mb-4">
            {isAdding ? '新しい勤務先' : '勤務先を編集'}
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                勤務先名 *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="例: カフェABC"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                給与形態 *
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as '時給制' | '日給制' | '業務委託',
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="時給制">時給制</option>
                <option value="日給制">日給制</option>
                <option value="業務委託">業務委託</option>
              </select>
            </div>

            {formData.type === '時給制' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  時給（円）
                </label>
                <input
                  type="number"
                  value={formData.hourlyRate}
                  onChange={(e) =>
                    setFormData({ ...formData, hourlyRate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1000"
                />
              </div>
            )}

            {formData.type === '日給制' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  日給（円）
                </label>
                <input
                  type="number"
                  value={formData.dailyRate}
                  onChange={(e) =>
                    setFormData({ ...formData, dailyRate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="8000"
                />
              </div>
            )}

            {formData.type === '業務委託' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  単価（円/時間）
                </label>
                <input
                  type="number"
                  value={formData.projectRate}
                  onChange={(e) =>
                    setFormData({ ...formData, projectRate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="2000"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                カラー
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={() => {
                resetForm();
                setIsAdding(false);
                setEditingId(null);
              }}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={isAdding ? handleAdd : handleUpdate}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isAdding ? '追加' : '更新'}
            </button>
          </div>
        </div>
      )}

      {/* 勤務先一覧 */}
      <div className="space-y-3">
        {workLocations.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>勤務先が登録されていません</p>
            <p className="text-sm mt-2">「勤務先を追加」から登録してください</p>
          </div>
        ) : (
          workLocations.map((location) => (
            <div
              key={location.id}
              className={`p-4 border rounded-lg ${
                location.isActive
                  ? 'border-gray-200 bg-white'
                  : 'border-gray-200 bg-gray-100 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: location.color }}
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {location.name}
                      {!location.isActive && (
                        <span className="ml-2 text-xs text-gray-500">
                          (無効)
                        </span>
                      )}
                    </h3>
                    <div className="flex gap-4 mt-1 text-sm text-gray-600">
                      <span>{location.type}</span>
                      {location.type === '時給制' && location.hourlyRate && (
                        <span>¥{location.hourlyRate.toLocaleString()}/時</span>
                      )}
                      {location.type === '日給制' && location.dailyRate && (
                        <span>¥{location.dailyRate.toLocaleString()}/日</span>
                      )}
                      {location.type === '業務委託' && location.projectRate && (
                        <span>¥{location.projectRate.toLocaleString()}/時</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleActive(location)}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                      location.isActive
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {location.isActive ? '無効化' : '有効化'}
                  </button>
                  <button
                    onClick={() => handleEdit(location)}
                    disabled={editingId !== null || isAdding}
                    className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg text-sm transition-colors disabled:opacity-50"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => handleDelete(location.id)}
                    disabled={editingId !== null || isAdding}
                    className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg text-sm transition-colors disabled:opacity-50"
                  >
                    削除
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
