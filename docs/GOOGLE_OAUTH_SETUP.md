# Google OAuth 2.0 + Calendar & Tasks API 設定ガイド

このガイドでは、アプリケーションでGoogle認証、Googleカレンダー API、Google Tasks APIを使用するための設定手順を説明します。

## 📋 前提条件

- Googleアカウント
- Google Cloud Consoleへのアクセス

## 🔧 Google Cloud Consoleでの設定

### 1. プロジェクトの作成

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. 画面上部の「プロジェクトを選択」→「新しいプロジェクト」をクリック
3. プロジェクト名を入力（例: `niyu07-Platform`）
4. 「作成」をクリック

### 2. APIの有効化

1. 左側のメニューから「APIとサービス」→「ライブラリ」を選択
2. 以下のAPIを検索して有効化：
   - **Google Calendar API** - ポモドーロセッションのカレンダー同期用
   - **Google Tasks API** - タスク管理との統合用
   - **Google+ API** - ユーザー情報取得用

### 3. OAuth同意画面の設定

1. 左側のメニューから「APIとサービス」→「OAuth同意画面」を選択
2. ユーザータイプで「外部」を選択→「作成」
3. 必須項目を入力：
   - **アプリ名**: `Pomodoro Tracker`
   - **ユーザーサポートメール**: 自分のメールアドレス
   - **デベロッパーの連絡先情報**: 自分のメールアドレス
4. 「保存して次へ」をクリック

#### スコープの追加

1. 「スコープを追加または削除」をクリック
2. 以下のスコープを追加：
   ```
   .../auth/userinfo.email
   .../auth/userinfo.profile
   .../auth/calendar
   .../auth/calendar.events
   .../auth/tasks
   .../auth/tasks.readonly
   ```
3. 「保存して次へ」をクリック

#### テストユーザーの追加

1. 「テストユーザーを追加」をクリック
2. 自分のGoogleアカウントのメールアドレスを追加
3. 「保存して次へ」をクリック

### 4. OAuth 2.0 クライアントIDの作成

1. 左側のメニューから「APIとサービス」→「認証情報」を選択
2. 「認証情報を作成」→「OAuth クライアント ID」を選択
3. アプリケーションの種類で「ウェブアプリケーション」を選択
4. 以下を設定：
   - **名前**: `niyu07-Platform-niyu`
   - **承認済みのリダイレクトURI**:
     ```
     http://localhost:3000/api/auth/callback/google
     https://your-domain.com/api/auth/callback/google
     ```
5. 「作成」をクリック

### 5. クライアントIDとシークレットを取得

1. 作成されたOAuth 2.0クライアントの詳細が表示されます
2. **クライアントID**と**クライアントシークレット**をコピー
3. これらの値を`.env`ファイルに設定します

## 🔐 環境変数の設定

プロジェクトのルートディレクトリにある`.env`ファイルを編集：

```env
# Google OAuth
GOOGLE_CLIENT_ID="あなたのクライアントID"
GOOGLE_CLIENT_SECRET="あなたのクライアントシークレット"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="既に生成済みのシークレット"

# Database
DATABASE_URL="postgresql://..."
```

## ✅ 動作確認

### 1. アプリケーションを起動

```bash
npm run dev
```

### 2. ログインをテスト

1. ブラウザで http://localhost:3000/auth/signin にアクセス
2. 「Googleでログイン」ボタンをクリック
3. Googleアカウントでログイン
4. 権限の承認画面が表示されたら、すべて許可

### 3. カレンダー同期をテスト

1. ポモドーロタイマーを開始
2. セッションを完了
3. Googleカレンダーを確認し、イベントが追加されているか確認

## 🚀 本番環境へのデプロイ

### 1. OAuth同意画面を公開

開発中は「テスト」モードですが、本番公開時は：

1. OAuth同意画面で「アプリを公開」をクリック
2. Googleの審査が必要な場合があります

### 2. 本番URLを追加

1. OAuth 2.0クライアントIDの設定に戻る
2. 承認済みのリダイレクトURIに本番URLを追加：
   ```
   https://your-production-domain.com/api/auth/callback/google
   ```

### 3. 環境変数を更新

本番環境の`.env`ファイルで`NEXTAUTH_URL`を更新：

```env
NEXTAUTH_URL="https://your-production-domain.com"
```

## 📝 トラブルシューティング

### エラー: "redirect_uri_mismatch"

→ OAuth 2.0クライアントIDの「承認済みのリダイレクトURI」を確認し、正しいURLが登録されているか確認してください。

### エラー: "access_denied"

→ OAuth同意画面でテストユーザーとして登録されているか確認してください。

### カレンダーAPIエラー

→ Google Calendar APIが有効化されているか確認してください。

## 🔗 参考リンク

- [Google Cloud Console](https://console.cloud.google.com/)
- [Google Calendar API Documentation](https://developers.google.com/calendar/api/guides/overview)
- [NextAuth.js Documentation](https://next-auth.js.org/)
