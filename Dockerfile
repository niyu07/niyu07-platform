# 🐳 Next.js 開発用 Dockerfile
# Node.js の公式イメージを使用
FROM node:20-alpine

# 作業ディレクトリを設定
WORKDIR /app

# package.json と package-lock.json をコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm ci

# ソースコードをコピー
COPY . .

# ポートを公開
# 3000: Next.js 開発サーバー
# 6006: Storybook
EXPOSE 3000 6006

# 開発サーバーを起動
CMD ["npm", "run", "dev"]
