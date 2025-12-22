# 🎓 セットアップ完了!次にやること

おめでとうございます!プロジェクトのセットアップが完了しました! 🎉

---

## ✅ 作成されたファイル一覧

### 📁 設定ファイル
- ✅ `.prettierrc` - コードの見た目を揃える設定
- ✅ `.prettierignore` - Prettier が無視するファイル
- ✅ `eslint.config.mjs` - コードのミスを見つける設定
- ✅ `vitest.config.ts` - テストの設定
- ✅ `vitest.setup.ts` - テストの準備ファイル
- ✅ `.storybook/main.ts` - Storybook のメイン設定
- ✅ `.storybook/preview.ts` - Storybook のプレビュー設定
- ✅ `package.json` - npm scripts を追加

### 🐳 Docker ファイル
- ✅ `Dockerfile` - Docker イメージの設計図
- ✅ `docker-compose.yml` - Docker の起動設定
- ✅ `.dockerignore` - Docker に含めないファイル

### 📝 ドキュメント
- ✅ `README.md` - プロジェクトの説明
- ✅ `SETUP.md` - セットアップガイド
- ✅ `DOCKER_GUIDE.md` - Docker を使った開発方法
- ✅ `CONFIG_GUIDE.md` - 設定ファイルの詳細説明
- ✅ `NEXT_STEPS.md` - このファイル!

### 🧪 サンプルコード
- ✅ `app/page.test.tsx` - ホームページのテスト
- ✅ `app/components/Button.tsx` - サンプルボタンコンポーネント
- ✅ `app/components/Button.test.tsx` - ボタンのテスト
- ✅ `app/components/Button.stories.tsx` - ボタンの Storybook

### 🤖 CI/CD
- ✅ `.github/workflows/ci.yml` - GitHub Actions の CI 設定

### 🛠️ その他
- ✅ `install-packages.sh` - パッケージ一括インストールスクリプト
- ✅ `.gitignore` - Git が無視するファイル(更新済み)

---

## 🚀 次にやること

### 1️⃣ Docker Desktop をインストール(まだの場合)

```bash
# Mac の場合
# https://www.docker.com/products/docker-desktop/ からダウンロード
```

---

### 2️⃣ パッケージをインストール

**Docker を使う場合(おすすめ!):**
```bash
docker-compose run --rm app npm ci
```

**ローカルで開発する場合:**
```bash
npm ci
```

---

### 3️⃣ 開発サーバーを起動

**Docker を使う場合:**
```bash
docker-compose up
```

**ローカルで開発する場合:**
```bash
npm run dev
```

ブラウザで http://localhost:3000 を開いてください!

---

### 4️⃣ テストを実行してみる

**Docker を使う場合:**
```bash
docker-compose run --rm app npm run test
```

**ローカルで開発する場合:**
```bash
npm run test
```

すべてのテストが通れば成功です! ✅

---

### 5️⃣ Storybook を起動してみる

**Docker を使う場合:**
```bash
docker-compose --profile storybook up storybook
```

**ローカルで開発する場合:**
```bash
npm run storybook
```

ブラウザで http://localhost:6006 を開いてください!

---

### 6️⃣ すべてのチェックを実行してみる

**Docker を使う場合:**
```bash
docker-compose run --rm app npm run ci
```

**ローカルで開発する場合:**
```bash
npm run ci
```

すべて通れば、CI の準備完了です! 🎉

---

## 📚 読むべきドキュメント

1. **まず読む**: [README.md](./README.md) - プロジェクト全体の説明
2. **Docker を使う**: [DOCKER_GUIDE.md](./DOCKER_GUIDE.md) - Docker の使い方
3. **ローカルで開発**: [SETUP.md](./SETUP.md) - ローカル開発の方法
4. **設定を理解する**: [CONFIG_GUIDE.md](./CONFIG_GUIDE.md) - 各設定ファイルの説明

---

## 🎯 開発フロー(復習)

1. **ブランチを作る**: `git checkout -b feature/your-feature`
2. **コードを書く**
3. **テストを書く**
4. **チェックを実行**: `npm run ci` (または `docker-compose run --rm app npm run ci`)
5. **コミット**: `git commit -m "feat: your feature"`
6. **プッシュ**: `git push origin feature/your-feature`
7. **プルリクエストを作る**
8. **CI が通ったらマージ**

---

## 🔧 後から強化できるポイント

### レベル1(慣れてきたら)
- [ ] ESLint のルールを追加する
- [ ] Prettier の設定をカスタマイズする
- [ ] テストのカバレッジを測定する(`npm run test:coverage`)

### レベル2(もっと慣れたら)
- [ ] Husky で commit 前に自動チェック
- [ ] lint-staged で変更したファイルだけチェック
- [ ] Renovate で依存関係を自動更新

### レベル3(上級者向け)
- [ ] Visual Regression Testing(見た目の変化を検知)
- [ ] E2E テスト(Playwright など)
- [ ] パフォーマンス測定

---

## ⚠️ 注意事項

1. **CI で落ちたらマージしない!** - 赤信号で進むのと同じくらい危険
2. **わからないエラーは調べる** - エラーメッセージをコピーして検索
3. **完璧を目指さない** - まず動かすことが大事
4. **Docker Desktop を起動しておく** - Docker を使う場合は必須

---

## 🆘 困ったときは

1. エラーメッセージを読む
2. ドキュメントを読む
3. Google で検索する
4. ChatGPT に聞く
5. チームメンバーに聞く

---

## 🎉 まとめ

このプロジェクトは、**初心者でも安全に開発できる**ように設定されています。

- ✅ コードのミスは **ESLint** が見つけてくれる
- ✅ 見た目のバラつきは **Prettier** が揃えてくれる
- ✅ 型のミスは **TypeScript** が教えてくれる
- ✅ 動作の確認は **Vitest** が自動でやってくれる
- ✅ 危険なパッケージは **npm audit** が見つけてくれる
- ✅ コンポーネントは **Storybook** で確認できる
- ✅ すべてのチェックは **GitHub Actions** が自動で実行してくれる

**あなたがやることは、コードを書くことだけ!** 🚀

頑張ってください! 🎉
