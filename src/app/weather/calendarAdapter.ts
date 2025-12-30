import { CalendarEvent, LocationType } from './types';
import { calendar_v3 } from 'googleapis';

/**
 * Google Calendar APIのイベントをWeatherページのCalendarEvent型に変換
 */
export function adaptGoogleCalendarEvent(
  googleEvent: calendar_v3.Schema$Event
): CalendarEvent | null {
  // イベントのIDとタイトルが必須
  if (!googleEvent.id || !googleEvent.summary) {
    return null;
  }

  // 開始時刻と終了時刻を取得
  const start = googleEvent.start?.dateTime || googleEvent.start?.date;
  const end = googleEvent.end?.dateTime || googleEvent.end?.date;

  if (!start || !end) {
    return null;
  }

  // 時刻を HH:MM 形式に変換
  const startTime = formatTimeToHHMM(start);
  const endTime = formatTimeToHHMM(end);

  // 場所のタイプを推測
  const locationType = inferLocationType(
    googleEvent.location,
    googleEvent.description,
    googleEvent.summary
  );

  return {
    id: googleEvent.id,
    title: googleEvent.summary,
    startTime,
    endTime,
    location: googleEvent.location || undefined,
    locationType,
    notes: googleEvent.description || undefined,
  };
}

/**
 * ISO8601形式の日時文字列をHH:MM形式に変換
 */
function formatTimeToHHMM(dateTimeString: string): string {
  const date = new Date(dateTimeString);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * イベントの場所や内容から屋内/屋外を推測
 */
function inferLocationType(
  location?: string | null,
  description?: string | null,
  title?: string | null
): LocationType {
  const text = [location, description, title]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  // 屋外キーワード
  const outdoorKeywords = [
    'outdoor',
    '屋外',
    'park',
    '公園',
    'field',
    'グラウンド',
    'beach',
    'ビーチ',
    '海',
    'mountain',
    '山',
    'terrace',
    'テラス',
    'garden',
    '庭',
    'stadium',
    'スタジアム',
    'court',
    'コート',
    'golf',
    'ゴルフ',
    'hiking',
    'ハイキング',
    'camping',
    'キャンプ',
    'bbq',
    'バーベキュー',
    'fishing',
    '釣り',
    'サッカー',
    'soccer',
    'baseball',
    '野球',
    'tennis',
    'テニス',
  ];

  // 屋内キーワード
  const indoorKeywords = [
    'indoor',
    '屋内',
    'office',
    'オフィス',
    '会議室',
    'meeting room',
    'conference',
    '会議',
    'home',
    '自宅',
    'building',
    'ビル',
    'room',
    '部屋',
    'hall',
    'ホール',
    'center',
    'センター',
    'library',
    '図書館',
    'cafe',
    'カフェ',
    'restaurant',
    'レストラン',
    'gym',
    'ジム',
    'studio',
    'スタジオ',
    '大学',
    'university',
    'school',
    '学校',
  ];

  // 屋外キーワードが含まれているか
  const isOutdoor = outdoorKeywords.some((keyword) => text.includes(keyword));
  if (isOutdoor) {
    return 'outdoor';
  }

  // 屋内キーワードが含まれているか
  const isIndoor = indoorKeywords.some((keyword) => text.includes(keyword));
  if (isIndoor) {
    return 'indoor';
  }

  // 判定できない場合は不明
  return 'unknown';
}

/**
 * 複数のGoogle Calendarイベントを変換
 */
export function adaptGoogleCalendarEvents(
  googleEvents: calendar_v3.Schema$Event[]
): CalendarEvent[] {
  return googleEvents
    .map(adaptGoogleCalendarEvent)
    .filter((event): event is CalendarEvent => event !== null);
}
