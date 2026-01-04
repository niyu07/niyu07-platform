import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCalendarList } from '@/lib/google-calendar';

// カレンダーリストを取得
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      console.error('Unauthorized access - no session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Calendar List API GET:', { userId: session.user.id });

    const calendars = await getCalendarList(session.user.id);
    console.log(`✅ Fetched ${calendars.length} calendars`);

    return NextResponse.json({ calendars });
  } catch (error) {
    console.error('❌ Error fetching calendar list:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to fetch calendar list';
    return NextResponse.json(
      {
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
