# Supabase Storage セットアップガイド

領収書・請求書のファイルアップロード機能を使用するには、Supabaseのストレージを設定する必要があります。

## 1. Supabaseプロジェクトの設定

### 1.1 Supabaseにログイン

https://supabase.com にアクセスして、既存のプロジェクトを開きます。

### 1.2 API情報を取得

1. 左サイドバーから「Project Settings」→「API」を選択
2. 以下の情報をコピー:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` キー → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 1.3 環境変数を設定

`.env`ファイルに以下を追加:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

## 2. Storage バケットの作成

### 2.1 バケットを作成

1. 左サイドバーから「Storage」を選択
2. 「Create a new bucket」をクリック
3. 以下の設定でバケットを作成:
   - **Name**: `receipts`
   - **Public bucket**: オフ(プライベート)
   - 「Create bucket」をクリック

### 2.2 RLS (Row Level Security) ポリシーの設定

**重要**: 現在の実装ではNextAuthを使用しているため、Supabaseの認証(`auth.uid()`)は使えません。
以下の2つの方法から選択してください:

#### 方法A: 全てのアクセスを許可(開発環境向け)

最もシンプルな方法です。開発環境やサーバーサイドで適切なアクセス制御を行う場合に使用します。

1. 作成した `receipts` バケットを選択
2. 「Policies」タブを選択
3. 「New Policy」をクリック

##### ポリシー1: 全アクセス許可(開発用)

```sql
-- ポリシー名: Allow all operations for development
-- 操作: All (SELECT, INSERT, UPDATE, DELETE)
-- ターゲットロール: anon, authenticated

-- 条件式:
bucket_id = 'receipts'
```

この設定により、anon keyを使って全ての操作が可能になります。
サーバーサイド(APIルート)でアクセス制御を行うため、セキュリティは保たれます。

#### 方法B: Supabase Authと統合(本番環境向け)

より厳格なセキュリティが必要な場合は、NextAuthとSupabase Authを統合します。

##### ポリシー1: アップロード許可(INSERT)

```sql
-- ポリシー名: Enable insert for authenticated users
-- 操作: INSERT
-- ターゲットロール: authenticated

-- 条件式:
bucket_id = 'receipts' AND (auth.uid())::text = (storage.foldername(name))[1]
```

##### ポリシー2: 読み取り許可(SELECT)

```sql
-- ポリシー名: Enable read for authenticated users
-- 操作: SELECT
-- ターゲットロール: authenticated

-- 条件式:
bucket_id = 'receipts' AND (auth.uid())::text = (storage.foldername(name))[1]
```

##### ポリシー3: 削除許可(DELETE)

```sql
-- ポリシー名: Enable delete for authenticated users
-- 操作: DELETE
-- ターゲットロール: authenticated

-- 条件式:
bucket_id = 'receipts' AND (auth.uid())::text = (storage.foldername(name))[1]
```

ただし、この方法を使うには追加の実装が必要です(後述)。

## 3. 認証の設定(オプション)

現在、NextAuthを使用しているため、SupabaseのJWT認証と統合する場合は追加の設定が必要です。

### 簡易的な方法

開発環境では、Supabase Storage APIを直接使用し、サーバーサイドでファイル操作を行うことで、RLSを回避できます。
現在の実装では、この方法を採用しています。

### 本番環境での推奨

本番環境では、以下のいずれかを検討してください:

1. **NextAuthとSupabase Authの統合**
   - SupabaseのJWTトークンを使用してRLSを活用

2. **サービスロールキーの使用**
   - サーバーサイドのみでファイル操作を行う
   - より厳格なアクセス制御を実装

## 4. 動作確認

### 4.1 アプリケーションを起動

```bash
npm run dev
```

### 4.2 ファイルアップロードをテスト

1. 会計管理ページ(`/accounting`)にアクセス
2. 取引を登録する際に、領収書・請求書のファイルを選択
3. ドラッグ&ドロップまたはクリックでファイルを選択
4. フォームを送信

### 4.3 Supabaseで確認

1. Supabase管理画面の「Storage」→「receipts」を開く
2. `userId/transactionId/filename`の形式でファイルが保存されているか確認

## 5. ストレージ構造

ファイルは以下の構造で保存されます:

```
receipts/
├── user@example.com/
│   ├── transaction-id-1/
│   │   ├── 1704067200000_receipt.pdf
│   │   └── 1704067300000_invoice.jpg
│   └── transaction-id-2/
│       └── 1704067400000_receipt.png
└── another-user@example.com/
    └── ...
```

## 6. 制限事項

- **ファイルサイズ**: 最大5MB
- **対応形式**: PDF, JPG, PNG
- **バケット容量**: Supabaseの無料プランでは1GB

## 7. トラブルシューティング

### エラー: "Missing env.NEXT_PUBLIC_SUPABASE_URL"

→ 環境変数が設定されていません。`.env`ファイルを確認してください。

### エラー: "new row violates row-level security policy"

→ RLSポリシーの設定を確認してください。

### ファイルのアップロードが失敗する

→ ブラウザのコンソールでエラーメッセージを確認してください。

## 8. 参考リンク

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Policies](https://supabase.com/docs/guides/storage/security/access-control)
