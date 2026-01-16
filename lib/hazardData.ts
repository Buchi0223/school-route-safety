import { HazardPoint } from "./types";

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
