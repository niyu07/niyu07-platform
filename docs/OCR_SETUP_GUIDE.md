# レシートOCR機能 セットアップガイド

## 📋 概要

このガイドでは、Google Cloud Vision APIを使用したレシートOCR機能のセットアップ方法と使い方を説明します。

## ✅ 実装済み機能

### 1. **データベーススキーマ**
- ✅ `receipts` テーブル（レシート画像とメタデータ）
- ✅ `receipt_ocr_data` テーブル（OCR結果の構造化データ）
- ✅ `api_usage_logs` テーブル（API使用量の追跡）

### 2. **API使用量管理システム**
- ✅ 月間使用量の自動追跡
- ✅ 上限チェック（デフォルト: 900回/月）
- ✅ 超過時の自動ブロック
- ✅ ユーザーごとの使用状況表示

### 3. **APIエンドポイント**
- ✅ `POST /api/receipts/upload` - レシート画像アップロード
- ✅ `GET /api/receipts/upload` - レシート一覧取得
- ✅ `DELETE /api/receipts/upload` - レシート削除
- ✅ `POST /api/receipts/ocr` - OCR処理実行
- ✅ `GET /api/receipts/ocr` - OCR結果取得

### 4. **フロントエンドコンポーネント**
- ✅ `ReceiptOcrUploader` - レシート撮影・OCR処理UI
- ✅ 使用状況プログレスバー
- ✅ OCR結果の視覚的表示

---

## 🚀 セットアップ手順

### ステップ1: Google Cloud Vision APIの有効化

#### 1-1. 課金を有効化

**重要**: 課金を有効化しても、無料枠内（月1,000回）なら料金は発生しません。

1. 以下のURLにアクセス:
   ```
   https://console.developers.google.com/billing/enable?project=871871079618
   ```

2. クレジットカード情報を登録
   - 無料枠を超えない限り請求されません
   - アプリ側で月900回に制限済み（安全マージン100回）

#### 1-2. Cloud Vision APIを有効化

1. 課金有効化後、以下のURLにアクセス:
   ```
   https://console.cloud.google.com/apis/library/vision.googleapis.com?project=niyu07-platform-ocr
   ```

2. 「有効にする」ボタンをクリック

### ステップ2: テスト実行

OCRテストスクリプトで動作確認:

```bash
# テスト方法1: ローカルの画像ファイルを使用（推奨）
npx tsx scripts/test-ocr.ts ./test-images/your-receipt.jpg

# テスト方法2: URL指定
# 注意: スクリプトは自動的に画像をダウンロードしてからOCR処理を行います
npx tsx scripts/test-ocr.ts https://example.com/receipt.jpg
```

**サポートされているファイル形式**:

- **標準画像**: JPG, JPEG, PNG, GIF, BMP, WEBP, TIFF（推奨）
- **iOS画像**: HEIC, HEIF（自動変換を試みますが、変換ライブラリの制限あり）
- **ドキュメント**: PDF（複数ページ対応、一部制限あり）
- **RAW画像**: RAW, ICO

スクリプトは自動的にファイル形式を検出し、適切なOCR処理を実行します。

**iOS（iPhone）ユーザーへの注意**:

HEIC形式は自動変換を試みますが、環境によっては失敗する場合があります。
確実にテストするには以下の方法をおすすめします:

1. **iPhoneの設定を変更**（推奨）
   - 設定 > カメラ > フォーマット > 「互換性優先」を選択
   - これにより、写真が自動的にJPG形式で保存されます

2. **撮影後に変換**
   - 写真アプリで画像を開く > 共有 > 「画像を保存」でJPG形式で保存
   - または、オンライン変換ツールを使用

**重要**:

- URLから直接OCR処理すると、Google Vision APIがアクセスできない場合があります
- 改善されたスクリプトは自動的に画像をダウンロードしてバイナリデータとして送信します
- Wikimedia等の一部サイトはレート制限やUser-Agent要件がある場合があります
- 実際のレシート画像（スマホで撮影したもの）を使用してテストすることを推奨します

成功すると以下のように表示されます:
```
✅ テスト成功！Google Cloud Vision APIは正常に動作しています。
```

### ステップ3: アプリケーションで使用

会計管理ページ（`/accounting`）に `ReceiptOcrUploader` コンポーネントを追加:

```tsx
import ReceiptOcrUploader from './components/ReceiptOcrUploader';

// 使用例
<ReceiptOcrUploader
  onOcrSuccess={(ocrData) => {
    // OCR結果を取引フォームに自動入力
    setDetail(ocrData.storeName || '');
    setAmount(ocrData.totalAmount?.toString() || '');
    setDate(ocrData.transactionDate || new Date().toISOString().split('T')[0]);
  }}
/>
```

---

## 💰 料金について

### 無料枠
- **月1,000ユニット（1,000回）まで完全無料**
- レシートOCR 1回 = 1ユニット

