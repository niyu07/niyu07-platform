import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { CalendarEvent } from '@/app/types';

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  location?: string;
  colorId?: string;
  recurrence?: string[];
  htmlLink?: string;
  organizer?: {
    email: string;
    displayName?: string;
    self?: boolean;
  };
}

export interface GoogleCalendar {
  id: string;
  summary: string;
  description?: string;
  primary?: boolean;
  backgroundColor?: string;
  foregroundColor?: string;
}

/**
 * Google Calendar を操作するカスタムフック
 */
export function useGoogleCalendar() {
  const { status } = useSession();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [calendars, setCalendars] = useState<GoogleCalendar[]>([]);
  const [selectedCalendarIds, setSelectedCalendarIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Google Calendar のイベントを CalendarEvent 型に変換
   */
  const convertToCalendarEvent = (
    googleEvent: GoogleCalendarEvent
  ): CalendarEvent => {
    const startDateTime =
      googleEvent.start.dateTime || googleEvent.start.date || '';
    const endDateTime = googleEvent.end.dateTime || googleEvent.end.date || '';

    // 日付と時刻を分離
    const startDate = new Date(startDateTime);
    const endDate = new Date(endDateTime);

    return {
      id: googleEvent.id,
      title: googleEvent.summary || '(タイトルなし)',
      date: startDate.toISOString().split('T')[0],
      startTime: googleEvent.start.dateTime
        ? `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`
        : '00:00',
      endTime: googleEvent.end.dateTime
        ? `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`
        : '23:59',
      type: 'イベント',
      location: googleEvent.location,
      memo: googleEvent.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      calendarId: googleEvent.organizer?.email,
      htmlLink: googleEvent.htmlLink,
    };
  };

  /**
   * カレンダーリストを取得
   */
  const fetchCalendars = useCallback(async () => {
    if (status !== 'authenticated') return;

    try {
      const response = await fetch('/api/calendar/list');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `Failed to fetch calendars (${response.status})`;
        console.error('API Error:', { status: response.status, error: errorData });
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const calendarList: GoogleCalendar[] = data.calendars || [];

      setCalendars(calendarList);

      // デフォルトでプライマリカレンダーを選択
      const primaryCalendar = calendarList.find((cal) => cal.primary);
      if (primaryCalendar && selectedCalendarIds.length === 0) {
        setSelectedCalendarIds([primaryCalendar.id]);
      }
    } catch (err) {
      setError(err as Error);
      console.error('カレンダーリスト取得エラー:', err);
    }
  }, [status, selectedCalendarIds.length]);

  /**
   * 指定期間のイベントを取得
   */
  const fetchEvents = useCallback(
    async (startDate: Date, endDate: Date) => {
      if (status !== 'authenticated') return;

      try {
        setIsLoading(true);
        setError(null);

        const params = new URLSearchParams({
          timeMin: startDate.toISOString(),
          timeMax: endDate.toISOString(),
        });

        // 選択されたカレンダーIDがあれば追加
        if (selectedCalendarIds.length > 0) {
          params.append('calendarIds', selectedCalendarIds.join(','));
        }

        const response = await fetch(`/api/calendar/events?${params}`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.error || `Failed to fetch events (${response.status})`;
          console.error('API Error:', { status: response.status, error: errorData });
          throw new Error(errorMessage);
        }

        const data = await response.json();
        const googleEvents: GoogleCalendarEvent[] = data.events || [];

        const calendarEvents = googleEvents.map(convertToCalendarEvent);
        setEvents(calendarEvents);
      } catch (err) {
        setError(err as Error);
        console.error('イベント取得エラー:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [status, selectedCalendarIds]
  );

  /**
   * イベントを作成
   */
  const createEvent = useCallback(
    async (eventData: {
      summary: string;
      description?: string;
      start: { dateTime?: string; date?: string };
      end: { dateTime?: string; date?: string };
      location?: string;
    }) => {
      if (status !== 'authenticated') return;

      try {
        const response = await fetch('/api/calendar/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData),
        });

        if (!response.ok) throw new Error('Failed to create event');

        const newGoogleEvent: GoogleCalendarEvent = await response.json();
        const newEvent = convertToCalendarEvent(newGoogleEvent);

        setEvents((prev) => [...prev, newEvent]);
        return newEvent;
      } catch (err) {
        console.error('イベント作成エラー:', err);
        throw err;
      }
    },
    [status]
  );

  /**
   * イベントを更新
   */
  const updateEvent = useCallback(
    async (
      eventId: string,
      eventData: {
        summary?: string;
        description?: string;
        start?: { dateTime?: string; date?: string };
        end?: { dateTime?: string; date?: string };
        location?: string;
      }
    ) => {
      if (status !== 'authenticated') return;

      try {
        const response = await fetch('/api/calendar/events', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventId, ...eventData }),
        });

        if (!response.ok) throw new Error('Failed to update event');

        const updatedGoogleEvent: GoogleCalendarEvent = await response.json();
        const updatedEvent = convertToCalendarEvent(updatedGoogleEvent);

        setEvents((prev) =>
          prev.map((e) => (e.id === eventId ? updatedEvent : e))
        );
        return updatedEvent;
      } catch (err) {
        console.error('イベント更新エラー:', err);
        throw err;
      }
    },
    [status]
  );

  /**
   * イベントを削除
   */
  const deleteEvent = useCallback(
    async (eventId: string) => {
      if (status !== 'authenticated') return;

      try {
        const response = await fetch(
          `/api/calendar/events?eventId=${eventId}`,
          {
            method: 'DELETE',
          }
        );

        if (!response.ok) throw new Error('Failed to delete event');

        setEvents((prev) => prev.filter((e) => e.id !== eventId));
      } catch (err) {
        console.error('イベント削除エラー:', err);
        throw err;
      }
    },
    [status]
  );

  return {
    events,
    calendars,
    selectedCalendarIds,
    isLoading,
    error,
    isAuthenticated: status === 'authenticated',
    fetchCalendars,
    fetchEvents,
    setSelectedCalendarIds,
    createEvent,
    updateEvent,
    deleteEvent,
    refresh: fetchEvents,
  };
}
