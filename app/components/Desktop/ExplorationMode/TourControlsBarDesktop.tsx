"use client";

import { memo, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Square,
  Gauge,
} from "lucide-react";

interface TourControlsBarDesktopProps {
  currentIndex: number;
  totalPoints: number;
  progress: number;
  isPlaying: boolean;
  speed: number;
  onPlay: () => void;
  onPause: () => void;
  onForward: () => void;
  onBackward: () => void;
  onStop: () => void;
  onSpeedChange: (speed: number) => void;
  onGoToIndex: (index: number) => void;
}

const SPEED_OPTIONS = [1, 2, 3] as const;

export const TourControlsBarDesktop = memo(function TourControlsBarDesktop({
  currentIndex,
  totalPoints,
  progress,
  isPlaying,
  speed,
  onPlay,
  onPause,
  onForward,
  onBackward,
  onStop,
  onSpeedChange,
  onGoToIndex,
}: TourControlsBarDesktopProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // ツアー開始時にフォーカス
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.focus();
    }
  }, []);

  const handleSliderChange = (value: number[]) => {
    if (value[0] !== undefined) {
      const index = Math.round((value[0] / 100) * (totalPoints - 1));
      onGoToIndex(index);
    }
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      onPause();
    } else {
      onPlay();
    }
  };

  return (
    <div
      ref={containerRef}
      className="bg-white/95 backdrop-blur shadow-lg rounded-xl border border-gray-200 p-4"
      tabIndex={0}
    >
      {/* 進捗情報 */}
      <div className="flex items-center justify-between mb-3 text-sm text-gray-600">
        <span>
          地点: <span className="font-bold text-gray-800">{currentIndex + 1}</span> / {totalPoints}
        </span>
        <span>
          進捗: <span className="font-bold text-blue-600">{Math.round(progress)}%</span>
        </span>
      </div>

      {/* 進捗スライダー */}
      <div className="mb-4">
        <Slider
          value={[progress]}
          onValueChange={handleSliderChange}
          max={100}
          step={1}
          className="w-full"
        />
      </div>

      {/* コントロールボタン */}
      <div className="flex items-center justify-between gap-2">
        {/* 左側：メインコントロール */}
        <div className="flex items-center gap-1">
          {/* 戻る */}
          <Button
            variant="outline"
            size="icon"
            onClick={onBackward}
            disabled={currentIndex <= 0}
            className="h-10 w-10 hover:bg-gray-100 transition-colors"
            title="前へ (←)"
          >
            <SkipBack className="h-4 w-4" />
          </Button>

          {/* 再生/一時停止 */}
          <Button
            variant="default"
            size="icon"
            onClick={handlePlayPause}
            className={`h-12 w-12 ${
              isPlaying
                ? "bg-yellow-500 hover:bg-yellow-600"
                : "bg-green-500 hover:bg-green-600"
            } transition-colors`}
            title={isPlaying ? "一時停止 (Space)" : "再生 (Space)"}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5 ml-0.5" />
            )}
          </Button>

          {/* 進む */}
          <Button
            variant="outline"
            size="icon"
            onClick={onForward}
            disabled={currentIndex >= totalPoints - 1}
            className="h-10 w-10 hover:bg-gray-100 transition-colors"
            title="次へ (→)"
          >
            <SkipForward className="h-4 w-4" />
          </Button>

          {/* 停止 */}
          <Button
            variant="outline"
            size="icon"
            onClick={onStop}
            className="h-10 w-10 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors ml-2"
            title="停止 (Escape)"
          >
            <Square className="h-4 w-4" />
          </Button>
        </div>

        {/* 右側：速度コントロール */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <Gauge className="h-4 w-4 text-gray-500 ml-1" />
          {SPEED_OPTIONS.map((s) => (
            <Button
              key={s}
              variant={speed === s ? "default" : "ghost"}
              size="sm"
              onClick={() => onSpeedChange(s)}
              className={`h-8 px-3 ${
                speed === s
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "hover:bg-gray-200"
              } transition-colors`}
              title={`${s}倍速 (${s})`}
            >
              {s}x
            </Button>
          ))}
        </div>
      </div>

      {/* キーボードショートカットヒント */}
      <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400 flex justify-center gap-4">
        <span>Space: 再生/停止</span>
        <span>← →: 前後移動</span>
        <span>1-3: 速度変更</span>
        <span>Esc: 終了</span>
      </div>
    </div>
  );
});
