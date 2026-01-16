import { OSRMResponse, Waypoint } from "./types";

const OSRM_BASE_URL = "https://router.project-osrm.org";

/**
 * OSRM APIを使用して歩行者向けルートを取得
 * @param waypoints 経由地点の配列
 * @returns ルートの座標配列 [lat, lng][]
 */
export async function getWalkingRoute(
  waypoints: Waypoint[]
): Promise<[number, number][] | null> {
  if (waypoints.length < 2) {
    return null;
  }

  // 座標を "lng,lat" 形式で連結（OSRMは lng,lat の順）
  const coordinates = waypoints
    .map((wp) => `${wp.lng},${wp.lat}`)
    .join(";");

  const url = `${OSRM_BASE_URL}/route/v1/foot/${coordinates}?overview=full&geometries=geojson`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.error("OSRM API error:", response.status, response.statusText);
      return null;
    }

    const data: OSRMResponse = await response.json();

    if (data.code !== "Ok" || !data.routes || data.routes.length === 0) {
      console.error("OSRM returned no routes:", data.code);
      return null;
    }

    // GeoJSON座標は [lng, lat] なので [lat, lng] に変換
    const route = data.routes[0];
    const coordinates_latLng: [number, number][] = route.geometry.coordinates.map(
      ([lng, lat]) => [lat, lng]
    );

    return coordinates_latLng;
  } catch (error) {
    console.error("Failed to fetch route:", error);
    return null;
  }
}

/**
 * ルートの総距離を計算（メートル）
 */
export function calculateRouteDistance(coordinates: [number, number][]): number {
  let totalDistance = 0;

  for (let i = 0; i < coordinates.length - 1; i++) {
    totalDistance += haversineDistance(
      coordinates[i][0],
      coordinates[i][1],
      coordinates[i + 1][0],
      coordinates[i + 1][1]
    );
  }

  return totalDistance;
}

/**
 * 2点間のHaversine距離を計算（メートル）
 */
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // 地球の半径（メートル）
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

/**
 * 経由地点を出発点から目的地への直線上の順序でソートする
 * 出発点からの距離に基づいて、経由地点を最適な順序に並べ替える
 */
export function sortWaypointsByRoute(waypoints: Waypoint[]): Waypoint[] {
  const startPoint = waypoints.find((wp) => wp.type === "start");
  const endPoint = waypoints.find((wp) => wp.type === "end");
  const viaPoints = waypoints.filter((wp) => wp.type === "via");

  if (!startPoint || !endPoint || viaPoints.length === 0) {
    return waypoints;
  }

  // 経由地点を出発点からの直線距離でソート
  // 直線距離を使用することで、大体の経路順になる
  const sortedViaPoints = [...viaPoints].sort((a, b) => {
    const distA = haversineDistance(startPoint.lat, startPoint.lng, a.lat, a.lng);
    const distB = haversineDistance(startPoint.lat, startPoint.lng, b.lat, b.lng);
    return distA - distB;
  });

  return [startPoint, ...sortedViaPoints, endPoint];
}

/**
 * 経路上の一定間隔のポイントを生成（Street Viewツアー用）
 * @param coordinates ルート座標
 * @param intervalMeters 間隔（メートル）
 * @returns 一定間隔のポイント配列
 */
export function interpolateRoutePoints(
  coordinates: [number, number][],
  intervalMeters: number = 20
): [number, number][] {
  if (coordinates.length < 2) return coordinates;

  const result: [number, number][] = [coordinates[0]];
  let accumulatedDistance = 0;

  for (let i = 0; i < coordinates.length - 1; i++) {
    const start = coordinates[i];
    const end = coordinates[i + 1];
    const segmentDistance = haversineDistance(start[0], start[1], end[0], end[1]);

    while (accumulatedDistance + intervalMeters <= segmentDistance) {
      accumulatedDistance += intervalMeters;
      const ratio = accumulatedDistance / segmentDistance;
      const lat = start[0] + (end[0] - start[0]) * ratio;
      const lng = start[1] + (end[1] - start[1]) * ratio;
      result.push([lat, lng]);
    }

    accumulatedDistance -= segmentDistance;
  }

  // 最後の地点を追加
  result.push(coordinates[coordinates.length - 1]);

  return result;
}
