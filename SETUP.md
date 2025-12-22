# 初心者向け Next.js 開発環境セットアップガイド

## 🎯 開発方法を選ぶ

このプロジェクトは2つの方法で開発できます:

### 🐳 方法1: Docker を使う(おすすめ!)

- **メリット**: ローカルを汚さない、環境が統一される
- **デメリット**: Docker Desktop が必要
- **詳しくは**: [DOCKER_GUIDE.md](./DOCKER_GUIDE.md) を読んでください

### 💻 方法2: ローカルで直接開発

- **メリット**: セットアップが簡単
- **デメリット**: ローカルに node_modules がインストールされる
- **詳しくは**: このファイルの下を読んでください

---

## 📦 必要なパッケージ(ローカル開発の場合)

以下のコマンドを実行すると、必要なパッケージがすべてインストールされます:

```bash
npm install --save-dev \
  prettier \
  eslint-config-prettier \
  eslint-plugin-prettier \
  vitest \
  @vitest/ui \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  jsdom \
  @storybook/nextjs \
  @storybook/addon-essentials \
  @storybook/addon-interactions \
  @storybook/test
```

### 各パッケージの役割

| パッケージ                      | 役割                                          |
| ------------------------------- | --------------------------------------------- |
| `prettier`                      | コードの見た目を自動で揃える                  |
| `eslint-config-prettier`        | ESLint と Prettier が喧嘩しないようにする     |
| `eslint-plugin-prettier`        | Prettier のルールを ESLint で使えるようにする |
| `vitest`                        | テストを実行するツール(Jest より速い!)        |
| `@vitest/ui`                    | テスト結果を見やすく表示する                  |
| `@testing-library/react`        | React コンポーネントをテストする              |
| `@testing-library/jest-dom`     | テストで「表示されているか」などを確認できる  |
| `@testing-library/user-event`   | ユーザーの操作(クリックなど)をテストできる    |
| `jsdom`                         | ブラウザの環境をテストで再現する              |
| `@storybook/nextjs`             | Next.js 用の Storybook                        |
| `@storybook/addon-essentials`   | Storybook の基本機能                          |
| `@storybook/addon-interactions` | Storybook でユーザー操作をテストできる        |
| `@storybook/test`               | Storybook でのテストツール                    |

## 🚀 初心者が最初にやる順番

1. **このファイルを読む** ← 今ここ!
2. **パッケージをインストール**(上のコマンドを実行)
3. **npm run format** でコードを整える
4. **npm run lint** でミスがないか確認
5. **npm run typecheck** で型のミスがないか確認
6. **npm run test** でテストを実行
7. **npm run dev** で開発サーバーを起動
8. **コードを書く**
9. **2〜7 を繰り返す**

## 📝 CI で使う npm scripts

すでに `package.json` に追加済みです:

- `npm run lint` - コードのミスを見つける
- `npm run format` - コードの見た目を揃える
- `npm run format:check` - 見た目が揃っているか確認だけする(CI用)
- `npm run typecheck` - TypeScript の型チェック
- `npm run test` - テストを実行
- `npm run test:ui` - テスト結果を画面で見る
- `npm run audit` - 危険なパッケージがないか確認
- `npm run build` - 本番用にビルド
- `npm run storybook` - Storybook を起動
- `npm run storybook:build` - Storybook をビルド

## 🔧 後から強化できるポイント

### レベル1(慣れてきたら)

- ESLint のルールを追加する
- Prettier の設定をカスタマイズする
- テストのカバレッジを測定する

### レベル2(もっと慣れたら)

- Husky で commit 前に自動チェック
- lint-staged で変更したファイルだけチェック
- Renovate で依存関係を自動更新

### レベル3(上級者向け)

- Visual Regression Testing(見た目の変化を検知)
- E2E テスト(Playwright など)
- パフォーマンス測定

## ⚠️ 注意事項

- **CI で落ちたらマージしない!** - 赤信号で進むのと同じくらい危険
- **わからないエラーは調べる** - エラーメッセージをコピーして検索
- **完璧を目指さない** - まず動かすことが大事

## 🆘 困ったときは

1. エラーメッセージを読む
2. Google で検索する
3. ChatGPT に聞く
4. チームメンバーに聞く

頑張ってください! 🎉
