# 通学路安全確認デモアプリ - CLAUDE.md

## プロジェクト概要

Honda Safety Mapのコンセプトを参考にした、小学生の通学路における安全教育支援デモアプリケーション。
保護者が子どもと一緒に通学路上の危険箇所を確認し、Street Viewバーチャルツアーで視覚的に学習できる。

## 技術スタック

| 技術 | バージョン | 用途 |
|------|-----------|------|
| Next.js | 14.x (App Router) | フレームワーク |
| TypeScript | 5.x | 型安全性 |
| Tailwind CSS | 3.x | スタイリング |
| shadcn/ui | latest | UIコンポーネント |
| Leaflet + react-leaflet | 1.9.x / 4.x | 地図表示（OSM） |
| Vitest | latest | テストフレームワーク |

## 外部サービス

| サービス | 用途 |
|---------|------|
| OpenStreetMap (OSM) | 地図タイル |
| OSRM | 歩行者向けルーティング |
| Google Street View API | パノラマ画像表示 |

## 環境変数

```bash
# .env.local に設定
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

## コマンド

```bash
# 開発
npm run dev

# ビルド
npm run build

# テスト
npm run test

# Lint
npm run lint
```

## プロジェクト構造

```
school-route-safety/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   └── components/
│       ├── Map/
│       │   ├── MapContainer.tsx      # OSM地図表示
│       │   ├── RouteLayer.tsx        # 経路描画
│       │   ├── HazardMarkers.tsx     # 危険地点マーカー
│       │   └── MyHazardMarkers.tsx   # マイ危険ポイントマーカー
│       ├── StreetView/
│       │   └── StreetViewPanel.tsx   # Street View表示
│       ├── Guide/
│       │   └── SafetyGuidePanel.tsx  # 安全学習ガイド
│       ├── Controls/
│       │   ├── RouteControls.tsx     # 経路設定UI
│       │   └── TourControls.tsx      # ツアー操作UI
│       ├── Desktop/
│       │   ├── ExplorationMode/      # デスクトップ探検モード
│       │   └── MyHazardPointMode/    # デスクトップピン設置モード
│       └── Mobile/
│           ├── ExplorationMode/      # モバイル探検モード
│           └── MyHazardPointMode/    # モバイルピン設置モード
├── lib/
│   ├── types.ts                      # 型定義
│   ├── hazardData.ts                 # 危険地点サンプルデータ・選別ロジック
│   ├── routing.ts                    # OSRM連携
│   ├── useMyHazardPoints.ts          # マイ危険ポイント管理Hook
│   ├── useMyHazardPointMode.ts       # ピン設置モード状態管理
│   ├── useExplorationMode.ts         # 探検モード状態管理
│   └── useTour.ts                    # ツアー状態管理
├── components/ui/                    # shadcn/uiコンポーネント
├── public/
│   └── icons/
├── __tests__/                        # テストファイル
│   ├── hazardData.test.ts
│   ├── hazardSelection.test.ts
│   ├── myHazardPoints.test.ts
│   └── routing.test.ts
└── package.json
```

## データ型定義

```typescript
interface HazardPoint {
  id: string;
  type: 'intersection' | 'accident' | 'braking' | 'user_report';
  lat: number;
  lng: number;
  title: string;
  description: string;
  checkPoints: string[];
  voiceGuide: string;
  safetyTips: string[];
}

interface Route {
  id: string;
  name: string;
  waypoints: [number, number][];
  hazardPoints: string[];
}

// マイ危険ポイント（ユーザー設置）
interface MyHazardPoint {
  id: string;
  lat: number;
  lng: number;
  reasons: MyHazardReason[];
  reasonDetail?: string;
  createdAt: string;
  updatedAt: string;
}

// マイ危険ポイントの理由
type MyHazardReason =
  | 'traffic_heavy'      // 車の交通量が多い
  | 'narrow_road'        // 道が狭い
  | 'poor_visibility'    // 見通しが悪い
  | 'no_sidewalk'        // 歩道がない
  | 'fast_cars'          // 車のスピードが速い
  | 'bicycle_danger'     // 自転車が危ない
  | 'other';             // その他

