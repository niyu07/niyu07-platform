# Google API連携 - 作業メモ

## 現状分析

### 1. カレンダー（✅ 完了）
- **状態**: Google Calendar APIと連携済み
- **ファイル**:
  - `src/lib/google-calendar.ts` - API連携ロジック
  - `src/hooks/useGoogleCalendar.ts` - カスタムフック
  - `src/app/api/calendar/events/route.ts` - APIエンドポイント
- **機能**: イベント取得・作成・更新・削除が実装済み

### 2. タスク（TODO）（🔄 要対応）
- **状態**: モックデータ使用中
- **ファイル**: `src/app/tasks/page.tsx`
- **モックデータ**: `mockTaskManagementData` from `src/app/data/mockData`
- **必要な作業**:
  - [ ] Google Tasks APIの連携
  - [ ] タスクの取得・作成・更新・削除API実装
  - [ ] モックデータからGoogle Tasks APIへの移行

### 3. 天気（🔄 要対応）
- **状態**: モックデータ使用中
- **ファイル**: `src/app/weather/page.tsx`
- **モックデータ**:
  - `mockLocations`
  - `mockCurrentWeather`
  - `mockHourlyForecast`
  - `mockDailyForecast`
  - `mockCalendarEvents`
  - `mockSuggestions`
  - `mockWeatherAlerts`
- **必要な作業**:
  - [ ] OpenWeatherMap API または Google Weather APIの連携
  - [ ] 天気データ取得API実装
  - [ ] カレンダーイベントとの連携（既存機能）
  - [ ] モックデータから実APIへの移行

### 4. 勤怠管理（🔄 要対応）
- **状態**: モックデータ使用中
- **ファイル**: `src/app/attendance/page.tsx`
- **モックデータ**:
  - `mockAttendanceRecords`
  - `mockWorkLocations`
  - `mockCalendarEvents`
- **必要な作業**:
  - [ ] データベース（Prisma）への保存機能
  - [ ] Google Calendarとの連携強化（既に一部実装あり）
  - [ ] モックデータからDB保存への移行

### 5. 会計管理（🔄 要対応）
- **状態**: モックデータ使用中（コンポーネント内）
- **ファイル**: `src/app/accounting/page.tsx`
- **必要な作業**:
  - [ ] データベース（Prisma）への保存機能
  - [ ] 収支データの永続化
  - [ ] モックデータからDB保存への移行

---

## 実装優先順位

### Phase 1: タスク管理（Google Tasks API）
1. Google Tasks API認証設定
2. APIエンドポイント作成
3. フロントエンド連携
4. モックデータ削除

### Phase 2: 天気（Weather API）
1. Weather API選定（OpenWeatherMap推奨）
2. APIエンドポイント作成
3. フロントエンド連携
4. カレンダー連携テスト

### Phase 3: 勤怠・会計（データベース保存）
1. Prismaスキーマ拡張
2. API作成
3. フロントエンド連携
4. モックデータ削除

---

## 質問事項

### タスク管理について
- Google Tasks APIを使用する？それとも別のタスク管理API？
- Google Calendarのイベントとタスクの同期が必要？

### 天気APIについて
- OpenWeatherMap（無料プランあり）を使用する？
- 他の天気APIの希望は？

### 勤怠・会計について
- データベースに保存する形で問題ない？
- 外部サービス連携の希望は？（例: freee, Money Forward等）

---

## 実装決定事項

✅ **タスク管理**: Google Tasks API
✅ **天気情報**: OpenWeatherMap API
✅ **勤怠・会計**: Prisma + Supabase (データベース保存)
✅ **実施順序**: タスク → 天気 → 勤怠・会計

## 技術スタック

- ✅ Next.js (App Router)
- ✅ NextAuth.js (Google OAuth)
- ✅ Prisma + PostgreSQL (Supabase)
- ✅ Google Calendar API
- 🔄 Google Tasks API（実装中）
- 🔄 OpenWeatherMap API（実装予定）

## 実装手順

### Phase 1: Google Tasks API
1. ✅ 実装計画確定
2. 🔄 Google Tasks APIの認証スコープ追加
3. 🔄 `src/lib/google-tasks.ts` 作成
4. 🔄 API エンドポイント作成 (`src/app/api/tasks/`)
5. 🔄 `useGoogleTasks` カスタムフック作成
6. 🔄 タスクページの更新
7. 🔄 モックデータ削除

### Phase 2: OpenWeatherMap API
1. 🔄 OpenWeatherMap APIキー取得
2. 🔄 `src/lib/weather-api.ts` 作成
3. 🔄 API エンドポイント作成 (`src/app/api/weather/`)
4. 🔄 天気ページの更新
5. 🔄 モックデータ削除

### Phase 3: 勤怠・会計データベース保存
1. 🔄 Prismaスキーマ拡張 (勤怠記録)
2. 🔄 Prismaスキーマ拡張 (会計取引)
3. 🔄 勤怠API作成
4. 🔄 会計API作成
5. 🔄 フロントエンド更新
6. 🔄 モックデータ削除