### 有料（無料枠超過時）
- 1,001〜5,000,000ユニット: $1.50/1,000ユニット
- 参考: [Google Cloud Vision API 料金](https://cloud.google.com/vision/pricing)

### アプリ側の制限
- **月間上限: 900回**（安全マージン100回）
- 上限に達すると自動的にOCR処理をブロック
- 翌月1日に自動リセット

---

## 🛡️ 使用量管理

### データベースで追跡

`api_usage_logs` テーブルで以下を管理:
- ユーザーごとの使用回数
- 月ごとの集計
- 使用上限の設定

### 使用状況の確認

```typescript
import { getUsage } from '@/lib/api-usage';

const usage = await getUsage(userId, 'vision');
console.log(`今月の使用回数: ${usage.count} / ${usage.limit}`);
console.log(`残り: ${usage.remaining} 回`);
console.log(`使用率: ${usage.percentage}%`);
```

### 使用上限の変更

```typescript
import { updateUsageLimit } from '@/lib/api-usage';

// 上限を800回に変更
await updateUsageLimit(userId, 'vision', 800);
```

---

## 📊 OCR処理フロー

```
1. ユーザーがレシート画像を撮影/アップロード
   ↓
2. POST /api/receipts/upload
   - Supabase Storageに保存
   - Receiptレコード作成（status: 'pending'）
   - 使用可能回数をチェック
   ↓
3. POST /api/receipts/ocr
   - 使用量チェック（超過時は429エラー）
   - Google Cloud Vision APIでOCR実行
   - 使用量を1増加
   - OCR結果をパース
   - receipt_ocr_dataに保存
   - Receiptのstatusを'completed'に更新
   ↓
4. フロントエンドにOCR結果を返す
   - 店舗名
   - 取引日
   - 合計金額
   - 消費税額
   - 支払い方法
   - 品目リスト
```

---

## 🔧 トラブルシューティング

### エラー: "PERMISSION_DENIED"

**原因**: Cloud Vision APIが有効化されていない、または課金が無効

**解決策**:
1. 課金を有効化: https://console.developers.google.com/billing/enable?project=871871079618
2. APIを有効化: https://console.cloud.google.com/apis/library/vision.googleapis.com

### エラー: "API usage limit exceeded"

**原因**: 月間上限（900回）に達した

**解決策**:
- 翌月まで待つ、または
- 管理者が上限を引き上げる（データベースで変更可能）

### エラー: "No text detected in the image"

**原因**: 画像が不鮮明、またはテキストが含まれていない

**解決策**:
- 明るい場所で撮影
- レシート全体が写るように撮影
- ピントを合わせる

---

## 📈 今後の拡張案

### 1. **OCR精度の向上**
- AI/MLモデルによる後処理
- 日本語特化の正規表現改善
- 店舗名データベースとのマッチング

### 2. **自動仕訳機能**
- OCR結果から自動でカテゴリ分類
- 過去の取引履歴から学習

### 3. **バッチ処理**
- 複数レシートの一括アップロード
- バックグラウンドでOCR処理

### 4. **Google Cloudのクォータ管理**
- Google Cloud Consoleでの1日あたりの上限設定
- アラート通知の設定

---

## 📚 関連ファイル

### データベース
- `prisma/schema.prisma` - スキーマ定義
- `prisma/migrations/20260108040441_add_api_usage_logs/` - マイグレーション

### バックエンド
- `src/lib/api-usage.ts` - 使用量管理ユーティリティ
- `src/app/api/receipts/upload/route.ts` - レシートアップロードAPI
- `src/app/api/receipts/ocr/route.ts` - OCR処理API

### フロントエンド
- `src/app/accounting/components/ReceiptOcrUploader.tsx` - OCR UIコンポーネント

### テスト
- `scripts/test-ocr.ts` - OCRテストスクリプト

### ドキュメント
- `docs/RECEIPT_OCR_SETUP.md` - 初期設定ドキュメント
- `docs/OCR_SETUP_GUIDE.md` - このファイル

---

## ✨ 使い方の例

### 基本的な使い方

1. 会計管理ページ（`/accounting`）を開く
2. 「レシートを撮影してOCR処理」ボタンをクリック
3. レシート画像を選択
4. 自動的にOCR処理が実行される
5. 結果が表示される（店舗名、金額、日付など）
6. 必要に応じて結果を取引フォームに反映

### OCR結果の活用

```tsx
<ReceiptOcrUploader
  onOcrSuccess={(ocrData) => {
    // 店舗名 → 取引詳細
    if (ocrData.storeName) {
      setDetail(ocrData.storeName);
    }

    // 合計金額 → 金額フィールド
    if (ocrData.totalAmount) {
      setAmount(ocrData.totalAmount.toString());
    }

    // 取引日 → 日付フィールド
    if (ocrData.transactionDate) {
      setDate(ocrData.transactionDate);
    }

    // カテゴリを推測（例: コンビニなら「消耗品費」）
    if (ocrData.storeName?.includes('セブンイレブン')) {
      setCategory('消耗品費');
    }
  }}
/>
```

---

## 🔐 セキュリティ

### 認証情報の管理
- `credentials/google-cloud-key.json` は `.gitignore` に追加済み
- 環境変数 `GOOGLE_APPLICATION_CREDENTIALS` で参照

### アクセス制御
- すべてのAPIエンドポイントで認証チェック
- ユーザーは自分のレシートのみアクセス可能
- 所有権チェックを実施

---

## 📞 サポート

問題が発生した場合:
1. `scripts/test-ocr.ts` でAPI接続をテスト
2. ブラウザのコンソールでエラーを確認
3. サーバーログを確認（`console.log` の出力）

---

**最終更新**: 2026-01-08
