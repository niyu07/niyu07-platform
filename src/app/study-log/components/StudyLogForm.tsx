'use client';

import { useState } from 'react';

export default function StudyLogForm() {
  const [category, setCategory] = useState('Programming');
  const [duration, setDuration] = useState('60');
  const [content, setContent] = useState('');
  const [material, setMaterial] = useState('');
  const [rating, setRating] = useState(3);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 実際のAPI呼び出しを実装
    console.log({
      category,
      duration,
      content,
      material,
      rating,
    });
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      {/* ヘッダー */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">📝</span>
        <h2 className="text-lg font-bold text-gray-900">学習を記録</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 科目/分野 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            科目/分野
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="Programming">Programming</option>
            <option value="Design">Design</option>
            <option value="English">English</option>
            <option value="Math">Math</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* 学習時間（分） */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            学習時間（分）
          </label>
          <div className="relative">
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              min="1"
              max="1440"
              placeholder="60"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-blue-500 hover:text-blue-600 font-medium"
            >
              タイマー引用
            </button>
          </div>
        </div>

        {/* 学習内容 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            学習内容
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="何を学びましたか？"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
          />
        </div>

        {/* 習得度 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            習得度
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="text-2xl transition-transform hover:scale-110"
              >
                {star <= rating ? '⭐' : '☆'}
              </button>
            ))}
          </div>
        </div>

        {/* 使用教材（任意） */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            使用教材（任意）
          </label>
          <input
            type="text"
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
            placeholder="例: React公式ドキュメント"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        {/* 記録するボタン */}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2.5 rounded-lg font-medium hover:bg-blue-600 transition-colors"
        >
          記録する
        </button>
      </form>
    </div>
  );
}
