# マイ危険ポイント機能 実行計画

> **作成日**: 2026-01-23
> **対象仕様書**: [SPEC_MSRH_PIN_v2.md](./SPEC_MSRH_PIN_v2.md) v0.6
> **ステータス**: 計画中

---

## 概要

本ドキュメントは「マイ危険ポイント機能」の実装に向けた実行計画です。
仕様書のPhase 1〜9を基に、詳細なタスクに分解しています。

---

## Phase 1: データ層

### 1.1 型定義
- [ ] `MyHazardPoint` インターフェース追加 (`lib/types.ts`)
- [ ] `MyHazardReason` 型定義（enum または union type）
- [ ] `MyHazardStorage` インターフェース追加
- [ ] `TourTarget` 型定義（`'my_hazard_points' | 'safety_map'`）

### 1.2 ローカルストレージ管理Hook
- [ ] `lib/useMyHazardPoints.ts` 作成
- [ ] `getAll()` - 全ピン取得
- [ ] `add(pin)` - ピン追加
- [ ] `update(id, pin)` - ピン更新
- [ ] `remove(id)` - ピン削除
- [ ] `clear()` - 全削除
- [ ] スキーマバージョン管理（マイグレーション対応）

### 1.3 ユーティリティ
- [ ] UUID生成関数（または既存ライブラリ活用）
- [ ] 距離計算関数（重複防止用、既存 `calculateDistance` 活用可）

---

## Phase 2: Safety Map自動選別ロジック

### 2.1 選別関数
- [ ] `lib/hazardData.ts` に `selectHazardPointsForTour()` 関数追加
- [ ] 経路から半径50m以内のHazardPoint抽出

### 2.2 優先度スコア計算
- [ ] タイプ別重み付けロジック
  - accident: +10点
  - braking: +8点
  - intersection: +6点
  - user_report: +4点
- [ ] 経路からの距離によるスコア加算

### 2.3 選出ロジック
- [ ] 上位3〜5件選出
- [ ] 近接地点の重複除去（代表1件のみ）
- [ ] 経路が短い場合の全件返却

### 2.4 テスト
- [ ] `__tests__/hazardSelection.test.ts` 作成
- [ ] 選別ロジックの単体テスト

---

## Phase 3: 状態管理

### 3.1 マイ危険ポイント設置モード
- [ ] `lib/useMyHazardPointMode.ts` 作成
- [ ] 状態定義: `pin_idle`, `pin_editing`
- [ ] 選択中ピンの管理
- [ ] 新規ピン位置の一時保存

### 3.2 探検モード拡張
- [ ] `lib/useExplorationMode.ts` に `target_select` フェーズ追加
- [ ] `tourTarget` 状態追加（`'my_hazard_points' | 'safety_map' | null`）
- [ ] `selectedHazardPoints` 状態追加（選別されたHazardPoint配列）
- [ ] フェーズ遷移ロジック更新
  - `route_setting` → `target_select` → `touring`

---

## Phase 4: 地図表示

### 4.1 マイ危険ポイントマーカー
- [ ] `app/components/Map/MyHazardMarkers.tsx` 作成
- [ ] 紫色（#8B5CF6）の丸型ピンアイコン
- [ ] 通常サイズ（24px）/ 選択時サイズ（32px）
- [ ] クリックイベントハンドリング

### 4.2 ポップアップ表示
- [ ] ピン選択時の情報ポップアップ
- [ ] 理由一覧表示
- [ ] 編集・削除ボタン

### 4.3 重複防止
- [ ] 30m以内の既存ピン検出
- [ ] 警告ダイアログ表示
- [ ] 「編集する」「新規作成する」選択肢

### 4.4 MapContainer統合
- [ ] `MapContainer.tsx` に `MyHazardMarkers` 追加
- [ ] z-index調整（HazardPointより前面）

---

## Phase 5: UI - トップ画面・巡回対象選択（デスクトップ）

### 5.1 トップ画面
- [ ] 「マイ危険ポイント設置」ボタン追加
- [ ] 「探検モード」ボタン（既存）の調整
- [ ] 設置済みピン数の表示

### 5.2 巡回対象選択パネル
- [ ] `app/components/Desktop/ExplorationMode/TourTargetSelector.tsx` 作成
- [ ] ラジオボタン形式の選択UI
- [ ] マイ危険ポイント件数表示
- [ ] Safety Map選別件数表示

### 5.3 Safety Map選別結果プレビュー
- [ ] 選別されたHazardPointの一覧表示
- [ ] タイプ別アイコン表示

---

## Phase 6: UI - ピン設置（デスクトップ）

### 6.1 ピン設置画面
- [ ] `app/components/Desktop/MyHazardPointMode/index.tsx` 作成
- [ ] ヘッダー（タイトル + 完了ボタン）
- [ ] 地図エリア
- [ ] ガイドパネル（設置済みピン一覧）

