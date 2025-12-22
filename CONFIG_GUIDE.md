# 🎓 設定ファイルの説明(小学生向け)

このファイルでは、各設定ファイルが「なぜ必要か」を1行ずつ説明します。

---

## 📄 .prettierrc (コードの見た目を揃える設定)

```json
{
  "semi": true, // 文の最後にセミコロン(;)をつける → みんな同じルールで書ける
  "trailingComma": "es5", // 配列の最後にカンマをつける → 後で追加しやすい
  "singleQuote": true, // シングルクォート(')を使う → 見た目が統一される
  "printWidth": 80, // 1行は80文字まで → 画面に収まって読みやすい
  "tabWidth": 2, // インデントは2スペース → コードが見やすい
  "useTabs": false, // タブではなくスペースを使う → どのエディタでも同じ見た目
  "arrowParens": "always", // アロー関数の引数に括弧をつける → 統一感がある
  "endOfLine": "lf" // 改行コードを統一 → Mac/Windows で同じになる
}
```

**なぜ必要?**
→ チームで開発するとき、みんなのコードの見た目がバラバラだと読みにくい。Prettier が自動で揃えてくれる!

---

## 📄 eslint.config.mjs (コードのミスを見つける設定)

```javascript
import nextVitals from 'eslint-config-next/core-web-vitals'; // Next.js のおすすめルール
import nextTs from 'eslint-config-next/typescript'; // TypeScript のルール

globalIgnores([
  '.next/**', // ビルド結果は無視 → 自動生成されるファイルはチェック不要
  'node_modules/**', // 外部パッケージは無視 → 他の人が作ったコードはチェック不要
]);
```

**なぜ必要?**
→ 間違ったコードを書いても、ESLint が「ここ間違ってるよ!」と教えてくれる。作文の文法チェッカーみたいなもの。

---

## 📄 vitest.config.ts (テストの設定)

```typescript
export default defineConfig({
  test: {
    environment: 'jsdom', // ブラウザの環境を再現 → React コンポーネントをテストできる
    setupFiles: ['./vitest.setup.ts'], // テストの準備ファイル → 毎回同じ設定を使える
    include: ['**/*.{test,spec}.{ts,tsx}'], // どのファイルがテストか → *.test.tsx がテスト
  },
});
```

**なぜ必要?**
→ コードが正しく動くかを自動でチェックできる。算数の答え合わせを自動でやってくれる感じ!

---

## 📄 .storybook/main.ts (Storybook の設定)

```typescript
const config = {
  stories: ['../**/*.stories.@(js|jsx|ts|tsx)'], // ストーリーファイルの場所
  addons: [
    '@storybook/addon-essentials', // 基本機能 → コントロールパネルなど
    '@storybook/addon-interactions', // 操作のテスト → クリックなどをテストできる
  ],
  framework: '@storybook/nextjs', // Next.js 用の設定
};
```

**なぜ必要?**
→ コンポーネントを1つずつ確認できる。レゴブロックを1個ずつ見る箱みたいなもの!

---

## 📄 package.json (npm scripts)

```json
{
  "lint": "eslint .", // コードのミスを見つける
  "lint:fix": "eslint . --fix", // ミスを自動で直す
  "format": "prettier --write .", // コードの見た目を揃える
  "format:check": "prettier --check .", // 見た目が揃っているか確認だけ(CI用)
  "typecheck": "tsc --noEmit", // 型のミスを見つける
  "test": "vitest run", // テストを実行
  "test:watch": "vitest", // ファイルを変更したら自動でテスト
  "test:ui": "vitest --ui", // テスト結果を画面で見る
  "audit": "npm audit --audit-level=moderate", // 危険なパッケージを見つける
  "storybook": "storybook dev -p 6006", // Storybook を起動
  "ci": "npm run format:check && ..." // CI で全部まとめて実行
}
```

**なぜ必要?**
→ 長いコマンドを覚えなくても、`npm run test` みたいに短く実行できる!

---

## 📄 .github/workflows/ci.yml (CI の設定)

```yaml
on:
  push:
    branches: [main] # main ブランチに push されたとき
  pull_request:
    branches: [main] # プルリクエストが作られたとき

steps:
  - npm run format:check # 見た目をチェック
  - npm run lint # ミスをチェック
  - npm run typecheck # 型をチェック
  - npm run test # テストを実行
  - npm run build # ビルドできるか確認
```

**なぜ必要?**
→ コードを push したら、自動でチェックしてくれる。ミスがあったら「赤信号」が出て、マージできない!

---

## 🎯 まとめ

| ファイル                   | 役割           | 例え話                     |
| -------------------------- | -------------- | -------------------------- |
| `.prettierrc`              | 見た目を揃える | 定規で文字の大きさを揃える |
| `eslint.config.mjs`        | ミスを見つける | 作文の文法チェッカー       |
| `vitest.config.ts`         | テストの設定   | 答え合わせの準備           |
| `.storybook/main.ts`       | 部品を見る箱   | レゴブロックを1個ずつ見る  |
| `package.json`             | コマンドの短縮 | 長い呪文を短くする         |
| `.github/workflows/ci.yml` | 自動チェック   | 信号機(赤なら止まる)       |

---

## 💡 覚えておくこと

1. **設定ファイルは最初に1回作るだけ** → 後は自動で動く
2. **わからないエラーは調べる** → エラーメッセージをコピーして検索
3. **CI が赤になったらマージしない** → 赤信号で進むのと同じくらい危険
4. **完璧を目指さない** → まず動かすことが大事

頑張ってください! 🎉
