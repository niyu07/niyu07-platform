interface StudySummaryCardsProps {
  today: {
    hours: number;
    goalHours: number;
    remaining: number;
  };
  weekly: {
    hours: number;
    weekOverWeekChange: number;
    weekOverWeekPercentage: number;
  };
  streak: {
    days: number;
    isNewRecord: boolean;
  };
  total: {
    hours: number;
    level: number;
    title: string;
  };
}

export default function StudySummaryCards({
  today,
  weekly,
  streak,
  total,
}: StudySummaryCardsProps) {
  const todayPercentage = (today.hours / today.goalHours) * 100;

  return (
    <div className="grid grid-cols-4 gap-6">
      {/* Today Card */}
      <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-2 right-2 bg-white/20 rounded-lg px-3 py-1">
          <span className="text-xs font-medium">Today</span>
        </div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <span className="text-2xl">📖</span>
          </div>
        </div>
        <div className="mb-2">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold">{today.hours}</span>
            <span className="text-lg">h</span>
          </div>
          <p className="text-sm text-blue-100 mt-1">
            目標まで {today.remaining}h
          </p>
        </div>
        {/* Progress bar */}
        <div className="w-full bg-white/20 rounded-full h-2 mt-3">
          <div
            className="bg-white rounded-full h-2 transition-all"
            style={{ width: `${Math.min(todayPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Weekly Card */}
      <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-2 right-2 bg-white/20 rounded-lg px-3 py-1">
          <span className="text-xs font-medium">Weekly</span>
        </div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <span className="text-2xl">📊</span>
          </div>
        </div>
        <div className="mb-2">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold">{weekly.hours}</span>
            <span className="text-lg">h</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-green-100">
              先週比 +{weekly.weekOverWeekChange}h
            </p>
            <div className="flex items-center gap-1 bg-white/20 rounded px-2 py-0.5">
              <span className="text-xs">↑</span>
              <span className="text-xs font-medium">
                {weekly.weekOverWeekPercentage}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Streak Card */}
      <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-2 right-2 bg-white/20 rounded-lg px-3 py-1">
          <span className="text-xs font-medium">Streak</span>
        </div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <span className="text-2xl">🔥</span>
          </div>
        </div>
        <div className="mb-2">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold">{streak.days}</span>
            <span className="text-lg">Days</span>
          </div>
          {streak.isNewRecord && (
            <div className="flex items-center gap-1 mt-1">
              <span className="text-sm">🏆</span>
              <p className="text-sm text-orange-100 font-medium">
                過去最高記録！
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Total Card */}
      <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-2 right-2 bg-white/20 rounded-lg px-3 py-1">
          <span className="text-xs font-medium">Total</span>
        </div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <span className="text-2xl">⭐</span>
          </div>
        </div>
        <div className="mb-2">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold">{total.hours}</span>
            <span className="text-lg">h</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="bg-purple-700 rounded px-2 py-0.5">
              <span className="text-xs font-medium">Lv.{total.level}</span>
            </div>
            <p className="text-sm text-purple-100">{total.title}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
