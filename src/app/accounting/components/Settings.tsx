'use client';

export default function Settings() {
  return (
    <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-6xl mb-4">🔧</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">設定</h3>
        <p className="text-gray-600 text-center max-w-md">
          勘定科目のカスタマイズや初期残高の設定ができます。
        </p>
        <div className="mt-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
          開発中 - Coming Soon
        </div>
      </div>
    </div>
  );
}
