# Google認証トラブルシューティングガイド

## 概要

このガイドは、Google OAuth認証で発生する `invalid_grant` エラーやトークン更新の問題を解決するための手順を説明します。

## 主な問題と原因

### 1. `invalid_grant` エラー

**原因:**

- リフレッシュトークンの有効期限切れ（6ヶ月間使用されなかった場合）
- ユーザーがGoogle側でアプリのアクセス権を取り消した
- パスワード変更やセキュリティイベントによるトークンの無効化
- OAuth認証フローの途中でタイムアウトが発生

**症状:**

```
❌ トークンリフレッシュエラー: Error: invalid_grant
```

### 2. OAuth Callback Timeout

**原因:**

- デフォルトのHTTPタイムアウト（3500ms）が短すぎる
- ネットワークの遅延

**症状:**

```
[next-auth][error][OAUTH_CALLBACK_ERROR]
outgoing request timed out after 3500ms
```

## 実装した解決策

### 1. 自動トークンクリーンアップ

無効なリフレッシュトークンを検出した場合、自動的にデータベースから削除します。

- [src/lib/google-calendar.ts](src/lib/google-calendar.ts#L46-L67)
- [src/lib/google-tasks.ts](src/lib/google-tasks.ts#L46-L67)

```typescript
catch (error: any) {
  if (error?.message?.includes('invalid_grant') || error?.code === 400) {
    // 無効なトークンを削除
    await prisma.account.delete({ where: { id: account.id } });
    throw new Error('Google認証トークンが無効になりました。再度ログインしてください。');
  }
}
```

### 2. 認証状態チェック機能

新しいユーティリティ関数とAPIエンドポイントを追加しました。

- [src/lib/google-auth.ts](src/lib/google-auth.ts) - ユーティリティ関数
- [src/app/api/auth/google-status/route.ts](src/app/api/auth/google-status/route.ts) - APIエンドポイント

**使用例:**

```typescript
// 認証状態を確認
const status = await checkGoogleAuthStatus(userId);

// 無効なトークンをクリア
await clearInvalidGoogleAuth(userId);

// 有効性を確保（無効な場合は自動クリア）
await ensureValidGoogleAuth(userId);
```

### 3. HTTPタイムアウトの延長

OAuth認証のタイムアウトを3500ms → 10000msに延長しました。

- [src/lib/auth.ts](src/lib/auth.ts#L31-L33)

```typescript
httpOptions: {
  timeout: 10000,
}
```

## APIエンドポイント

### GET `/api/auth/google-status`

現在のGoogle認証状態を確認します。

**レスポンス例:**

```json
{
  "isAuthenticated": true,
  "hasRefreshToken": true,
  "message": "Google認証は有効です"
}
```

または

```json
{
  "isAuthenticated": false,
  "hasRefreshToken": true,
  "isTokenInvalid": true,
  "message": "リフレッシュトークンが無効です。再認証が必要です。"
}
```

### DELETE `/api/auth/google-status`

無効なGoogle認証情報をデータベースから削除します。

**レスポンス例:**

```json
{
  "success": true,
  "message": "Google認証情報を削除しました"
}
```

## ユーザー向けの対処方法

### エラーが発生した場合

1. **サインアウト**: 現在のセッションからログアウトします
2. **再認証**: Googleアカウントで再度サインインします
3. **権限の確認**: Google Calendar、Google Tasksへのアクセス許可を確認します

### 予防策

- 定期的にアプリケーションを使用する（6ヶ月以上放置しない）
- Googleアカウントのセキュリティ設定でアプリの権限を確認する

## 開発者向けの注意事項

### デバッグモード

開発環境では自動的にデバッグモードが有効になります。

```typescript
debug: process.env.NODE_ENV === 'development',
```

### トークン更新のログ

トークン更新時に以下のログが出力されます：

```
🔄 Refreshing Google tokens...
✅ [操作完了メッセージ]
❌ [エラーメッセージ]
⚠️ リフレッシュトークンが無効です。アカウント情報をクリアします。
```

### エラーハンドリング

すべてのGoogle API呼び出しで適切なエラーハンドリングを実装しています：

1. トークン更新エラーのキャッチ
2. `invalid_grant` の特別処理
3. データベースのクリーンアップ
4. ユーザーへの明確なエラーメッセージ

## Google Cloud Console設定

### 必要なスコープ

```
openid
email
profile
https://www.googleapis.com/auth/calendar
https://www.googleapis.com/auth/calendar.events
https://www.googleapis.com/auth/tasks
https://www.googleapis.com/auth/tasks.readonly
```

### OAuth同意画面

- **アクセスタイプ**: `offline`
- **プロンプト**: `consent`（毎回同意画面を表示してリフレッシュトークンを確実に取得）

## 参考リンク

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Google API Client Library](https://github.com/googleapis/google-api-nodejs-client)

## まとめ

この実装により、以下の改善が実現されました：

1. ✅ 無効なトークンの自動検出と削除
2. ✅ 認証状態の確認機能
3. ✅ HTTPタイムアウトの延長によるエラー削減
4. ✅ より明確なエラーメッセージ
5. ✅ デバッグモードによる問題の可視化

ユーザーは無効な認証情報が原因でエラーが発生した場合、自動的にクリーンアップされ、再ログインを促されます。
