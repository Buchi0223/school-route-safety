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
