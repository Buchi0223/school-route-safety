"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  Navigation,
  AlertTriangle,
} from "lucide-react";
import { TourStatus } from "@/lib/useTour";
import { HazardPoint, HAZARD_TYPE_INFO } from "@/lib/types";

interface TourControlsProps {
  status: TourStatus;
  progress: number;
  speed: number;
  isReady: boolean;
  nearbyHazard: HazardPoint | null;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onForward: () => void;
  onBackward: () => void;
  onSpeedChange: (speed: number) => void;
  onProgressChange: (progress: number) => void;
  totalPoints: number;
  currentIndex: number;
}

export function TourControls({
  status,
  progress,
  speed,
  isReady,
  nearbyHazard,
  onPlay,
  onPause,
  onStop,
  onForward,
  onBackward,
  onSpeedChange,
  onProgressChange,
  totalPoints,
  currentIndex,
}: TourControlsProps) {
  const isPlaying = status === "playing";
  const isPaused = status === "paused";
  const isFinished = status === "finished";

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = parseFloat(e.target.value);
    const newIndex = Math.round((newProgress / 100) * (totalPoints - 1));
    onProgressChange(newIndex);
  };

  if (!isReady) {
    return (
      <Card className="shadow-md">
        <CardHeader className="pb-2 pt-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Navigation className="h-4 w-4" />
            バーチャルツアー
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-3">
          <p className="text-sm text-gray-500 text-center py-2">
            ルートを計算してからツアーを開始できます
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2 pt-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Navigation className="h-4 w-4" />
          バーチャルツアー
          {isFinished && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
              完了
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pb-3">
        {/* 危険地点接近時の警告 */}
        {nearbyHazard && (
          <div
            className="flex items-center gap-2 p-2 rounded text-sm"
            style={{
              backgroundColor: `${HAZARD_TYPE_INFO[nearbyHazard.type].color}20`,
              borderLeft: `3px solid ${HAZARD_TYPE_INFO[nearbyHazard.type].color}`,
            }}
          >
            <AlertTriangle
              className="h-4 w-4 flex-shrink-0"
              style={{ color: HAZARD_TYPE_INFO[nearbyHazard.type].color }}
            />
            <div>
              <p className="font-medium text-xs">{nearbyHazard.title}</p>
              <p className="text-xs text-gray-600">危険地点に接近しました</p>
            </div>
          </div>
        )}

        {/* プログレスバー */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-500">
            <span>進捗</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleProgressChange}
            className="w-full h-3 lg:h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 touch-manipulation"
          />
        </div>

        {/* コントロールボタン */}
        <div className="flex items-center justify-center gap-2 lg:gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 lg:h-8 lg:w-8 touch-manipulation"
            onClick={onBackward}
            disabled={currentIndex <= 0}
          >
            <SkipBack className="h-5 w-5 lg:h-4 lg:w-4" />
          </Button>

          {isPlaying ? (
            <Button
              size="icon"
              className="h-12 w-12 lg:h-10 lg:w-10 touch-manipulation"
              onClick={onPause}
            >
              <Pause className="h-6 w-6 lg:h-5 lg:w-5" />
            </Button>
          ) : (
            <Button
              size="icon"
              className="h-12 w-12 lg:h-10 lg:w-10 touch-manipulation"
              onClick={onPlay}
              disabled={isFinished}
            >
              <Play className="h-6 w-6 lg:h-5 lg:w-5" />
            </Button>
          )}

          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 lg:h-8 lg:w-8 touch-manipulation"
            onClick={onStop}
            disabled={status === "idle"}
          >
            <Square className="h-5 w-5 lg:h-4 lg:w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 lg:h-8 lg:w-8 touch-manipulation"
            onClick={onForward}
            disabled={currentIndex >= totalPoints - 1}
          >
            <SkipForward className="h-5 w-5 lg:h-4 lg:w-4" />
          </Button>
        </div>

        {/* 速度調整 */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-500">
            <span>速度</span>
            <span>
              {speed === 1 && "遅い"}
              {speed === 2 && "やや遅い"}
              {speed === 3 && "普通"}
              {speed === 4 && "やや速い"}
              {speed === 5 && "速い"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">遅</span>
            <input
              type="range"
              min="1"
              max="5"
              value={speed}
              onChange={(e) => onSpeedChange(parseInt(e.target.value))}
              className="flex-1 h-3 lg:h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 touch-manipulation"
            />
            <span className="text-xs text-gray-400">速</span>
          </div>
        </div>

        {/* ステータス表示 */}
        <div className="text-center text-xs text-gray-500">
          {status === "idle" && "再生ボタンでツアーを開始"}
          {status === "playing" && "ツアー再生中..."}
          {status === "paused" && nearbyHazard && "危険地点で一時停止中"}
          {status === "paused" && !nearbyHazard && "一時停止中"}
          {status === "finished" && "ツアーが完了しました"}
        </div>
      </CardContent>
    </Card>
  );
}
