"use client";

import { useRef, useCallback } from "react";
import { Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import { Waypoint } from "@/lib/types";

const LONG_PRESS_DURATION = 500; // ミリ秒

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

  const handleMouseDown = useCallback((id: string) => {
    pressedIdRef.current = id;
    longPressTimerRef.current = setTimeout(() => {
      if (pressedIdRef.current === id) {
        onDelete(id);
      }
    }, LONG_PRESS_DURATION);
  }, [onDelete]);

  const handleMouseUp = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    pressedIdRef.current = null;
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    pressedIdRef.current = null;
  }, []);

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
            mousedown: () => handleMouseDown(waypoint.id),
            mouseup: handleMouseUp,
            mouseout: handleMouseLeave,
            dragend: (e) => handleDragEnd(waypoint.id, e),
            // モバイル用（タッチイベント）- Leaflet内部でサポートされている
            ...({
              touchstart: () => handleMouseDown(waypoint.id),
              touchend: handleMouseUp,
              touchcancel: handleMouseLeave,
            } as Record<string, () => void>),
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
