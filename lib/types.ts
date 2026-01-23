// 危険地点の種類
export type HazardType = 'intersection' | 'accident' | 'braking' | 'user_report';

// 危険地点データ
export interface HazardPoint {
  id: string;
  type: HazardType;
  lat: number;
  lng: number;
  title: string;
  description: string;
  checkPoints: string[];
  voiceGuide: string;
  safetyTips: string[];
}

// 経路データ
export interface Route {
  id: string;
  name: string;
  waypoints: [number, number][]; // [lat, lng][]
  hazardPoints: string[]; // HazardPoint IDs on this route
}

// 経由地点（ユーザーが設定）
export interface Waypoint {
  id: string;
  lat: number;
  lng: number;
  type: 'start' | 'end' | 'via';
  label?: string;
}

// OSRM API レスポンスの型
export interface OSRMRoute {
  geometry: {
    coordinates: [number, number][]; // [lng, lat][]
    type: string;
  };
  legs: {
    steps: {
      geometry: {
        coordinates: [number, number][];
      };
      distance: number;
      duration: number;
    }[];
    distance: number;
    duration: number;
  }[];
  distance: number;
  duration: number;
}

export interface OSRMResponse {
  code: string;
  routes: OSRMRoute[];
  waypoints: {
    hint: string;
    distance: number;
    name: string;
    location: [number, number];
  }[];
}

// 危険地点タイプの情報
export const HAZARD_TYPE_INFO: Record<HazardType, {
  icon: string;
  color: string;
  label: string;
  description: string;
}> = {
  intersection: {
    icon: '⚠️',
    color: '#EAB308', // yellow-500
    label: '見通しの悪い交差点',
    description: '左右の確認が困難な交差点です。必ず一旦停止して安全確認をしましょう。',
  },
  accident: {
    icon: '🔴',
    color: '#EF4444', // red-500
    label: '事故多発エリア',
    description: '過去に事故が多発しているエリアです。特に注意して通行しましょう。',
  },
  braking: {
    icon: '🟠',
    color: '#F97316', // orange-500
    label: '急ブレーキ多発地点',
    description: '車が急ブレーキをかけることが多い地点です。車の動きに注意しましょう。',
  },
  user_report: {
    icon: '💬',
    color: '#3B82F6', // blue-500
    label: 'ユーザー投稿情報',
    description: '地域の方からの危険情報です。',
  },
};

// ============================================
// マイ危険ポイント関連の型定義
// ============================================

// マイ危険ポイントの理由
export type MyHazardReason =
  | 'narrow_road'        // 道路が狭い/歩道がない
  | 'poor_visibility'    // 見通しが悪い
  | 'speeding_cars'      // スピードを出すクルマが多い
  | 'high_traffic'       // 交通量が多い
  | 'pedestrian_conflict' // 歩行者/自転車との接触が心配
  | 'other';             // その他

// マイ危険ポイントの理由情報
export const MY_HAZARD_REASON_INFO: Record<MyHazardReason, {
  label: string;
  description: string;
  relatedHazardType?: HazardType;
}> = {
  narrow_road: {
    label: '道路が狭い/歩道がない',
    description: '車との距離が近くなりやすい場所です',
  },
  poor_visibility: {
    label: '見通しが悪い',
    description: '曲がり角や障害物で先が見えにくい場所です',
    relatedHazardType: 'intersection',
  },
  speeding_cars: {
    label: 'スピードを出すクルマが多い',
    description: '車がスピードを出しやすい道路です',
    relatedHazardType: 'braking',
  },
  high_traffic: {
    label: '交通量が多い',
    description: '車や自転車の通行が多い場所です',
    relatedHazardType: 'accident',
  },
  pedestrian_conflict: {
    label: '歩行者/自転車との接触が心配',
    description: '他の歩行者や自転車とぶつかりやすい場所です',
    relatedHazardType: 'user_report',
  },
  other: {
    label: 'その他',
    description: '上記以外の危険を感じる場所です',
  },
};

// マイ危険ポイントデータ
export interface MyHazardPoint {
  id: string;                    // UUID
  lat: number;                   // 緯度
  lng: number;                   // 経度
  reasons: MyHazardReason[];     // 危険理由（複数選択可、最低1つ必須）
  reasonDetail?: string;         // 補足説明（任意、「その他」選択時）
  routeId?: string;              // 紐づく経路ID（任意）
  createdAt: string;             // ISO 8601形式
  updatedAt: string;             // ISO 8601形式
}

// ローカルストレージ構造
export interface MyHazardStorage {
  version: number;               // スキーマバージョン
  pins: MyHazardPoint[];         // ピン一覧
  lastUpdated: string;           // 最終更新日時
}

// 巡回対象の選択
export type TourTarget = 'my_hazard_points' | 'safety_map';

// ============================================
// ツアー停止地点の型定義
// ============================================

// ツアーの停止地点（HazardPointまたはMyHazardPoint）
export type TourStopPoint = HazardPoint | MyHazardPoint;

// 型ガード関数：HazardPointかどうか
export function isHazardPoint(point: TourStopPoint): point is HazardPoint {
  return 'type' in point && 'title' in point;
}

// 型ガード関数：MyHazardPointかどうか
export function isMyHazardPoint(point: TourStopPoint): point is MyHazardPoint {
  return 'reasons' in point && 'createdAt' in point;
}
