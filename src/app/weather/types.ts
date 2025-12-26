// 天気状態の型
export type WeatherCondition =
  | 'clear' // 晴れ
  | 'partly-cloudy' // 晴れ時々曇り
  | 'cloudy' // 曇り
  | 'rain' // 雨
  | 'heavy-rain' // 大雨
  | 'snow' // 雪
  | 'thunderstorm' // 雷雨
  | 'fog'; // 霧

// 地点情報の型
export interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  isFavorite: boolean;
  order: number;
}

// 現在の天気情報
export interface CurrentWeather {
  locationId: string;
  timestamp: string;
  temperature: number; // 気温（°C）
  feelsLike: number; // 体感温度（°C）
  humidity: number; // 湿度（%）
  windSpeed: number; // 風速（m/s）
  windDirection: string; // 風向（北、南東など）
  visibility: number; // 視程（km）
  precipitation: number; // 降水確率（%）
  condition: WeatherCondition;
  sunrise: string; // HH:MM
  sunset: string; // HH:MM
  moonPhase: number; // 月齢（日）
}

// 時間ごとの予報
export interface HourlyForecast {
  time: string; // HH:MM
  temperature: number;
  precipitation: number; // 降水確率（%）
  condition: WeatherCondition;
}

// 日ごとの予報
export interface DailyForecast {
  date: string; // YYYY-MM-DD
  dayOfWeek: string; // Mon, Tue, etc.
  displayDate: string; // 12/20 (Sat)
  maxTemp: number;
  minTemp: number;
  precipitation: number;
  condition: WeatherCondition;
  isHoliday: boolean;
}

// 予定の場所タイプ
export type LocationType = 'indoor' | 'outdoor' | 'unknown';

// カレンダー予定
export interface CalendarEvent {
  id: string;
  title: string;
  startTime: string; // HH:MM
  endTime: string;
  location?: string;
  locationType: LocationType;
  travelTimeMinutes?: number; // 移動時間（分）
  notes?: string;
}

// 提案の種類
export type SuggestionType =
  | 'umbrella' // 傘
  | 'clothing' // 服装
  | 'cancellation' // 中止
  | 'departure'; // 出発

// 提案の強度
export type SuggestionSeverity = 'info' | 'warning' | 'critical';

// 行動提案
export interface Suggestion {
  id: string;
  type: SuggestionType;
  severity: SuggestionSeverity;
  message: string;
  reason: string;
  eventId?: string; // 関連する予定のID
  timestamp: string;
}

// 天気警告
export interface WeatherAlert {
  id: string;
  title: string;
  message: string;
  severity: SuggestionSeverity;
  timeRange: string; // "14:00-17:00"
  icon: string;
}
