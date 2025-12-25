import { CalendarEventType } from '../../types';

// イベントタイプに応じた色を取得
export const getEventTypeColor = (
  type: CalendarEventType
): {
  bg: string;
  border: string;
  text: string;
} => {
  const colors = {
    授業: {
      bg: 'bg-blue-100',
      border: 'border-blue-300',
      text: 'text-blue-800',
    },
    勤務: {
      bg: 'bg-green-100',
      border: 'border-green-300',
      text: 'text-green-800',
    },
    案件: {
      bg: 'bg-purple-100',
      border: 'border-purple-300',
      text: 'text-purple-800',
    },
    学習: {
      bg: 'bg-orange-100',
      border: 'border-orange-300',
      text: 'text-orange-800',
    },
    イベント: {
      bg: 'bg-pink-100',
      border: 'border-pink-300',
      text: 'text-pink-800',
    },
    休憩: {
      bg: 'bg-gray-100',
      border: 'border-gray-300',
      text: 'text-gray-600',
    },
  };

  return colors[type] || colors['休憩'];
};

// イベントタイプに応じた背景色（カレンダーグリッド用）
export const getEventTypeBgColor = (type: CalendarEventType): string => {
  const colors = {
    授業: 'bg-blue-500',
    勤務: 'bg-green-500',
    案件: 'bg-purple-500',
    学習: 'bg-orange-500',
    イベント: 'bg-pink-500',
    休憩: 'bg-gray-400',
  };

  return colors[type] || colors['休憩'];
};

// イベントタイプに応じたアイコンを取得
export const getEventTypeIcon = (type: CalendarEventType): string => {
  const icons = {
    授業: '📖',
    勤務: '💼',
    案件: '💻',
    学習: '📚',
    イベント: '🎉',
    休憩: '☕',
  };

  return icons[type] || '📅';
};
