import { NextRequest, NextResponse } from 'next/server';
import { getCurrentWeather } from '@/lib/weather';

/**
 * GET /api/weather/current
 * 現在の天気情報を取得
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
      const weather = await getCurrentWeather(
        undefined,
        parseFloat(lat),
        parseFloat(lon)
      );
      return NextResponse.json(weather);
    }

    // 都市名が指定されている場合
    if (city) {
      const weather = await getCurrentWeather(city);
      return NextResponse.json(weather);
    }

    // デフォルトは東京
    const weather = await getCurrentWeather('Tokyo,JP');
    return NextResponse.json(weather);
  } catch (error) {
    console.error('天気情報の取得エラー:', error);
    return NextResponse.json(
      { error: '天気情報の取得に失敗しました' },
      { status: 500 }
    );
  }
}
