"use client";

import { Button } from "@/components/ui/button";
import { Navigation, Trash2, Route } from "lucide-react";
import { Waypoint } from "@/lib/types";
import { Overlay } from "./Overlay";

interface RouteSearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  waypoints: Waypoint[];
  isDrawingRoute: boolean;
  onStartDrawing: () => void;
  onStopDrawing: () => void;
  onClearWaypoints: () => void;
  onCalculateRoute: () => void;
  isCalculatingRoute: boolean;
  routeDistance: number | null;
}

export function RouteSearchOverlay({
  isOpen,
  onClose,
  waypoints,
  onClearWaypoints,
  onCalculateRoute,
  isCalculatingRoute,
  routeDistance,
}: RouteSearchOverlayProps) {
  const startPoint = waypoints.find((wp) => wp.type === "start");
  const endPoint = waypoints.find((wp) => wp.type === "end");
  const viaPoints = waypoints.filter((wp) => wp.type === "via");

  const canCalculateRoute = startPoint && endPoint;

  const formatDistance = (meters: number) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${Math.round(meters)} m`;
  };

  const handleCalculateRoute = () => {
    onCalculateRoute();
    // ルート計算後にオーバーレイを閉じる
    if (canCalculateRoute) {
      onClose();
    }
  };

  return (
    <Overlay isOpen={isOpen} onClose={onClose} title="経路検索" disableBackgroundClose>
      <div className="p-3 space-y-3">
        {/* スタート・ゴール地点を横並び */}
        <div className="flex gap-2">
          {/* スタート地点 */}
          <div className="flex-1 flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              S
            </div>
            <div className="min-w-0 flex-1">
              {startPoint ? (
                <p className="text-xs text-green-600 truncate">
                  {startPoint.lat.toFixed(4)}, {startPoint.lng.toFixed(4)}
                </p>
              ) : (
                <p className="text-xs text-gray-400">タップで設定</p>
              )}
            </div>
          </div>

          {/* ゴール地点 */}
          <div className="flex-1 flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              G
            </div>
            <div className="min-w-0 flex-1">
              {endPoint ? (
                <p className="text-xs text-red-600 truncate">
                  {endPoint.lat.toFixed(4)}, {endPoint.lng.toFixed(4)}
                </p>
              ) : (
                <p className="text-xs text-gray-400">ダブルタップ</p>
              )}
            </div>
          </div>
        </div>

        {/* 経由地点と距離を横並び（コンパクト表示） */}
        {(viaPoints.length > 0 || routeDistance !== null) && (
          <div className="flex gap-2 text-xs">
            {viaPoints.length > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded">
                <span className="text-blue-600">経由: {viaPoints.length}箇所</span>
              </div>
            )}
            {routeDistance !== null && (
              <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 rounded">
                <Route className="h-3 w-3 text-blue-600" />
                <span className="text-blue-800 font-medium">{formatDistance(routeDistance)}</span>
              </div>
            )}
          </div>
        )}

        {/* 操作ヒント（簡潔版） */}
        <p className="text-xs text-gray-500 text-center">
          タップ→S/経由追加 | ダブルタップ→G設定 | 長押し→削除
        </p>

        {/* 操作ボタン */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 touch-manipulation h-10"
            onClick={onClearWaypoints}
            disabled={waypoints.length === 0}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            クリア
          </Button>

          <Button
            size="sm"
            className="flex-1 touch-manipulation h-10 bg-blue-600 hover:bg-blue-700"
            onClick={handleCalculateRoute}
            disabled={!canCalculateRoute || isCalculatingRoute}
          >
            <Navigation className="h-4 w-4 mr-1" />
            {isCalculatingRoute ? "計算中..." : "ルート計算"}
          </Button>
        </div>
      </div>
    </Overlay>
  );
}
