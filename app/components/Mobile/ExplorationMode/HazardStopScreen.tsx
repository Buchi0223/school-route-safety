"use client";

import { memo, useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { AlertTriangle, Loader2 } from "lucide-react";
import { CharacterBubble } from "./CharacterBubble";
import { HazardPoint, HAZARD_TYPE_INFO } from "@/lib/types";

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
    initHazardStreetView?: () => void;
  }
}

// セリフシーケンス
const SPEECH_SEQUENCE = [
  {
    message: "ここには、どんな危ない場所がひそんでいそうかな？",
    subMessage: "まわりをよく見てみよう",
  },
  {
    message: "見つけた危ない場所で身を守るにはどうしたらいいかな？",
    subMessage: "考えてみよう",
  },
  {
    message: "続きの道を進もう！",
    subMessage: "タップしてツアーを再開",
  },
];

interface HazardStopScreenProps {
  apiKey: string;
  hazard: HazardPoint;
  routeCoordinates: [number, number][];
  currentPosition: [number, number] | null;
  heading: number;
  onResume: () => void;
}

export const HazardStopScreen = memo(function HazardStopScreen({
  apiKey,
  hazard,
  routeCoordinates,
  currentPosition,
  heading,
  onResume,
}: HazardStopScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const panoramaRef = useRef<google.maps.StreetViewPanorama | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [speechIndex, setSpeechIndex] = useState(0);

  // Google Maps API を読み込む
  useEffect(() => {
    if (window.google?.maps) {
      setIsLoaded(true);
      return;
    }

    if (!apiKey) return;

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initHazardStreetView`;
    script.async = true;
    script.defer = true;

    window.initHazardStreetView = () => {
      setIsLoaded(true);
    };

    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [apiKey]);

  // Street View を初期化
  const initPanorama = useCallback(() => {
    if (!isLoaded || !containerRef.current || !currentPosition) return;

    const position = { lat: currentPosition[0], lng: currentPosition[1] };

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
    }
  }, [isLoaded, currentPosition, heading]);

  useEffect(() => {
    initPanorama();
  }, [initPanorama]);

  // セリフをタップしたときの処理
  const handleSpeechTap = () => {
    if (speechIndex < SPEECH_SEQUENCE.length - 1) {
      // 次のセリフへ
      setSpeechIndex((prev) => prev + 1);
    } else {
      // 最後のセリフをタップしたらツアー再開
      onResume();
    }
  };

  const hazardInfo = HAZARD_TYPE_INFO[hazard.type];
  const currentSpeech = SPEECH_SEQUENCE[speechIndex];

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* ヘッダー */}
      <div className="h-14 bg-gradient-to-r from-red-600 to-orange-500 flex items-center justify-center px-4 shrink-0">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-white animate-pulse" />
          <span className="text-white font-bold">危険地点に到着！</span>
        </div>
      </div>

      {/* 危険地点情報バー */}
      <div className="bg-white/95 backdrop-blur-sm px-4 py-2 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{hazardInfo.icon}</span>
          <div>
            <span
              className="px-2 py-0.5 rounded text-xs text-white"
              style={{ backgroundColor: hazardInfo.color }}
            >
              {hazardInfo.label}
            </span>
            <p className="text-sm font-medium text-gray-800 mt-0.5">
              {hazard.title}
            </p>
          </div>
        </div>
      </div>

      {/* Street View (メインエリア) */}
      <div className="flex-1 relative">
        <div
          ref={containerRef}
          className="w-full h-full"
          style={{ backgroundColor: "#1a1a1a" }}
        >
          {!isLoaded && (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
              <p className="text-gray-400 text-sm">読み込み中...</p>
            </div>
          )}
        </div>

        {/* 停止中オーバーレイ（半透明） */}
        <div className="absolute inset-0 bg-black/30 pointer-events-none" />

        {/* MiniMap (右上) */}
        <div className="absolute top-4 right-4">
          <MiniMap
            routeCoordinates={routeCoordinates}
            currentPosition={currentPosition}
            heading={heading}
          />
        </div>

        {/* キャラクターと吹き出し (右下) */}
        <div className="absolute bottom-28 right-4 pointer-events-auto z-10">
          <CharacterBubble
            key={speechIndex} // セリフが変わるたびにアニメーションをリセット
            message={currentSpeech.message}
            subMessage={currentSpeech.subMessage}
            onTap={handleSpeechTap}
            showTapIndicator={true}
            position="right"
          />
        </div>

        {/* 進行状況インジケーター */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {SPEECH_SEQUENCE.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === speechIndex
                  ? "bg-yellow-400"
                  : index < speechIndex
                  ? "bg-yellow-400/50"
                  : "bg-white/30"
              }`}
            />
          ))}
        </div>
      </div>

      {/* 下部の説明テキスト */}
      <div className="bg-white/95 backdrop-blur-sm px-4 py-3 shrink-0">
        <p className="text-xs text-gray-600 text-center">
          {hazard.description}
        </p>
        {hazard.safetyTips && hazard.safetyTips.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1 justify-center">
            {hazard.safetyTips.slice(0, 2).map((tip, index) => (
              <span
                key={index}
                className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded"
              >
                {tip}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
