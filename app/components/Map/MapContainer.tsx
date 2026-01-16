"use client";

import { useEffect, useState } from "react";
import {
  MapContainer as LeafletMapContainer,
  TileLayer,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Waypoint } from "@/lib/types";
import { WaypointMarkers } from "./WaypointMarkers";
import { RouteLayer } from "./RouteLayer";
import { HazardMarkers } from "./HazardMarkers";
import { CurrentPositionMarker } from "./CurrentPositionMarker";
import { HazardPoint } from "@/lib/types";

// デフォルトのLeafletアイコン設定
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// 宇都宮市周辺の初期位置
const DEFAULT_CENTER: [number, number] = [36.5516, 139.8967];
const DEFAULT_ZOOM = 15;

interface MapClickHandlerProps {
  onMapClick: (lat: number, lng: number) => void;
  onMapDoubleClick: (lat: number, lng: number) => void;
  isDrawingRoute: boolean;
}

function MapClickHandler({ onMapClick, onMapDoubleClick, isDrawingRoute }: MapClickHandlerProps) {
  const map = useMap();

  useEffect(() => {
    if (isDrawingRoute) {
      map.doubleClickZoom.disable();
    } else {
      map.doubleClickZoom.enable();
    }
  }, [isDrawingRoute, map]);

  useMapEvents({
    click: (e) => {
      if (isDrawingRoute) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
    dblclick: (e) => {
      if (isDrawingRoute) {
        e.originalEvent.preventDefault();
        onMapDoubleClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

interface MapContainerComponentProps {
  waypoints: Waypoint[];
  onWaypointAdd: (lat: number, lng: number) => void;
  onWaypointDoubleClick: (lat: number, lng: number) => void;
  onWaypointDelete: (id: string) => void;
  onWaypointMove: (id: string, lat: number, lng: number) => void;
  isDrawingRoute: boolean;
  routeCoordinates: [number, number][] | null;
  onRouteDrag?: (lat: number, lng: number, segmentIndex: number) => void;
  hazardPoints: HazardPoint[];
  onHazardClick: (hazard: HazardPoint) => void;
  selectedHazardId: string | null;
  // ツアー用プロパティ
  tourPosition?: [number, number] | null;
  tourHeading?: number;
  isTourActive?: boolean;
  children?: React.ReactNode;
}

export default function MapContainerComponent({
  waypoints,
  onWaypointAdd,
  onWaypointDoubleClick,
  onWaypointDelete,
  onWaypointMove,
  isDrawingRoute,
  routeCoordinates,
  onRouteDrag,
  hazardPoints,
  onHazardClick,
  selectedHazardId,
  tourPosition,
  tourHeading = 0,
  isTourActive = false,
  children,
}: MapContainerComponentProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">地図を読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <LeafletMapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        className="w-full h-full"
        style={{ cursor: isDrawingRoute ? "crosshair" : "grab" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler
          onMapClick={onWaypointAdd}
          onMapDoubleClick={onWaypointDoubleClick}
          isDrawingRoute={isDrawingRoute}
        />
        <WaypointMarkers
          waypoints={waypoints}
          onDelete={onWaypointDelete}
          onMove={onWaypointMove}
          isDrawingRoute={isDrawingRoute}
          isDraggable={!isTourActive}
        />
        {routeCoordinates && (
          <RouteLayer
            coordinates={routeCoordinates}
            onRouteDrag={onRouteDrag}
            isEditable={!isDrawingRoute && !isTourActive}
          />
        )}
        <HazardMarkers
          hazardPoints={hazardPoints}
          onHazardClick={onHazardClick}
          selectedHazardId={selectedHazardId}
        />
        {/* ツアー中の現在位置マーカー */}
        {isTourActive && tourPosition && (
          <CurrentPositionMarker
            position={tourPosition}
            heading={tourHeading}
            followMap={true}
          />
        )}
      </LeafletMapContainer>
      {children}
    </div>
  );
}
