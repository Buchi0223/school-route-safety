"use client";

import { useState, useCallback, useEffect } from "react";
import { MyHazardPoint, MyHazardReason } from "@/lib/types";
import { ReasonBottomSheet } from "./ReasonBottomSheet";
import { MapPin, Check, HelpCircle, X } from "lucide-react";
import Image from "next/image";

interface MyHazardPointModeMobileProps {
  // ピンデータ
  pins: MyHazardPoint[];
  onPinAdd: (pin: Omit<MyHazardPoint, "id" | "createdAt" | "updatedAt">) => void;
  onPinUpdate: (id: string, updates: Partial<MyHazardPoint>) => void;
  onPinDelete: (id: string) => void;
  findNearby: (lat: number, lng: number, radiusMeters?: number) => MyHazardPoint[];

  // 選択状態
  selectedPinId: string | null;
  onPinSelect: (pin: MyHazardPoint | null) => void;

  // 外部からの地図クリック位置（page.tsxから渡される）
  mapClickLocation?: { lat: number; lng: number } | null;
  onMapClickLocationClear?: () => void;

  // 閉じるハンドラ
  onClose?: () => void;
}

export function MyHazardPointModeMobile({
  pins,
  onPinAdd,
  onPinUpdate,
  onPinDelete,
  findNearby,
  selectedPinId,
  onPinSelect,
  mapClickLocation,
  onMapClickLocationClear,
  onClose,
}: MyHazardPointModeMobileProps) {
  // ボトムシート状態
  const [reasonSheetOpen, setReasonSheetOpen] = useState(false);

  // 編集モード
  const [editingPin, setEditingPin] = useState<MyHazardPoint | null>(null);

  // 新規ピン用の一時位置
  const [pendingLocation, setPendingLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearbyPin, setNearbyPin] = useState<MyHazardPoint | null>(null);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);

  // キャラクター表示状態
  const [isCharacterVisible, setIsCharacterVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsCharacterVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // 外部からの地図クリックを処理
  useEffect(() => {
    if (mapClickLocation) {
      const { lat, lng } = mapClickLocation;

      // 30m以内に既存ピンがあるかチェック
      const nearby = findNearby(lat, lng, 30);
      if (nearby.length > 0) {
        setPendingLocation({ lat, lng });
        setNearbyPin(nearby[0]);
        setShowDuplicateWarning(true);
      } else {
        // 新規作成ボトムシートを開く
        setPendingLocation({ lat, lng });
        setEditingPin(null);
        setReasonSheetOpen(true);
      }

      // 位置をクリア
      onMapClickLocationClear?.();
    }
  }, [mapClickLocation, findNearby, onMapClickLocationClear]);

  // 理由選択完了時
  const handleReasonSubmit = useCallback((reasons: MyHazardReason[], detail?: string) => {
    if (editingPin) {
      // 編集モード
      onPinUpdate(editingPin.id, { reasons, reasonDetail: detail });
    } else if (pendingLocation) {
      // 新規作成
      onPinAdd({
        lat: pendingLocation.lat,
        lng: pendingLocation.lng,
        reasons,
        reasonDetail: detail,
      });
    }

    setReasonSheetOpen(false);
    setEditingPin(null);
    setPendingLocation(null);
  }, [editingPin, pendingLocation, onPinAdd, onPinUpdate]);

  // 重複警告：既存ピンを編集
  const handleEditExisting = useCallback(() => {
    if (nearbyPin) {
      setShowDuplicateWarning(false);
      setEditingPin(nearbyPin);
      setReasonSheetOpen(true);
    }
  }, [nearbyPin]);

  // 重複警告：新規作成を続行
  const handleCreateNew = useCallback(() => {
    setShowDuplicateWarning(false);
    setNearbyPin(null);
    setEditingPin(null);
    setReasonSheetOpen(true);
  }, []);

  // 重複警告キャンセル
  const handleCancelDuplicate = useCallback(() => {
    setShowDuplicateWarning(false);
    setPendingLocation(null);
    setNearbyPin(null);
  }, []);

  return (
    <>
      {/* 上部ガイドバー */}
      <div className="fixed top-12 left-0 right-0 z-[1000] bg-purple-600 text-white px-4 py-2 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            <div>
              <span className="font-bold text-sm">ピン設置モード</span>
              <span className="text-purple-200 text-xs ml-2">
                設置済み: {pins.length}件
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-purple-200 text-xs">
              <HelpCircle className="w-3 h-3" />
              <span>タップでピン設置</span>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-purple-500/50 hover:bg-purple-500 transition-colors"
                aria-label="閉じる"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* キャラクターと吹き出し (左下) */}
      <div className="fixed bottom-4 left-2 z-[1000] pointer-events-auto">
        <div className="flex items-end gap-2">
          {/* キャラクター */}
          <div
            className={`w-16 h-16 relative transition-all duration-500 ${
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

          {/* 吹き出し */}
          <div
            className={`relative bg-purple-50 border-2 border-purple-400 rounded-xl p-3 max-w-[200px] transition-all duration-500 ${
              isCharacterVisible ? "opacity-100 scale-100" : "opacity-0 scale-75"
            }`}
            style={{ transitionDelay: "200ms" }}
          >
            {/* 吹き出しの尻尾 */}
            <div className="absolute left-[-8px] bottom-4 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[8px] border-r-purple-400" />
            <div className="absolute left-[-5px] bottom-4 w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-r-[6px] border-r-purple-50" />

            <p className="text-xs font-bold text-purple-800">
              {pins.length === 0
                ? "地図をタップして危険だと思う場所にピンを立ててね！"
                : `${pins.length}個のピンを設置したよ！他にも危険な場所はあるかな？`}
            </p>
          </div>
        </div>
      </div>

      {/* 理由選択ボトムシート */}
      <ReasonBottomSheet
        isOpen={reasonSheetOpen}
        onClose={() => {
          setReasonSheetOpen(false);
          setEditingPin(null);
          setPendingLocation(null);
        }}
        onSubmit={handleReasonSubmit}
        initialReasons={editingPin?.reasons || []}
        initialDetail={editingPin?.reasonDetail || ""}
        mode={editingPin ? "edit" : "create"}
      />

      {/* 重複警告ダイアログ */}
      {showDuplicateWarning && nearbyPin && (
        <div className="fixed inset-0 z-[2000] flex items-end justify-center">
          {/* オーバーレイ */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={handleCancelDuplicate}
          />

          {/* ダイアログ（ボトムシート風） */}
          <div className="relative bg-white rounded-t-2xl w-full max-w-md p-6 pb-8 animate-slide-up">
            {/* ドラッグハンドル */}
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                近くにピンがあります
              </h3>
            </div>

            <p className="text-gray-600 text-sm mb-4">
              この位置から30m以内に既存のピンがあります。
            </p>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleEditExisting}
                className="w-full py-3 px-4 bg-purple-600 text-white rounded-xl font-medium active:scale-98 transition-transform"
              >
                既存のピンを編集する
              </button>
              <button
                onClick={handleCreateNew}
                className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium active:scale-98 transition-transform"
              >
                それでも新規作成する
              </button>
              <button
                onClick={handleCancelDuplicate}
                className="w-full py-2 text-gray-500 text-sm"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

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
    </>
  );
}
