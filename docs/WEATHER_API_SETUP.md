# Weather API セットアップガイド

このガイドでは、OpenWeatherMap APIを使用して天気情報を取得するための設定方法を説明します。

## 1. OpenWeatherMap APIキーの取得

### 1.1 アカウント作成

1. [OpenWeatherMap](https://openweathermap.org/) にアクセス
2. 右上の「Sign In」をクリック
3. 「Create an Account」をクリックして新規登録
4. 必要事項を入力:
   - Username
   - Email
   - Password
5. 利用規約に同意して「Create Account」をクリック
6. 登録したメールアドレスに確認メールが届くので、リンクをクリックして認証

### 1.2 APIキーの取得

1. [OpenWeatherMap](https://openweathermap.org/) にログイン
2. 右上のユーザー名をクリックして「My API keys」を選択
3. デフォルトで「Default」という名前のAPIキーが作成されています
4. このAPIキーをコピー（または「Create Key」で新しいキーを作成）

**注意**: 新しいAPIキーは有効になるまで数時間かかる場合があります。

## 2. 環境変数の設定

### 2.1 .envファイルの作成

プロジェクトのルートディレクトリに `.env` ファイルを作成します（まだ存在しない場合）:

```bash
cp .env.example .env
```

### 2.2 APIキーの設定

`.env` ファイルを開き、以下の行を追加:

```env
OPENWEATHERMAP_API_KEY="your-api-key-here"
```

`your-api-key-here` を先ほどコピーしたAPIキーに置き換えてください。

## 3. APIの利用プラン

### 無料プラン (Free)

- **コスト**: 無料
- **リクエスト制限**: 60回/分、1,000,000回/月
- **利用可能な機能**:
  - 現在の天気
  - 5日間の天気予報（3時間ごと）
  - 天気アイコン

このアプリでは無料プランで十分に機能します。

### 有料プラン

より多くのリクエストや追加機能（16日間予報、時間ごとの予報など）が必要な場合は、[Pricing](https://openweathermap.org/price) をご確認ください。

## 4. 動作確認

### 4.1 開発サーバーの起動

```bash
npm run dev
```

### 4.2 天気ページにアクセス

ブラウザで以下のURLにアクセス:

```
http://localhost:3000/weather
```

### 4.3 動作確認のポイント

- 現在の天気情報が表示される
- 24時間の時間ごと予報が表示される
- 7日間の日別予報が表示される
- 地点を変更すると、その地点の天気が表示される

### 4.4 エラーが出る場合

もし天気情報が表示されない場合:

1. **APIキーが有効になっているか確認**
   - 新しいAPIキーは有効になるまで数時間かかる場合があります

2. **ブラウザのコンソールを確認**
   - F12キーを押して開発者ツールを開く
   - Console タブでエラーメッセージを確認

3. **APIキーを直接テスト**

   ブラウザで以下のURLにアクセス（YOUR_API_KEYを実際のキーに置き換え）:

   ```
   https://api.openweathermap.org/data/2.5/weather?q=Tokyo&appid=YOUR_API_KEY
   ```

   JSONレスポンスが返ってくれば、APIキーは正常に動作しています。

## 5. API エンドポイント

このアプリで使用しているAPIエンドポイント:

### 5.1 現在の天気

```
GET /api/weather/current?city=Tokyo
GET /api/weather/current?lat=35.6762&lon=139.6503
```

### 5.2 天気予報（5日間、3時間ごと）

```
GET /api/weather/forecast?city=Tokyo
GET /api/weather/forecast?lat=35.6762&lon=139.6503
```

### 5.3 日本の主要都市の天気

```
GET /api/weather/japan-cities
```

## 6. トラブルシューティング

### エラー: "OPENWEATHERMAP_API_KEY が設定されていません"

- `.env` ファイルが正しく作成されているか確認
- `OPENWEATHERMAP_API_KEY` が正しく設定されているか確認
- 開発サーバーを再起動

### エラー: "OpenWeatherMap API Error: 401"

- APIキーが正しくコピーされているか確認
- APIキーが有効になっているか確認（数時間待つ必要がある場合あり）

### エラー: "OpenWeatherMap API Error: 429"

- リクエスト制限を超えています
- 少し待ってから再度試してください
- 無料プランの場合: 60回/分、1,000,000回/月

## 7. 参考リンク

- [OpenWeatherMap API Documentation](https://openweathermap.org/api)
- [Current Weather API](https://openweathermap.org/current)
- [5 Day Forecast API](https://openweathermap.org/forecast5)
- [Weather Icons](https://openweathermap.org/weather-conditions)

## 8. セキュリティに関する注意

- `.env` ファイルは **絶対にGitにコミットしない** でください
- `.gitignore` に `.env` が含まれていることを確認してください
- APIキーを公開リポジトリに含めないように注意してください
