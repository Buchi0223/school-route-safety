"use client";

import { Polyline, Marker } from "react-leaflet";
import { useMemo } from "react";
import L from "leaflet";

// ドラッグ用の中間点アイコン（小さな白い丸）
const createMidpointIcon = () => {
  return L.divIcon({
    className: "midpoint-icon",
    html: `
      <div style="
        width: 12px;
        height: 12px;
        background: white;
        border: 2px solid #3B82F6;
        border-radius: 50%;
        cursor: grab;
        box-shadow: 0 1px 3px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
};

interface RouteLayerProps {
  coordinates: [number, number][];
  // segmentIndex: 経路上の相対位置（0.0〜1.0）
  onRouteDrag?: (lat: number, lng: number, segmentIndex: number) => void;
  isEditable?: boolean;
}

export function RouteLayer({
  coordinates,
  onRouteDrag,
  isEditable = false,
}: RouteLayerProps) {
  // 経路の中間点を計算（セグメントごとに1つ）
  const midpoints = useMemo(() => {
    if (coordinates.length < 2 || !isEditable) return [];

    const points: { position: [number, number]; segmentIndex: number }[] = [];

    // セグメント数を制限（多すぎると重くなる）
    const maxMidpoints = 10;
    const step = Math.max(1, Math.floor(coordinates.length / maxMidpoints));

    for (let i = 0; i < coordinates.length - 1; i += step) {
      const start = coordinates[i];
      const endIdx = Math.min(i + step, coordinates.length - 1);
      const end = coordinates[endIdx];

      // 中間点を計算
      const midLat = (start[0] + end[0]) / 2;
      const midLng = (start[1] + end[1]) / 2;

      // 経路上の相対位置（0.0〜1.0）
      const segmentIndex = i / (coordinates.length - 1);

      points.push({
        position: [midLat, midLng],
        segmentIndex,
      });
    }

    return points;
  }, [coordinates, isEditable]);

  const handleDragEnd = (segmentIndex: number, e: L.DragEndEvent) => {
    if (onRouteDrag) {
      const marker = e.target as L.Marker;
      const position = marker.getLatLng();
      onRouteDrag(position.lat, position.lng, segmentIndex);
    }
  };

  return (
    <>
      {/* メインの経路線 */}
      <Polyline
        positions={coordinates}
        pathOptions={{
          color: "#3B82F6",
          weight: 5,
          opacity: 0.8,
        }}
      />

      {/* ドラッグ可能な中間点マーカー */}
      {isEditable && midpoints.map((point, idx) => (
        <Marker
          key={`midpoint-${idx}`}
          position={point.position}
          icon={createMidpointIcon()}
          draggable={true}
          eventHandlers={{
            dragend: (e) => handleDragEnd(point.segmentIndex, e),
          }}
        />
      ))}
    </>
  );
}
