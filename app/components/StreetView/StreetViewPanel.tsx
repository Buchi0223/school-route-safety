"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Navigation, AlertCircle, Loader2 } from "lucide-react";
import { HazardPoint, HAZARD_TYPE_INFO } from "@/lib/types";

// Google Maps API の型定義を拡張
declare global {
  interface Window {
    initStreetView: () => void;
  }
}

interface StreetViewPanelProps {
  selectedHazard: HazardPoint | null;
  apiKey: string;
  // ツアー用プロパティ
  tourPosition?: [number, number] | null;
  tourHeading?: number;
  isTourActive?: boolean;
}

export function StreetViewPanel({
  selectedHazard,
  apiKey,
  tourPosition,
  tourHeading = 0,
  isTourActive = false,
}: StreetViewPanelProps) {
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
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initStreetView`;
    script.async = true;
    script.defer = true;

    window.initStreetView = () => {
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

  // Street View を初期化
  const initPanorama = useCallback(
    (lat: number, lng: number, heading: number = 0) => {
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
          }
        );
      } else {
        panoramaRef.current.setPosition(position);
        panoramaRef.current.setPov({ heading, pitch: 0 });
      }
    },
    [isLoaded]
  );

  // ツアーモード時の位置更新
  useEffect(() => {
    if (isTourActive && tourPosition && isLoaded) {
      initPanorama(tourPosition[0], tourPosition[1], tourHeading);
    }
  }, [isTourActive, tourPosition, tourHeading, isLoaded, initPanorama]);

  // 危険地点選択時の位置更新
  useEffect(() => {
    if (!isTourActive && selectedHazard && isLoaded) {
      initPanorama(selectedHazard.lat, selectedHazard.lng);
    }
  }, [isTourActive, selectedHazard, isLoaded, initPanorama]);

  if (error) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Street View
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 bg-red-50 border border-red-200 rounded-lg flex flex-col items-center justify-center gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <p className="text-red-600 text-sm text-center px-4">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ツアーモード
  if (isTourActive && tourPosition) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Navigation className="h-5 w-5 text-blue-600" />
            バーチャルツアー
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded animate-pulse">
              再生中
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 min-h-0">
          <div
            ref={containerRef}
            className="w-full h-full min-h-[200px] rounded overflow-hidden"
            style={{ backgroundColor: "#e5e5e5" }}
          >
            {!isLoaded && (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                <p className="text-gray-500 text-sm">読み込み中...</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // 危険地点が選択されていない場合
  if (!selectedHazard) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Street View
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 bg-gray-100 rounded flex items-center justify-center">
            <p className="text-gray-500 text-sm text-center">
              危険地点を選択すると
              <br />
              Street View が表示されます
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hazardInfo = HAZARD_TYPE_INFO[selectedHazard.type];

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Street View
        </CardTitle>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xl">{hazardInfo.icon}</span>
          <span
            className="px-2 py-0.5 rounded text-xs text-white"
            style={{ backgroundColor: hazardInfo.color }}
          >
            {hazardInfo.label}
          </span>
        </div>
        <p className="text-sm font-medium mt-1">{selectedHazard.title}</p>
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        <div
          ref={containerRef}
          className="w-full h-full min-h-[200px] rounded overflow-hidden"
          style={{ backgroundColor: "#e5e5e5" }}
        >
          {!isLoaded && (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <p className="text-gray-500 text-sm">読み込み中...</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
