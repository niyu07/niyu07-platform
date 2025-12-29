# Google Tasks API テストガイド

## テスト準備

開発サーバーが起動していることを確認してください:
```bash
npm run dev
# http://localhost:3000
```

## テスト手順

### 1. 認証確認

1. ブラウザで http://localhost:3000 にアクセス
2. Googleアカウントでログイン
3. Google Tasks APIのスコープが許可されていることを確認

### 2. タスクAPI動作確認

以下のAPIエンドポイントをテストします:

#### A. タスクリスト取得
```bash
curl -X GET http://localhost:3000/api/tasks \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

期待される結果:
```json
{
  "taskLists": [
    {
      "id": "...",
      "title": "マイタスク"
    }
  ]
}
```

#### B. すべてのタスク取得
```bash
curl -X GET "http://localhost:3000/api/tasks?all=true" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

期待される結果:
```json
{
  "tasks": [
    {
      "id": "...",
      "title": "タスク名",
      "status": "needsAction",
      "taskListId": "...",
      "taskListTitle": "マイタスク"
    }
  ]
}
```

#### C. タスク作成
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "title": "テストタスク",
    "notes": "これはテストです",
    "due": "2025-12-31T00:00:00.000Z"
  }'
```

期待される結果:
```json
{
  "task": {
    "id": "...",
    "title": "テストタスク",
    "notes": "これはテストです",
    "status": "needsAction"
  }
}
```

#### D. タスク更新
```bash
curl -X PUT http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "taskId": "YOUR_TASK_ID",
    "title": "更新されたタスク",
    "status": "needsAction"
  }'
```

#### E. タスク完了
```bash
curl -X PATCH http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "taskId": "YOUR_TASK_ID"
  }'
```

#### F. タスク削除
```bash
curl -X DELETE "http://localhost:3000/api/tasks?taskId=YOUR_TASK_ID" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

期待される結果:
```json
{
  "success": true
}
```

### 3. フロントエンドテスト（次のステップ）

タスクページ (http://localhost:3000/tasks) にアクセスして、UIから以下を確認:

- [ ] タスク一覧が表示される
- [ ] 新規タスクを作成できる
- [ ] タスクを編集できる
- [ ] タスクを完了できる
- [ ] タスクを削除できる
- [ ] カンバンビュー・リストビュー・カレンダービューが動作する

## 既知の問題

現在、タスクページはまだモックデータを使用しています。次のステップで `useGoogleTasks` フックと連携させる必要があります。

## 次のステップ

1. タスクページ ([src/app/tasks/page.tsx](src/app/tasks/page.tsx)) を更新
2. モックデータ (`mockTaskManagementData`) を削除
3. `useGoogleTasks` フックを使用するように変更
4. Google Tasksのデータ構造とアプリの型定義を調整

## トラブルシューティング

### エラー: "Google認証情報が見つかりません"
- ログインしているか確認
- Google OAuth設定が正しいか確認
- `.env`ファイルに`GOOGLE_CLIENT_ID`と`GOOGLE_CLIENT_SECRET`が設定されているか確認

### エラー: "Failed to fetch tasks"
- Google Tasks APIが有効になっているか確認（Google Cloud Console）
- 認証スコープに`https://www.googleapis.com/auth/tasks`が含まれているか確認
- データベースにアクセストークンが保存されているか確認

### エラー: 401 Unauthorized
- セッションが有効か確認
- 再ログインしてみる
