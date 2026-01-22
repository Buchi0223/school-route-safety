# PC版 通学路探検機能 実装TODOリスト

**作成日**: 2025年1月19日
**参照仕様書**: PC版_通学路探検機能_仕様書.md

---

## 実装概要

モバイル版で実装済みの「通学路探検モード」をPC版（デスクトップ）に搭載する。
3パネルレイアウト（地図60% / Street View + ガイド40%）とキーボードショートカットを実装。

---

## Phase 1: 基盤実装 ✅ 完了

### 1.1 ディレクトリ・ファイル作成
- [x] `app/components/Desktop/ExplorationMode/` ディレクトリ作成
- [x] `index.tsx` - 状態切り替え親コンポーネント（スケルトン）
- [x] `ExplorationControlsDesktop.tsx` - 左上コントロールパネル（スケルトン）

### 1.2 page.tsx への統合準備
- [x] デスクトップ判定ロジック追加（desktopTab状態による分岐）
- [x] 探検モード切り替え条件の追加（デスクトップ版/モバイル版の分岐）
- [x] デスクトップヘッダーに「通学路探検」タブ追加

### 1.3 共通フックの確認・調整
- [x] `useExplorationMode` がデスクトップでも動作するか確認
- [x] `useTour` がデスクトップでも動作するか確認
- [x] 必要に応じてフックの調整（調整不要、そのまま使用可能）

---

## Phase 2: 経路設定画面（route_setting） ✅ 完了

### 2.1 ExplorationControlsDesktop コンポーネント
- [x] 左上オーバーレイのCard UIを作成
- [x] モードタイトル「通学路探検モード」表示
- [x] 操作手順のステップ表示（①出発地点 ②目的地 ③経由地点）
- [x] 「探検スタート」ボタン（経路設定完了時に有効化）
- [x] 「リセット」ボタン
- [x] 経路設定状態の表示（S/G/経由地点数）

### 2.2 GuidePanelDesktop コンポーネント
- [x] `app/components/Desktop/ExplorationMode/GuidePanelDesktop.tsx` 作成
- [x] 右下パネルのレイアウト作成
- [x] キャラクター吹き出し統合（CharacterBubble再利用）
- [x] ウェルカムメッセージ表示「準備はいいかな？」
- [x] 操作ヒント表示（シングルクリック、ドラッグ、右クリック）

### 2.3 経路設定ロジックの統合
- [x] 既存のRouteControlsのロジックを探検モードでも使用
- [x] 地図クリックでのポイント追加機能の確認
- [x] マーカードラッグ機能の確認
- [x] 経路計算（OSRM）の動作確認

### 2.4 index.tsx の route_setting 状態対応
- [x] route_setting状態でのレイアウト実装
- [x] 地図パネル（60%）+ 右側パネル（40%）の分割
- [x] Street Viewパネル（右上）にプレースホルダーまたは出発地点表示
- [x] ガイドパネル（右下）にGuidePanelDesktop表示

---

## Phase 3: ツアー画面（touring） ✅ 完了

### 3.1 TourControlsBarDesktop コンポーネント
- [x] `app/components/Desktop/ExplorationMode/TourControlsBarDesktop.tsx` 作成
- [x] 下部固定バーのレイアウト
- [x] 戻るボタン [◀]
- [x] 進むボタン [▶]
- [x] 再生/一時停止ボタン [⏸️/▶️]
- [x] 停止ボタン [⏹️]
- [x] 進捗スライダー（ドラッグ対応）
- [x] 速度ボタン [1x][2x][3x]
- [x] ボタンのホバーエフェクト

### 3.2 キーボードショートカット実装
- [x] `hooks/useKeyboardShortcuts.ts` 作成
- [x] Space: 再生/一時停止
- [x] →: 次のポイントへ
- [x] ←: 前のポイントへ
- [x] Escape: ツアー停止
- [x] 1, 2, 3: 速度変更
- [x] +/-: 速度アップ/ダウン
- [x] フォーカス管理（ツアー開始時にコントロールバーへ）

### 3.3 ツアー中のステータス表示
- [x] ExplorationControlsDesktopにツアー状態表示を追加
- [x] 現在地点 / 総地点数
- [x] 走行距離 / 総距離
- [x] 「ツアー中」ラベル表示

### 3.4 ガイドパネルのツアー中表示
- [x] GuidePanelDesktopにツアー中の表示モード追加
- [x] キャラクターの励ましメッセージ「いい調子だね！」
- [x] 次の危険地点までの距離表示
- [x] 次の危険地点名の表示

### 3.5 地図の現在位置追従
- [x] ツアー中に現在位置マーカーを表示
- [x] 現在位置を中心に地図が追従するオプション
- [x] 進行方向を示す矢印表示

### 3.6 index.tsx の touring 状態対応
- [x] touring状態でのレイアウト実装
- [x] 下部にTourControlsBarDesktop表示
- [x] Street Viewパネルに現在位置のStreet View表示
- [x] 危険地点接近時のマーカーハイライト

---

## Phase 4: 危険地点停止画面（hazard_stop） ✅ 完了

### 4.1 HazardStopPanelDesktop コンポーネント
- [x] `app/components/Desktop/ExplorationMode/HazardStopPanelDesktop.tsx` 作成
- [x] Street Viewパネル上部に「⚠️ 危険地点に到着！」ヘッダー
- [x] 危険地点情報バー（アイコン + タイプ + タイトル）

### 4.2 キャラクター問いかけシーケンス
- [x] GuidePanelDesktopに危険地点停止時の表示モード追加
- [x] 3段階のセリフ表示
  - [x] 「どこに危険があるかな？3つ探してみよう！」
  - [x] 「危険から身を守るためにどう注意したらいいと思う？」
  - [x] 「探検を続けよう！」
