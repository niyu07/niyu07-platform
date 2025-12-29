import { useState, useEffect, useCallback } from 'react';

export interface CalendarColorMap {
  [calendarId: string]: string;
}

const STORAGE_KEY = 'calendar-colors';

// デフォルトのカラーパレット
const DEFAULT_COLORS = [
  '#4285f4', // Google Blue
  '#ea4335', // Google Red
  '#fbbc04', // Google Yellow
  '#34a853', // Google Green
  '#ff6d00', // Deep Orange
  '#46bdc6', // Cyan
  '#7986cb', // Indigo
  '#f4511e', // Red Orange
  '#33b679', // Green
  '#8e24aa', // Purple
];

/**
 * カレンダーの色設定を管理するカスタムフック
 */
export function useCalendarColors() {
  const [colorMap, setColorMap] = useState<CalendarColorMap>({});

  // 初回マウント時にローカルストレージから読み込み
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setColorMap(JSON.parse(stored));
      }
    } catch (error) {
      console.error('カレンダー色設定の読み込みエラー:', error);
    }
  }, []);

  // カレンダーの色を取得（デフォルト色を返す）
  const getCalendarColor = useCallback(
    (calendarId: string, defaultColor?: string): string => {
      if (colorMap[calendarId]) {
        return colorMap[calendarId];
      }
      return defaultColor || DEFAULT_COLORS[0];
    },
    [colorMap]
  );

  // カレンダーの色を設定
  const setCalendarColor = useCallback((calendarId: string, color: string) => {
    setColorMap((prevColorMap) => {
      const newColorMap = { ...prevColorMap, [calendarId]: color };

      // ローカルストレージに保存
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newColorMap));
      } catch (error) {
        console.error('カレンダー色設定の保存エラー:', error);
      }

      return newColorMap;
    });
  }, []);

  // 複数のカレンダーにデフォルト色を自動割り当て
  const assignDefaultColors = useCallback((calendarIds: string[]) => {
    setColorMap((prevColorMap) => {
      const newColorMap = { ...prevColorMap };
      let colorIndex = 0;
      let hasChanges = false;

      calendarIds.forEach((calendarId) => {
        if (!newColorMap[calendarId]) {
          newColorMap[calendarId] =
            DEFAULT_COLORS[colorIndex % DEFAULT_COLORS.length];
          colorIndex++;
          hasChanges = true;
        }
      });

      // 変更がない場合は前の状態を返す
      if (!hasChanges) {
        return prevColorMap;
      }

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newColorMap));
      } catch (error) {
        console.error('カレンダー色設定の保存エラー:', error);
      }

      return newColorMap;
    });
  }, []);

  return {
    colorMap,
    getCalendarColor,
    setCalendarColor,
    assignDefaultColors,
    DEFAULT_COLORS,
  };
}
