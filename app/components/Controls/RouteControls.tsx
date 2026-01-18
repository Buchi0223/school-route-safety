"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Navigation, Trash2, Route, MousePointer2 } from "lucide-react";
import { Waypoint } from "@/lib/types";

interface RouteControlsProps {
  waypoints: Waypoint[];
  isDrawingRoute: boolean;
  onStartDrawing: () => void;
  onStopDrawing: () => void;
  onClearWaypoints: () => void;
  onCalculateRoute: () => void;
  isCalculatingRoute: boolean;
  routeDistance: number | null;
}

export function RouteControls({
  waypoints,
  isDrawingRoute,
  onStartDrawing,
  onStopDrawing,
  onClearWaypoints,
  onCalculateRoute,
  isCalculatingRoute,
  routeDistance,
}: RouteControlsProps) {
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

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2 pt-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Route className="h-4 w-4" />
          経路設定
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pb-3">
        {/* 地点サマリー */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-[10px] font-bold">
              S
            </div>
            <span className={startPoint ? "text-green-700" : "text-gray-400"}>
              {startPoint ? "設定済" : "未設定"}
            </span>
          </div>

          {viaPoints.length > 0 && (
            <div className="flex items-center gap-1">
              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-[10px] font-bold">
                {viaPoints.length}
              </div>
              <span className="text-blue-700">経由</span>
            </div>
          )}

          <div className="flex items-center gap-1">
            <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white text-[10px] font-bold">
              G
            </div>
            <span className={endPoint ? "text-red-700" : "text-gray-400"}>
              {endPoint ? "設定済" : "未設定"}
            </span>
          </div>

          {routeDistance !== null && (
            <span className="ml-auto text-gray-600 font-medium">
              {formatDistance(routeDistance)}
            </span>
          )}
        </div>

        {/* 操作ボタン */}
        <div className="flex gap-2">
          {isDrawingRoute ? (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 touch-manipulation min-h-[44px] lg:min-h-0"
              onClick={onStopDrawing}
            >
              描画終了
            </Button>
          ) : (
            <Button
              size="sm"
              className="flex-1 touch-manipulation min-h-[44px] lg:min-h-0"
              onClick={onStartDrawing}
              disabled={waypoints.length >= 10}
            >
              <MousePointer2 className="h-3 w-3 mr-1" />
              経路を描く
            </Button>
          )}

          <Button
            variant="secondary"
            size="sm"
            className="flex-1 touch-manipulation min-h-[44px] lg:min-h-0"
            onClick={onCalculateRoute}
            disabled={!canCalculateRoute || isCalculatingRoute}
          >
            <Navigation className="h-3 w-3 mr-1" />
            {isCalculatingRoute ? "計算中..." : "ルート計算"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="touch-manipulation min-h-[44px] min-w-[44px] lg:min-h-0 lg:min-w-0"
            onClick={onClearWaypoints}
            disabled={waypoints.length === 0}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>

        {/* 描画中のヒント */}
        {isDrawingRoute && (
          <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
            <p className="font-medium mb-1">操作方法:</p>
            <ul className="space-y-0.5 text-blue-700">
              <li>• クリック: 地点を追加（最初=出発、途中=経由）</li>
              <li>• ダブルクリック: 目的地を設定して終了</li>
              <li>• マーカーをクリック → 移動/削除ボタンで操作</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
