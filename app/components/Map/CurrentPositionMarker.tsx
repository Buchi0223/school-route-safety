"use client";

import { useEffect } from "react";
import { Marker, useMap } from "react-leaflet";
import L from "leaflet";

// 現在位置アイコン（矢印型）
const createCurrentPositionIcon = (heading: number) => {
  return L.divIcon({
    className: "current-position-icon",
    html: `
      <div style="
        width: 24px;
        height: 24px;
        position: relative;
      ">
        <!-- 外側のリング -->
        <div style="
          position: absolute;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: rgba(59, 130, 246, 0.3);
          animation: pulse 2s ease-in-out infinite;
        "></div>
        <!-- 方向を示す矢印 -->
        <div style="
          position: absolute;
          width: 16px;
          height: 16px;
          top: 4px;
          left: 4px;
          background: #3B82F6;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: rotate(${heading}deg);
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        ">
          <div style="
            width: 0;
            height: 0;
            border-left: 4px solid transparent;
            border-right: 4px solid transparent;
            border-bottom: 8px solid white;
            transform: translateY(-1px);
          "></div>
        </div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

interface CurrentPositionMarkerProps {
  position: [number, number];
  heading: number;
  followMap?: boolean;
}

export function CurrentPositionMarker({
  position,
  heading,
  followMap = true,
}: CurrentPositionMarkerProps) {
  const map = useMap();

  // 地図を現在位置に追従させる
  useEffect(() => {
    if (followMap && position) {
      map.panTo(position, { animate: true, duration: 0.5 });
    }
  }, [position, followMap, map]);

  if (!position) return null;

  return (
    <Marker
      position={position}
      icon={createCurrentPositionIcon(heading)}
      zIndexOffset={1000}
    />
  );
}
