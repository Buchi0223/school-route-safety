"use client";

import { MyHazardPoint, MY_HAZARD_REASON_INFO } from "@/lib/types";

// マイ危険ポイントのアイコンカラー（MyHazardMarkersと同じ値）
const MY_HAZARD_COLOR = "#8B5CF6";

interface DuplicatePinWarningDialogProps {
  isOpen: boolean;
  nearbyPin: MyHazardPoint | null;
  onEditExisting: () => void;
  onCreateNew: () => void;
  onCancel: () => void;
}

export function DuplicatePinWarningDialog({
  isOpen,
  nearbyPin,
  onEditExisting,
  onCreateNew,
  onCancel,
}: DuplicatePinWarningDialogProps) {
  if (!isOpen || !nearbyPin) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center">
      {/* オーバーレイ */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onCancel}
      />

      {/* ダイアログ */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-sm w-full mx-4 p-6">
        {/* ヘッダー */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: MY_HAZARD_COLOR }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900">
            近くにピンがあります
          </h3>
        </div>

        {/* メッセージ */}
        <p className="text-gray-600 mb-4">
          この位置から30m以内に既存のピンがあります。
        </p>

        {/* 既存ピンの情報 */}
        <div className="bg-purple-50 rounded-lg p-3 mb-4">
          <div className="text-sm font-medium text-purple-700 mb-1">
            既存のピン:
          </div>
          <ul className="text-sm text-gray-700 space-y-1">
            {nearbyPin.reasons.map((reason) => (
              <li key={reason} className="flex items-start gap-1">
                <span className="text-purple-500">•</span>
                <span>{MY_HAZARD_REASON_INFO[reason].label}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* アクションボタン */}
        <div className="flex flex-col gap-2">
          <button
            onClick={onEditExisting}
            className="w-full py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            既存のピンを編集する
          </button>
          <button
            onClick={onCreateNew}
            className="w-full py-2 px-4 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            それでも新規作成する
          </button>
          <button
            onClick={onCancel}
            className="w-full py-2 px-4 text-gray-500 hover:text-gray-700 transition-colors text-sm"
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
}
