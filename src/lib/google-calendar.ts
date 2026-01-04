import { google } from 'googleapis';
import { prisma } from './prisma';

/**
 * ユーザーのGoogleカレンダークライアントを取得
 */
export async function getCalendarClient(userId: string) {
  // ユーザーのアクセストークンを取得
  const account = await prisma.account.findFirst({
    where: {
      userId,
      provider: 'google',
    },
  });

  if (!account || !account.refresh_token) {
    throw new Error('Google認証情報が見つかりません');
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    access_token: account.access_token,
    refresh_token: account.refresh_token,
    expiry_date: account.expires_at ? account.expires_at * 1000 : undefined,
  });

  // トークンの自動更新を設定
  oauth2Client.on('tokens', async (tokens) => {
    console.log('🔄 Refreshing Google tokens...');
    await prisma.account.update({
      where: { id: account.id },
      data: {
        access_token: tokens.access_token ?? account.access_token,
        refresh_token: tokens.refresh_token ?? account.refresh_token,
        expires_at: tokens.expiry_date
          ? Math.floor(tokens.expiry_date / 1000)
          : account.expires_at,
      },
    });
  });

  // トークンが期限切れの場合は事前にリフレッシュ
  try {
    const tokenInfo = await oauth2Client.getAccessToken();
    if (tokenInfo.token && tokenInfo.token !== account.access_token) {
      await prisma.account.update({
        where: { id: account.id },
        data: {
          access_token: tokenInfo.token,
        },
      });
    }
  } catch (error) {
    console.error('❌ トークンリフレッシュエラー:', error);
    throw new Error(
      'Google認証トークンの更新に失敗しました。再度ログインしてください。'
    );
  }

  return google.calendar({ version: 'v3', auth: oauth2Client });
}

/**
 * ポモドーロセッションをGoogleカレンダーに追加
 */
export async function addPomodoroToCalendar(
  userId: string,
  session: {
    startTime: Date;
    endTime: Date;
    mode: string;
    category: string;
    durationMinutes: number;
  }
) {
  try {
    const calendar = await getCalendarClient(userId);

    const event = {
      summary: `🍅 ${session.mode} - ${session.category}`,
      description: `ポモドーロタイマー: ${session.durationMinutes}分の${session.mode}セッション`,
      start: {
        dateTime: session.startTime.toISOString(),
        timeZone: 'Asia/Tokyo',
      },
      end: {
        dateTime: session.endTime.toISOString(),
        timeZone: 'Asia/Tokyo',
      },
      colorId: session.mode === '作業' ? '9' : '2', // 青: 作業、緑: 休憩
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });

    console.log(
      '✅ Googleカレンダーにイベントを作成しました:',
      response.data.id
    );
    return response.data;
  } catch (error) {
    console.error('❌ Googleカレンダーへの追加エラー:', error);
    throw error;
  }
}

/**
 * ユーザーが利用可能なカレンダーリストを取得
 */
export async function getCalendarList(userId: string) {
  try {
    const calendar = await getCalendarClient(userId);

    const response = await calendar.calendarList.list();

    return response.data.items || [];
  } catch (error) {
    console.error('❌ カレンダーリスト取得エラー:', error);
    throw error;
  }
}

/**
 * Googleカレンダーから今日の予定を取得
 */
export async function getTodayEvents(userId: string) {
  try {
    const calendar = await getCalendarClient(userId);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: today.toISOString(),
      timeMax: tomorrow.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    return response.data.items || [];
  } catch (error) {
    console.error('❌ Googleカレンダーからの取得エラー:', error);
    throw error;
  }
}

/**
 * Googleカレンダーから指定期間の予定を取得
 */
export async function getEvents(
  userId: string,
  timeMin: string,
  timeMax: string
) {
  try {
    const calendar = await getCalendarClient(userId);

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 2500,
    });

    return response.data.items || [];
  } catch (error) {
    console.error('❌ Googleカレンダーからの取得エラー:', error);
    throw error;
  }
}

/**
 * 複数のカレンダーから指定期間の予定を取得
 */
export async function getEventsFromMultipleCalendars(
  userId: string,
  calendarIds: string[],
  timeMin: string,
  timeMax: string
) {
  try {
    const calendar = await getCalendarClient(userId);

    // 各カレンダーからイベントを並列取得
    const promises = calendarIds.map((calendarId) =>
      calendar.events
        .list({
          calendarId,
          timeMin,
          timeMax,
          singleEvents: true,
          orderBy: 'startTime',
          maxResults: 2500,
        })
        .then((response) => response.data.items || [])
        .catch((error) => {
          console.error(`❌ カレンダー ${calendarId} からの取得エラー:`, error);
          return [];
        })
    );

    const results = await Promise.all(promises);

    // すべてのイベントを統合
    const allEvents = results.flat();

    // 重複を除外（同じイベントIDのものは1つだけ残す）
    const uniqueEvents = Array.from(
      new Map(allEvents.map((event) => [event.id, event])).values()
    );

    // ソート
    uniqueEvents.sort((a, b) => {
      const aTime = a.start?.dateTime || a.start?.date || '';
      const bTime = b.start?.dateTime || b.start?.date || '';
      return aTime.localeCompare(bTime);
    });

    return uniqueEvents;
  } catch (error) {
    console.error('❌ 複数カレンダーからの取得エラー:', error);
    throw error;
  }
}

/**
 * Googleカレンダーにイベントを作成
 */
export async function createEvent(
  userId: string,
  eventData: {
    summary: string;
    description?: string;
    start: { dateTime?: string; date?: string };
    end: { dateTime?: string; date?: string };
    location?: string;
  }
) {
  try {
    const calendar = await getCalendarClient(userId);

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        ...eventData,
        start: {
          ...eventData.start,
          timeZone: 'Asia/Tokyo',
        },
        end: {
          ...eventData.end,
          timeZone: 'Asia/Tokyo',
        },
      },
    });

    console.log(
      '✅ Googleカレンダーにイベントを作成しました:',
      response.data.id
    );
    return response.data;
  } catch (error) {
    console.error('❌ Googleカレンダーへの作成エラー:', error);
    throw error;
  }
}

/**
 * Googleカレンダーのイベントを更新
 */
export async function updateEvent(
  userId: string,
  eventId: string,
  eventData: {
    summary?: string;
    description?: string;
    start?: { dateTime?: string; date?: string };
    end?: { dateTime?: string; date?: string };
    location?: string;
  }
) {
  try {
    const calendar = await getCalendarClient(userId);

    const response = await calendar.events.patch({
      calendarId: 'primary',
      eventId,
      requestBody: eventData,
    });

    console.log('✅ Googleカレンダーのイベントを更新しました:', eventId);
    return response.data;
  } catch (error) {
    console.error('❌ Googleカレンダーの更新エラー:', error);
    throw error;
  }
}

/**
 * Googleカレンダーからイベントを削除
 */
export async function deleteEvent(userId: string, eventId: string) {
  try {
    const calendar = await getCalendarClient(userId);

    await calendar.events.delete({
      calendarId: 'primary',
      eventId,
    });

    console.log('✅ Googleカレンダーからイベントを削除しました:', eventId);
  } catch (error) {
    console.error('❌ Googleカレンダーの削除エラー:', error);
    throw error;
  }
}
