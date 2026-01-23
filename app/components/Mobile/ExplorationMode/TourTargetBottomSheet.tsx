"use client";

import { useState, useEffect, useCallback } from "react";
import { TourTarget, HazardPoint, HAZARD_TYPE_INFO } from "@/lib/types";
import { X, MapPin, Shield, ChevronRight, AlertTriangle, Play } from "lucide-react";
import Image from "next/image";

interface TourTargetBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTour: (target: TourTarget) => void;
  myHazardPointCount: number;
  selectedHazardPoints: HazardPoint[];
}

export function TourTargetBottomSheet({
  isOpen,
  onClose,
  onStartTour,
  myHazardPointCount,
  selectedHazardPoints,
}: TourTargetBottomSheetProps) {
  const [selectedTarget, setSelectedTarget] = useState<TourTarget | null>(null);
  const [isCharacterVisible, setIsCharacterVisible] = useState(false);

  // 背景スクロール防止
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const timer = setTimeout(() => setIsCharacterVisible(true), 300);
      return () => clearTimeout(timer);
    } else {
      document.body.style.overflow = "";
      setIsCharacterVisible(false);
      setSelectedTarget(null);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleStartTour = useCallback(() => {
    if (selectedTarget) {
      onStartTour(selectedTarget);
    }
  }, [selectedTarget, onStartTour]);

  if (!isOpen) return null;

  const canStartTour = selectedTarget !== null && (
    (selectedTarget === "my_hazard_points" && myHazardPointCount > 0) ||
    (selectedTarget === "safety_map" && selectedHazardPoints.length > 0)
  );

  return (
    <div className="fixed inset-0 z-[2000] flex items-end justify-center">
      {/* オーバーレイ */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* ボトムシート */}
      <div className="relative bg-white rounded-t-2xl w-full max-w-md max-h-[90vh] flex flex-col animate-slide-up">
        {/* ドラッグハンドル */}
        <div className="pt-3 pb-2">
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto" />
        </div>

        {/* ヘッダー */}
        <div className="flex items-center justify-between px-4 pb-3 border-b">
          <h3 className="font-bold text-gray-900 text-lg">巡回対象を選択</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* コンテンツ */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {/* キャラクターと吹き出し */}
          <div className="flex items-start gap-2 mb-4">
            <div
              className={`w-14 h-14 relative shrink-0 transition-all duration-500 ${
                isCharacterVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <Image
                src="/images/character_v2.png"
                alt="セーフティにゃん"
                fill
                className="object-contain drop-shadow-md"
                priority
              />
            </div>
            <div
              className={`flex-1 bg-yellow-50 border-2 border-yellow-300 rounded-xl p-3 relative transition-all duration-500 ${
                isCharacterVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"
              }`}
              style={{ transitionDelay: "150ms" }}
            >
              <div className="absolute left-[-8px] top-4 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[8px] border-r-yellow-300" />
              <p className="text-sm font-medium text-gray-800">
                どっちを巡回する？
              </p>
              <p className="text-xs text-gray-600 mt-1">
                自分で立てたピンか、Safety Mapの危険地点を選んでね！
              </p>
            </div>
          </div>

          {/* 選択肢 */}
          <div className="space-y-3">
            {/* マイ危険ポイント */}
            <button
              onClick={() => setSelectedTarget("my_hazard_points")}
              disabled={myHazardPointCount === 0}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                selectedTarget === "my_hazard_points"
                  ? "border-purple-500 bg-purple-50"
                  : myHazardPointCount === 0
                    ? "border-gray-200 bg-gray-50 opacity-50"
                    : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  selectedTarget === "my_hazard_points"
                    ? "bg-purple-500"
                    : "bg-purple-100"
                }`}>
                  <MapPin className={`w-6 h-6 ${
                    selectedTarget === "my_hazard_points"
                      ? "text-white"
                      : "text-purple-600"
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">マイ危険ポイント</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      myHazardPointCount > 0
                        ? "bg-purple-100 text-purple-700"
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      {myHazardPointCount}件
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {myHazardPointCount > 0
                      ? "自分で設置したピンを巡回"
                      : "ピンを設置してください"}
                  </p>
                </div>
                {selectedTarget === "my_hazard_points" && (
                  <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </div>
            </button>

            {/* Safety Map */}
            <button
              onClick={() => setSelectedTarget("safety_map")}
              disabled={selectedHazardPoints.length === 0}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                selectedTarget === "safety_map"
                  ? "border-blue-500 bg-blue-50"
                  : selectedHazardPoints.length === 0
                    ? "border-gray-200 bg-gray-50 opacity-50"
                    : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  selectedTarget === "safety_map"
                    ? "bg-blue-500"
                    : "bg-blue-100"
                }`}>
                  <Shield className={`w-6 h-6 ${
                    selectedTarget === "safety_map"
                      ? "text-white"
                      : "text-blue-600"
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">Safety Map</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      selectedHazardPoints.length > 0
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      {selectedHazardPoints.length}件
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {selectedHazardPoints.length > 0
                      ? "経路沿いの危険地点を巡回"
                      : "経路を設定してください"}
                  </p>
                </div>
                {selectedTarget === "safety_map" && (
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </div>

              {/* Safety Map選別結果プレビュー */}
              {selectedTarget === "safety_map" && selectedHazardPoints.length > 0 && (
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <p className="text-xs font-medium text-blue-700 mb-2">巡回する地点:</p>
                  <div className="space-y-1">
                    {selectedHazardPoints.slice(0, 3).map((hazard) => (
                      <div key={hazard.id} className="flex items-center gap-2 text-xs">
                        <span>{HAZARD_TYPE_INFO[hazard.type].icon}</span>
                        <span className="text-gray-700 truncate">{hazard.title}</span>
                      </div>
                    ))}
                    {selectedHazardPoints.length > 3 && (
                      <p className="text-xs text-gray-500">
                        他 {selectedHazardPoints.length - 3}件
                      </p>
                    )}
                  </div>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* フッター */}
        <div className="px-4 py-4 border-t bg-gray-50">
          <button
            onClick={handleStartTour}
            disabled={!canStartTour}
            className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-98 ${
              canStartTour
                ? "bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-md"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            <Play className="w-5 h-5" />
            ツアーを開始
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
