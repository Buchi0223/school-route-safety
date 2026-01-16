"use client";

import { useRef, useCallback, useEffect } from "react";
import { Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import { Waypoint } from "@/lib/types";

const LONG_PRESS_DURATION = 600; // ミリ秒（少し長めに）
const MOVE_THRESHOLD = 10; // ピクセル（この範囲内の移動は許容）

// 経由地点タイプ別のアイコン
const createWaypointIcon = (type: Waypoint["type"], index?: number) => {
  const colors = {
    start: "#22C55E", // green-500
    end: "#EF4444", // red-500
    via: "#3B82F6", // blue-500
  };

  const getLabel = () => {
    if (type === "start") return "S";
    if (type === "end") return "G";
    return index !== undefined ? String(index + 1) : "";
  };

  return L.divIcon({
    className: "custom-waypoint-icon",
    html: `
      <div style="
        background-color: ${colors[type]};
        width: ${type === "via" ? "24px" : "30px"};
        height: ${type === "via" ? "24px" : "30px"};
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: ${type === "via" ? "10px" : "14px"};
      ">
        ${getLabel()}
      </div>
    `,
    iconSize: [type === "via" ? 24 : 30, type === "via" ? 24 : 30],
    iconAnchor: [type === "via" ? 12 : 15, type === "via" ? 12 : 15],
    popupAnchor: [0, type === "via" ? -12 : -15],
  });
};

interface WaypointMarkersProps {
  waypoints: Waypoint[];
  onDelete: (id: string) => void;
  onMove: (id: string, lat: number, lng: number) => void;
  isDrawingRoute: boolean;
  isDraggable?: boolean;
}

export function WaypointMarkers({
  waypoints,
  onDelete,
  onMove,
  isDrawingRoute,
  isDraggable = true,
}: WaypointMarkersProps) {
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pressedIdRef = useRef<string | null>(null);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const isLongPressTriggeredRef = useRef(false);

  const getTypeLabel = (type: Waypoint["type"]) => {
    switch (type) {
      case "start":
        return "出発地点";
      case "end":
        return "目的地";
      case "via":
        return "経由地点";
    }
  };

  const clearLongPressTimer = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    pressedIdRef.current = null;
    startPosRef.current = null;
  }, []);

  const handlePressStart = useCallback((id: string, clientX?: number, clientY?: number) => {
    // 既存のタイマーをクリア
    clearLongPressTimer();

    pressedIdRef.current = id;
    isLongPressTriggeredRef.current = false;
    startPosRef.current = clientX !== undefined && clientY !== undefined
      ? { x: clientX, y: clientY }
      : null;

    longPressTimerRef.current = setTimeout(() => {
      if (pressedIdRef.current === id && !isLongPressTriggeredRef.current) {
        isLongPressTriggeredRef.current = true;
        onDelete(id);
        clearLongPressTimer();
      }
    }, LONG_PRESS_DURATION);
  }, [onDelete, clearLongPressTimer]);

  const handlePressMove = useCallback((clientX: number, clientY: number) => {
    // 移動距離が閾値を超えたらキャンセル
    if (startPosRef.current && longPressTimerRef.current) {
      const dx = Math.abs(clientX - startPosRef.current.x);
      const dy = Math.abs(clientY - startPosRef.current.y);
      if (dx > MOVE_THRESHOLD || dy > MOVE_THRESHOLD) {
        clearLongPressTimer();
      }
    }
  }, [clearLongPressTimer]);

  const handlePressEnd = useCallback(() => {
    clearLongPressTimer();
  }, [clearLongPressTimer]);

  // ドラッグ終了時のハンドラ
  const handleDragEnd = useCallback(
    (id: string, e: L.DragEndEvent) => {
      const marker = e.target as L.Marker;
      const position = marker.getLatLng();
      onMove(id, position.lat, position.lng);
    },
    [onMove]
  );

  // 経由地点のインデックスを計算
  const viaIndexMap = new Map<string, number>();
  let viaIndex = 0;
  waypoints.forEach((wp) => {
    if (wp.type === "via") {
      viaIndexMap.set(wp.id, viaIndex++);
    }
  });

  // 経由地点間を結ぶ線（ルート計算前の仮線）
  const waypointPositions: [number, number][] = waypoints.map((wp) => [wp.lat, wp.lng]);

  return (
    <>
      {/* 経由地点間の仮線（点線） */}
      {isDrawingRoute && waypoints.length >= 2 && (
        <Polyline
          positions={waypointPositions}
          pathOptions={{
            color: "#9CA3AF",
            weight: 2,
            dashArray: "5, 10",
            opacity: 0.7,
          }}
        />
      )}

      {waypoints.map((waypoint) => (
        <Marker
          key={waypoint.id}
          position={[waypoint.lat, waypoint.lng]}
          icon={createWaypointIcon(waypoint.type, viaIndexMap.get(waypoint.id))}
          draggable={isDraggable && !isDrawingRoute}
          eventHandlers={{
            // デスクトップ用
            mousedown: (e) => {
              const event = e.originalEvent as MouseEvent;
              handlePressStart(waypoint.id, event.clientX, event.clientY);
            },
            mouseup: handlePressEnd,
            mouseout: handlePressEnd,
            mousemove: (e) => {
              const event = e.originalEvent as MouseEvent;
              handlePressMove(event.clientX, event.clientY);
            },
            dragstart: handlePressEnd, // ドラッグ開始時は長押しキャンセル
            dragend: (e) => handleDragEnd(waypoint.id, e),
            // モバイル用（タッチイベント）
            ...({
              touchstart: (e: L.LeafletMouseEvent) => {
                const originalEvent = e.originalEvent as unknown as TouchEvent;
                const touch = originalEvent?.touches?.[0];
                if (touch) {
                  handlePressStart(waypoint.id, touch.clientX, touch.clientY);
                }
              },
              touchmove: (e: L.LeafletMouseEvent) => {
                const originalEvent = e.originalEvent as unknown as TouchEvent;
                const touch = originalEvent?.touches?.[0];
                if (touch) {
                  handlePressMove(touch.clientX, touch.clientY);
                }
              },
              touchend: handlePressEnd,
              touchcancel: handlePressEnd,
            } as Record<string, (e: L.LeafletMouseEvent) => void>),
          }}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-bold">{getTypeLabel(waypoint.type)}</p>
              {waypoint.label && <p>{waypoint.label}</p>}
              <p className="text-gray-500 text-xs">
                {waypoint.lat.toFixed(6)}, {waypoint.lng.toFixed(6)}
              </p>
              <p className="text-gray-400 text-xs mt-1">
                ドラッグで移動 / 長押しで削除
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}
