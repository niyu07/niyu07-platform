'use client';

import { useState } from 'react';
import { CalendarEvent, WorkLocation, AttendanceRecord } from '../../types';
import { importAttendanceFromCalendar } from '../utils/calendarIntegration';

interface CalendarImportProps {
  calendarEvents: CalendarEvent[];
  workLocations: WorkLocation[];
  onImport: (importedRecords: AttendanceRecord[]) => void;
}

export default function CalendarImport({
  calendarEvents,
  onImport,
}: CalendarImportProps) {
  const [locationMapping] = useState<Record<string, string>>({});

  const workEvents = calendarEvents.filter((event) => event.type === '勤務');

  const handleImport = () => {
    const imported = importAttendanceFromCalendar(workEvents, locationMapping);
    onImport(imported);
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        カレンダーからインポート
      </h2>

      <p className="text-gray-600 mb-6">
        カレンダーの勤務イベントを勤怠データとしてインポートできます。
      </p>

      {workEvents.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">
            インポート可能な勤務イベントがありません
          </p>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">
              勤務イベント ({workEvents.length}件)
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {workEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{event.title}</p>
                    <p className="text-sm text-gray-600">
                      {event.date} {event.startTime} - {event.endTime}
                      {event.location && ` @ ${event.location}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleImport}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            {workEvents.length}件の勤務イベントをインポート
          </button>
        </>
      )}
    </div>
  );
}
