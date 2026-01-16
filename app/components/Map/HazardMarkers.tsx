"use client";

import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { HazardPoint, HAZARD_TYPE_INFO } from "@/lib/types";

// 危険地点タイプ別のアイコン
const createHazardIcon = (type: HazardPoint["type"], isSelected: boolean) => {
  const info = HAZARD_TYPE_INFO[type];
  const size = isSelected ? 40 : 32;

  return L.divIcon({
    className: "custom-hazard-icon",
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${isSelected ? 24 : 20}px;
        background-color: white;
        border-radius: 50%;
        border: 3px solid ${info.color};
        box-shadow: ${isSelected ? "0 0 10px " + info.color : "0 2px 4px rgba(0,0,0,0.3)"};
        transition: all 0.2s;
      ">
        ${info.icon}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
};

interface HazardMarkersProps {
  hazardPoints: HazardPoint[];
  onHazardClick: (hazard: HazardPoint) => void;
  selectedHazardId: string | null;
  /** クリックを無効にする（経路描画中など） */
  disabled?: boolean;
}

export function HazardMarkers({
  hazardPoints,
  onHazardClick,
  selectedHazardId,
  disabled = false,
}: HazardMarkersProps) {
  return (
    <>
      {hazardPoints.map((hazard) => {
        const info = HAZARD_TYPE_INFO[hazard.type];
        const isSelected = selectedHazardId === hazard.id;

        return (
          <Marker
            key={hazard.id}
            position={[hazard.lat, hazard.lng]}
            icon={createHazardIcon(hazard.type, isSelected)}
            eventHandlers={
              disabled
                ? {}
                : {
                    click: () => onHazardClick(hazard),
                  }
            }
          >
            {/* disabled時はPopupを表示しない */}
            {!disabled && (
              <Popup>
                <div className="text-sm max-w-xs">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{info.icon}</span>
                    <span
                      className="px-2 py-0.5 rounded text-xs text-white"
                      style={{ backgroundColor: info.color }}
                    >
                      {info.label}
                    </span>
                  </div>
                  <p className="font-bold text-base mb-1">{hazard.title}</p>
                  <p className="text-gray-600 mb-2">{hazard.description}</p>
                  <button
                    onClick={() => onHazardClick(hazard)}
                    className="w-full px-3 py-1.5 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                  >
                    Street Viewで確認
                  </button>
                </div>
              </Popup>
            )}
          </Marker>
        );
      })}
    </>
  );
}
