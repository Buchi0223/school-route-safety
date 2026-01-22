"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HazardPoint, Waypoint } from "@/lib/types";
import {
  Compass,
  MapPin,
  Flag,
  Play,
  RotateCcw,
  X,
  AlertTriangle,
  Trophy,
  Navigation,
  CheckCircle2,
} from "lucide-react";
import { memo } from "react";

type ControlMode = "route_setting" | "touring" | "hazard_stop" | "completed";

interface ExplorationControlsDesktopProps {
  mode: ControlMode;
  waypoints: Waypoint[];
  hasValidRoute: boolean;
  routeDistance: number | null;

  // ツアー中の情報
  currentIndex?: number;
  totalPoints?: number;
  progress?: number;
  isPlaying?: boolean;
  nearbyHazard?: HazardPoint | null;
  hazardCount?: number;

  // アクション
  onStartTour: () => void;
  onReset: () => void;
  onExit: () => void;
  onResume?: () => void;
  onRetry?: () => void;
}

export const ExplorationControlsDesktop = memo(function ExplorationControlsDesktop({
  mode,
  waypoints,
  hasValidRoute,
  routeDistance,
  currentIndex = 0,
  totalPoints = 0,
  progress = 0,
  isPlaying = false,
  nearbyHazard = null,
  hazardCount = 0,
  onStartTour,
  onReset,
  onExit,
  onResume,
  onRetry,
}: ExplorationControlsDesktopProps) {
  const startPoint = waypoints.find((wp) => wp.type === "start");
  const endPoint = waypoints.find((wp) => wp.type === "end");
  const viaCount = waypoints.filter((wp) => wp.type === "via").length;

  // 経路設定モード
  if (mode === "route_setting") {
    return (
      <Card className="bg-white/95 backdrop-blur shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-purple-700">
            <Compass className="h-5 w-5" />
            通学路探検モード
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 操作手順 */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-6 h-6 rounded-full ${startPoint ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"}`}>
                {startPoint ? <CheckCircle2 className="h-4 w-4" /> : "1"}
              </div>
              <span className={startPoint ? "text-green-700" : "text-gray-600"}>
                出発地点をクリック
              </span>
              {startPoint && <MapPin className="h-4 w-4 text-green-500" />}
            </div>
            <div className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-6 h-6 rounded-full ${endPoint ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"}`}>
                {endPoint ? <CheckCircle2 className="h-4 w-4" /> : "2"}
              </div>
              <span className={endPoint ? "text-green-700" : "text-gray-600"}>
                目的地をダブルクリック
              </span>
              {endPoint && <Flag className="h-4 w-4 text-red-500" />}
            </div>
            <div className="flex items-center gap-2 text-gray-500 text-xs pl-8">
              ※ 経由地点はシングルクリックで追加
            </div>
          </div>

          {/* 設定状態サマリー */}
          <div className="flex items-center gap-3 text-sm bg-gray-50 rounded-lg p-2">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4 text-green-500" />
              <span>{startPoint ? "設定済" : "未設定"}</span>
            </div>
            <div className="flex items-center gap-1">
              <Flag className="h-4 w-4 text-red-500" />
              <span>{endPoint ? "設定済" : "未設定"}</span>
            </div>
            {viaCount > 0 && (
              <div className="flex items-center gap-1">
                <Navigation className="h-4 w-4 text-blue-500" />
                <span>経由{viaCount}点</span>
              </div>
            )}
          </div>

          {/* 距離表示 */}
          {routeDistance && (
            <div className="text-sm text-gray-600 bg-blue-50 rounded-lg p-2">
              総距離: <span className="font-bold text-blue-700">{routeDistance.toFixed(0)}m</span>
            </div>
          )}

          {/* ボタン */}
          <div className="flex gap-2">
            <Button
              onClick={onStartTour}
              disabled={!hasValidRoute}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              <Play className="h-4 w-4 mr-2" />
              探検スタート
            </Button>
            <Button
              onClick={onReset}
              variant="outline"
              size="icon"
              title="リセット"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              onClick={onExit}
              variant="ghost"
              size="icon"
              title="終了"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ツアー中モード
  if (mode === "touring") {
    return (
      <Card className="bg-white/95 backdrop-blur shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <Navigation className="h-5 w-5 animate-pulse" />
            ツアー中
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* 進捗情報 */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>進捗</span>
              <span className="font-bold">{currentIndex + 1} / {totalPoints}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* 距離情報 */}
          {routeDistance && (
            <div className="text-sm text-gray-600">
              総距離: <span className="font-bold">{routeDistance.toFixed(0)}m</span>
            </div>
          )}

          {/* ステータス */}
          <div className="flex items-center gap-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${isPlaying ? "bg-green-500 animate-pulse" : "bg-yellow-500"}`} />
            <span>{isPlaying ? "再生中" : "一時停止中"}</span>
          </div>

          {/* 終了ボタン */}
          <Button
            onClick={onExit}
            variant="outline"
            className="w-full"
          >
            <X className="h-4 w-4 mr-2" />
            ツアー終了
          </Button>
        </CardContent>
      </Card>
    );
  }

  // 危険地点停止モード
  if (mode === "hazard_stop" && nearbyHazard) {
    return (
      <Card className="bg-white/95 backdrop-blur shadow-lg border-red-200">
        <CardHeader className="pb-2 bg-red-50 rounded-t-lg">
          <CardTitle className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            危険地点で停止中
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-3">
          {/* 危険地点情報 */}
          <div className="bg-red-50 rounded-lg p-3">
            <h4 className="font-bold text-red-800">{nearbyHazard.title}</h4>
            <p className="text-sm text-red-600 mt-1">{nearbyHazard.description}</p>
          </div>

          {/* 進捗情報 */}
          <div className="flex justify-between text-sm text-gray-600">
            <span>進捗</span>
            <span className="font-bold">{currentIndex + 1} / {totalPoints}</span>
          </div>

          {/* ボタン */}
          <div className="flex gap-2">
            <Button
              onClick={onResume}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <Play className="h-4 w-4 mr-2" />
              ツアー再開
            </Button>
            <Button
              onClick={onExit}
              variant="outline"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 完了モード
  if (mode === "completed") {
    return (
      <Card className="bg-white/95 backdrop-blur shadow-lg border-yellow-200">
        <CardHeader className="pb-2 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-t-lg">
          <CardTitle className="flex items-center gap-2 text-yellow-700">
            <Trophy className="h-5 w-5" />
            探検完了！
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-3">
          {/* 実績 */}
          <div className="bg-yellow-50 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">確認した危険地点</span>
              <span className="font-bold text-yellow-700">{hazardCount}箇所</span>
            </div>
            {routeDistance && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">歩行距離</span>
                <span className="font-bold text-yellow-700">{routeDistance.toFixed(0)}m</span>
              </div>
            )}
          </div>

          {/* ボタン */}
          <div className="flex gap-2">
            <Button
              onClick={onRetry}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              もう一度探検
            </Button>
            <Button
              onClick={onExit}
              variant="outline"
            >
              終了
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
});
