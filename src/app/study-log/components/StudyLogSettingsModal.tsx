'use client';

import { useState } from 'react';
import { StudyLogSettings, Habit, StudyCategory } from '@/app/types';

interface StudyLogSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: StudyLogSettings;
  onSave: (settings: StudyLogSettings) => void;
}

export default function StudyLogSettingsModal({
  isOpen,
  onClose,
  settings,
  onSave,
}: StudyLogSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<
    'goals' | 'categories' | 'habits'
  >('goals');
  const [localSettings, setLocalSettings] =
    useState<StudyLogSettings>(settings);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      ...localSettings,
      updatedAt: new Date().toISOString(),
    });
    onClose();
  };

  const handleAddHabit = () => {
    const newHabit: Habit = {
      id: `habit-${Date.now()}`,
      title: '新しい習慣',
      targetDays: [1, 2, 3, 4, 5], // 平日
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setLocalSettings({
      ...localSettings,
      habits: [...localSettings.habits, newHabit],
    });
  };

  const handleUpdateHabit = (habitId: string, updates: Partial<Habit>) => {
    setLocalSettings({
      ...localSettings,
      habits: localSettings.habits.map((habit) =>
        habit.id === habitId
          ? { ...habit, ...updates, updatedAt: new Date().toISOString() }
          : habit
      ),
    });
  };

  const handleDeleteHabit = (habitId: string) => {
    setLocalSettings({
      ...localSettings,
      habits: localSettings.habits.filter((habit) => habit.id !== habitId),
    });
  };

  const handleAddCustomCategory = () => {
    const newCategory = {
      name: '新しいカテゴリ',
      color: '#9E9E9E',
    };

    setLocalSettings({
      ...localSettings,
      customCategories: [...localSettings.customCategories, newCategory],
    });
  };

  const handleUpdateCustomCategory = (
    index: number,
    updates: { name?: string; color?: string }
  ) => {
    const updatedCategories = [...localSettings.customCategories];
    updatedCategories[index] = {
      ...updatedCategories[index],
      ...updates,
    };

    setLocalSettings({
      ...localSettings,
      customCategories: updatedCategories,
    });
  };

  const handleDeleteCustomCategory = (index: number) => {
    setLocalSettings({
      ...localSettings,
      customCategories: localSettings.customCategories.filter(
        (_, i) => i !== index
      ),
    });
  };

  const dayLabels = ['日', '月', '火', '水', '木', '金', '土'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* ヘッダー */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">学習ログ設定</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* タブ */}
          <div className="flex gap-4 mt-4">
            <button
              onClick={() => setActiveTab('goals')}
              className={`pb-2 px-1 font-medium border-b-2 transition-colors ${
                activeTab === 'goals'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              目標設定
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`pb-2 px-1 font-medium border-b-2 transition-colors ${
                activeTab === 'categories'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              カテゴリ管理
            </button>
            <button
              onClick={() => setActiveTab('habits')}
              className={`pb-2 px-1 font-medium border-b-2 transition-colors ${
                activeTab === 'habits'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              習慣チェックリスト
            </button>
          </div>
        </div>

        {/* コンテンツ */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* 目標設定タブ */}
          {activeTab === 'goals' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  1日の目標学習時間（時間）
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={localSettings.dailyGoalHours}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      dailyGoalHours: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  推奨: 2〜5時間程度
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  週間目標学習時間（時間・任意）
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={localSettings.weeklyGoalHours || ''}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      weeklyGoalHours: e.target.value
                        ? parseFloat(e.target.value)
                        : undefined,
                    })
                  }
                  placeholder="未設定"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  月間目標学習時間（時間・任意）
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={localSettings.monthlyGoalHours || ''}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      monthlyGoalHours: e.target.value
                        ? parseFloat(e.target.value)
                        : undefined,
                    })
                  }
                  placeholder="未設定"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* カテゴリ管理タブ */}
          {activeTab === 'categories' && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-700">
                    デフォルトカテゴリ
                  </h3>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: '#4F7FFF' }}
                    />
                    <span className="text-sm text-gray-700">Programming</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: '#4CAF50' }}
                    />
                    <span className="text-sm text-gray-700">Design</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: '#9C27B0' }}
                    />
                    <span className="text-sm text-gray-700">English</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: '#FF9800' }}
                    />
                    <span className="text-sm text-gray-700">Math</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: '#9E9E9E' }}
                    />
                    <span className="text-sm text-gray-700">Other</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-700">
                    カスタムカテゴリ
                  </h3>
                  <button
                    onClick={handleAddCustomCategory}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    + 追加
                  </button>
                </div>

                <div className="space-y-2">
                  {localSettings.customCategories.map((category, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg"
                    >
                      <input
                        type="color"
                        value={category.color}
                        onChange={(e) =>
                          handleUpdateCustomCategory(index, {
                            color: e.target.value,
                          })
                        }
                        className="w-8 h-8 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={category.name}
                        onChange={(e) =>
                          handleUpdateCustomCategory(index, {
                            name: e.target.value,
                          })
                        }
                        className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => handleDeleteCustomCategory(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        削除
                      </button>
                    </div>
                  ))}

                  {localSettings.customCategories.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      カスタムカテゴリはまだありません
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 習慣チェックリストタブ */}
          {activeTab === 'habits' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">
                  毎日実行したい習慣を設定できます
                </p>
                <button
                  onClick={handleAddHabit}
                  className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
                >
                  + 習慣を追加
                </button>
              </div>

              <div className="space-y-3">
                {localSettings.habits.map((habit) => (
                  <div
                    key={habit.id}
                    className="p-4 bg-white border border-gray-200 rounded-lg space-y-3"
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={habit.isActive}
                        onChange={(e) =>
                          handleUpdateHabit(habit.id, {
                            isActive: e.target.checked,
                          })
                        }
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <input
                          type="text"
                          value={habit.title}
                          onChange={(e) =>
                            handleUpdateHabit(habit.id, {
                              title: e.target.value,
                            })
                          }
                          className="w-full px-3 py-1 text-sm font-medium border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <textarea
                          value={habit.description || ''}
                          onChange={(e) =>
                            handleUpdateHabit(habit.id, {
                              description: e.target.value,
                            })
                          }
                          placeholder="詳細説明（任意）"
                          rows={2}
                          className="w-full mt-2 px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                      </div>
                      <button
                        onClick={() => handleDeleteHabit(habit.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        削除
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2">
                        実行する曜日
                      </label>
                      <div className="flex gap-2">
                        {dayLabels.map((day, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              const newDays = habit.targetDays.includes(index)
                                ? habit.targetDays.filter((d) => d !== index)
                                : [...habit.targetDays, index].sort();
                              handleUpdateHabit(habit.id, {
                                targetDays: newDays,
                              });
                            }}
                            className={`w-8 h-8 rounded-full text-xs font-medium transition-colors ${
                              habit.targetDays.includes(index)
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

                {localSettings.habits.length === 0 && (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-2">
                      習慣はまだありません
                    </p>
                    <p className="text-xs text-gray-400">
                      「習慣を追加」ボタンから新しい習慣を追加できます
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
