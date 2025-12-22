# niyu07-platform

Next.js + TypeScript で作られた、初心者でも安全に開発できるプロジェクトです。

## 🎯 特徴

- ✅ **Lint & Format**: ESLint + Prettier で自動チェック
- ✅ **型チェック**: TypeScript で型安全
- ✅ **テスト**: Vitest + Testing Library で自動テスト
- ✅ **UI カタログ**: Storybook でコンポーネント管理
- ✅ **セキュリティ**: npm audit で脆弱性チェック
- ✅ **CI/CD**: GitHub Actions で自動チェック
- ✅ **Docker 対応**: ローカルを汚さず開発可能

---

## 🚀 クイックスタート

### 🐳 Docker で開発する(おすすめ!)

```bash
# 1. パッケージをインストール
docker-compose run --rm app npm ci

# 2. 開発サーバーを起動
docker-compose up

# 3. ブラウザで開く
# http://localhost:3000
```

詳しくは [DOCKER_GUIDE.md](./DOCKER_GUIDE.md) を読んでください。

---

### 💻 ローカルで開発する

```bash
# 1. パッケージをインストール
npm ci

# 2. 開発サーバーを起動
npm run dev

# 3. ブラウザで開く
# http://localhost:3000
```

詳しくは [SETUP.md](./SETUP.md) を読んでください。

---

## 📝 よく使うコマンド

| コマンド            | 説明                   |
| ------------------- | ---------------------- |
| `npm run dev`       | 開発サーバーを起動     |
| `npm run build`     | 本番用にビルド         |
| `npm run lint`      | コードのミスをチェック |
| `npm run format`    | コードの見た目を揃える |
| `npm run typecheck` | 型チェック             |
| `npm run test`      | テストを実行           |
| `npm run storybook` | Storybook を起動       |
| `npm run ci`        | すべてのチェックを実行 |

Docker を使う場合は、コマンドの前に `docker-compose run --rm app` をつけてください。

---

## 📚 ドキュメント

- [SETUP.md](./SETUP.md) - セットアップガイド
- [DOCKER_GUIDE.md](./DOCKER_GUIDE.md) - Docker を使った開発方法
- [CONFIG_GUIDE.md](./CONFIG_GUIDE.md) - 設定ファイルの詳細説明

---

## 🧪 テスト

```bash
# テストを実行
npm run test

# テストを監視モードで実行
npm run test:watch

# テスト結果を UI で見る
npm run test:ui

# カバレッジを確認
npm run test:coverage
```

---

## 📖 Storybook

```bash
# Storybook を起動
npm run storybook

# ブラウザで開く
# http://localhost:6006
```

---

## 🔒 セキュリティチェック

```bash
# 脆弱性をチェック
npm run audit
```

---

## 🤝 開発フロー

1. **ブランチを作る**: `git checkout -b feature/your-feature`
2. **コードを書く**
3. **テストを書く**
4. **チェックを実行**: `npm run ci`
5. **コミット**: `git commit -m "feat: your feature"`
6. **プッシュ**: `git push origin feature/your-feature`
7. **プルリクエストを作る**
8. **CI が通ったらマージ**

---

## 📦 技術スタック

- **フレームワーク**: Next.js 16
- **言語**: TypeScript 5
- **スタイル**: Tailwind CSS 4
- **テスト**: Vitest + Testing Library
- **Lint**: ESLint 9
- **Format**: Prettier
- **UI カタログ**: Storybook
- **CI/CD**: GitHub Actions

---

## 🆘 困ったときは

1. [SETUP.md](./SETUP.md) を読む
2. [DOCKER_GUIDE.md](./DOCKER_GUIDE.md) を読む
3. [CONFIG_GUIDE.md](./CONFIG_GUIDE.md) を読む
4. エラーメッセージを Google で検索
5. ChatGPT に聞く
6. チームメンバーに聞く

---

## 📄 ライセンス

Private

---

## 🎉 Happy Coding!

初心者でも安全に開発できるように設定されています。
わからないことがあれば、遠慮なく聞いてください!
