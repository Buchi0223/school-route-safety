"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { HazardPoint } from "./types";
import { interpolateRoutePoints } from "./routing";

export type TourStatus = "idle" | "playing" | "paused" | "finished";

export interface TourState {
  status: TourStatus;
  currentIndex: number;
  tourPoints: [number, number][];
  speed: number; // 1-5 (1=遅い, 5=速い)
  nearbyHazard: HazardPoint | null;
  // 既に一時停止した危険地点のIDセット（通過済み）
  pausedHazardIds: Set<string>;
}

const SPEED_INTERVALS: Record<number, number> = {
  1: 2000, // 2秒
  2: 1500,
  3: 1000, // 1秒（デフォルト）
  4: 700,
  5: 400,  // 0.4秒
};

interface UseTourProps {
  routeCoordinates: [number, number][] | null;
  hazardPoints: HazardPoint[];
  onPositionChange?: (position: [number, number], heading: number) => void;
  onHazardApproach?: (hazard: HazardPoint) => void;
  onTourEnd?: () => void;
}

export function useTour({
  routeCoordinates,
  hazardPoints,
  onPositionChange,
  onHazardApproach,
  onTourEnd,
}: UseTourProps) {
  const [state, setState] = useState<TourState>({
    status: "idle",
    currentIndex: 0,
    tourPoints: [],
    speed: 3,
    nearbyHazard: null,
    pausedHazardIds: new Set(),
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // ツアーポイントを生成
  const initializeTour = useCallback(() => {
    if (!routeCoordinates || routeCoordinates.length < 2) return;

    // 経路を一定間隔（20m）のポイントに補間
    const points = interpolateRoutePoints(routeCoordinates, 20);

    setState((prev) => ({
      ...prev,
      status: "idle",
      currentIndex: 0,
      tourPoints: points,
      nearbyHazard: null,
      pausedHazardIds: new Set(),
    }));
  }, [routeCoordinates]);

  // 経路が変更されたらツアーを初期化
  useEffect(() => {
    initializeTour();
  }, [initializeTour]);

  // 2点間の方位角を計算
  const calculateHeading = useCallback(
    (from: [number, number], to: [number, number]): number => {
      const lat1 = (from[0] * Math.PI) / 180;
      const lat2 = (to[0] * Math.PI) / 180;
      const dLng = ((to[1] - from[1]) * Math.PI) / 180;

      const y = Math.sin(dLng) * Math.cos(lat2);
      const x =
        Math.cos(lat1) * Math.sin(lat2) -
        Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

      let heading = (Math.atan2(y, x) * 180) / Math.PI;
      return (heading + 360) % 360;
    },
    []
  );

  // 近くの危険地点をチェック
  const checkNearbyHazard = useCallback(
    (position: [number, number]): HazardPoint | null => {
      const HAZARD_DETECTION_RADIUS = 30; // 30m以内

      for (const hazard of hazardPoints) {
        const distance = haversineDistance(
          position[0],
          position[1],
          hazard.lat,
          hazard.lng
        );
        if (distance <= HAZARD_DETECTION_RADIUS) {
          return hazard;
        }
      }
      return null;
    },
    [hazardPoints]
  );

  // 次のポイントへ移動
  const moveToNext = useCallback(() => {
    setState((prev) => {
      if (prev.status !== "playing" || prev.tourPoints.length === 0) {
        return prev;
      }

      const nextIndex = prev.currentIndex + 1;

      // ツアー終了
      if (nextIndex >= prev.tourPoints.length) {
        onTourEnd?.();
        return {
          ...prev,
          status: "finished",
          currentIndex: prev.tourPoints.length - 1,
        };
      }

      const currentPos = prev.tourPoints[nextIndex];
      const nextPos =
        nextIndex + 1 < prev.tourPoints.length
          ? prev.tourPoints[nextIndex + 1]
          : currentPos;

      // 方位角を計算
      const heading = calculateHeading(currentPos, nextPos);

      // 位置変更コールバック
      onPositionChange?.(currentPos, heading);

      // 危険地点チェック
      const nearbyHazard = checkNearbyHazard(currentPos);

      // まだ停止していない危険地点に接近した場合のみ自動停止
      if (nearbyHazard && !prev.pausedHazardIds.has(nearbyHazard.id)) {
        // 危険地点接近時は自動停止
        onHazardApproach?.(nearbyHazard);
        // この危険地点を停止済みセットに追加
        const newPausedHazardIds = new Set(prev.pausedHazardIds);
        newPausedHazardIds.add(nearbyHazard.id);
        return {
          ...prev,
          currentIndex: nextIndex,
          status: "paused",
          nearbyHazard,
          pausedHazardIds: newPausedHazardIds,
        };
      }

      return {
        ...prev,
        currentIndex: nextIndex,
        nearbyHazard,
      };
    });
  }, [calculateHeading, checkNearbyHazard, onPositionChange, onHazardApproach, onTourEnd]);

  // 再生
  const play = useCallback(() => {
    if (state.tourPoints.length === 0) return;

    setState((prev) => ({
      ...prev,
      status: "playing",
    }));
  }, [state.tourPoints.length]);

  // 一時停止
  const pause = useCallback(() => {
    setState((prev) => ({
      ...prev,
      status: "paused",
    }));
  }, []);

  // 停止（最初に戻る）
  const stop = useCallback(() => {
    setState((prev) => ({
      ...prev,
      status: "idle",
      currentIndex: 0,
      nearbyHazard: null,
      pausedHazardIds: new Set(), // 停止時は危険地点の停止履歴をリセット
    }));

    if (state.tourPoints.length > 0) {
      const firstPos = state.tourPoints[0];
      const secondPos = state.tourPoints[1] || firstPos;
      const heading = calculateHeading(firstPos, secondPos);
      onPositionChange?.(firstPos, heading);
    }
  }, [state.tourPoints, calculateHeading, onPositionChange]);

  // 前進
  const forward = useCallback(() => {
    setState((prev) => {
      if (prev.currentIndex >= prev.tourPoints.length - 1) return prev;

      const nextIndex = Math.min(prev.currentIndex + 5, prev.tourPoints.length - 1);
      const currentPos = prev.tourPoints[nextIndex];
      const nextPos =
        nextIndex + 1 < prev.tourPoints.length
          ? prev.tourPoints[nextIndex + 1]
          : currentPos;

      const heading = calculateHeading(currentPos, nextPos);
      onPositionChange?.(currentPos, heading);

      return {
        ...prev,
        currentIndex: nextIndex,
      };
    });
  }, [calculateHeading, onPositionChange]);

  // 後退
  const backward = useCallback(() => {
    setState((prev) => {
      if (prev.currentIndex <= 0) return prev;

      const nextIndex = Math.max(prev.currentIndex - 5, 0);
      const currentPos = prev.tourPoints[nextIndex];
      const nextPos =
        nextIndex + 1 < prev.tourPoints.length
          ? prev.tourPoints[nextIndex + 1]
          : currentPos;

      const heading = calculateHeading(currentPos, nextPos);
      onPositionChange?.(currentPos, heading);

      return {
        ...prev,
        currentIndex: nextIndex,
      };
    });
  }, [calculateHeading, onPositionChange]);

  // 速度変更
  const setSpeed = useCallback((speed: number) => {
    setState((prev) => ({
      ...prev,
      speed: Math.max(1, Math.min(5, speed)),
    }));
  }, []);

  // 特定のインデックスに移動
  const goToIndex = useCallback(
    (index: number) => {
      setState((prev) => {
        const clampedIndex = Math.max(0, Math.min(index, prev.tourPoints.length - 1));
        const currentPos = prev.tourPoints[clampedIndex];

        if (currentPos) {
          const nextPos =
            clampedIndex + 1 < prev.tourPoints.length
              ? prev.tourPoints[clampedIndex + 1]
              : currentPos;
          const heading = calculateHeading(currentPos, nextPos);
          onPositionChange?.(currentPos, heading);
        }

        return {
          ...prev,
          currentIndex: clampedIndex,
        };
      });
    },
    [calculateHeading, onPositionChange]
  );

  // 自動再生の制御
  useEffect(() => {
    if (state.status === "playing") {
      const interval = SPEED_INTERVALS[state.speed] || 1000;
      intervalRef.current = setInterval(moveToNext, interval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.status, state.speed, moveToNext]);

  // 現在位置
  const currentPosition: [number, number] | null =
    state.tourPoints.length > 0 ? state.tourPoints[state.currentIndex] : null;

  // 進捗率
  const progress =
    state.tourPoints.length > 1
      ? (state.currentIndex / (state.tourPoints.length - 1)) * 100
      : 0;

  return {
    ...state,
    currentPosition,
    progress,
    play,
    pause,
    stop,
    forward,
    backward,
    setSpeed,
    goToIndex,
    isReady: state.tourPoints.length > 0,
  };
}

// Haversine距離計算（メートル）
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
