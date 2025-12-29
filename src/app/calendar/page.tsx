'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { CalendarView, CalendarEvent, Semester, Holiday } from '../types';
import { mockCalendarSettings } from '../data/mockData';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';
import { useGoogleTasks } from '@/hooks/useGoogleTasks';
import { convertGoogleTasksToAppTasks } from '@/app/tasks/utils/googleTasksAdapter';
import { useCalendarColors } from '@/hooks/useCalendarColors';
import CalendarHeader from './components/CalendarHeader';
import MonthView from './components/MonthView';
import WeekView from './components/WeekView';
import DayView from './components/DayView';
import ListView from './components/ListView';
import EventForm from './components/EventForm';
import CalendarSidePanel from './components/CalendarSidePanel';
import TimeTableRegistration from './components/TimeTableRegistration';
import SemesterSettings from './components/SemesterSettings';
import EventDetailModal from './components/EventDetailModal';
import CalendarSelector from './components/CalendarSelector';

export default function CalendarPage() {
  const { data: session } = useSession();
  const {
    events: googleEvents,
    calendars,
    selectedCalendarIds,
    fetchCalendars,
    fetchEvents,
    setSelectedCalendarIds,
    createEvent,
    deleteEvent: deleteGoogleEvent,
  } = useGoogleCalendar();

  const { tasks: googleTasks } = useGoogleTasks('@default');

  const { colorMap, setCalendarColor, assignDefaultColors, DEFAULT_COLORS } =
    useCalendarColors();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>(
    mockCalendarSettings.defaultView
  );
  const [showEventForm, setShowEventForm] = useState(false);
  const [showTimeTableForm, setShowTimeTableForm] = useState(false);
  const [showSemesterSettings, setShowSemesterSettings] = useState(false);
  const [showCalendarSelector, setShowCalendarSelector] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  ); // 初期表示で今日を選択
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | undefined>(
    undefined
  );

  // Google Tasksのデータをアプリのタスク形式に変換
  const convertedTasks = useMemo(
    () => convertGoogleTasksToAppTasks(googleTasks),
    [googleTasks]
  );

  // Google Calendarのイベントとタスクの締め切りを統合
  const events = useMemo(() => {
    // タスクの締め切りをイベントとして追加
    const taskDeadlines: CalendarEvent[] = convertedTasks
      .filter((task) => task.dueDate && task.status !== '完了')
      .map((task) => {
        // YYYY/MM/DD形式をYYYY-MM-DD形式に変換
        const dateParts = task.dueDate!.split('/');
        const isoDate = `${dateParts[0]}-${dateParts[1]}-${dateParts[2]}`;

        return {
          id: `task-${task.id}`,
          title: `📋 ${task.title}`,
          date: isoDate,
          startTime: '00:00',
          endTime: '23:59',
          type: 'task' as CalendarEvent['type'], // タスク専用タイプ
          memo: task.description,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
        };
      });

    return [...googleEvents, ...taskDeadlines];
  }, [googleEvents, convertedTasks]);

  // 初回マウント時にカレンダーリストを取得
  useEffect(() => {
    if (session?.user?.id) {
      fetchCalendars();
    }
  }, [session?.user?.id, fetchCalendars]);

  // カレンダーリストが変わったらデフォルト色を割り当て
  useEffect(() => {
    if (calendars.length > 0) {
      assignDefaultColors(calendars.map((cal) => cal.id));
    }
  }, [calendars, assignDefaultColors]);

  // ビューや日付が変わったときにイベントを再取得
  useEffect(() => {
    if (!session?.user?.id) return;

    const getDateRange = () => {
      const startDate = new Date(currentDate);
      const endDate = new Date(currentDate);

      if (view === '月') {
        // 月の最初と最後
        startDate.setDate(1);
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(0);
      } else if (view === '週') {
        // 週の最初(日曜日)と最後(土曜日)
        const day = startDate.getDay();
        startDate.setDate(startDate.getDate() - day);
        endDate.setDate(endDate.getDate() + (6 - day));
      } else if (view === '日') {
        // 当日のみ
        endDate.setDate(endDate.getDate() + 1);
      } else {
        // リストビュー: 現在月
        startDate.setDate(1);
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(0);
      }

      // 時刻をリセット
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);

      return { startDate, endDate };
    };

    const { startDate, endDate } = getDateRange();
    fetchEvents(startDate, endDate);
  }, [currentDate, view, session?.user?.id, fetchEvents]);

  // ナビゲーション処理
  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (view === '月') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (view === '週') {
      newDate.setDate(newDate.getDate() - 7);
    } else if (view === '日') {
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (view === '月') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (view === '週') {
      newDate.setDate(newDate.getDate() + 7);
    } else if (view === '日') {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // ビュー切替
  const handleViewChange = (newView: CalendarView) => {
    setView(newView);
  };

  // 日付クリック（月ビューで日付を選択）
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  // 予定追加
  const handleAddEvent = () => {
    setSelectedDate(currentDate);
    setShowEventForm(true);
  };

  const handleSaveEvent = async (
    eventData: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    try {
      // Google Calendarのフォーマットに変換
      const startDateTime = `${eventData.date}T${eventData.startTime}:00`;
      const endDateTime = `${eventData.date}T${eventData.endTime}:00`;

      await createEvent({
        summary: eventData.title,
        description: eventData.memo,
        start: { dateTime: startDateTime },
        end: { dateTime: endDateTime },
        location: eventData.location,
      });

      setShowEventForm(false);
    } catch (error) {
      console.error('イベント作成エラー:', error);
      alert('イベントの作成に失敗しました');
    }
  };

  const handleCancelEvent = () => {
    setShowEventForm(false);
  };

  // イベントクリック
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  // イベント削除
  const handleDeleteEvent = async (eventId: string) => {
    try {
      await deleteGoogleEvent(eventId);
      setSelectedEvent(undefined);
    } catch (error) {
      console.error('イベント削除エラー:', error);
      alert('イベントの削除に失敗しました');
    }
  };

  // 時間割登録
  const handleOpenTimeTable = () => {
    setShowTimeTableForm(true);
  };

  const handleSaveTimeTable = async (
    eventDataList: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>[]
  ) => {
    try {
      // 各イベントをGoogle Calendarに作成
      for (const eventData of eventDataList) {
        const startDateTime = `${eventData.date}T${eventData.startTime}:00`;
        const endDateTime = `${eventData.date}T${eventData.endTime}:00`;

        await createEvent({
          summary: eventData.title,
          description: eventData.memo,
          start: { dateTime: startDateTime },
          end: { dateTime: endDateTime },
          location: eventData.location,
        });
      }
      setShowTimeTableForm(false);
    } catch (error) {
      console.error('時間割作成エラー:', error);
      alert('時間割の作成に失敗しました');
    }
  };

  // 学期・休暇設定
  const handleOpenSettings = () => {
    setShowSemesterSettings(true);
  };

  const handleSaveSemesterSettings = (
    semesters: Semester[],
    holidays: Holiday[]
  ) => {
    // TODO: 学期・休暇設定を保存
    console.log('Semesters:', semesters, 'Holidays:', holidays);
  };

  // カレンダー選択
  const handleOpenCalendarSelector = () => {
    setShowCalendarSelector(true);
  };

  const handleToggleCalendar = (calendarId: string) => {
    setSelectedCalendarIds((prev) => {
      if (prev.includes(calendarId)) {
        // 最低1つは選択されている必要がある
        if (prev.length === 1) return prev;
        return prev.filter((id) => id !== calendarId);
      } else {
        return [...prev, calendarId];
      }
    });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* ヘッダー */}
      <CalendarHeader
        currentDate={currentDate}
        view={view}
        onViewChange={handleViewChange}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onToday={handleToday}
        onAddEvent={handleAddEvent}
        onOpenSettings={handleOpenSettings}
        onOpenCalendarSelector={handleOpenCalendarSelector}
      />

      {/* メインコンテンツ */}
      <div className="flex-1 overflow-hidden flex">
        {/* カレンダービュー */}
        <div className="flex-1 overflow-hidden">
          {view === '月' && (
            <MonthView
              currentDate={currentDate}
              events={events}
              onDateClick={handleDateClick}
              calendarColors={colorMap}
            />
          )}
          {view === '週' && (
            <WeekView
              currentDate={currentDate}
              events={events}
              onEventClick={handleEventClick}
              calendarColors={colorMap}
            />
          )}
          {view === '日' && (
            <DayView
              currentDate={currentDate}
              events={events}
              workingHours={mockCalendarSettings.workingHours}
              onEventClick={handleEventClick}
              calendarColors={colorMap}
            />
          )}
          {view === 'リスト' && (
            <ListView
              events={events}
              onEventClick={handleEventClick}
              calendarColors={colorMap}
            />
          )}
        </div>

        {/* サイドパネル */}
        {(view === '月' || view === '週') && selectedDate && (
          <CalendarSidePanel
            selectedDate={selectedDate}
            currentDate={currentDate}
            events={events}
            tasks={convertedTasks}
            workingHours={mockCalendarSettings.workingHours}
            onOpenTimeTable={handleOpenTimeTable}
            calendarColors={colorMap}
          />
        )}
      </div>

      {/* イベント追加フォーム */}
      {showEventForm && (
        <EventForm
          initialDate={selectedDate}
          onSave={handleSaveEvent}
          onCancel={handleCancelEvent}
        />
      )}

      {/* 時間割登録フォーム */}
      {showTimeTableForm && (
        <TimeTableRegistration
          onClose={() => setShowTimeTableForm(false)}
          onSave={handleSaveTimeTable}
        />
      )}

      {/* 学期・休暇設定フォーム */}
      {showSemesterSettings && (
        <SemesterSettings
          onClose={() => setShowSemesterSettings(false)}
          onSave={handleSaveSemesterSettings}
        />
      )}

      {/* イベント詳細モーダル */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(undefined)}
          onDelete={handleDeleteEvent}
        />
      )}

      {/* カレンダー選択モーダル */}
      {showCalendarSelector && (
        <CalendarSelector
          calendars={calendars}
          selectedCalendarIds={selectedCalendarIds}
          calendarColors={colorMap}
          onToggleCalendar={handleToggleCalendar}
          onColorChange={setCalendarColor}
          onClose={() => setShowCalendarSelector(false)}
          defaultColors={DEFAULT_COLORS}
        />
      )}
    </div>
  );
}
