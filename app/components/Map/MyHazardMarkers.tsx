"use client";

import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { MyHazardPoint, MY_HAZARD_REASON_INFO, MyHazardReason } from "@/lib/types";

// マイ危険ポイントのアイコンカラー（紫色）
const MY_HAZARD_COLOR = "#8B5CF6";

// マイ危険ポイント用のアイコン
const createMyHazardIcon = (isSelected: boolean) => {
  const size = isSelected ? 32 : 24;

  return L.divIcon({
    className: "custom-my-hazard-icon",
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${isSelected ? 16 : 12}px;
        background-color: ${MY_HAZARD_COLOR};
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: ${isSelected ? "0 0 10px " + MY_HAZARD_COLOR : "0 2px 4px rgba(0,0,0,0.3)"};
        transition: all 0.2s;
        color: white;
      ">
        <svg width="${isSelected ? 16 : 12}" height="${isSelected ? 16 : 12}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
};

// 理由のサマリーを生成
const getReasonsLabel = (reasons: MyHazardReason[]): string => {
  if (reasons.length === 0) return "";
  if (reasons.length === 1) {
    return MY_HAZARD_REASON_INFO[reasons[0]].label;
  }
  return `${MY_HAZARD_REASON_INFO[reasons[0]].label} 他${reasons.length - 1}件`;
};

interface MyHazardMarkersProps {
  myHazardPoints: MyHazardPoint[];
  onPinClick?: (pin: MyHazardPoint) => void;
  onPinEdit?: (pin: MyHazardPoint) => void;
  onPinDelete?: (pin: MyHazardPoint) => void;
  selectedPinId: string | null;
  disabled?: boolean;
  showPopup?: boolean;
}

export function MyHazardMarkers({
  myHazardPoints,
  onPinClick,
  onPinEdit,
  onPinDelete,
  selectedPinId,
  disabled = false,
  showPopup = true,
}: MyHazardMarkersProps) {
  return (
    <>
      {myHazardPoints.map((pin) => {
        const isSelected = selectedPinId === pin.id;

        return (
          <Marker
            key={pin.id}
            position={[pin.lat, pin.lng]}
            icon={createMyHazardIcon(isSelected)}
            zIndexOffset={1000} // HazardPointより前面に表示
            eventHandlers={
              disabled
                ? {}
                : {
                    click: () => onPinClick?.(pin),
                  }
            }
          >
            {showPopup && (
              <Popup>
                <div className="min-w-[200px]">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: MY_HAZARD_COLOR }}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    </div>
                    <span className="font-bold text-sm" style={{ color: MY_HAZARD_COLOR }}>
                      マイ危険ポイント
                    </span>
                  </div>

                  <div className="text-xs text-gray-600 mb-2">
                    危険な理由:
                  </div>

                  <ul className="space-y-1 mb-3">
                    {pin.reasons.map((reason) => (
                      <li
                        key={reason}
                        className="text-sm flex items-start gap-1"
                      >
                        <span className="text-purple-500">•</span>
                        <span>{MY_HAZARD_REASON_INFO[reason].label}</span>
                      </li>
                    ))}
                  </ul>

                  {pin.reasonDetail && (
                    <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded mb-3">
                      {pin.reasonDetail}
                    </div>
                  )}

                  {(onPinEdit || onPinDelete) && (
                    <div className="flex gap-2 pt-2 border-t">
                      {onPinEdit && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onPinEdit(pin);
                          }}
                          className="flex-1 px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
                        >
                          編集
                        </button>
                      )}
                      {onPinDelete && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onPinDelete(pin);
                          }}
                          className="flex-1 px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                        >
                          削除
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </Popup>
            )}
          </Marker>
        );
      })}
    </>
  );
}

export { MY_HAZARD_COLOR, getReasonsLabel };
