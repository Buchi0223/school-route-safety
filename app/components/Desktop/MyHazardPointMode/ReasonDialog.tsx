"use client";

import { useState, useEffect } from "react";
import { MyHazardReason, MY_HAZARD_REASON_INFO } from "@/lib/types";
import { X, MapPin, AlertTriangle } from "lucide-react";

// 理由の順序
const REASON_ORDER: MyHazardReason[] = [
  "narrow_road",
  "poor_visibility",
  "speeding_cars",
  "high_traffic",
  "pedestrian_conflict",
  "other",
];

interface ReasonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reasons: MyHazardReason[], detail?: string) => void;
  // 編集モード用
  initialReasons?: MyHazardReason[];
  initialDetail?: string;
  mode?: "create" | "edit";
}

export function ReasonDialog({
  isOpen,
  onClose,
  onSubmit,
  initialReasons = [],
  initialDetail = "",
  mode = "create",
}: ReasonDialogProps) {
  const [selectedReasons, setSelectedReasons] = useState<MyHazardReason[]>(initialReasons);
  const [detail, setDetail] = useState(initialDetail);

  // ダイアログが開くたびに初期値をセット
  useEffect(() => {
    if (isOpen) {
      setSelectedReasons(initialReasons);
      setDetail(initialDetail);
    }
  }, [isOpen, initialReasons, initialDetail]);

  if (!isOpen) return null;

  const handleReasonToggle = (reason: MyHazardReason) => {
    setSelectedReasons((prev) =>
      prev.includes(reason)
        ? prev.filter((r) => r !== reason)
        : [...prev, reason]
    );
  };

  const handleSubmit = () => {
    if (selectedReasons.length === 0) return;
    onSubmit(selectedReasons, detail || undefined);
  };

  const canSubmit = selectedReasons.length > 0;
  const showDetailInput = selectedReasons.includes("other");

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center">
      {/* オーバーレイ */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* ダイアログ */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* ヘッダー */}
        <div className="bg-purple-600 text-white px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg">
                  {mode === "create" ? "危険な理由を選択" : "理由を編集"}
                </h3>
                <p className="text-sm text-purple-200">
                  複数選択できます
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 理由リスト */}
        <div className="p-4 max-h-[50vh] overflow-y-auto">
          <div className="space-y-2">
            {REASON_ORDER.map((reason) => {
              const info = MY_HAZARD_REASON_INFO[reason];
              const isSelected = selectedReasons.includes(reason);

              return (
                <label
                  key={reason}
                  className={`block p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    isSelected
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 hover:border-purple-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleReasonToggle(reason)}
                      className="mt-0.5 w-5 h-5 text-purple-600 rounded"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {info.label}
                      </div>
                      <div className="text-sm text-gray-500 mt-0.5">
                        {info.description}
                      </div>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>

          {/* 「その他」選択時のテキスト入力 */}
          {showDetailInput && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                具体的に教えてください（任意）
              </label>
              <textarea
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                placeholder="どのような危険がありますか？"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows={3}
              />
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="px-4 py-3 bg-gray-50 border-t flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {selectedReasons.length > 0 ? (
              <span className="text-purple-600 font-medium">
                {selectedReasons.length}件選択中
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-600">
                <AlertTriangle className="w-4 h-4" />
                最低1つ選択してください
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                canSubmit
                  ? "bg-purple-600 text-white hover:bg-purple-700"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {mode === "create" ? "ピンを立てる" : "保存する"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
