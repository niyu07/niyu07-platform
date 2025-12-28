import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { addPomodoroToCalendar } from '@/lib/google-calendar';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { startTime, endTime, mode, category, durationMinutes } = body;

    if (!startTime || !endTime || !mode || !category || !durationMinutes) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Googleカレンダーに追加
    const event = await addPomodoroToCalendar(session.user.id, {
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      mode,
      category,
      durationMinutes,
    });

    return NextResponse.json({
      success: true,
      eventId: event.id,
      message: 'Googleカレンダーに同期しました',
    });
  } catch (error) {
    console.error('Calendar sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync with Google Calendar' },
      { status: 500 }
    );
  }
}
