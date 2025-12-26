import { WeatherCondition } from './types';

// 天気状態からアイコンを取得
export function getWeatherIcon(condition: WeatherCondition): string {
  const icons: Record<WeatherCondition, string> = {
    clear: '☀️',
    'partly-cloudy': '⛅',
    cloudy: '☁️',
    rain: '🌧️',
    'heavy-rain': '🌧️',
    snow: '🌨️',
    thunderstorm: '⛈️',
    fog: '🌫️',
  };
  return icons[condition];
}

// 天気状態から日本語ラベルを取得
export function getWeatherLabel(condition: WeatherCondition): string {
  const labels: Record<WeatherCondition, string> = {
    clear: '晴れ',
    'partly-cloudy': '晴れ時々曇り',
    cloudy: '曇り',
    rain: '雨',
    'heavy-rain': '大雨',
    snow: '雪',
    thunderstorm: '雷雨',
    fog: '霧',
  };
  return labels[condition];
}

// 風向の角度から方角を取得
export function getWindDirection(angle: number): string {
  const directions = ['北', '北東', '東', '南東', '南', '南西', '西', '北西'];
  const index = Math.round(angle / 45) % 8;
  return directions[index];
}

// 体感温度を計算（簡易版）
export function calculateFeelsLike(
  temperature: number,
  windSpeed: number,
  humidity: number
): number {
  // 風速が強い場合は体感温度が下がる
  const windChill = temperature - windSpeed * 0.5;
  // 湿度が高い場合は体感温度が上がる（夏）、下がる（冬）
  const humidityEffect = temperature > 20 ? humidity * 0.05 : -humidity * 0.02;
  return Math.round(windChill + humidityEffect);
}

// 日の出・日の入り時刻から月のフェーズを推定
export function getMoonPhaseLabel(moonPhase: number): string {
  if (moonPhase === 0) return '新月';
  if (moonPhase < 7) return '三日月';
  if (moonPhase === 7 || moonPhase === 8) return '上弦';
  if (moonPhase < 15) return '十三夜';
  if (moonPhase === 15) return '満月';
  if (moonPhase < 22) return '下弦';
  return '晦日';
}

// 気温差から服装提案を生成
export function getClothingSuggestion(
  minTemp: number,
  maxTemp: number,
  feelsLike: number
): string | null {
  const tempDiff = maxTemp - minTemp;

  if (feelsLike < 12) {
    return '防寒着推奨';
  }

  if (tempDiff >= 8) {
    return 'レイヤードスタイル推奨（気温差が大きいです）';
  }

  if (minTemp < 10 && maxTemp > 20) {
    return '朝晩は冷え込みます、上着をお忘れなく';
  }

  return null;
}

// 降水確率から傘の提案を生成
export function getUmbrellaSuggestion(precipitation: number): {
  message: string;
  severity: 'info' | 'warning' | 'critical';
} | null {
  if (precipitation >= 60) {
    return {
      message: '傘必携',
      severity: 'critical',
    };
  }

  if (precipitation >= 40) {
    return {
      message: '傘推奨',
      severity: 'warning',
    };
  }

  if (precipitation >= 30) {
    return {
      message: '折り畳み傘があると安心',
      severity: 'info',
    };
  }

  return null;
}

// 屋外スポーツの中止判定
export function shouldCancelOutdoorActivity(
  precipitation: number,
  windSpeed: number
): boolean {
  return precipitation >= 60 || windSpeed >= 8;
}

// 時刻文字列をパース
export function parseTime(timeStr: string): { hour: number; minute: number } {
  const [hour, minute] = timeStr.split(':').map(Number);
  return { hour, minute };
}

// 移動時間を考慮した出発時刻を計算
export function calculateDepartureTime(
  eventStartTime: string,
  travelTimeMinutes: number,
  bufferMinutes = 0
): string {
  const { hour, minute } = parseTime(eventStartTime);
  const totalMinutes = hour * 60 + minute - travelTimeMinutes - bufferMinutes;
  const departureHour = Math.floor(totalMinutes / 60);
  const departureMinute = totalMinutes % 60;
  return `${departureHour}:${departureMinute.toString().padStart(2, '0')}`;
}

// 現在時刻が指定時刻範囲内かチェック
export function isTimeInRange(
  currentTime: string,
  startTime: string,
  endTime: string
): boolean {
  const current = parseTime(currentTime);
  const start = parseTime(startTime);
  const end = parseTime(endTime);

  const currentMinutes = current.hour * 60 + current.minute;
  const startMinutes = start.hour * 60 + start.minute;
  const endMinutes = end.hour * 60 + end.minute;

  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
}
