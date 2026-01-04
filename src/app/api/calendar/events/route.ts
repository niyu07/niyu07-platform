import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import {
  getEvents,
  getTodayEvents,
  getEventsFromMultipleCalendars,
  createEvent,
  updateEvent,
  deleteEvent,
} from '@/lib/google-calendar';

// カレンダーイベントを取得
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      console.error('Unauthorized access - no session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const timeMin = searchParams.get('timeMin');
    const timeMax = searchParams.get('timeMax');
    const calendarIds = searchParams.get('calendarIds');

    console.log('Calendar Events API GET:', {
      userId: session.user.id,
      timeMin,
      timeMax,
      calendarIds,
    });

    let events;
    if (timeMin && timeMax) {
      // 期間指定で取得
      if (calendarIds) {
        // 複数カレンダーから取得
        const ids = calendarIds.split(',');
        events = await getEventsFromMultipleCalendars(
          session.user.id,
          ids,
          timeMin,
          timeMax
        );
      } else {
        // プライマリカレンダーのみ
        events = await getEvents(session.user.id, timeMin, timeMax);
      }
    } else {
      // 今日のイベントを取得（デフォルト）
      events = await getTodayEvents(session.user.id);
    }

    console.log(`✅ Fetched ${events.length} calendar events`);
    return NextResponse.json({ events });
  } catch (error) {
    console.error('❌ Error fetching calendar events:', error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Failed to fetch calendar events';
    return NextResponse.json(
      {
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// カレンダーイベントを作成
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const event = await createEvent(session.user.id, body);

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return NextResponse.json(
      { error: 'Failed to create calendar event' },
      { status: 500 }
    );
  }
}

// カレンダーイベントを更新
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { eventId, ...eventData } = body;

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    const event = await updateEvent(session.user.id, eventId, eventData);

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error updating calendar event:', error);
    return NextResponse.json(
      { error: 'Failed to update calendar event' },
      { status: 500 }
    );
  }
}

// カレンダーイベントを削除
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    await deleteEvent(session.user.id, eventId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    return NextResponse.json(
      { error: 'Failed to delete calendar event' },
      { status: 500 }
    );
  }
}
