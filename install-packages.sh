#!/bin/bash

# Docker コンテナ内でパッケージをインストールするスクリプト
# ローカルを汚さずに package.json を更新できます

echo "🐳 Docker コンテナ内でパッケージをインストールします..."
echo ""

# Docker イメージをビルド
echo "📦 Docker イメージをビルド中..."
docker-compose build

# パッケージをインストール
echo "📦 パッケージをインストール中..."
docker-compose run --rm app npm install --save-dev \
  prettier \
  eslint-config-prettier \
  eslint-plugin-prettier \
  vitest \
  @vitest/ui \
  @vitejs/plugin-react \
  jsdom \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  @storybook/nextjs \
  @storybook/addon-essentials \
  @storybook/addon-interactions \
  @storybook/test

echo ""
echo "✅ パッケージのインストールが完了しました!"
echo ""
echo "📝 package.json と package-lock.json が更新されました"
echo "これらのファイルを Git にコミットしてください:"
echo ""
echo "  git add package.json package-lock.json"
echo "  git commit -m \"chore: add dev dependencies\""
echo "  git push"
echo ""
