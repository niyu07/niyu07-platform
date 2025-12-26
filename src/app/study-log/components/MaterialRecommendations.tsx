import { MaterialRecommendation } from '../../types';

interface MaterialRecommendationsProps {
  recommendations: MaterialRecommendation[];
}

const typeIcons: Record<string, string> = {
  講座: '🎬',
  書籍: '📚',
  動画: '📺',
  その他: '📝',
};

const typeColors: Record<string, string> = {
  講座: 'bg-red-100 text-red-700',
  書籍: 'bg-green-100 text-green-700',
  動画: 'bg-purple-100 text-purple-700',
  その他: 'bg-gray-100 text-gray-700',
};

export default function MaterialRecommendations({
  recommendations,
}: MaterialRecommendationsProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      {/* ヘッダー */}
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-900 mb-1">おすすめの教材</h2>
        <p className="text-xs text-gray-500">あなたの学習履歴から</p>
      </div>

      {/* レコメンドリスト */}
      <div className="space-y-3">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
          >
            {/* アイコンとタイトル */}
            <div className="flex items-start gap-3 mb-2">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xl">{typeIcons[rec.type]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-2">
                  {rec.title}
                </h3>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      typeColors[rec.type]
                    }`}
                  >
                    {rec.type}
                  </span>
                </div>
              </div>
              {rec.url && (
                <button className="text-gray-400 hover:text-gray-600">
                  <span className="text-sm">↗</span>
                </button>
              )}
            </div>

            {/* レコメンド理由 */}
            <p className="text-xs text-gray-600 mb-2">{rec.reason}</p>

            {/* カテゴリタグ */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-blue-600 font-medium">
                {rec.category}
              </span>
            </div>
          </div>
        ))}

        {recommendations.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">レコメンドはありません</p>
          </div>
        )}
      </div>
    </div>
  );
}
