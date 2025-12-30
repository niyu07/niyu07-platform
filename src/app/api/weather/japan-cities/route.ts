import { NextResponse } from 'next/server';
import { getJapanCitiesWeather } from '@/lib/weather';

/**
 * GET /api/weather/japan-cities
 * 日本の主要都市（東京、大阪、名古屋、札幌、福岡）の天気情報を取得
 */
export async function GET() {
  try {
    const citiesWeather = await getJapanCitiesWeather();
    return NextResponse.json(citiesWeather);
  } catch (error) {
    console.error('都市の天気情報の取得エラー:', error);
    return NextResponse.json(
      { error: '都市の天気情報の取得に失敗しました' },
      { status: 500 }
    );
  }
}