- [x] セリフ進行ボタン/クリックエリア
- [x] 進行インジケーター（● ○ ○）
- [x] Enter キーでのセリフ進行対応

### 4.3 チェックポイント表示
- [x] 危険地点ごとのチェックポイントリスト表示
- [x] インタラクティブなチェックボックス（学習補助用）
- [x] 安全のヒント表示

### 4.4 Street View操作
- [x] 危険地点停止時にStreet Viewの視点操作を有効化
- [x] 「周りを見渡してみよう」のヒント表示

### 4.5 ExplorationControlsDesktopの停止中表示
- [x] 「危険地点で停止中」ラベル
- [x] 危険地点名表示
- [x] 「ツアー再開」ボタン

### 4.6 index.tsx の hazard_stop 状態対応
- [x] hazard_stop状態でのレイアウト実装
- [x] 地図上の危険地点マーカーをハイライト
- [x] コントロールバーを「一時停止中」状態に

---

## Phase 5: 修了証画面（completed） ✅ 完了

### 5.1 CertificateModalDesktop コンポーネント
- [x] `app/components/Desktop/ExplorationMode/CertificateModalDesktop.tsx` 作成
- [x] モーダルオーバーレイ（背景半透明 + ぼかし）
- [x] 修了証カードデザイン
  - [x] タイトル「修了証」
  - [x] サブタイトル「通学路の安全マスター」
  - [x] 学習実績（危険地点数、歩行距離）
  - [x] 日付表示
  - [x] キャラクター署名

### 5.2 紙吹雪エフェクト
- [x] 紙吹雪アニメーション実装（30-50個のパーティクル）
- [x] ランダムな色・サイズ・回転
- [x] 落下アニメーション（3秒）

### 5.3 アクションボタン
- [x] 「もう一度探検する」ボタン → resetExploration()
- [x] 「ホームに戻る」ボタン → exitExploration()

### 5.4 index.tsx の completed 状態対応
- [x] completed状態でCertificateModalDesktopを表示
- [x] 背景は最後のツアー状態を維持

---

## Phase 6: 統合・テスト・仕上げ ✅ 完了

### 6.1 page.tsx への完全統合
- [x] デスクトップ表示時の探検モード切り替え実装
- [x] ヘッダーの「通学路探検」タブ動作確認
- [x] 探検モード ↔ 通常モードの切り替え確認

### 6.2 レスポンシブ対応確認
- [x] 1024px以上でデスクトップ版表示
- [x] 1024px未満でモバイル版表示
- [x] 画面リサイズ時の切り替え動作確認

### 6.3 機能テスト
- [x] 経路設定が正常に動作する
- [x] ツアーが正常に開始・進行する
- [x] 危険地点で自動停止する
- [x] セリフが3段階で進行する
- [x] ツアー再開が正常に動作する
- [x] 修了証が正しく表示される
- [x] リセット・終了が正常に動作する

### 6.4 キーボード操作テスト
- [x] Space で再生/一時停止
- [x] 矢印キーで前後移動
- [x] Enter でセリフ進行
- [x] Escape で終了
- [x] 数字キーで速度変更

### 6.5 UI/UX調整
- [x] カラースキームの統一確認
- [x] アニメーションの動作確認
- [x] ボタンホバーエフェクト確認
- [x] フォーカスインジケーター確認

### 6.6 アクセシビリティ確認
- [x] キーボード操作完全対応
- [x] Tab キーでのフォーカス移動
- [x] aria-label の設定確認

### 6.7 ビルド・デプロイ
- [x] npm run build 成功確認
- [x] ESLint エラーなし確認
- [x] Vercel デプロイ
- [x] 本番環境での動作確認

---

## ファイル作成一覧

| ファイルパス | 説明 |
|-------------|------|
| `app/components/Desktop/ExplorationMode/index.tsx` | 状態切り替え親コンポーネント |
| `app/components/Desktop/ExplorationMode/ExplorationControlsDesktop.tsx` | 左上コントロールパネル |
| `app/components/Desktop/ExplorationMode/GuidePanelDesktop.tsx` | 右下ガイドパネル |
| `app/components/Desktop/ExplorationMode/TourControlsBarDesktop.tsx` | 下部コントロールバー |
| `app/components/Desktop/ExplorationMode/HazardStopPanelDesktop.tsx` | 危険地点停止パネル |
| `app/components/Desktop/ExplorationMode/CertificateModalDesktop.tsx` | 修了証モーダル |
| `hooks/useKeyboardShortcuts.ts` | キーボードショートカットフック |

---

## 再利用コンポーネント

| コンポーネント | 再利用方法 |
|---------------|-----------|
| `useExplorationMode` | そのまま使用 |
| `useTour` | そのまま使用 |
| `CharacterBubble` | propsでサイズ調整して使用 |
| `MapContainer` | 既存コンポーネントを使用 |
| `StreetViewPanel` | 既存コンポーネントを使用 |
| `RouteLayer` | 既存コンポーネントを使用 |
| `HazardMarkers` | 既存コンポーネントを使用 |

---

## 進捗管理

| Phase | 状態 | 完了日 |
|-------|------|--------|
| Phase 1: 基盤実装 | ✅ 完了 | 2025-01-19 |
| Phase 2: 経路設定画面 | ✅ 完了 | 2025-01-22 |
| Phase 3: ツアー画面 | ✅ 完了 | 2025-01-22 |
| Phase 4: 危険地点停止画面 | ✅ 完了 | 2025-01-22 |
| Phase 5: 修了証画面 | ✅ 完了 | 2025-01-22 |
| Phase 6: 統合・テスト | ✅ 完了 | 2025-01-22 |

---

*以上*
