"use client";

import { MyHazardPoint, MY_HAZARD_REASON_INFO, MyHazardReason } from "@/lib/types";
import { MapPin, Edit2, Trash2, Clock } from "lucide-react";

// 理由のサマリーを生成
const getReasonsLabel = (reasons: MyHazardReason[]): string => {
  if (reasons.length === 0) return "";
  if (reasons.length === 1) {
    return MY_HAZARD_REASON_INFO[reasons[0]].label;
  }
  return `${MY_HAZARD_REASON_INFO[reasons[0]].label} 他${reasons.length - 1}件`;
};

// 日付フォーマット
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${month}/${day} ${hours}:${minutes}`;
};

interface PinListPanelProps {
  pins: MyHazardPoint[];
  selectedPinId: string | null;
  onPinSelect: (pin: MyHazardPoint) => void;
  onPinEdit: (pin: MyHazardPoint) => void;
  onPinDelete: (pin: MyHazardPoint) => void;
}

export function PinListPanel({
  pins,
  selectedPinId,
  onPinSelect,
  onPinEdit,
  onPinDelete,
}: PinListPanelProps) {
  if (pins.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-6">
        <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
          <MapPin className="w-8 h-8 text-purple-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-700 mb-2">
          ピンがありません
        </h3>
        <p className="text-sm text-gray-500">
          地図をクリックして<br />
          危険だと思う場所にピンを立てましょう
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* ヘッダー */}
      <div className="px-4 py-3 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-700">設置済みピン</h3>
          <span className="text-sm text-purple-600 font-medium">
            {pins.length}件
          </span>
        </div>
      </div>

      {/* ピン一覧 */}
      <div className="flex-1 overflow-y-auto">
        <div className="divide-y">
          {pins.map((pin, index) => {
            const isSelected = selectedPinId === pin.id;
            return (
              <div
                key={pin.id}
                onClick={() => onPinSelect(pin)}
                className={`p-3 cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-purple-50 border-l-4 border-l-purple-500"
                    : "hover:bg-gray-50 border-l-4 border-l-transparent"
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* ピン番号 */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      isSelected
                        ? "bg-purple-600 text-white"
                        : "bg-purple-100 text-purple-600"
                    }`}
                  >
                    {index + 1}
                  </div>

                  {/* ピン情報 */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {getReasonsLabel(pin.reasons)}
                    </div>
                    {pin.reasonDetail && (
                      <div className="text-sm text-gray-500 truncate mt-0.5">
                        {pin.reasonDetail}
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(pin.createdAt)}
                    </div>
                  </div>

                  {/* アクションボタン */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onPinEdit(pin);
                      }}
                      className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-100 rounded transition-colors"
                      title="編集"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onPinDelete(pin);
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded transition-colors"
                      title="削除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 選択時に理由の詳細を表示 */}
                {isSelected && pin.reasons.length > 1 && (
                  <div className="mt-2 ml-11 flex flex-wrap gap-1">
                    {pin.reasons.map((reason) => (
                      <span
                        key={reason}
                        className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full"
                      >
                        {MY_HAZARD_REASON_INFO[reason].label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
