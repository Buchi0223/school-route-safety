# 通学路安全確認デモアプリ - 実行計画 TODO

## Phase 1: 基本機能（MVP）

### 1.1 プロジェクトセットアップ
- [x] Next.js 14 プロジェクト作成（App Router, TypeScript）
- [x] Tailwind CSS 設定確認
- [x] shadcn/ui 初期化・基本コンポーネント追加（Button, Card, Tabs, Accordion）
- [x] ESLint 設定確認
- [x] 環境変数ファイル作成（.env.local.example）
- [x] プロジェクト構造作成（app/components/, lib/, __tests__/）

### 1.2 地図表示機能
- [x] Leaflet, react-leaflet インストール
- [x] MapContainer コンポーネント作成
- [x] OSM タイルレイヤー表示
- [x] 初期表示位置を宇都宮市周辺に設定
- [x] 地図のズーム・パン操作確認

### 1.3 経路設定機能
- [x] lib/types.ts 作成（HazardPoint, Route 型定義）
- [x] 地図クリックで経由地点追加機能
- [x] 経由地点マーカー表示
- [x] 経由地点の削除機能
- [x] RouteControls コンポーネント作成（出発地・目的地設定UI）

### 1.4 ルーティング機能
- [x] lib/routing.ts 作成（OSRM API連携）
- [x] OSRM API で歩行者ルート取得
- [x] RouteLayer コンポーネント作成
- [x] 経路をポリラインで地図上に描画

### 1.5 危険地点表示機能
- [x] lib/hazardData.ts 作成（サンプルデータ）
- [x] 宇都宮市周辺の危険地点サンプルデータ作成（8箇所）
- [x] HazardMarkers コンポーネント作成
- [x] 危険タイプ別アイコン実装（intersection, accident, braking, user_report）
- [x] マーカークリックでポップアップ表示

### 1.6 Street View 基本表示
- [x] Google Maps JavaScript API 読み込み設定
- [x] StreetViewPanel コンポーネント作成
- [x] 危険地点クリックで該当位置の Street View 表示
- [x] Street View の視点操作（パン・ズーム）確認

### 1.7 メイン画面レイアウト
- [x] app/page.tsx メインレイアウト実装
- [x] 左側：地図エリア（60%）
- [x] 右上：Street View エリア
- [x] 右下：情報パネルエリア（SafetyGuidePanel 基本実装済み）
- [x] コントロールバー配置

---

## Phase 2: ツアー機能

### 2.1 ツアー基盤
- [x] ツアー状態管理（useState/useReducer）
- [x] 経路上のポイントリスト生成（一定間隔で座標取得）
- [x] 現在位置インデックス管理

### 2.2 Street View ツアー
- [x] 経路に沿った Street View 自動遷移
- [x] TourControls コンポーネント作成
- [x] 再生/一時停止ボタン
- [x] 前進/後退ボタン
- [x] 進行速度調整スライダー

### 2.3 地図連動
- [x] ツアー中の現在位置を地図上にマーカー表示
- [x] 現在位置マーカーのアニメーション
- [x] 地図の自動追従（現在位置を中心に）

### 2.4 危険地点での動作
- [x] 危険地点接近時の自動停止
- [x] 危険地点ハイライト表示
- [x] 危険地点通過後の自動再開（オプション）

---

## Phase 3: ガイド機能

### 3.1 SafetyGuidePanel 実装
- [x] SafetyGuidePanel コンポーネント作成
- [x] 現在の危険地点情報表示
- [x] アコーディオン形式でセクション分け

### 3.2 チェックポイント表示
- [x] チェックポイントリスト表示
- [x] チェック済み/未チェック状態管理
- [x] チェックボックス UI

### 3.3 声かけ例・安全ヒント
- [x] 声かけ例（voiceGuide）表示
- [x] 安全行動のヒント（safetyTips）表示
- [x] 危険タイプ別の解説テキスト

### 3.4 レスポンシブ対応
- [x] モバイル用レイアウト実装
- [x] 地図/Street View タブ切り替え
- [x] ガイドパネルのアコーディオン化
- [x] タッチ操作最適化

---

## Phase 4: 仕上げ

### 4.1 UI ブラッシュアップ
- [x] 全体的なスタイル調整
- [x] カラーテーマ統一
- [x] アイコンの視認性向上
- [x] ローディング状態の表示
- [x] エラーハンドリング・エラー表示

### 4.2 テスト追加
- [x] Vitest セットアップ
- [x] MapContainer テスト
- [x] HazardMarkers テスト
- [x] routing.ts テスト
- [x] 主要コンポーネントのスナップショットテスト

### 4.3 デプロイ準備
- [x] 本番用環境変数設定（.env.example 作成済み）
- [x] ビルド確認（npm run build）
- [x] Vercel プロジェクト作成
- [x] 環境変数設定（Vercel）
- [x] デプロイ実行

### 4.4 QRコード・ドキュメント
- [x] デプロイ URL 取得: https://map-demo-eight.vercel.app
- [x] QRコード生成（public/qrcode.png）
- [x] README.md 更新（使い方説明）

---

## Phase 5: レビュー・改善

### 5.1 動作確認
- [x] デスクトップブラウザでの動作確認（Chrome, Firefox, Safari）
- [x] モバイルブラウザでの動作確認（iOS Safari, Android Chrome）
- [x] Street View カバレッジ確認（サンプル地点）

### 5.2 パフォーマンス確認
- [x] ページ読み込み速度確認
- [x] 地図操作のスムーズさ確認
- [x] メモリ使用量確認

### 5.3 フィードバック対応
- [x] 使い勝手の確認・改善点洗い出し
- [x] 改善実施（チェックボックスUI追加）
- [x] 最終動作確認

---

## 進捗サマリー

| Phase | 状態 | 完了タスク |
|-------|------|-----------|
| Phase 1: 基本機能 | **完了** | 28 / 28 |
| Phase 2: ツアー機能 | **完了** | 12 / 12 |
| Phase 3: ガイド機能 | **完了** | 12 / 12 |
| Phase 4: 仕上げ | **完了** | 15 / 15 |
| Phase 5: レビュー | **完了** | 8 / 8 |
| **合計** | | **75 / 75** |

---

*最終更新: 2026年1月16日*
