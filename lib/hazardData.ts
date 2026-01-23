import { HazardPoint, HazardType } from "./types";

/**
 * JSONファイルから危険地点データを読み込む
 */
export async function loadHazardPoints(): Promise<HazardPoint[]> {
  try {
    const response = await fetch("/data/hazardPoints.json");
    if (!response.ok) {
      throw new Error("Failed to load hazard points");
    }
    const data = await response.json();
    return data.hazardPoints;
  } catch (error) {
    console.error("Error loading hazard points:", error);
    return [];
  }
}

/**
 * 指定した座標の近くにある危険地点を取得
 * @param hazardPoints 危険地点配列
 * @param lat 緯度
 * @param lng 経度
 * @param radiusMeters 検索半径（メートル）
 */
export function getNearbyHazards(
  hazardPoints: HazardPoint[],
  lat: number,
  lng: number,
  radiusMeters: number = 500
): HazardPoint[] {
  return hazardPoints.filter((hazard) => {
    const distance = haversineDistance(lat, lng, hazard.lat, hazard.lng);
    return distance <= radiusMeters;
  });
}

/**
 * 経路上の危険地点を取得
 * @param hazardPoints 危険地点配列
 * @param routeCoordinates ルート座標配列
 * @param radiusMeters 経路からの検索半径（メートル）
 */
export function getHazardsAlongRoute(
  hazardPoints: HazardPoint[],
  routeCoordinates: [number, number][],
  radiusMeters: number = 50
): HazardPoint[] {
  const hazardsSet = new Set<string>();
  const result: HazardPoint[] = [];

  for (const [lat, lng] of routeCoordinates) {
    for (const hazard of hazardPoints) {
      if (hazardsSet.has(hazard.id)) continue;

      const distance = haversineDistance(lat, lng, hazard.lat, hazard.lng);
      if (distance <= radiusMeters) {
        hazardsSet.add(hazard.id);
        result.push(hazard);
      }
    }
  }

  return result;
}

// Haversine距離計算
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

// ============================================
// Safety Map自動選別ロジック
// ============================================

/**
 * 危険地点タイプ別の優先度スコア
 */
const HAZARD_TYPE_SCORES: Record<HazardType, number> = {
  accident: 10,      // 事故多発エリア
  braking: 8,        // 急ブレーキ多発
  intersection: 6,   // 見通しの悪い交差点
  user_report: 4,    // ユーザー投稿
};

/**
 * 選別設定
 */
const SELECTION_CONFIG = {
  routeRadiusMeters: 50,      // 経路からの検索半径
  closeDistanceBonus: 2,      // 10m以内の追加スコア
  closeDistanceThreshold: 10, // 近接判定の距離（メートル）
  minPoints: 3,               // 最小選出数
  maxPoints: 5,               // 最大選出数
  duplicateRadiusMeters: 50,  // 重複除去の半径
};

/**
 * HazardPointとスコアの組み合わせ
 */
interface ScoredHazardPoint {
  hazardPoint: HazardPoint;
  score: number;
  minDistanceToRoute: number;
}

/**
 * 経路上のHazardPointから重要なポイントを自動選別
 *
 * アルゴリズム:
 * 1. 経路から50m以内のHazardPointを抽出
 * 2. 各ポイントに優先度スコアを計算
 *    - タイプ別: accident(+10), braking(+8), intersection(+6), user_report(+4)
 *    - 距離: 経路から10m以内なら+2
 * 3. スコア順にソートし、上位3〜5件を選出
 * 4. 近接地点（50m以内）は代表1件のみ残す
 *
 * @param hazardPoints 全危険地点配列
 * @param routeCoordinates ルート座標配列 [lat, lng][]
 * @returns 選別されたHazardPoint配列（経路上の位置順）
 */
export function selectHazardPointsForTour(
  hazardPoints: HazardPoint[],
  routeCoordinates: [number, number][]
): HazardPoint[] {
  if (routeCoordinates.length === 0) {
    return [];
  }

  // 1. 経路から指定半径以内のHazardPointを抽出し、スコアを計算
  const scoredPoints = calculateScores(hazardPoints, routeCoordinates);

  if (scoredPoints.length === 0) {
    return [];
  }

  // 経路が短く、ポイント数が少ない場合は全件返却
  if (scoredPoints.length <= SELECTION_CONFIG.minPoints) {
    return sortByRoutePosition(
      scoredPoints.map((sp) => sp.hazardPoint),
      routeCoordinates
    );
  }

  // 2. スコア順にソート
  const sortedByScore = [...scoredPoints].sort((a, b) => b.score - a.score);

  // 3. 近接地点を除去しながら選出
  const selected = selectWithDuplicateRemoval(sortedByScore);

  // 4. 経路上の位置順にソート
  return sortByRoutePosition(selected, routeCoordinates);
}

