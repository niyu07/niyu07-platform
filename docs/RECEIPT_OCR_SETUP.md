# レシートOCR機能セットアップガイド

このドキュメントでは、レシート画像からOCR処理を行い、取引データを自動抽出する機能のセットアップ方法を説明します。

## 概要

この機能は以下の技術スタックを使用しています:

- **データベーススキーマ**: `receipts`テーブル（レシート画像とメタデータ）、`receipt_ocr_data`テーブル（OCR結果の構造化データ）
- **OCRエンジン**: Google Cloud Vision API
- **処理方式**: 同期処理（画像アップロード時に即座にOCR実行）

## 前提条件

- Google Cloud Platformアカウント
- プロジェクトの作成とBilling（課金）の有効化
- Node.js 18以上

## セットアップ手順

### 1. Google Cloud Vision APIの有効化

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. プロジェクトを選択（または新規作成）"niyu07-platform-ocr"
3. [Cloud Vision API](https://console.cloud.google.com/apis/library/vision.googleapis.com)を有効化

### 2. 認証情報の設定

#### 方法A: サービスアカウントキーを使用（推奨）

1. Google Cloud Consoleで「APIとサービス」→「認証情報」に移動
2. 「認証情報を作成」→「サービスアカウント」を選択
3. サービスアカウント名を入力（例: `receipt-ocr-service`）
4. ロールで「Cloud Vision API ユーザー」を付与
5. 「キーを作成」→「JSON」を選択してダウンロード
6. ダウンロードしたJSONファイルを `credentials/google-cloud-key.json` として配置

```bash
# プロジェクトルートに配置
/Users/niyu/dev/niyu07-platform/credentials/google-cloud-key.json
```

**環境変数の設定（.env）:**

```bash
GOOGLE_APPLICATION_CREDENTIALS="./credentials/google-cloud-key.json"
```

**注意**: `credentials/` ディレクトリは既に `.gitignore` に追加されているため、JSONキーファイルがGitにコミットされることはありません。

#### 方法B: APIキーを使用（シンプルだが制限あり）

1. Google Cloud Consoleで「APIとサービス」→「認証情報」に移動
2. 「認証情報を作成」→「APIキー」を選択
3. 作成されたAPIキーをコピー
4. （推奨）APIキーの制限を設定:
   - アプリケーションの制限: HTTPリファラー（Webサイト）またはIPアドレス
   - API制限: Cloud Vision API

**環境変数の設定（.env）:**

```bash
GOOGLE_CLOUD_VISION_API_KEY="your-api-key-here"
```

**注意**: APIキーを使用する場合、[src/app/api/receipts/ocr/route.ts](../src/app/api/receipts/ocr/route.ts)のVision APIクライアント初期化部分を以下のように修正してください:

```typescript
const visionClient = new vision.ImageAnnotatorClient({
  apiKey: process.env.GOOGLE_CLOUD_VISION_API_KEY,
});
```

### 3. データベースマイグレーション

既にマイグレーションは実行済みです。もし再実行が必要な場合:

```bash
npx prisma migrate dev
```

### 4. パッケージのインストール確認

```bash
npm install @google-cloud/vision
```

## 使用方法

### APIエンドポイント

#### 1. OCR処理の実行

**POST** `/api/receipts/ocr`

レシート画像に対してOCR処理を実行し、構造化データを抽出します。

**リクエストボディ:**

```json
{
  "receiptId": "cuid-of-receipt",
  "imageUrl": "https://storage.example.com/receipts/image.jpg"
}
```

**レスポンス (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "ocr-data-id",
    "receiptId": "receipt-id",
    "storeName": "コンビニA",
    "transactionDate": "2024-01-15T00:00:00.000Z",
    "totalAmount": 1580,
    "taxAmount": 116,
    "paymentMethod": "現金",
    "items": [
      {
        "name": "おにぎり",
        "price": 120
      },
      {
        "name": "お茶",
        "price": 150
      }
    ],
    "rawText": "全OCRテキスト...",
    "confidence": 0.8,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### 2. OCR結果の取得

**GET** `/api/receipts/ocr?receiptId=xxx`

既に処理済みのOCR結果を取得します。

**レスポンス (200 OK):**

```json
{
  "id": "ocr-data-id",
  "receiptId": "receipt-id",
  "storeName": "コンビニA",
  "transactionDate": "2024-01-15T00:00:00.000Z",
  "totalAmount": 1580,
  "taxAmount": 116,
  "paymentMethod": "現金",
  "items": [...],
  "rawText": "...",
  "confidence": 0.8,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### データベーススキーマ

#### Receiptテーブル

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

#### ReceiptOcrDataテーブル

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

  receipt Receipt @relation(...)
}
```

## OCRテキスト解析について

現在の実装は日本語レシートに特化した**簡易的なパーサー**です。以下の情報を抽出します:

- **店舗名**: 最初の非空行を店舗名として推定
- **取引日**: 日付パターン（YYYY/MM/DD、YYYY-MM-DD、YYYY年MM月DD日など）を検索
- **合計金額**: 「合計」「小計」「お会計」などのキーワード後の金額を抽出
- **消費税額**: 「消費税」「税額」などのキーワード後の金額を抽出
- **支払い方法**: 「現金」「クレジット」「電子マネー」などのキーワードを検索
- **品目リスト**: 金額が含まれる行を品目として扱う（簡易実装）

### 解析精度の向上方法

本番環境でより高度な解析が必要な場合、以下の方法を検討してください:

1. **自然言語処理（NLP）の活用**
   - 形態素解析（例: MeCab, Kuromoji）
   - 固有表現抽出（NER）

2. **機械学習モデルの導入**
   - レシート専用のカスタムMLモデルをトレーニング
   - Google Cloud AutoML Visionの活用

3. **商用OCRサービスの検討**
   - Amazon Textract
   - Azure Form Recognizer（レシート認識機能あり）

4. **ルールベースの強化**
   - より多様なレシートフォーマットに対応したパターンマッチング
   - 店舗ごとのフォーマット学習

## セキュリティとコスト

### セキュリティ

- サービスアカウントキーはGitにコミットしない（.gitignoreに追加）
- 本番環境では環境変数やシークレット管理サービス（AWS Secrets Manager、Google Secret Managerなど）を使用
- APIキーには必ず制限を設定

### コスト

Google Cloud Vision APIの料金（2024年1月時点）:

- **テキスト検出**: 月1,000ユニットまで無料、それ以降は1,000ユニットあたり$1.50
- 1リクエスト = 1ユニット

詳細は[公式料金ページ](https://cloud.google.com/vision/pricing)を参照してください。

## トラブルシューティング

### エラー: "Application Default Credentials are not available"

→ `GOOGLE_APPLICATION_CREDENTIALS`環境変数が正しく設定されているか確認してください。

### エラー: "Permission denied"

→ サービスアカウントに「Cloud Vision API ユーザー」ロールが付与されているか確認してください。

### OCR結果が不正確

→ 画像の品質を確認してください。明るさ、解像度、角度などがOCR精度に影響します。

### 型エラー: "Type 'OcrItem[]' is not assignable to type..."

→ 既に`as unknown as`キャストで対応済みです。Prismaの`Json`型との互換性の問題です。

## 次のステップ

1. **レシート画像アップロード機能の実装**
   - Supabase Storageまたは別のストレージサービスとの統合
   - 画像アップロードAPI（POST /api/receipts）の実装

2. **フロントエンド実装**
   - レシート画像アップロードUI
   - OCR結果の表示・編集画面
   - 取引データへの自動変換機能

3. **非同期処理への移行（オプション）**
   - バックグラウンドジョブキュー（BullMQ、AWS SQSなど）の導入
   - Webhook/ポーリングによる結果取得

4. **解析精度の改善**
   - より高度なテキスト解析アルゴリズムの実装
   - ユーザーフィードバックを活用した学習機能

## 参考リンク

- [Google Cloud Vision API ドキュメント](https://cloud.google.com/vision/docs)
- [Prisma JSON型のドキュメント](https://www.prisma.io/docs/concepts/components/prisma-schema/data-model#json)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
