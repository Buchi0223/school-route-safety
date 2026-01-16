# 通学路安全確認デモアプリ モバイル版UI改良 - 実行計画 TODO

**文書バージョン**: 1.0
**作成日**: 2026年1月16日
**基準仕様書**: モバイル版UI改良_仕様書.md

---

## Phase 1: 基盤整備・ヘッダーメニュー

### 1.1 キャラクター画像の準備
- [x] Character.png をトリミング（80x80px）
- [x] public/images/character.png として配置
- [x] 透過PNG形式で最適化

### 1.2 MobileHeader コンポーネント
- [x] app/components/Mobile/MobileHeader.tsx 作成
- [x] 帯状メニューUI実装（高さ48px）
- [x] メニューアイテム3つ配置（経路検索/通学路探検/アイコン説明）
- [x] アイコン設定（🔍/🎒/❓）
- [x] アクティブ状態のスタイル
- [x] タップ領域の最適化（touch-manipulation）

### 1.3 オーバーレイ基盤コンポーネント
- [x] app/components/Mobile/Overlay.tsx 作成
- [x] スライドダウン/アップアニメーション実装
- [x] 閉じるボタン（✕）
- [x] 背景タップで閉じる機能
- [x] オーバーレイ状態管理フック作成

### 1.4 モバイルページレイアウト更新
- [x] app/page.tsx のモバイル版レイアウト更新
- [x] MobileHeader の組み込み
- [x] 地図をフルスクリーン表示に変更
- [x] 既存のMobileViewTabs を条件付きで使用

---

## Phase 2: 経路検索オーバーレイ

### 2.1 RouteSearchOverlay コンポーネント
- [x] app/components/Mobile/RouteSearchOverlay.tsx 作成
- [x] 既存のRouteControls機能を流用
- [x] オーバーレイ形式でのUI実装
- [x] スタート/ゴール設定UI
- [x] クリアボタン
- [x] ルート計算ボタン
- [x] 地図との連携（タップで地点設定）

### 2.2 経路検索フロー実装
- [x] オーバーレイ表示/非表示の状態管理
- [x] 地点設定時のオーバーレイ維持
- [x] ルート計算完了後のオーバーレイ自動閉じ
- [x] エラーハンドリング

---

## Phase 3: ヘルプオーバーレイ

### 3.1 HelpOverlay コンポーネント
- [ ] app/components/Mobile/HelpOverlay.tsx 作成
- [ ] 危険地点の種類セクション
  - [ ] 見通しの悪い交差点（⚠️）
  - [ ] 事故多発エリア（🔴）
  - [ ] 急ブレーキ多発地点（🟠）
  - [ ] ユーザー投稿情報（💬）
- [ ] 操作方法セクション
  - [ ] 地図をタップ
  - [ ] マーカーをタップ
  - [ ] 探検モード
- [ ] スクロール対応
- [ ] セクション区切り線

---

## Phase 4: 探検モード - 経路設定

### 4.1 ExplorationMode コンポーネント基盤
- [ ] app/components/Mobile/ExplorationMode/index.tsx 作成
- [ ] 探検モード状態管理（useExplorationMode フック）
  - [ ] idle（未開始）
  - [ ] route_setting（経路設定中）
  - [ ] touring（ツアー中）
  - [ ] hazard_stop（危険地点で停止）
  - [ ] completed（完了）
- [ ] lib/useExplorationMode.ts 作成

### 4.2 ExplorationRouteSetup コンポーネント
- [ ] app/components/Mobile/ExplorationMode/RouteSetup.tsx 作成
- [ ] 「まずは通学路を教えてね！」UI
- [ ] スタート/ゴール設定表示
- [ ] 「探検スタート！」ボタン
- [ ] 経路設定完了時の遷移処理

---

## Phase 5: 探検モード - ツアー画面

### 5.1 MiniMap コンポーネント
- [ ] app/components/Mobile/ExplorationMode/MiniMap.tsx 作成
- [ ] 100x100px サイズの小窓地図
- [ ] 現在位置マーカー表示
- [ ] 経路ハイライト表示
- [ ] 位置: 左下（デフォルト）/右下（キャラクター表示時）
- [ ] タップで拡大表示（オプション）

### 5.2 TourControlsCompact コンポーネント
- [ ] app/components/Mobile/ExplorationMode/TourControlsCompact.tsx 作成
- [ ] コンパクトなコントロールバー（高さ60px）
- [ ] 半透明黒背景
- [ ] 戻る/進むボタン（◀/▶）
- [ ] 進捗スライダー
- [ ] 速度設定ボタン

### 5.3 ExplorationTourScreen コンポーネント
- [ ] app/components/Mobile/ExplorationMode/TourScreen.tsx 作成
- [ ] ヘッダー（終了ボタン + 探検中表示）
- [ ] Street View 全画面表示
- [ ] MiniMap オーバーレイ配置
- [ ] TourControlsCompact 配置
- [ ] 既存useTourフックとの連携

---

## Phase 6: 探検モード - キャラクター＆吹き出し

### 6.1 CharacterBubble コンポーネント
- [ ] app/components/Mobile/ExplorationMode/CharacterBubble.tsx 作成
- [ ] キャラクター画像表示（80x80px）
- [ ] 吹き出しUI
  - [ ] 背景色: #FFFFFF
  - [ ] ボーダー: 2px solid #FFD700
  - [ ] 角丸: 16px
  - [ ] 影: 0 4px 8px rgba(0,0,0,0.15)
- [ ] セリフテキスト表示
- [ ] 「タップして次へ」インジケーター

