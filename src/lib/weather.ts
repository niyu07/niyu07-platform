/**
 * OpenWeatherMap API を使用した天気情報取得ライブラリ
 * API Documentation: https://openweathermap.org/api
 */

const API_KEY = process.env.OPENWEATHERMAP_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export interface CurrentWeather {
  location: string;
  temperature: number;
  feelsLike: number;
  tempMin: number;
  tempMax: number;
  humidity: number;
  pressure: number;
  description: string;
  icon: string;
  windSpeed: number;
  cloudiness: number;
  timestamp: number;
}

export interface ForecastItem {
  timestamp: number;
  date: string;
  temperature: number;
  feelsLike: number;
  tempMin: number;
  tempMax: number;
  humidity: number;
  description: string;
  icon: string;
  windSpeed: number;
  cloudiness: number;
  pop: number; // 降水確率
}

export interface WeatherForecast {
  location: string;
  forecasts: ForecastItem[];
}

/**
 * 現在の天気を取得
 * @param city 都市名（例: "Tokyo", "Tokyo,JP"）
 * @param lat 緯度（都市名の代わりに使用可能）
 * @param lon 経度（都市名の代わりに使用可能）
 */
export async function getCurrentWeather(
  city?: string,
  lat?: number,
  lon?: number
): Promise<CurrentWeather> {
  if (!API_KEY) {
    throw new Error('OPENWEATHERMAP_API_KEY が設定されていません');
  }

  let url = `${BASE_URL}/weather?appid=${API_KEY}&units=metric&lang=ja`;

  if (lat !== undefined && lon !== undefined) {
    url += `&lat=${lat}&lon=${lon}`;
  } else if (city) {
    url += `&q=${encodeURIComponent(city)}`;
  } else {
    throw new Error('都市名または緯度経度を指定してください');
  }

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.message || `HTTP ${response.status}`;
      throw new Error(`OpenWeatherMap API Error: ${message}`);
    }

    const data = await response.json();

    return {
      location: data.name,
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      tempMin: Math.round(data.main.temp_min),
      tempMax: Math.round(data.main.temp_max),
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      windSpeed: data.wind.speed,
      cloudiness: data.clouds.all,
      timestamp: data.dt,
    };
  } catch (error) {
    console.error('天気情報の取得エラー:', error);
    throw error;
  }
}

/**
 * 5日間の天気予報を取得（3時間ごと）
 * @param city 都市名（例: "Tokyo", "Tokyo,JP"）
 * @param lat 緯度（都市名の代わりに使用可能）
 * @param lon 経度（都市名の代わりに使用可能）
 */
export async function getWeatherForecast(
  city?: string,
  lat?: number,
  lon?: number
): Promise<WeatherForecast> {
  if (!API_KEY) {
    throw new Error('OPENWEATHERMAP_API_KEY が設定されていません');
  }

  let url = `${BASE_URL}/forecast?appid=${API_KEY}&units=metric&lang=ja`;

  if (lat !== undefined && lon !== undefined) {
    url += `&lat=${lat}&lon=${lon}`;
  } else if (city) {
    url += `&q=${encodeURIComponent(city)}`;
  } else {
    throw new Error('都市名または緯度経度を指定してください');
  }

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.message || `HTTP ${response.status}`;
      throw new Error(`OpenWeatherMap API Error: ${message}`);
    }

    const data = await response.json();

    interface ApiListItem {
      dt: number;
      main: {
        temp: number;
        feels_like: number;
        temp_min: number;
        temp_max: number;
        humidity: number;
      };
      weather: Array<{
        description: string;
        icon: string;
      }>;
      wind: {
        speed: number;
      };
      clouds: {
        all: number;
      };
      pop: number;
    }

    const forecasts: ForecastItem[] = data.list.map((item: ApiListItem) => ({
      timestamp: item.dt,
      date: new Date(item.dt * 1000).toISOString(),
      temperature: Math.round(item.main.temp),
      feelsLike: Math.round(item.main.feels_like),
      tempMin: Math.round(item.main.temp_min),
      tempMax: Math.round(item.main.temp_max),
      humidity: item.main.humidity,
      description: item.weather[0].description,
      icon: item.weather[0].icon,
      windSpeed: item.wind.speed,
      cloudiness: item.clouds.all,
      pop: Math.round(item.pop * 100), // 0-1を0-100%に変換
    }));

    return {
      location: data.city.name,
      forecasts,
    };
  } catch (error) {
    console.error('天気予報の取得エラー:', error);
    throw error;
  }
}

/**
 * 天気アイコンのURLを取得
 * @param icon アイコンコード（例: "01d"）
 * @param size アイコンサイズ（"1x", "2x", "4x"）
 */
export function getWeatherIconUrl(
  icon: string,
  size: '1x' | '2x' | '4x' = '2x'
): string {
  const sizeMap = {
    '1x': '',
    '2x': '@2x',
    '4x': '@4x',
  };
  return `https://openweathermap.org/img/wn/${icon}${sizeMap[size]}.png`;
}

/**
 * 日本の主要都市の天気を取得
 */
export async function getJapanCitiesWeather(): Promise<CurrentWeather[]> {
  const cities = [
    'Tokyo,JP',
    'Osaka,JP',
    'Nagoya,JP',
    'Sapporo,JP',
    'Fukuoka,JP',
  ];

  const weatherPromises = cities.map((city) => getCurrentWeather(city));

  try {
    return await Promise.all(weatherPromises);
  } catch (error) {
    console.error('複数都市の天気取得エラー:', error);
    throw error;
  }
}