// 巡回対象
type TourTarget = 'my_hazard_points' | 'safety_map';
```

## 危険地点タイプとアイコン

### Safety Map（システム提供）
| type | アイコン | 説明 |
|------|---------|------|
| intersection | ⚠️ 黄色三角 | 見通しの悪い交差点 |
| accident | 🔴 赤丸 | 事故多発エリア |
| braking | 🟠 橙色 | 急ブレーキ多発地点 |
| user_report | 💬 吹き出し | ユーザー投稿情報 |

### マイ危険ポイント（ユーザー設置）
| 色 | サイズ | 説明 |
|----|--------|------|
| 紫色（#8B5CF6） | 24px / 32px（選択時） | ユーザーが設置した危険ポイント |

## マイ危険ポイント機能

ユーザーが自分で通学路の危険だと思う場所にピンを設置し、探検モードで巡回できる機能。

### 主要機能
- **ピン設置**: 地図をクリック/タップして危険地点を登録
- **理由選択**: 複数の理由から選択（交通量、道幅、見通しなど）
- **重複防止**: 30m以内に既存ピンがある場合は警告
- **巡回対象選択**: 探検モードで「マイ危険ポイント」または「Safety Map」を選択
- **修了証連携**: 完了画面で巡回結果を表示

### ローカルストレージ
- キー: `my_hazard_points`
- スキーマバージョン管理によるマイグレーション対応
- 永続化されたピンはブラウザを閉じても保持

### 探検モードのフェーズ
1. `idle` - 未開始
2. `route_setting` - 経路設定中
3. `target_select` - 巡回対象選択
4. `touring` - ツアー中
5. `hazard_stop` - 危険地点で停止
6. `completed` - 完了

## サンプルデータ地域

- 緯度: 36.55付近
- 経度: 139.89付近
- 地域: 栃木県宇都宮市周辺

※具体的な出発点・目的地は開発中に設定

## 開発フェーズ

### Phase 1: 基本機能（MVP）
- [ ] Next.jsプロジェクトセットアップ（TypeScript, Tailwind, shadcn/ui）
- [ ] OSM地図表示（Leaflet）
- [ ] クリックによる経由地点設定
- [ ] OSRMによる経路描画
- [ ] サンプル危険地点のマーカー表示
- [ ] 危険地点クリックでStreet View表示

### Phase 2: ツアー機能
- [ ] 経路に沿ったStreet Viewバーチャルツアー
- [ ] 進行コントロール（前進・後退・停止）
- [ ] 危険地点での自動停止・ハイライト
- [ ] 現在位置の地図連動

### Phase 3: ガイド機能
- [ ] 安全学習ガイドパネル実装
- [ ] チェックポイント・声かけ例の表示
- [ ] 危険タイプ別アイコン・解説
- [ ] レスポンシブデザイン調整

### Phase 4: 仕上げ
- [ ] UIブラッシュアップ
- [ ] QRコード生成・配置
- [ ] Vercelデプロイ
- [ ] 動作確認・微調整

### Phase 5: レビュー・改善
- [ ] 全体的な見直し
- [ ] フィードバックに基づく改善

## 画面レイアウト（デスクトップ）

```
┌─────────────────────────────────────────────────────────┐
│  コントロールバー（経路設定・ツアー開始/停止・フィルタ）    │
├─────────────────────────────┬───────────────────────────┤
│                             │                           │
│                             │    Street View エリア     │
│     地図表示エリア           │        (右上 40%)         │
│       (左側 60%)            │                           │
│                             ├───────────────────────────┤
│     OSM地図                  │                           │
│     経路表示                 │    ガイドパネル           │
│     危険地点マーカー          │      (右下 40%)           │
│                             │    チェックポイント        │
│                             │    声かけ例               │
└─────────────────────────────┴───────────────────────────┘
```

## モバイル対応

- 地図とStreet Viewを切り替え表示（タブ式）
- ガイドパネルはアコーディオン形式
- タッチ操作に最適化

## 対応言語

- 日本語のみ

## テスト方針

- 主要コンポーネントの基本的な単体テスト
- Vitestを使用

## デプロイ

- Vercel（xxx.vercel.app）
- デプロイ後にQRコード生成

## 注意事項

- Google Street View API: APIキー必要、利用規約確認
- Street Viewカバレッジ: 全道路で利用可能ではない
- OSRM: 公開デモサーバーには利用制限あり
- オフライン利用: 不可（オンライン接続必須）

## 参考リンク

- [Honda Safety Map](https://safetymap.jp/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Leaflet Documentation](https://leafletjs.com/)
- [Google Street View API](https://developers.google.com/maps/documentation/streetview)
- [OSRM API](http://project-osrm.org/docs/v5.24.0/api/)
- [shadcn/ui](https://ui.shadcn.com/)
