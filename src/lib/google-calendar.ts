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

  if (!account || !account.access_token) {
    throw new Error('Google認証情報が見つかりません');
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    access_token: account.access_token,
    refresh_token: account.refresh_token,
  });

  // リフレッシュトークンがある場合、自動更新を設定
  oauth2Client.on('tokens', async (tokens) => {
    if (tokens.refresh_token) {
      // 新しいリフレッシュトークンをDBに保存
      await prisma.account.update({
        where: { id: account.id },
        data: {
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at: tokens.expiry_date
            ? Math.floor(tokens.expiry_date / 1000)
            : null,
        },
      });
    }
  });

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