### 6.2 吹き出しアニメーション
- [ ] フェードイン（0.3秒）
- [ ] キャラクターバウンスアニメーション（0.5秒）
- [ ] 吹き出し表示時のスケールアニメーション

### 6.3 危険地点停止画面
- [ ] app/components/Mobile/ExplorationMode/HazardStopScreen.tsx 作成
- [ ] Street View 停止状態表示
- [ ] CharacterBubble 配置
- [ ] セリフシーケンス管理（3段階）
  - [ ] セリフ1: 「ここには、どんな危ない場所がひそんでいそうかな？」
  - [ ] セリフ2: 「見つけた危ない場所で身を守るにはどうしたらいいかな？」
  - [ ] セリフ3: 「続きの道を進もう！」
- [ ] タップで次のセリフへ進む
- [ ] セリフ3タップでツアー再開

---

## Phase 7: 探検モード - 完了画面

### 7.1 CertificateModal コンポーネント
- [ ] app/components/Mobile/ExplorationMode/CertificateModal.tsx 作成
- [ ] 賞状デザイン
  - [ ] 背景色: #FFFEF0（クリーム色）
  - [ ] 金色グラデーションボーダー
  - [ ] 内側点線装飾
- [ ] タイトル: 「しょうじょう」
- [ ] 本文: 「あなたは通学路の安全マスターです！」
- [ ] 統計情報表示
  - [ ] 確認した危険地点数
  - [ ] 歩いた距離
- [ ] 日付表示
- [ ] キャラクター署名

### 7.2 完了画面演出
- [ ] 「おつかれさま！」ヘッダー
- [ ] 賞状スケールインアニメーション（0.5秒）
- [ ] 紙吹雪エフェクト（CSS or Lottie）
- [ ] 「もう一度探検する」ボタン
- [ ] 「ホームに戻る」ボタン

---

## Phase 8: 統合・動作確認

### 8.1 全体統合
- [ ] app/page.tsx でモバイル版UI完全切り替え
- [ ] 各コンポーネント間の状態連携確認
- [ ] 画面遷移フロー確認
- [ ] エラーハンドリング確認

### 8.2 動作テスト
- [ ] 経路検索フロー動作確認
- [ ] 探検モード全フロー動作確認
  - [ ] 経路設定 → ツアー開始
  - [ ] 危険地点停止 → セリフ進行 → 再開
  - [ ] ツアー完了 → 賞状表示
- [ ] ヘルプオーバーレイ動作確認
- [ ] モバイル実機テスト（iOS/Android）

### 8.3 パフォーマンス最適化
- [ ] コンポーネントのメモ化（React.memo）
- [ ] 不要な再レンダリング防止
- [ ] 画像最適化
- [ ] アニメーションのGPUアクセラレーション

---

## Phase 9: デプロイ・仕上げ

### 9.1 ビルド確認
- [ ] npm run build 成功確認
- [ ] TypeScript エラーなし確認
- [ ] ESLint 警告対応

### 9.2 デプロイ
- [ ] Vercel 本番デプロイ
- [ ] 動作確認（本番環境）
- [ ] モバイル実機で最終確認

### 9.3 ドキュメント更新
- [ ] README.md 更新（新機能説明追加）
- [ ] 仕様書ステータス更新（レビュー待ち → 実装完了）

---

## 進捗サマリー

| Phase | 内容 | タスク数 | 状態 |
|-------|------|---------|------|
| Phase 1 | 基盤整備・ヘッダーメニュー | 14 | **完了** |
| Phase 2 | 経路検索オーバーレイ | 11 | **完了** |
| Phase 3 | ヘルプオーバーレイ | 9 | 未着手 |
| Phase 4 | 探検モード - 経路設定 | 8 | 未着手 |
| Phase 5 | 探検モード - ツアー画面 | 14 | 未着手 |
| Phase 6 | 探検モード - キャラクター | 13 | 未着手 |
| Phase 7 | 探検モード - 完了画面 | 12 | 未着手 |
| Phase 8 | 統合・動作確認 | 12 | 未着手 |
| Phase 9 | デプロイ・仕上げ | 8 | 未着手 |
| **合計** | | **98** | |

---

## 依存関係

```
Phase 1 ─┬─→ Phase 2 ─→ Phase 8
         ├─→ Phase 3 ─→ Phase 8
         └─→ Phase 4 ─→ Phase 5 ─→ Phase 6 ─→ Phase 7 ─→ Phase 8 ─→ Phase 9
```

---

## 新規ファイル一覧

```
app/components/Mobile/
├── MobileHeader.tsx
├── Overlay.tsx
├── RouteSearchOverlay.tsx
├── HelpOverlay.tsx
└── ExplorationMode/
    ├── index.tsx
    ├── RouteSetup.tsx
    ├── TourScreen.tsx
    ├── MiniMap.tsx
    ├── TourControlsCompact.tsx
    ├── CharacterBubble.tsx
    ├── HazardStopScreen.tsx
    └── CertificateModal.tsx

lib/
└── useExplorationMode.ts

public/images/
└── character.png (トリミング済み)
```

---

## 見積もり工数

| Phase | 見積もり |
|-------|---------|
| Phase 1 | 基盤整備 |
| Phase 2 | 経路検索 |
| Phase 3 | ヘルプ |
| Phase 4 | 探検基盤 |
| Phase 5 | ツアー画面 |
| Phase 6 | キャラクター |
| Phase 7 | 完了画面 |
| Phase 8 | 統合テスト |
| Phase 9 | デプロイ |

※時間見積もりは含めていません

---

*最終更新: 2026年1月16日*
