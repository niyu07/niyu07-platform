'use client';

import { useState } from 'react';
import { ClassPeriod, CalendarEvent } from '../../types';

interface TimeTableRegistrationProps {
  onClose: () => void;
  onSave: (
    events: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>[]
  ) => void;
}

export default function TimeTableRegistration({
  onClose,
}: TimeTableRegistrationProps) {
  const [step, setStep] = useState(1);
  const [classPeriods, setClassPeriods] = useState<ClassPeriod[]>([
    { id: '1', name: '1限', startTime: '09:00', endTime: '10:30' },
    { id: '2', name: '2限', startTime: '10:40', endTime: '12:10' },
    { id: '3', name: '3限', startTime: '13:00', endTime: '14:30' },
    { id: '4', name: '4限', startTime: '14:40', endTime: '16:10' },
    { id: '5', name: '5限', startTime: '16:20', endTime: '17:50' },
  ]);

  const addClassPeriod = () => {
    const newPeriod: ClassPeriod = {
      id: `${classPeriods.length + 1}`,
      name: `${classPeriods.length + 1}限`,
      startTime: '09:00',
      endTime: '10:30',
    };
    setClassPeriods([...classPeriods, newPeriod]);
  };

  const removeClassPeriod = (id: string) => {
    setClassPeriods(classPeriods.filter((p) => p.id !== id));
  };

  const updateClassPeriod = (
    id: string,
    field: keyof ClassPeriod,
    value: string
  ) => {
    setClassPeriods(
      classPeriods.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // TODO: 時間割を保存
      onClose();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-auto">
        {/* ヘッダー */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">時間割の登録</h2>
            <p className="text-sm text-gray-600 mt-1">
              ステップ {step}/3:{' '}
              {step === 1
                ? '授業時間の設定'
                : step === 2
                  ? '時間割の入力'
                  : '繰り返し設定'}
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

        {/* ステップ1: 授業時間の設定 */}
        {step === 1 && (
          <div className="p-6">
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-4 gap-4 text-sm font-semibold text-gray-700 mb-3">
                <div>時限名</div>
                <div>開始時刻</div>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                  終了時刻
                </div>
                <div></div>
              </div>

              {classPeriods.map((period) => (
                <div
                  key={period.id}
                  className="grid grid-cols-4 gap-4 items-center mb-3"
                >
                  <div>
                    <input
                      type="text"
                      value={period.name}
                      onChange={(e) =>
                        updateClassPeriod(period.id, 'name', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <input
                      type="time"
                      value={period.startTime}
                      onChange={(e) =>
                        updateClassPeriod(
                          period.id,
                          'startTime',
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">〜</span>
                    <input
                      type="time"
                      value={period.endTime}
                      onChange={(e) =>
                        updateClassPeriod(period.id, 'endTime', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => removeClassPeriod(period.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
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
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={addClassPeriod}
              className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
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
              時限を追加
            </button>
          </div>
        )}

        {/* ステップ2: 時間割の入力 */}
        {step === 2 && (
          <div className="p-6">
            <div className="text-center text-gray-500 py-12">
              時間割入力フォーム（実装予定）
            </div>
          </div>
        )}

        {/* ステップ3: 繰り返し設定 */}
        {step === 3 && (
          <div className="p-6">
            <div className="text-center text-gray-500 py-12">
              繰り返し設定フォーム（実装予定）
            </div>
          </div>
        )}

        {/* フッター */}
        <div className="p-6 border-t border-gray-200 flex justify-between">
          <button
            onClick={step === 1 ? onClose : handleBack}
            className="px-6 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            {step === 1 ? 'キャンセル' : '戻る'}
          </button>
          <button
            onClick={handleNext}
            className="px-6 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium flex items-center gap-2"
          >
            {step === 3 ? '完了' : '次へ'}
            {step < 3 && (
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
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
