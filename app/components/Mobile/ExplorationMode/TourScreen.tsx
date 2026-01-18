"use client";

import { memo, useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { X, Loader2, MapPin } from "lucide-react";
import { TourControlsCompact } from "./TourControlsCompact";
import { HazardPoint } from "@/lib/types";

// MiniMapを動的インポート（SSR無効）
const MiniMap = dynamic(
  () => import("./MiniMap").then((mod) => mod.MiniMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-[100px] h-[100px] bg-gray-700 rounded-lg animate-pulse" />
    ),
  }
);

// Google Maps API の型定義
declare global {
  interface Window {
    initTourStreetView?: () => void;
  }
}

interface TourScreenProps {
  apiKey: string;
  routeCoordinates: [number, number][];
  hazardPoints?: HazardPoint[];
  // ツアー状態
  tourPoints: [number, number][];
  currentIndex: number;
  currentPosition: [number, number] | null;
  heading: number;
  progress: number;
  speed: number;
  isPlaying: boolean;
  nearbyHazard: HazardPoint | null;
  // コントロール
  onPlay: () => void;
  onPause: () => void;
  onForward: () => void;
  onBackward: () => void;
  onSpeedChange: (speed: number) => void;
  onGoToIndex: (index: number) => void;
  onExit: () => void;
}

export const TourScreen = memo(function TourScreen({
  apiKey,
  routeCoordinates,
  hazardPoints = [],
  tourPoints,
  currentIndex,
  currentPosition,
  heading,
  progress,
  speed,
  isPlaying,
  nearbyHazard,
  onPlay,
  onPause,
  onForward,
  onBackward,
  onSpeedChange,
  onGoToIndex,
  onExit,
}: TourScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const panoramaRef = useRef<google.maps.StreetViewPanorama | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Google Maps API を読み込む
  useEffect(() => {
    if (window.google?.maps) {
      setIsLoaded(true);
      return;
    }

    if (!apiKey) {
      setError("Google Maps API キーが設定されていません");
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initTourStreetView`;
    script.async = true;
    script.defer = true;

    window.initTourStreetView = () => {
      setIsLoaded(true);
    };

    script.onerror = () => {
      setError("Google Maps API の読み込みに失敗しました");
    };

    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [apiKey]);

  // Street View を初期化・更新
  const updatePanorama = useCallback(
    (lat: number, lng: number, heading: number) => {
      if (!isLoaded || !containerRef.current) return;

      const position = { lat, lng };

      if (!panoramaRef.current) {
        panoramaRef.current = new window.google.maps.StreetViewPanorama(
          containerRef.current,
          {
            position,
            pov: { heading, pitch: 0 },
            zoom: 1,
            addressControl: false,
            showRoadLabels: false,
            motionTracking: false,
            motionTrackingControl: false,
            fullscreenControl: false,
            linksControl: false,
            panControl: false,
            zoomControl: false,
          }
        );
      } else {
        panoramaRef.current.setPosition(position);
        panoramaRef.current.setPov({ heading, pitch: 0 });
      }
    },
    [isLoaded]
  );

  // 位置更新時にStreet Viewを更新
  useEffect(() => {
    if (currentPosition && isLoaded) {
      updatePanorama(currentPosition[0], currentPosition[1], heading);
    }
  }, [currentPosition, heading, isLoaded, updatePanorama]);

  // エラー表示
  if (error) {
    return (
      <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col items-center justify-center">
        <p className="text-red-400 text-center px-4">{error}</p>
        <button
          onClick={onExit}
          className="mt-4 px-4 py-2 bg-white/20 text-white rounded-lg"
        >
          戻る
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* ヘッダー */}
      <div className="h-12 bg-black/80 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-yellow-400" />
          <span className="text-white font-bold text-sm">探検中</span>
          {nearbyHazard && (
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">
              危険地点付近
            </span>
          )}
        </div>
        <button
          onClick={onExit}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors touch-manipulation"
          aria-label="終了"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Street View (全画面) */}
      <div className="flex-1 relative">
        <div
          ref={containerRef}
          className="w-full h-full"
          style={{ backgroundColor: "#1a1a1a" }}
        >
          {!isLoaded && (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
              <p className="text-gray-400 text-sm">Street View を読み込み中...</p>
            </div>
          )}
        </div>

        {/* MiniMap オーバーレイ (右上) */}
        <div className="absolute top-4 right-4">
          <MiniMap
            routeCoordinates={routeCoordinates}
            currentPosition={currentPosition}
            heading={heading}
            hazardPoints={hazardPoints}
          />
        </div>

        {/* 進捗インジケーター (左下) */}
        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2">
          <p className="text-white text-xs font-medium">
            {currentIndex + 1} / {tourPoints.length}
          </p>
        </div>
      </div>

      {/* コントロールバー */}
      <div className="shrink-0">
        <TourControlsCompact
          isPlaying={isPlaying}
          progress={progress}
          totalPoints={tourPoints.length}
          currentIndex={currentIndex}
          speed={speed}
          onPlay={onPlay}
          onPause={onPause}
          onForward={onForward}
          onBackward={onBackward}
          onSpeedChange={onSpeedChange}
          onProgressChange={onGoToIndex}
        />
      </div>
    </div>
  );
});
