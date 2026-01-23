"use client";

import { HazardPoint, TourTarget, HAZARD_TYPE_INFO } from "@/lib/types";
import { MapPin, Database } from "lucide-react";

interface TourTargetSelectorProps {
  selectedTarget: TourTarget | null;
  onTargetChange: (target: TourTarget) => void;
  myHazardPointCount: number;
  selectedHazardPoints: HazardPoint[];
  onStartTour: () => void;
  onBack: () => void;
  canStartTour: boolean;
}

export function TourTargetSelector({
  selectedTarget,
  onTargetChange,
  myHazardPointCount,
  selectedHazardPoints,
  onStartTour,
  onBack,
  canStartTour,
}: TourTargetSelectorProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* ヘッダー */}
      <div className="bg-blue-600 text-white px-4 py-3">
        <h3 className="font-bold">巡回対象を選択</h3>
        <p className="text-sm text-blue-100 mt-1">
          どの情報を使ってツアーしますか？
        </p>
      </div>

      {/* 選択オプション */}
      <div className="p-4 space-y-3">
        {/* マイ危険ポイント */}
        <label
          className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${
            selectedTarget === "my_hazard_points"
              ? "border-purple-500 bg-purple-50"
              : "border-gray-200 hover:border-purple-300"
          }`}
        >
          <div className="flex items-start gap-3">
            <input
              type="radio"
              name="tourTarget"
              value="my_hazard_points"
              checked={selectedTarget === "my_hazard_points"}
              onChange={() => onTargetChange("my_hazard_points")}
              className="mt-1 w-4 h-4 text-purple-600"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-purple-600" />
                <span className="font-bold text-gray-900">
                  自分で立てたピン
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                マイ危険ポイント
              </p>
              <div className="mt-2 text-sm">
                {myHazardPointCount > 0 ? (
                  <span className="text-purple-600 font-medium">
                    設置済み: {myHazardPointCount}件
                  </span>
                ) : (
                  <span className="text-gray-400">
                    ピンが設置されていません
                  </span>
                )}
              </div>
            </div>
          </div>
        </label>

        {/* Safety Map */}
        <label
          className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${
            selectedTarget === "safety_map"
              ? "border-blue-500 bg-blue-50"
              : "border-gray-200 hover:border-blue-300"
          }`}
        >
          <div className="flex items-start gap-3">
            <input
              type="radio"
              name="tourTarget"
              value="safety_map"
              checked={selectedTarget === "safety_map"}
              onChange={() => onTargetChange("safety_map")}
              className="mt-1 w-4 h-4 text-blue-600"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-600" />
                <span className="font-bold text-gray-900">
                  Safety Mapの投稿情報
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                経路上の重要地点を自動選別
              </p>
              <div className="mt-2 text-sm">
                {selectedHazardPoints.length > 0 ? (
                  <span className="text-blue-600 font-medium">
                    この経路で {selectedHazardPoints.length}地点 を選別
                  </span>
                ) : (
                  <span className="text-gray-400">
                    経路上に危険地点がありません
                  </span>
                )}
              </div>
            </div>
          </div>
        </label>

        {/* Safety Map選別結果プレビュー */}
        {selectedTarget === "safety_map" && selectedHazardPoints.length > 0 && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-500 mb-2">選別された地点:</div>
            <ul className="space-y-1.5">
              {selectedHazardPoints.map((hazard) => {
                const info = HAZARD_TYPE_INFO[hazard.type];
                return (
                  <li
                    key={hazard.id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
                      style={{ backgroundColor: info.color + "20", color: info.color }}
                    >
                      {info.icon}
                    </span>
                    <span className="text-gray-700 truncate">
                      {hazard.title}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {/* アクションボタン */}
      <div className="px-4 pb-4 flex gap-2">
        <button
          onClick={onBack}
          className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          経路を変更
        </button>
        <button
          onClick={onStartTour}
          disabled={!canStartTour}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
            canStartTour
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          ツアーを開始
        </button>
      </div>
    </div>
  );
}
