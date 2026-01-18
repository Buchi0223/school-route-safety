"use client";

import { memo } from "react";
import { ChevronLeft, ChevronRight, Play, Pause, Gauge } from "lucide-react";

interface TourControlsCompactProps {
  isPlaying: boolean;
  progress: number;
  totalPoints: number;
  currentIndex: number;
  speed: number;
  onPlay: () => void;
  onPause: () => void;
  onForward: () => void;
  onBackward: () => void;
  onSpeedChange: (speed: number) => void;
  onProgressChange: (index: number) => void;
}

export const TourControlsCompact = memo(function TourControlsCompact({
  isPlaying,
  progress,
  totalPoints,
  currentIndex,
  speed,
  onPlay,
  onPause,
  onForward,
  onBackward,
  onSpeedChange,
  onProgressChange,
}: TourControlsCompactProps) {
  // 速度切り替え（1→2→3→4→5→1のループ）
  const handleSpeedToggle = () => {
    const nextSpeed = speed >= 5 ? 1 : speed + 1;
    onSpeedChange(nextSpeed);
  };

  // スライダー変更時
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    onProgressChange(value);
  };

  return (
    <div className="bg-black/70 backdrop-blur-sm h-[60px] px-3 flex items-center gap-2">
      {/* 戻るボタン */}
      <button
        onClick={onBackward}
        disabled={currentIndex === 0}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors touch-manipulation"
        aria-label="戻る"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>

      {/* 再生/一時停止ボタン */}
      <button
        onClick={isPlaying ? onPause : onPlay}
        className="w-12 h-12 flex items-center justify-center rounded-full bg-yellow-500 hover:bg-yellow-400 transition-colors touch-manipulation"
        aria-label={isPlaying ? "一時停止" : "再生"}
      >
        {isPlaying ? (
          <Pause className="w-6 h-6 text-white" />
        ) : (
          <Play className="w-6 h-6 text-white ml-0.5" />
        )}
      </button>

      {/* 進むボタン */}
      <button
        onClick={onForward}
        disabled={currentIndex >= totalPoints - 1}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors touch-manipulation"
        aria-label="進む"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>

      {/* 進捗スライダー */}
      <div className="flex-1 flex items-center gap-2 mx-2">
        <input
          type="range"
          min={0}
          max={totalPoints > 0 ? totalPoints - 1 : 0}
          value={currentIndex}
          onChange={handleSliderChange}
          className="w-full h-2 bg-white/30 rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-yellow-400
            [&::-webkit-slider-thumb]:shadow-md
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-moz-range-thumb]:w-4
            [&::-moz-range-thumb]:h-4
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-yellow-400
            [&::-moz-range-thumb]:border-none
            [&::-moz-range-thumb]:shadow-md
            [&::-moz-range-thumb]:cursor-pointer"
          style={{
            background: `linear-gradient(to right, #FBBF24 0%, #FBBF24 ${progress}%, rgba(255,255,255,0.3) ${progress}%, rgba(255,255,255,0.3) 100%)`,
          }}
        />
        <span className="text-white text-xs whitespace-nowrap min-w-[40px] text-right">
          {Math.round(progress)}%
        </span>
      </div>

      {/* 速度ボタン */}
      <button
        onClick={handleSpeedToggle}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors touch-manipulation relative"
        aria-label={`速度: ${speed}x`}
      >
        <Gauge className="w-5 h-5 text-white" />
        <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
          {speed}
        </span>
      </button>
    </div>
  );
});
