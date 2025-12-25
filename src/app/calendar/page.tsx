'use client';

import { useState } from 'react';
import { CalendarView, CalendarEvent, Semester, Holiday } from '../types';
import { mockCalendarEvents, mockCalendarSettings } from '../data/mockData';
import CalendarHeader from './components/CalendarHeader';
import MonthView from './components/MonthView';
import WeekView from './components/WeekView';
import DayView from './components/DayView';
import ListView from './components/ListView';
import EventForm from './components/EventForm';
import CalendarSidePanel from './components/CalendarSidePanel';
import TimeTableRegistration from './components/TimeTableRegistration';
import SemesterSettings from './components/SemesterSettings';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>(
    mockCalendarSettings.defaultView
  );
  const [events, setEvents] = useState<CalendarEvent[]>(mockCalendarEvents);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showTimeTableForm, setShowTimeTableForm] = useState(false);
  const [showSemesterSettings, setShowSemesterSettings] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  ); // 初期表示で今日を選択

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

  const handleSaveEvent = (
    eventData: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: `cal-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setEvents([...events, newEvent]);
    setShowEventForm(false);
  };

  const handleCancelEvent = () => {
    setShowEventForm(false);
  };

  // イベントクリック
  const handleEventClick = (event: CalendarEvent) => {
    // TODO: イベント詳細モーダルを表示
    console.log('Event clicked:', event);
  };

  // 時間割登録
  const handleOpenTimeTable = () => {
    setShowTimeTableForm(true);
  };

  const handleSaveTimeTable = (
    eventDataList: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>[]
  ) => {
    const newEvents = eventDataList.map((eventData) => ({
      ...eventData,
      id: `cal-${Date.now()}-${Math.random()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    setEvents([...events, ...newEvents]);
    setShowTimeTableForm(false);
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
            />
          )}
          {view === '週' && (
            <WeekView
              currentDate={currentDate}
              events={events}
              onEventClick={handleEventClick}
            />
          )}
          {view === '日' && (
            <DayView
              currentDate={currentDate}
              events={events}
              workingHours={mockCalendarSettings.workingHours}
              onEventClick={handleEventClick}
            />
          )}
          {view === 'リスト' && (
            <ListView events={events} onEventClick={handleEventClick} />
          )}
        </div>

        {/* サイドパネル */}
        {(view === '月' || view === '週') && selectedDate && (
          <CalendarSidePanel
            selectedDate={selectedDate}
            currentDate={currentDate}
            events={events}
            workingHours={mockCalendarSettings.workingHours}
            onOpenTimeTable={handleOpenTimeTable}
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
    </div>
  );
}