### 6.2 理由選択ダイアログ
- [ ] `app/components/Desktop/MyHazardPointMode/ReasonDialog.tsx` 作成
- [ ] チェックボックス形式（複数選択）
- [ ] 「その他」選択時のテキスト入力
- [ ] 「ピンを立てる」ボタン

### 6.3 ピン一覧表示
- [ ] 設置済みピンのリスト表示
- [ ] 各ピンの理由サマリー
- [ ] 選択・ハイライト機能

### 6.4 編集・削除機能
- [ ] 編集ダイアログ（理由変更）
- [ ] 削除確認ダイアログ
- [ ] ドラッグ&ドロップ移動（将来検討）

---

## Phase 7: UI - モバイル対応

### 7.1 トップ画面（モバイル）
- [ ] 縦並びボタンレイアウト
- [ ] 設置済みピン数表示

### 7.2 ピン設置画面（モバイル）
- [ ] `app/components/Mobile/MyHazardPointMode/index.tsx` 作成
- [ ] 地図全画面表示
- [ ] 上部ガイド表示
- [ ] 下部コントロール（ピン数 + 完了ボタン）

### 7.3 理由選択ボトムシート
- [ ] `app/components/Mobile/MyHazardPointMode/ReasonBottomSheet.tsx` 作成
- [ ] ドラッグハンドル
- [ ] チェックボックスリスト
- [ ] 「ピンを立てる」ボタン

### 7.4 巡回対象選択ボトムシート
- [ ] `app/components/Mobile/ExplorationMode/TourTargetBottomSheet.tsx` 作成
- [ ] ラジオボタン選択
- [ ] 「ツアーを開始」ボタン

---

## Phase 8: ツアー連携

### 8.1 停止地点リスト生成
- [ ] `tourTarget` に応じた停止地点配列生成
- [ ] マイ危険ポイント選択時: 全マイ危険ポイント
- [ ] Safety Map選択時: 選別されたHazardPoint

### 8.2 マイ危険ポイント停止時の表示
- [ ] デスクトップ: `HazardStopPanelDesktop.tsx` 拡張
- [ ] モバイル: `HazardStopScreen.tsx` 拡張
- [ ] 「あなたが立てたピン」ラベル
- [ ] 選択した理由一覧

### 8.3 useTour.ts 拡張
- [ ] マイ危険ポイントでの自動停止判定
- [ ] 停止種別の識別（HazardPoint / MyHazardPoint）

---

## Phase 9: 完了画面連携

### 9.1 CertificateModal拡張
- [ ] 巡回対象の表示（マイ危険ポイント or Safety Map）
- [ ] 確認した地点数の表示

### 9.2 マイ危険ポイント使用時
- [ ] 設置ピン数表示
- [ ] 理由別サマリー

### 9.3 Safety Map使用時
- [ ] 確認した地点数
- [ ] タイプ別サマリー

---

## Phase 10: 統合・テスト

### 10.1 統合
- [ ] `app/page.tsx` への統合
- [ ] デスクトップ/モバイル切り替え
- [ ] 状態管理の接続

### 10.2 テスト
- [ ] 単体テスト追加
- [ ] E2Eテスト（手動確認）
- [ ] モバイル実機テスト

### 10.3 ドキュメント
- [ ] CLAUDE.md 更新
- [ ] README更新（必要に応じて）

---

## 優先順位と依存関係

```
Phase 1 ──┬──→ Phase 3 ──→ Phase 5 ──→ Phase 10
          │              ↘
          │               Phase 6 ──→ Phase 10
          │              ↗
Phase 2 ──┴──→ Phase 8 ──→ Phase 9 ──→ Phase 10
                         ↗
Phase 4 ────────────────┘
                         ↗
Phase 7 ────────────────┘
```

### 推奨実装順序

1. **Phase 1**: データ層（必須の土台）
2. **Phase 3**: 状態管理（UIの前提）
3. **Phase 4**: 地図表示（視覚的確認用）
4. **Phase 6**: デスクトップUI（メイン機能）
5. **Phase 2**: Safety Map選別（探検モード拡張）
6. **Phase 5**: トップ画面・選択UI
7. **Phase 8**: ツアー連携
8. **Phase 9**: 完了画面
9. **Phase 7**: モバイル対応
10. **Phase 10**: 統合・テスト

---

## 見積もり（参考）

| Phase | 内容 | 規模感 |
|-------|------|--------|
| 1 | データ層 | 小 |
| 2 | Safety Map選別 | 中 |
| 3 | 状態管理 | 小 |
| 4 | 地図表示 | 中 |
| 5 | トップ画面・選択UI | 小 |
| 6 | ピン設置UI（デスクトップ） | 大 |
| 7 | モバイル対応 | 大 |
| 8 | ツアー連携 | 中 |
| 9 | 完了画面 | 小 |
| 10 | 統合・テスト | 中 |

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2026-01-23 | 初版作成 |
