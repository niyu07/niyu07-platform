# 🐳 Docker で開発する方法(小学生向け)

Docker を使うと、**ローカルを汚さずに**開発できます!
コンテナという「箱」の中で開発するので、パソコンに直接インストールする必要がありません。

---

## 🎯 Docker とは?

**例え話:**
- パソコン = 家
- Docker コンテナ = レンタルルーム
- レンタルルームで作業すれば、家は汚れない!

---

## 📦 必要なもの

1. **Docker Desktop** をインストール
   - Mac: https://www.docker.com/products/docker-desktop/
   - インストール後、Docker Desktop を起動しておく

---

## 🚀 使い方

### 1️⃣ 最初の1回だけ:パッケージをインストール

```bash
# Docker コンテナを起動してパッケージをインストール
docker-compose run --rm app npm ci
```

**何をしているか:**
- `docker-compose run` = コンテナの中でコマンドを実行
- `--rm` = 実行後にコンテナを削除(ゴミが残らない)
- `app` = どのコンテナを使うか
- `npm ci` = パッケージをインストール

---

### 2️⃣ 開発サーバーを起動

```bash
# Next.js 開発サーバーを起動
docker-compose up
```

**何が起こるか:**
- コンテナが起動する
- Next.js 開発サーバーが起動する
- ブラウザで http://localhost:3000 を開くと見れる!

**止め方:**
- `Ctrl + C` を押す
- または別のターミナルで `docker-compose down`

---

### 3️⃣ Storybook を起動

```bash
# Storybook を起動
docker-compose --profile storybook up storybook
```

**何が起こるか:**
- Storybook が起動する
- ブラウザで http://localhost:6006 を開くと見れる!

---

### 4️⃣ テストを実行

```bash
# テストを実行
docker-compose run --rm app npm run test
```

---

### 5️⃣ コードの見た目を揃える

```bash
# Prettier でコードを整える
docker-compose run --rm app npm run format
```

---

### 6️⃣ コードのミスをチェック

```bash
# ESLint でミスをチェック
docker-compose run --rm app npm run lint
```

---

### 7️⃣ 型チェック

```bash
# TypeScript の型チェック
docker-compose run --rm app npm run typecheck
```

---

### 8️⃣ すべてのチェックを一度に実行(CI と同じ)

```bash
# CI で実行されるすべてのチェック
docker-compose run --rm app npm run ci
```

---

## 🎨 よく使うコマンド一覧

| コマンド | 何をするか |
|---------|----------|
| `docker-compose up` | 開発サーバーを起動 |
| `docker-compose down` | コンテナを停止 |
| `docker-compose run --rm app npm run test` | テストを実行 |
| `docker-compose run --rm app npm run lint` | Lint チェック |
| `docker-compose run --rm app npm run format` | コードを整える |
| `docker-compose run --rm app npm run typecheck` | 型チェック |
| `docker-compose run --rm app npm run ci` | すべてのチェック |
| `docker-compose logs -f` | ログを見る |
| `docker-compose exec app sh` | コンテナの中に入る |

---

## 🔧 トラブルシューティング

### ❌ ポートが使われている

**エラー:**
```
Error: Port 3000 is already in use
```

**解決方法:**
```bash
# 既存のコンテナを停止
docker-compose down

# または、使っているプロセスを確認
lsof -i :3000
```

---

### ❌ ファイルの変更が反映されない

**解決方法:**
```bash
# コンテナを再起動
docker-compose restart
```

---

### ❌ パッケージが見つからない

**解決方法:**
```bash
# パッケージを再インストール
docker-compose run --rm app npm ci
```

---

### ❌ コンテナが起動しない

**解決方法:**
```bash
# すべてのコンテナを停止して削除
docker-compose down -v

# イメージを再ビルド
docker-compose build --no-cache

# 再起動
docker-compose up
```

---

## 📂 ファイル構成

```
niyu07-platform/
├── Dockerfile              # Docker イメージの設計図
├── docker-compose.yml      # Docker の起動設定
├── .dockerignore          # Docker に含めないファイル
└── ...
```

---

## 💡 覚えておくこと

1. **Docker Desktop を起動しておく** → これがないと動かない
2. **`docker-compose run --rm app` の後にコマンドを書く** → コンテナの中で実行される
3. **ローカルのファイルを編集すると、コンテナ内にも反映される** → マジック!
4. **`Ctrl + C` で止める** → 開発サーバーを止めるとき

---

## 🎯 初心者が最初にやる順番(Docker 版)

1. **Docker Desktop をインストール・起動** ← 忘れずに!
2. **パッケージをインストール**: `docker-compose run --rm app npm ci`
3. **開発サーバーを起動**: `docker-compose up`
4. **ブラウザで確認**: http://localhost:3000
5. **コードを書く**
6. **テストを実行**: `docker-compose run --rm app npm run test`
7. **Lint チェック**: `docker-compose run --rm app npm run lint`
8. **5〜7 を繰り返す**

---

## 🆘 困ったときは

1. **Docker Desktop が起動しているか確認**
2. **エラーメッセージを読む**
3. **Google で検索する**
4. **ChatGPT に聞く**

頑張ってください! 🎉
