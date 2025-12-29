import { useState } from 'react';
import { GoogleCalendar } from '@/hooks/useGoogleCalendar';

interface CalendarSelectorProps {
  calendars: GoogleCalendar[];
  selectedCalendarIds: string[];
  calendarColors: { [calendarId: string]: string };
  onToggleCalendar: (calendarId: string) => void;
  onColorChange: (calendarId: string, color: string) => void;
  onClose: () => void;
  defaultColors: string[];
}

export default function CalendarSelector({
  calendars,
  selectedCalendarIds,
  calendarColors,
  onToggleCalendar,
  onColorChange,
  onClose,
  defaultColors,
}: CalendarSelectorProps) {
  const [editingColorId, setEditingColorId] = useState<string | null>(null);
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-96 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            表示するカレンダー
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2">
          {calendars.map((calendar) => {
            const currentColor =
              calendarColors[calendar.id] ||
              calendar.backgroundColor ||
              defaultColors[0];

            return (
              <div
                key={calendar.id}
                className="flex items-center p-3 hover:bg-gray-50 rounded"
              >
                <input
                  type="checkbox"
                  checked={selectedCalendarIds.includes(calendar.id)}
                  onChange={() => onToggleCalendar(calendar.id)}
                  className="w-4 h-4 text-blue-600 rounded mr-3"
                />
                <div className="flex items-center flex-1 gap-2">
                  {/* カラーピッカー */}
                  <div className="relative">
                    <button
                      onClick={() =>
                        setEditingColorId(
                          editingColorId === calendar.id ? null : calendar.id
                        )
                      }
                      className="w-6 h-6 rounded border-2 border-gray-300 hover:border-gray-400 transition-colors"
                      style={{ backgroundColor: currentColor }}
                      title="色を変更"
                    />
                    {editingColorId === calendar.id && (
                      <div className="absolute top-8 left-0 z-10 bg-white rounded-lg shadow-lg p-3 border border-gray-200">
                        <div className="grid grid-cols-5 gap-2">
                          {defaultColors.map((color) => (
                            <button
                              key={color}
                              onClick={() => {
                                onColorChange(calendar.id, color);
                                setEditingColorId(null);
                              }}
                              className="w-8 h-8 rounded border-2 hover:border-gray-400 transition-colors"
                              style={{
                                backgroundColor: color,
                                borderColor:
                                  currentColor === color
                                    ? '#000'
                                    : 'transparent',
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="font-medium text-gray-800">
                      {calendar.summary}
                      {calendar.primary && (
                        <span className="ml-2 text-xs text-gray-500">
                          (メイン)
                        </span>
                      )}
                    </div>
                    {calendar.description && (
                      <div className="text-sm text-gray-500">
                        {calendar.description}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {calendars.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            カレンダーが見つかりません
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
