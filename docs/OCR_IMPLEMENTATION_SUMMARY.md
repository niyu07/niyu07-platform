# レシートOCR機能 実装完了サマリー

## ✅ 実装完了内容

### 1. データベーススキーマ（Prisma）

#### `receipts` テーブル

レシート画像とメタデータを管理

```prisma
model Receipt {
  id         String   @id @default(cuid())
  userId     String
  imageUrl   String
  uploadedAt DateTime @default(now())
  status     String   @default("pending") // 'pending' | 'processing' | 'completed' | 'failed'
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  user    User           @relation(...)
  ocrData ReceiptOcrData?
}
```

#### `receipt_ocr_data` テーブル

OCR結果の構造化データ

```prisma
model ReceiptOcrData {
  id              String    @id @default(cuid())
  receiptId       String    @unique
  storeName       String?
  transactionDate DateTime? @db.Date
  totalAmount     Int?
  taxAmount       Int?
  paymentMethod   String?
  items           Json      @default("[]")
  rawText         String?   @db.Text
  confidence      Float?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}
```

#### `api_usage_logs` テーブル

**無料枠管理の核心機能**

```prisma
model ApiUsageLog {
  id        String   @id @default(cuid())
  userId    String
  apiType   String   // 'vision' | 'calendar' | 'tasks' | 'gmail'
  month     String   // 'YYYY-MM'
  count     Int      @default(0)
  limit     Int      @default(900) // 月間上限（安全マージン込み）
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### 2. バックエンドAPI

#### `/api/receipts/upload` (POST/GET/DELETE)

- **POST**: レシート画像をSupabase Storageにアップロード
  - FormDataでファイルを受信
  - Receiptレコード作成
  - OCR使用可能回数を返す

- **GET**: ユーザーのレシート一覧を取得
  - OCR使用状況も含む

- **DELETE**: レシートを削除
  - Supabase Storageのファイルも削除
  - OCRデータも自動削除（Cascade）

#### `/api/receipts/ocr` (POST/GET)

- **POST**: Google Cloud Vision APIでOCR処理実行
  - **使用量チェック**: 上限超過時は429エラー
  - OCR実行成功後に使用量を増加
  - パース処理で構造化データに変換
  - データベースに保存

- **GET**: OCR結果を取得

### 3. 使用量管理ライブラリ (`src/lib/api-usage.ts`)

#### 主要関数

```typescript
// 使用量取得
getUsage(userId, 'vision')
→ { count, limit, remaining, isOverLimit, percentage }

// 使用量増加（上限チェック付き）
incrementUsage(userId, 'vision')
→ 上限超過時はError throw

// 使用可能かチェック
checkUsageLimit(userId, 'vision')
→ true/false

// すべてのAPI使用量取得
getAllUsage(userId)
→ { vision: {...}, calendar: {...}, ... }

// 上限変更
updateUsageLimit(userId, 'vision', 800)
```

### 4. フロントエンドコンポーネント

#### `ReceiptOcrUploader.tsx`

- レシート画像の選択・アップロード
- OCR処理の実行
- 使用状況のプログレスバー表示
- OCR結果の視覚的表示
- 親コンポーネントへのコールバック (`onOcrSuccess`)

**使用例:**

```tsx
<ReceiptOcrUploader
  onOcrSuccess={(ocrData) => {
    setDetail(ocrData.storeName || '');
    setAmount(ocrData.totalAmount?.toString() || '');
    setDate(ocrData.transactionDate || '');
  }}
/>
```

### 5. テストツール

#### `scripts/test-ocr.ts`

Google Cloud Vision APIの接続テスト

```bash
npx tsx scripts/test-ocr.ts <画像URL>
```

## 🛡️ 無料枠保護の仕組み

### 3段階の保護

#### レベル1: データベースレベル

- `api_usage_logs` で使用量を追跡
- 月ごとに自動リセット（`month`フィールド）
- デフォルト上限: 900回/月（100回の安全マージン）

#### レベル2: アプリケーションレベル

- OCR実行前に `getUsage()` でチェック
- 上限超過時は `429 Too Many Requests` エラー
- フロントエンドでボタンを無効化

#### レベル3: Google Cloudレベル（推奨）

- Google Cloud Consoleでクォータ設定
- 1日あたりの上限を設定可能
- 参考: [Capping API usage](https://docs.cloud.google.com/apis/docs/capping-api-usage)

## 📊 データフロー

```
1. ユーザーがレシート画像を選択
   ↓
2. POST /api/receipts/upload
   - Supabase Storageに保存
   - Receiptレコード作成
   - OCR使用可能回数を確認
   ↓
3. POST /api/receipts/ocr
   - 使用量チェック（超過時は即エラー）
   - Google Cloud Vision API呼び出し
   - 使用量を1増加 ← **重要: 成功後のみ増加**
   - テキスト解析・パース
   - ReceiptOcrDataに保存
   ↓
4. フロントエンドにOCR結果を返す
   - 店舗名、金額、日付などを表示
   - onOcrSuccess コールバックで親コンポーネントに通知
