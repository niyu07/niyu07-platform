import {
  CurrentWeather as OpenWeatherCurrent,
  ForecastItem as OpenWeatherForecast,
} from '@/lib/weather';
import {
  CurrentWeather,
  HourlyForecast,
  DailyForecast,
  WeatherCondition,
} from './types';

/**
 * OpenWeatherMapのアイコンコードを天気状態に変換
 */
function iconToCondition(icon: string | undefined): WeatherCondition {
  if (!icon) return 'cloudy';

  const code = icon.slice(0, 2);
  switch (code) {
    case '01':
      return 'clear';
    case '02':
      return 'partly-cloudy';
    case '03':
    case '04':
      return 'cloudy';
    case '09':
    case '10':
      return 'rain';
    case '11':
      return 'thunderstorm';
    case '13':
      return 'snow';
    case '50':
      return 'fog';
    default:
      return 'cloudy';
  }
}

/**
 * 風向きを角度から方位に変換
 */
function degreeToDirection(degree: number | undefined): string {
  if (degree === undefined) return 'N';
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(degree / 45) % 8;
  return directions[index];
}

/**
 * OpenWeatherMapの現在の天気データをアプリの型に変換
 */
export function adaptCurrentWeather(
  data: OpenWeatherCurrent,
  locationId: string,
  windDirection?: number
): CurrentWeather {
  // timestampが存在しない場合は現在時刻を使用
  const timestamp = data.timestamp
    ? new Date(data.timestamp * 1000).toISOString()
    : new Date().toISOString();

  return {
    locationId,
    timestamp,
    temperature: data.temperature,
    feelsLike: data.feelsLike,
    humidity: data.humidity,
    windSpeed: data.windSpeed,
    windDirection: degreeToDirection(windDirection),
    visibility: 10, // OpenWeatherMapのフリープランでは視程が取れないのでデフォルト値
    precipitation: 0, // 現在の天気には降水確率がないので0
    condition: iconToCondition(data.icon),
    sunrise: '06:00', // APIから取得する場合は別途処理が必要
    sunset: '17:00', // APIから取得する場合は別途処理が必要
    moonPhase: 0, // 月齢は別のAPIが必要
  };
}

/**
 * OpenWeatherMapの予報データを時間ごとの予報に変換
 */
export function adaptHourlyForecast(
  forecasts: OpenWeatherForecast[] | undefined
): HourlyForecast[] {
  if (!forecasts || forecasts.length === 0) {
    return [];
  }

  return forecasts.slice(0, 24).map((item) => {
    const date = new Date(item.timestamp * 1000);
    return {
      time: date.toLocaleTimeString('ja-JP', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      temperature: item.temperature,
      precipitation: item.pop,
      condition: iconToCondition(item.icon),
    };
  });
}

/**
 * OpenWeatherMapの予報データを日ごとの予報に変換
 */
export function adaptDailyForecast(
  forecasts: OpenWeatherForecast[] | undefined
): DailyForecast[] {
  if (!forecasts || forecasts.length === 0) {
    return [];
  }

  // 日付ごとにグループ化
  const dailyMap = new Map<string, OpenWeatherForecast[]>();

  forecasts.forEach((item) => {
    const date = new Date(item.timestamp * 1000);
    const dateKey = date.toISOString().split('T')[0];

    if (!dailyMap.has(dateKey)) {
      dailyMap.set(dateKey, []);
    }
    dailyMap.get(dateKey)!.push(item);
  });

  // 日ごとの最高気温、最低気温、降水確率を計算
  const dailyForecasts: DailyForecast[] = [];

  dailyMap.forEach((items, dateKey) => {
    const temps = items.map((item) => item.temperature);
    const maxTemp = Math.max(...temps);
    const minTemp = Math.min(...temps);
    const maxPop = Math.max(...items.map((item) => item.pop));

    // 最も頻繁に現れる天気状態を選択
    const conditionCounts = new Map<string, number>();
    items.forEach((item) => {
      const condition = iconToCondition(item.icon);
      conditionCounts.set(condition, (conditionCounts.get(condition) || 0) + 1);
    });

    let mostCommonCondition: WeatherCondition = 'cloudy';
    let maxCount = 0;
    conditionCounts.forEach((count, condition) => {
      if (count > maxCount) {
        maxCount = count;
        mostCommonCondition = condition as WeatherCondition;
      }
    });

    const date = new Date(dateKey);
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' });
    const displayDate = `${date.getMonth() + 1}/${date.getDate()} (${dayOfWeek})`;

    dailyForecasts.push({
      date: dateKey,
      dayOfWeek,
      displayDate,
      maxTemp,
      minTemp,
      precipitation: maxPop,
      condition: mostCommonCondition,
      isHoliday: false, // 祝日判定は別途実装が必要
    });
  });

  return dailyForecasts.slice(0, 7); // 7日分まで
}
