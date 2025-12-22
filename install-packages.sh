#!/bin/bash

# Next.js プロジェクトの開発環境セットアップスクリプト
# このスクリプトを実行すると、必要なパッケージがすべてインストールされます

echo "📦 必要なパッケージをインストールしています..."
echo ""

# Prettier 関連
echo "✨ Prettier (コードの見た目を揃える)"
npm install --save-dev \
  prettier \
  eslint-config-prettier \
  eslint-plugin-prettier

# Vitest 関連
echo "🧪 Vitest (テストツール)"
npm install --save-dev \
  vitest \
  @vitest/ui \
  @vitejs/plugin-react \
  jsdom

# Testing Library 関連
echo "🎭 Testing Library (React コンポーネントのテスト)"
npm install --save-dev \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event

# Storybook 関連
echo "📚 Storybook (コンポーネントカタログ)"
npm install --save-dev \
  @storybook/nextjs \
  @storybook/addon-essentials \
  @storybook/addon-interactions \
  @storybook/test

echo ""
echo "✅ すべてのパッケージのインストールが完了しました!"
echo ""
echo "📝 次のステップ:"
echo "1. npm run format でコードを整える"
echo "2. npm run lint でミスがないか確認"
echo "3. npm run test でテストを実行"
echo "4. npm run dev で開発サーバーを起動"
echo ""
echo "詳しくは SETUP.md を読んでください 🎉"
