import { NextRequest, NextResponse } from 'next/server';
import { getWeatherForecast } from '@/lib/weather';

/**
 * GET /api/weather/forecast
 * 5日間の天気予報を取得（3時間ごと）
 * クエリパラメータ:
 * - city: 都市名（例: "Tokyo", "Tokyo,JP"）
 * - lat: 緯度（cityの代わりに使用可能）
 * - lon: 経度（cityの代わりに使用可能）
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const city = searchParams.get('city');
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');

    // 緯度経度が両方指定されている場合
    if (lat && lon) {
      const forecast = await getWeatherForecast(
        undefined,
        parseFloat(lat),
        parseFloat(lon)
      );
      return NextResponse.json(forecast);
    }

    // 都市名が指定されている場合
    if (city) {
      const forecast = await getWeatherForecast(city);
      return NextResponse.json(forecast);
    }

    // デフォルトは東京
    const forecast = await getWeatherForecast('Tokyo,JP');
    return NextResponse.json(forecast);
  } catch (error) {
    console.error('天気予報の取得エラー:', error);
    return NextResponse.json(
      { error: '天気予報の取得に失敗しました' },
      { status: 500 }
    );
  }
}
