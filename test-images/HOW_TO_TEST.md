# OCR機能のテスト方法

## 実際のレシート画像でテストする（推奨）

1. **スマホでレシートを撮影**
   - iPhoneのカメラで撮影（HEIC形式）
   - Androidのカメラで撮影（JPG形式）

2. **このディレクトリに画像を配置**
   ```bash
   # 例: AirDropやUSBケーブルで転送
   # test-images/my-receipt.jpg
   ```

3. **テストを実行**
   ```bash
   npx tsx scripts/test-ocr.ts ./test-images/my-receipt.jpg
   ```

## スクリーンショットでテストする

レシート画像がない場合、テキストのスクリーンショットでもテストできます：

1. メモ帳やテキストエディタで以下のような内容を入力:
   ```
   ABC Store
   123 Main Street
   
   Coffee         $3.50
   Sandwich       $7.99
   Cookie         $2.00
   
   Total         $13.49
   
   2024-01-09 14:30
   ```

2. そのテキストのスクリーンショットを撮影

3. スクリーンショットをこのディレクトリに保存

4. テストを実行

## オンラインのレシート画像を使用

公開されているレシート画像のURLを使用することもできます:

```bash
# 例（URLは自分で見つける必要があります）
npx tsx scripts/test-ocr.ts https://example.com/receipt.jpg
```

## トラブルシューティング

### エラー: "Bad image data"
- 画像ファイルが破損している
- PDFが処理できない形式
→ JPGまたはPNG形式の画像を使用してください

### エラー: "No text detected"
- 画像にテキストが含まれていない
- 画像が不鮮明すぎる
→ より鮮明な画像を使用してください

### 成功例
正しく動作すると、以下のように表示されます:

```
🔍 Google Cloud Vision API OCRテスト開始

📄 画像: ./test-images/receipt.jpg

✅ 認証情報を確認中...
   プロジェクトID: niyu07-platform-ocr

📋 ファイル形式: JPG

   サイズ: 234.56 KB

🤖 OCR処理を実行中...
✅ OCR処理完了

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 抽出されたテキスト:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ABC Store
123 Main Street
Coffee $3.50
Sandwich $7.99
...
```
