'use client';

import { useState } from 'react';
import { Semester, Holiday } from '../../types';

interface SemesterSettingsProps {
  onClose: () => void;
  onSave: (semesters: Semester[], holidays: Holiday[]) => void;
}

export default function SemesterSettings({
  onClose,
  onSave,
}: SemesterSettingsProps) {
  const [semesters, setSemesters] = useState<Semester[]>([
    {
      id: '1',
      name: '2024年度 後期',
      startDate: '2024-10-01',
      endDate: '2025-03-31',
    },
  ]);

  const [holidays, setHolidays] = useState<Holiday[]>([
    {
      id: '1',
      name: '冬休み',
      startDate: '2024-12-25',
      endDate: '2025-01-07',
    },
    {
      id: '2',
      name: '春休み',
      startDate: '2025-02-20',
      endDate: '2025-03-31',
    },
  ]);

  const addSemester = () => {
    const newSemester: Semester = {
      id: `sem-${Date.now()}`,
      name: '新しい学期',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
    };
    setSemesters([...semesters, newSemester]);
  };

  const addHoliday = () => {
    const newHoliday: Holiday = {
      id: `hol-${Date.now()}`,
      name: '新しい休暇',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
    };
    setHolidays([...holidays, newHoliday]);
  };

  const updateSemester = (id: string, field: keyof Semester, value: string) => {
    setSemesters(
      semesters.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const updateHoliday = (id: string, field: keyof Holiday, value: string) => {
    setHolidays(
      holidays.map((h) => (h.id === id ? { ...h, [field]: value } : h))
    );
  };

  const removeSemester = (id: string) => {
    setSemesters(semesters.filter((s) => s.id !== id));
  };

  const removeHoliday = (id: string) => {
    setHolidays(holidays.filter((h) => h.id !== id));
  };

  const handleSave = () => {
    onSave(semesters, holidays);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        {/* ヘッダー */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">学期・休暇設定</h2>
            <p className="text-sm text-gray-600 mt-1">
              大学の学期や休暇期間を設定して、カレンダーの自動表示を管理します。
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {/* 学期設定 */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              学期設定
            </h3>

            <div className="space-y-3">
              {semesters.map((semester) => (
                <div
                  key={semester.id}
                  className="bg-gray-50 rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <input
                      type="text"
                      value={semester.name}
                      onChange={(e) =>
                        updateSemester(semester.id, 'name', e.target.value)
                      }
                      className="text-lg font-semibold bg-transparent border-none focus:outline-none w-full mb-2"
                    />
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <input
                        type="date"
                        value={semester.startDate}
                        onChange={(e) =>
                          updateSemester(
                            semester.id,
                            'startDate',
                            e.target.value
                          )
                        }
                        className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span>〜</span>
                      <input
                        type="date"
                        value={semester.endDate}
                        onChange={(e) =>
                          updateSemester(semester.id, 'endDate', e.target.value)
                        }
                        className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => removeSemester(semester.id)}
                    className="ml-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={addSemester}
              className="w-full mt-3 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              学期を追加
            </button>
          </div>

          {/* 休暇設定 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              休暇設定
            </h3>

            <div className="space-y-3">
              {holidays.map((holiday) => (
                <div
                  key={holiday.id}
                  className="bg-gray-50 rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <input
                      type="text"
                      value={holiday.name}
                      onChange={(e) =>
                        updateHoliday(holiday.id, 'name', e.target.value)
                      }
                      className="text-base font-semibold bg-transparent border-none focus:outline-none w-full mb-2"
                    />
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <input
                        type="date"
                        value={holiday.startDate}
                        onChange={(e) =>
                          updateHoliday(holiday.id, 'startDate', e.target.value)
                        }
                        className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span>〜</span>
                      <input
                        type="date"
                        value={holiday.endDate}
                        onChange={(e) =>
                          updateHoliday(holiday.id, 'endDate', e.target.value)
                        }
                        className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => removeHoliday(holiday.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => removeHoliday(holiday.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={addHoliday}
              className="w-full mt-3 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              休暇を追加
            </button>
          </div>
        </div>

        {/* フッター */}
        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
