"use client";

import { useState, useEffect, useCallback } from "react";
import { MyHazardReason, MY_HAZARD_REASON_INFO } from "@/lib/types";
import { X, Check, MapPin } from "lucide-react";

interface ReasonBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reasons: MyHazardReason[], detail?: string) => void;
  initialReasons?: MyHazardReason[];
  initialDetail?: string;
  mode: "create" | "edit";
}

const REASON_OPTIONS: MyHazardReason[] = [
  "narrow_road",
  "poor_visibility",
  "speeding_cars",
  "high_traffic",
  "pedestrian_conflict",
  "other",
];

export function ReasonBottomSheet({
  isOpen,
  onClose,
  onSubmit,
  initialReasons = [],
  initialDetail = "",
  mode,
}: ReasonBottomSheetProps) {
  const [selectedReasons, setSelectedReasons] = useState<MyHazardReason[]>(initialReasons);
  const [otherDetail, setOtherDetail] = useState(initialDetail);

  // モーダルが開いた時に初期値をセット
  useEffect(() => {
    if (isOpen) {
      setSelectedReasons(initialReasons);
      setOtherDetail(initialDetail);
    }
  }, [isOpen, initialReasons, initialDetail]);

  // 背景スクロール防止
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const toggleReason = useCallback((reason: MyHazardReason) => {
    setSelectedReasons((prev) =>
      prev.includes(reason)
        ? prev.filter((r) => r !== reason)
        : [...prev, reason]
    );
  }, []);

  const handleSubmit = useCallback(() => {
    if (selectedReasons.length === 0) return;

    const detail = selectedReasons.includes("other") ? otherDetail : undefined;
    onSubmit(selectedReasons, detail);
  }, [selectedReasons, otherDetail, onSubmit]);

  if (!isOpen) return null;

  const isValid = selectedReasons.length > 0;
  const showOtherInput = selectedReasons.includes("other");

  return (
    <div className="fixed inset-0 z-[2000] flex items-end justify-center">
      {/* オーバーレイ */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* ボトムシート */}
      <div className="relative bg-white rounded-t-2xl w-full max-w-md max-h-[85vh] flex flex-col animate-slide-up">
        {/* ドラッグハンドル */}
        <div className="pt-3 pb-2">
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto" />
        </div>

        {/* ヘッダー */}
        <div className="flex items-center justify-between px-4 pb-3 border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-purple-600" />
            </div>
            <h3 className="font-bold text-gray-900">
              {mode === "create" ? "危険な理由を選択" : "理由を編集"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* コンテンツ */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <p className="text-sm text-gray-600 mb-4">
            危険だと思う理由を選んでください（複数選択可）
          </p>

          {/* 理由選択 */}
          <div className="space-y-2">
            {REASON_OPTIONS.map((reason) => {
              const info = MY_HAZARD_REASON_INFO[reason];
              const isSelected = selectedReasons.includes(reason);

              return (
                <button
                  key={reason}
                  onClick={() => toggleReason(reason)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all active:scale-98 ${
                    isSelected
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  {/* チェックボックス */}
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
                      isSelected
                        ? "bg-purple-500"
                        : "border-2 border-gray-300"
                    }`}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                  </div>

                  {/* ラベル */}
                  <div className="flex-1 text-left">
                    <p className={`font-medium ${isSelected ? "text-purple-700" : "text-gray-700"}`}>
                      {info.label}
                    </p>
                    <p className="text-xs text-gray-500">{info.description}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* その他の入力 */}
          {showOtherInput && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                具体的な理由（任意）
              </label>
              <textarea
                value={otherDetail}
                onChange={(e) => setOtherDetail(e.target.value)}
                placeholder="例: 夕方になると日が当たらず暗い"
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:border-purple-500 focus:outline-none resize-none"
                rows={3}
              />
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="px-4 py-4 border-t bg-gray-50">
          <button
            onClick={handleSubmit}
            disabled={!isValid}
            className={`w-full py-3 rounded-xl font-bold transition-all active:scale-98 ${
              isValid
                ? "bg-purple-600 text-white"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {mode === "create" ? "ピンを立てる" : "変更を保存"}
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
