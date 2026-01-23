"use client";

import { MyHazardPoint, MY_HAZARD_REASON_INFO } from "@/lib/types";
import { AlertTriangle, X } from "lucide-react";

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  pin: MyHazardPoint | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmDialog({
  isOpen,
  pin,
  onClose,
  onConfirm,
}: DeleteConfirmDialogProps) {
  if (!isOpen || !pin) return null;

  const reasonLabel = pin.reasons.length === 1
    ? MY_HAZARD_REASON_INFO[pin.reasons[0]].label
    : `${MY_HAZARD_REASON_INFO[pin.reasons[0]].label} 他${pin.reasons.length - 1}件`;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center">
      {/* オーバーレイ */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* ダイアログ */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        {/* ヘッダー */}
        <div className="p-5 text-center">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7 text-red-600" />
          </div>
          <h3 className="font-bold text-lg text-gray-900">
            このピンを削除しますか？
          </h3>
          <p className="text-sm text-gray-500 mt-2">
            「{reasonLabel}」のピンを削除します。<br />
            この操作は取り消せません。
          </p>
        </div>

        {/* フッター */}
        <div className="px-4 py-3 bg-gray-50 border-t flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg font-medium transition-colors"
          >
            削除する
          </button>
        </div>
      </div>
    </div>
  );
}
