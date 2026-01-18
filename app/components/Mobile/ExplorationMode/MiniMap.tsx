"use client";

import { memo, useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { HazardPoint, HAZARD_TYPE_INFO } from "@/lib/types";

interface MiniMapProps {
  routeCoordinates: [number, number][];
  currentPosition: [number, number] | null;
  heading: number;
  hazardPoints?: HazardPoint[];
  className?: string;
}

export const MiniMap = memo(function MiniMap({
  routeCoordinates,
  currentPosition,
  heading,
  hazardPoints = [],
  className = "",
}: MiniMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const hazardMarkersRef = useRef<L.Marker[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // 地図の初期化（一度だけ実行）
  useEffect(() => {
    if (!isClient || !mapContainerRef.current || mapRef.current) return;

    // 初期位置はデフォルト値
    const initialCenter: [number, number] = [36.5516, 139.8967];

    mapRef.current = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 16,
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      touchZoom: false,
      doubleClickZoom: false,
      scrollWheelZoom: false,
      boxZoom: false,
      keyboard: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(mapRef.current);

    // 地図の準備完了を通知
    setIsMapReady(true);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
        routeLayerRef.current = null;
        hazardMarkersRef.current = [];
        setIsMapReady(false);
      }
    };
  }, [isClient]);

  // 経路を描画
  useEffect(() => {
    if (!isMapReady || !mapRef.current || routeCoordinates.length < 2) return;

    // 既存の経路を削除
    if (routeLayerRef.current) {
      mapRef.current.removeLayer(routeLayerRef.current);
    }

    // 新しい経路を描画
    routeLayerRef.current = L.polyline(routeCoordinates, {
      color: "#3B82F6",
      weight: 4,
      opacity: 0.8,
    }).addTo(mapRef.current);

    // 経路全体が見えるようにフィット
    mapRef.current.fitBounds(routeLayerRef.current.getBounds(), {
      padding: [10, 10],
    });
  }, [isMapReady, routeCoordinates]);

  // 危険地点マーカーを描画
  useEffect(() => {
    if (!isMapReady || !mapRef.current || hazardPoints.length === 0) return;

    // 既存のマーカーを削除
    hazardMarkersRef.current.forEach((marker) => {
      mapRef.current?.removeLayer(marker);
    });
    hazardMarkersRef.current = [];

    // 新しいマーカーを追加
    hazardPoints.forEach((hazard) => {
      const hazardInfo = HAZARD_TYPE_INFO[hazard.type];
      const icon = L.divIcon({
        className: "minimap-hazard-marker",
        html: `
          <div style="
            width: 16px;
            height: 16px;
            background-color: ${hazardInfo.color};
            border: 2px solid white;
            border-radius: 50%;
            box-shadow: 0 1px 3px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 8px;
          ">${hazardInfo.icon}</div>
        `,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });

      const marker = L.marker([hazard.lat, hazard.lng], { icon }).addTo(
        mapRef.current!
      );
      hazardMarkersRef.current.push(marker);
    });
  }, [isMapReady, hazardPoints]);

  // 現在位置マーカーを更新
  useEffect(() => {
    if (!isMapReady || !mapRef.current || !currentPosition) return;

    // カスタムアイコンを作成（方向を示す矢印）
    const arrowIcon = L.divIcon({
      className: "minimap-current-marker",
      html: `
        <div style="
          width: 20px;
          height: 20px;
          background-color: #EF4444;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 6px rgba(0,0,0,0.4);
          position: relative;
        ">
          <div style="
            position: absolute;
            top: -8px;
            left: 50%;
            transform: translateX(-50%) rotate(${heading}deg);
            width: 0;
            height: 0;
            border-left: 5px solid transparent;
            border-right: 5px solid transparent;
            border-bottom: 8px solid #EF4444;
          "></div>
        </div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    if (markerRef.current) {
      markerRef.current.setLatLng(currentPosition);
      markerRef.current.setIcon(arrowIcon);
    } else {
      markerRef.current = L.marker(currentPosition, { icon: arrowIcon }).addTo(
        mapRef.current
      );
    }

    // 地図を現在位置にパン
    mapRef.current.panTo(currentPosition, { animate: true, duration: 0.3 });
  }, [isMapReady, currentPosition, heading]);

  if (!isClient) {
    return (
      <div
        className={`bg-gray-200 rounded-lg ${className}`}
        style={{ width: 100, height: 100 }}
      />
    );
  }

  return (
    <div
      ref={mapContainerRef}
      className={`rounded-lg overflow-hidden border-2 border-white shadow-lg ${className}`}
      style={{ width: 100, height: 100 }}
    />
  );
});