/**
 * 各HazardPointのスコアを計算
 */
function calculateScores(
  hazardPoints: HazardPoint[],
  routeCoordinates: [number, number][]
): ScoredHazardPoint[] {
  const result: ScoredHazardPoint[] = [];

  for (const hazard of hazardPoints) {
    // 経路上の各点との最小距離を計算
    let minDistance = Infinity;
    for (const [lat, lng] of routeCoordinates) {
      const distance = haversineDistance(lat, lng, hazard.lat, hazard.lng);
      if (distance < minDistance) {
        minDistance = distance;
      }
    }

    // 経路から指定半径以内のポイントのみ対象
    if (minDistance <= SELECTION_CONFIG.routeRadiusMeters) {
      const score = calculateScore(hazard.type, minDistance);
      result.push({
        hazardPoint: hazard,
        score,
        minDistanceToRoute: minDistance,
      });
    }
  }

  return result;
}

/**
 * 優先度スコアを計算
 */
function calculateScore(type: HazardType, distanceToRoute: number): number {
  let score = HAZARD_TYPE_SCORES[type] || 0;

  // 経路から10m以内ならボーナス
  if (distanceToRoute <= SELECTION_CONFIG.closeDistanceThreshold) {
    score += SELECTION_CONFIG.closeDistanceBonus;
  }

  return score;
}

/**
 * 近接地点を除去しながら選出
 */
function selectWithDuplicateRemoval(
  sortedPoints: ScoredHazardPoint[]
): HazardPoint[] {
  const selected: HazardPoint[] = [];

  for (const { hazardPoint } of sortedPoints) {
    // 最大数に達したら終了
    if (selected.length >= SELECTION_CONFIG.maxPoints) {
      break;
    }

    // 既に選択済みのポイントと近接していないか確認
    const isTooClose = selected.some((selectedPoint) => {
      const distance = haversineDistance(
        hazardPoint.lat,
        hazardPoint.lng,
        selectedPoint.lat,
        selectedPoint.lng
      );
      return distance < SELECTION_CONFIG.duplicateRadiusMeters;
    });

    if (!isTooClose) {
      selected.push(hazardPoint);
    }
  }

  return selected;
}

/**
 * 経路上の位置順にソート
 */
function sortByRoutePosition(
  hazardPoints: HazardPoint[],
  routeCoordinates: [number, number][]
): HazardPoint[] {
  // 各HazardPointが経路上のどの位置に最も近いかを計算
  const withPosition = hazardPoints.map((hazard) => {
    let minIndex = 0;
    let minDistance = Infinity;

    for (let i = 0; i < routeCoordinates.length; i++) {
      const [lat, lng] = routeCoordinates[i];
      const distance = haversineDistance(lat, lng, hazard.lat, hazard.lng);
      if (distance < minDistance) {
        minDistance = distance;
        minIndex = i;
      }
    }

    return { hazard, routeIndex: minIndex };
  });

  // 経路インデックス順にソート
  withPosition.sort((a, b) => a.routeIndex - b.routeIndex);

  return withPosition.map((item) => item.hazard);
}

/**
 * 選別結果の情報を取得（UI表示用）
 */
export function getSelectionInfo(
  hazardPoints: HazardPoint[],
  routeCoordinates: [number, number][]
): {
  totalNearRoute: number;
  selected: HazardPoint[];
  selectedCount: number;
} {
  // 経路近くの全ポイント数
  const nearRoute = getHazardsAlongRoute(
    hazardPoints,
    routeCoordinates,
    SELECTION_CONFIG.routeRadiusMeters
  );

  // 選別されたポイント
  const selected = selectHazardPointsForTour(hazardPoints, routeCoordinates);

  return {
    totalNearRoute: nearRoute.length,
    selected,
    selectedCount: selected.length,
  };
}
