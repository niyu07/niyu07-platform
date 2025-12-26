import {
  Location,
  CurrentWeather,
  HourlyForecast,
  DailyForecast,
  CalendarEvent,
  Suggestion,
  WeatherAlert,
} from './types';

// デフォルト地点
export const mockLocations: Location[] = [
  {
    id: 'tokyo-shibuya',
    name: '東京都渋谷区',
    latitude: 35.6595,
    longitude: 139.7004,
    isFavorite: true,
    order: 0,
  },
  {
    id: 'osaka-city',
    name: '大阪府大阪市',
    latitude: 34.6937,
    longitude: 135.5023,
    isFavorite: false,
    order: 1,
  },
];

// 現在の天気（東京渋谷区）
export const mockCurrentWeather: CurrentWeather = {
  locationId: 'tokyo-shibuya',
  timestamp: '2025-12-26T23:13:00+09:00',
  temperature: 15,
  feelsLike: 13,
  humidity: 65,
  windSpeed: 3.2,
  windDirection: '北',
  visibility: 10,
  precipitation: 10,
  condition: 'clear',
  sunrise: '6:48',
  sunset: '16:32',
  moonPhase: 15,
};

// 24時間予報
export const mockHourlyForecast: HourlyForecast[] = [
  { time: '0:00', temperature: 2, precipitation: 10, condition: 'cloudy' },
  { time: '1:00', temperature: 3, precipitation: 10, condition: 'cloudy' },
  { time: '2:00', temperature: 4, precipitation: 10, condition: 'cloudy' },
  { time: '3:00', temperature: 4, precipitation: 10, condition: 'cloudy' },
  { time: '4:00', temperature: 6, precipitation: 10, condition: 'cloudy' },
  { time: '5:00', temperature: 7, precipitation: 10, condition: 'cloudy' },
  { time: '6:00', temperature: 7, precipitation: 10, condition: 'cloudy' },
  { time: '7:00', temperature: 8, precipitation: 10, condition: 'clear' },
  { time: '8:00', temperature: 10, precipitation: 10, condition: 'clear' },
  { time: '9:00', temperature: 11, precipitation: 10, condition: 'clear' },
  { time: '10:00', temperature: 13, precipitation: 20, condition: 'clear' },
  {
    time: '11:00',
    temperature: 14,
    precipitation: 30,
    condition: 'partly-cloudy',
  },
  {
    time: '12:00',
    temperature: 15,
    precipitation: 40,
    condition: 'partly-cloudy',
  },
  { time: '13:00', temperature: 16, precipitation: 50, condition: 'cloudy' },
  { time: '14:00', temperature: 16, precipitation: 60, condition: 'rain' },
  { time: '15:00', temperature: 15, precipitation: 70, condition: 'rain' },
  { time: '16:00', temperature: 14, precipitation: 80, condition: 'rain' },
  { time: '17:00', temperature: 13, precipitation: 60, condition: 'rain' },
  { time: '18:00', temperature: 12, precipitation: 50, condition: 'cloudy' },
  { time: '19:00', temperature: 11, precipitation: 40, condition: 'cloudy' },
  { time: '20:00', temperature: 10, precipitation: 30, condition: 'cloudy' },
  { time: '21:00', temperature: 9, precipitation: 20, condition: 'cloudy' },
  { time: '22:00', temperature: 8, precipitation: 10, condition: 'cloudy' },
  { time: '23:00', temperature: 8, precipitation: 10, condition: 'cloudy' },
];

// 週間予報
export const mockDailyForecast: DailyForecast[] = [
  {
    date: '2025-12-20',
    dayOfWeek: 'Sat',
    displayDate: '12/20 (Sat)',
    maxTemp: 15,
    minTemp: 8,
    precipitation: 10,
    condition: 'clear',
    isHoliday: false,
  },
  {
    date: '2025-12-21',
    dayOfWeek: 'Sun',
    displayDate: '12/21 (Sun)',
    maxTemp: 14,
    minTemp: 7,
    precipitation: 20,
    condition: 'partly-cloudy',
    isHoliday: true,
  },
  {
    date: '2025-12-22',
    dayOfWeek: 'Mon',
    displayDate: '12/22 (Mon)',
    maxTemp: 12,
    minTemp: 9,
    precipitation: 80,
    condition: 'rain',
    isHoliday: false,
  },
  {
    date: '2025-12-23',
    dayOfWeek: 'Tue',
    displayDate: '12/23 (Tue)',
    maxTemp: 13,
    minTemp: 6,
    precipitation: 30,
    condition: 'cloudy',
    isHoliday: false,
  },
  {
    date: '2025-12-24',
    dayOfWeek: 'Wed',
    displayDate: '12/24 (Wed)',
    maxTemp: 11,
    minTemp: 4,
    precipitation: 0,
    condition: 'clear',
    isHoliday: false,
  },
  {
    date: '2025-12-25',
    dayOfWeek: 'Thu',
    displayDate: '12/25 (Thu)',
    maxTemp: 10,
    minTemp: 3,
    precipitation: 0,
    condition: 'clear',
    isHoliday: false,
  },
  {
    date: '2025-12-26',
    dayOfWeek: 'Fri',
    displayDate: '12/26 (Fri)',
    maxTemp: 11,
    minTemp: 5,
    precipitation: 40,
    condition: 'cloudy',
    isHoliday: false,
  },
];

// カレンダー予定
export const mockCalendarEvents: CalendarEvent[] = [
  {
    id: 'event-1',
    title: 'プログラミング基礎',
    startTime: '09:00',
    endTime: '10:30',
    location: '大学（屋内）',
    locationType: 'indoor',
    travelTimeMinutes: 30,
    notes: '',
  },
  {
    id: 'event-2',
    title: 'ランチミーティング',
    startTime: '12:00',
    endTime: '13:00',
    location: 'オープンテラス',
    locationType: 'outdoor',
    travelTimeMinutes: 10,
    notes: '',
  },
  {
    id: 'event-3',
    title: 'サークル活動（サッカー）',
    startTime: '15:00',
    endTime: '17:00',
    location: 'グラウンド',
    locationType: 'outdoor',
    travelTimeMinutes: 15,
    notes: '',
  },
];

// 天気警告
export const mockWeatherAlerts: WeatherAlert[] = [
  {
    id: 'alert-1',
    title: '⚠️ 14:00-17:00 雨の可能性が高いです',
    message: '傘を持って行きましょう',
    severity: 'warning',
    timeRange: '14:00-17:00',
    icon: '⚠️',
  },
];

// 提案
export const mockSuggestions: Suggestion[] = [
  {
    id: 'suggestion-1',
    type: 'departure',
    severity: 'info',
    message: '8:30出発推奨',
    reason: '移動時間を考慮',
    eventId: 'event-1',
    timestamp: new Date().toISOString(),
  },
  {
    id: 'suggestion-2',
    type: 'umbrella',
    severity: 'warning',
    message: '傘必携',
    reason: '午後に降水確率60%以上',
    timestamp: new Date().toISOString(),
  },
  {
    id: 'suggestion-3',
    type: 'cancellation',
    severity: 'critical',
    message: '中止を検討してください（雨が強い予報です）',
    reason: '降水確率80%、屋外スポーツ',
    eventId: 'event-3',
    timestamp: new Date().toISOString(),
  },
  {
    id: 'suggestion-4',
    type: 'clothing',
    severity: 'info',
    message: '朝晩は冷え込みます、上着をお忘れなく',
    reason: '今日の気温差: 9°C',
    timestamp: new Date().toISOString(),
  },
];