```

## 💰 料金管理

### Google Cloud Vision API料金

- **無料枠**: 月1,000ユニット（1,000回）
- **有料**: 1,001〜5,000,000ユニット = $1.50/1,000ユニット
- **レシートOCR**: 1回 = 1ユニット

### アプリ側の設定

- **デフォルト上限**: 900回/月
- **安全マージン**: 100回
- **カスタマイズ**: `updateUsageLimit()` で変更可能

### 料金発生を防ぐために

1. ✅ 課金を有効化しても、1,000回以内なら**料金は0円**
2. ✅ アプリ側で900回に制限済み
3. ✅ 超過時は自動的にブロック
4. ⚠️ さらに安全を期すなら、Google Cloud Consoleで1日33回（月990回）に制限

## 🚀 次のステップ（セットアップ手順）

### 1. Google Cloud Vision APIを有効化

#### 課金を有効化

```
https://console.developers.google.com/billing/enable?project=871871079618
```

※ クレジットカード登録が必要ですが、無料枠内なら請求されません

#### APIを有効化

```
https://console.cloud.google.com/apis/library/vision.googleapis.com?project=niyu07-platform-ocr
```

### 2. 動作テスト

```bash
npx tsx scripts/test-ocr.ts https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Sample_receipt.jpg/800px-Sample_receipt.jpg
```

成功すると:

```
✅ テスト成功！Google Cloud Vision APIは正常に動作しています。
```

### 3. UIに組み込む

会計管理ページ (`src/app/accounting/page.tsx`) に追加:

```tsx
import ReceiptOcrUploader from './components/ReceiptOcrUploader';

// 取引入力タブ内に追加
<ReceiptOcrUploader
  onOcrSuccess={(ocrData) => {
    // OCR結果を取引フォームに反映
    setDetail(ocrData.storeName || '');
    setAmount(ocrData.totalAmount?.toString() || '');
    setDate(ocrData.transactionDate || '');
  }}
/>;
```

## 📁 作成・更新ファイル一覧

### データベース

- `prisma/schema.prisma` - スキーマ更新
- `prisma/migrations/20260108040441_add_api_usage_logs/` - マイグレーション

### バックエンド

- `src/lib/api-usage.ts` - **NEW** 使用量管理
- `src/app/api/receipts/upload/route.ts` - **NEW** レシートアップロードAPI
- `src/app/api/receipts/ocr/route.ts` - **UPDATED** OCR処理API（使用量チェック追加）

### フロントエンド

- `src/app/accounting/components/ReceiptOcrUploader.tsx` - **NEW** OCR UIコンポーネント

### テスト・ドキュメント

- `scripts/test-ocr.ts` - **EXISTING** テストスクリプト
- `docs/RECEIPT_OCR_SETUP.md` - **EXISTING** 初期設定ドキュメント
- `docs/OCR_SETUP_GUIDE.md` - **NEW** セットアップガイド
- `docs/OCR_IMPLEMENTATION_SUMMARY.md` - **NEW** このファイル

## ✨ 実装のハイライト

### 1. **完全な無料枠保護**

- データベースで使用量を厳密に追跡
- 上限超過を3段階でブロック
- 月ごとの自動リセット

### 2. **ユーザーフレンドリー**

- リアルタイムの使用状況表示
- プログレスバーで視覚的に確認
- 上限に近づくと警告表示

### 3. **拡張性**

- 他のGoogle Cloud API（Calendar、Tasks、Gmail）にも対応可能
- `apiType` を変えるだけで使用量管理を共有

### 4. **堅牢性**

- エラーハンドリング完備
- トランザクション的な処理（成功時のみ使用量増加）
- ユーザー認証・所有権チェック

## 🎯 使用例シナリオ

### シナリオ1: 初回利用

1. ユーザーがレシートを撮影
2. 自動アップロード → OCR処理
3. 結果表示: 店舗名「セブンイレブン」、金額「1,200円」
4. ワンクリックで取引フォームに反映
5. 使用状況: 1/900回

### シナリオ2: 月末に上限接近

1. 使用状況: 895/900回（99%）
2. プログレスバーが赤色で警告
3. 「⚠️ 上限に近づいています」メッセージ
4. あと5回利用可能

### シナリオ3: 上限到達

1. 使用状況: 900/900回（100%）
2. OCRボタンが無効化
3. 「月間OCR処理上限に達しました。来月まで利用できません」
4. 翌月1日に自動リセット → 0/900回

## 📞 トラブルシューティング

### Q1: OCRボタンが押せない

**A**: 使用状況を確認してください。上限に達している場合は翌月まで待つか、管理者に上限引き上げを依頼してください。

### Q2: OCR精度が低い

**A**:

- 明るい場所で撮影
- レシート全体が写るように
- ピントを合わせる
- 可能な限り平らに配置

### Q3: 「PERMISSION_DENIED」エラー

**A**:

1. Google Cloud Consoleで課金を有効化
2. Cloud Vision APIを有効化
3. テストスクリプトで確認

## 🔮 今後の拡張アイデア

1. **自動カテゴリ分類**
   - 店舗名から自動で「消耗品費」「交通費」などを判定

2. **過去データからの学習**
   - ユーザーの過去の取引履歴からパターンを学習

3. **バッチ処理**
   - 複数レシートを一度にアップロード
   - バックグラウンドで順次処理

4. **AI補正**
   - Claude APIやGemini APIでOCR結果を補正
   - より高精度なデータ抽出

---

**実装完了日**: 2026-01-08
**ステータス**: ✅ 完了（Google Cloud課金有効化待ち）
**次のアクション**: Google Cloudで課金を有効化してテスト実行
