"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Marker, Popup, Polyline, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { Waypoint } from "@/lib/types";

// 経由地点タイプ別のアイコン
const createWaypointIcon = (type: Waypoint["type"], index?: number, isMoving?: boolean) => {
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

  const baseColor = colors[type];
  const borderColor = isMoving ? "#FBBF24" : "white"; // 移動中は黄色ボーダー
  const borderWidth = isMoving ? "3px" : "2px";

  return L.divIcon({
    className: "custom-waypoint-icon",
    html: `
      <div style="
        background-color: ${baseColor};
        width: ${type === "via" ? "24px" : "30px"};
        height: ${type === "via" ? "24px" : "30px"};
        border-radius: 50%;
        border: ${borderWidth} solid ${borderColor};
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: ${type === "via" ? "10px" : "14px"};
        ${isMoving ? "animation: pulse 1s infinite;" : ""}
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

// 移動モード用のマップクリックハンドラ
function MoveHandler({
  movingWaypointId,
  onMapClick,
}: {
  movingWaypointId: string | null;
  onMapClick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click: (e) => {
      if (movingWaypointId) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

export function WaypointMarkers({
  waypoints,
  onDelete,
  onMove,
  isDrawingRoute,
  isDraggable = true,
}: WaypointMarkersProps) {
  const [movingWaypointId, setMovingWaypointId] = useState<string | null>(null);
  const popupRefs = useRef<Map<string, L.Popup>>(new Map());

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

  // 削除ボタンクリック
  const handleDelete = useCallback((id: string) => {
    // ポップアップを閉じる
    const popup = popupRefs.current.get(id);
    if (popup) {
      popup.close();
    }
    onDelete(id);
  }, [onDelete]);

  // 移動ボタンクリック
  const handleStartMove = useCallback((id: string) => {
    // ポップアップを閉じる
    const popup = popupRefs.current.get(id);
    if (popup) {
      popup.close();
    }
    setMovingWaypointId(id);
  }, []);

  // 地図クリックで移動完了
  const handleMapClick = useCallback((lat: number, lng: number) => {
    if (movingWaypointId) {
      onMove(movingWaypointId, lat, lng);
      setMovingWaypointId(null);
    }
  }, [movingWaypointId, onMove]);

  // 移動キャンセル（ESCキーやマーカー再クリック）
  const handleCancelMove = useCallback(() => {
    setMovingWaypointId(null);
  }, []);

  // ESCキーで移動モードをキャンセル
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && movingWaypointId) {
        setMovingWaypointId(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [movingWaypointId]);

  // ドラッグ終了時のハンドラ（デスクトップ用）
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
      {/* 移動モード用のマップクリックハンドラ */}
      <MoveHandler movingWaypointId={movingWaypointId} onMapClick={handleMapClick} />

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

      {/* 移動モード中の案内 */}
      {movingWaypointId && (
        <div
          style={{
            position: "fixed",
            top: "60px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#FBBF24",
            color: "#1F2937",
            padding: "8px 16px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            zIndex: 1000,
            fontWeight: "bold",
            fontSize: "14px",
          }}
        >
          地図をタップして移動先を選択
          <button
            onClick={handleCancelMove}
            style={{
              marginLeft: "12px",
              backgroundColor: "#6B7280",
              color: "white",
              border: "none",
              padding: "4px 8px",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            キャンセル
          </button>
        </div>
      )}

      {waypoints.map((waypoint) => {
        const isMoving = movingWaypointId === waypoint.id;

        return (
          <Marker
            key={waypoint.id}
            position={[waypoint.lat, waypoint.lng]}
            icon={createWaypointIcon(waypoint.type, viaIndexMap.get(waypoint.id), isMoving)}
            draggable={isDraggable && !isDrawingRoute && !movingWaypointId}
            eventHandlers={{
              dragend: (e) => handleDragEnd(waypoint.id, e),
              click: () => {
                // 移動モード中に同じマーカーをクリックしたらキャンセル
                if (movingWaypointId === waypoint.id) {
                  handleCancelMove();
                }
              },
            }}
          >
            <Popup
              ref={(popup) => {
                if (popup) {
                  popupRefs.current.set(waypoint.id, popup);
                }
              }}
            >
              <div className="text-sm min-w-[140px]">
                <p className="font-bold text-center mb-2">{getTypeLabel(waypoint.type)}</p>
                {waypoint.label && <p className="text-center mb-2">{waypoint.label}</p>}
                <p className="text-gray-500 text-xs text-center mb-3">
                  {waypoint.lat.toFixed(5)}, {waypoint.lng.toFixed(5)}
                </p>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => handleStartMove(waypoint.id)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-medium"
                  >
                    移動
                  </button>
                  <button
                    onClick={() => handleDelete(waypoint.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded text-xs font-medium"
                  >
                    削除
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}

      {/* 移動中マーカーのパルスアニメーション用CSS */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </>
  );
}
