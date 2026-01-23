"use client";

import { useState, useCallback, useEffect } from "react";
import { MyHazardPoint, MyHazardReason } from "@/lib/types";
import { ReasonDialog } from "./ReasonDialog";
import { PinListPanel } from "./PinListPanel";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { DuplicatePinWarningDialog } from "@/app/components/Map/DuplicatePinWarningDialog";
import { MapPin, Check, HelpCircle } from "lucide-react";

interface MyHazardPointModeDesktopProps {
  // ピンデータ
  pins: MyHazardPoint[];
  onPinAdd: (pin: Omit<MyHazardPoint, "id" | "createdAt" | "updatedAt">) => void;
  onPinUpdate: (id: string, updates: Partial<MyHazardPoint>) => void;
  onPinDelete: (id: string) => void;
  findNearby: (lat: number, lng: number, radiusMeters?: number) => MyHazardPoint[];

  // 選択状態
  selectedPinId: string | null;
  onPinSelect: (pin: MyHazardPoint | null) => void;

  // 完了アクション
  onComplete: () => void;

  // 外部からの地図クリック位置（page.tsxから渡される）
  mapClickLocation?: { lat: number; lng: number } | null;
  onMapClickLocationClear?: () => void;
}

export function MyHazardPointModeDesktop({
  pins,
  onPinAdd,
  onPinUpdate,
  onPinDelete,
  findNearby,
  selectedPinId,
  onPinSelect,
  onComplete,
  mapClickLocation,
  onMapClickLocationClear,
}: MyHazardPointModeDesktopProps) {
  // ダイアログ状態
  const [reasonDialogOpen, setReasonDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);

  // 編集モード
  const [editingPin, setEditingPin] = useState<MyHazardPoint | null>(null);
  const [deletingPin, setDeletingPin] = useState<MyHazardPoint | null>(null);

  // 新規ピン用の一時位置
  const [pendingLocation, setPendingLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearbyPin, setNearbyPin] = useState<MyHazardPoint | null>(null);

  // 外部からの地図クリックを処理
  useEffect(() => {
    if (mapClickLocation) {
      const { lat, lng } = mapClickLocation;

      // 30m以内に既存ピンがあるかチェック
      const nearby = findNearby(lat, lng, 30);
      if (nearby.length > 0) {
        setPendingLocation({ lat, lng });
        setNearbyPin(nearby[0]);
        setDuplicateDialogOpen(true);
      } else {
        // 新規作成ダイアログを開く
        setPendingLocation({ lat, lng });
        setEditingPin(null);
        setReasonDialogOpen(true);
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

    setReasonDialogOpen(false);
    setEditingPin(null);
    setPendingLocation(null);
  }, [editingPin, pendingLocation, onPinAdd, onPinUpdate]);

  // ピン編集
  const handlePinEdit = useCallback((pin: MyHazardPoint) => {
    setEditingPin(pin);
    setReasonDialogOpen(true);
  }, []);

  // ピン削除確認
  const handlePinDeleteRequest = useCallback((pin: MyHazardPoint) => {
    setDeletingPin(pin);
    setDeleteDialogOpen(true);
  }, []);

  // ピン削除実行
  const handlePinDeleteConfirm = useCallback(() => {
    if (deletingPin) {
      onPinDelete(deletingPin.id);
      if (selectedPinId === deletingPin.id) {
        onPinSelect(null);
      }
    }
    setDeleteDialogOpen(false);
    setDeletingPin(null);
  }, [deletingPin, selectedPinId, onPinDelete, onPinSelect]);

  // 重複警告ダイアログ：既存ピンを編集
  const handleEditExisting = useCallback(() => {
    if (nearbyPin) {
      setDuplicateDialogOpen(false);
      setEditingPin(nearbyPin);
      setReasonDialogOpen(true);
    }
  }, [nearbyPin]);

  // 重複警告ダイアログ：新規作成を続行
  const handleCreateNew = useCallback(() => {
    setDuplicateDialogOpen(false);
    setNearbyPin(null);
    setEditingPin(null);
    setReasonDialogOpen(true);
  }, []);

  // ピン選択
  const handlePinSelect = useCallback((pin: MyHazardPoint) => {
    onPinSelect(selectedPinId === pin.id ? null : pin);
  }, [selectedPinId, onPinSelect]);

  return (
    <>
      {/* 左上のコントロールパネル */}
      <div className="absolute top-4 left-4 z-[1000] w-80">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* ヘッダー */}
          <div className="bg-purple-600 text-white px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold">マイ危険ポイント設置</h3>
                <p className="text-sm text-purple-200">
                  地図をクリックしてピンを立てよう
                </p>
              </div>
            </div>
          </div>

          {/* ガイド */}
          <div className="p-4 bg-purple-50 border-b">
            <div className="flex items-start gap-2 text-sm text-purple-800">
              <HelpCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium mb-1">ピンの立て方</p>
                <ol className="text-purple-600 space-y-1 ml-4 list-decimal">
                  <li>地図上の危険な場所をクリック</li>
                  <li>危険な理由を選択</li>
                  <li>「ピンを立てる」をクリック</li>
                </ol>
              </div>
            </div>
          </div>

          {/* ステータス */}
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="text-sm">
              <span className="text-gray-500">設置済み：</span>
              <span className="font-bold text-purple-600 ml-1">{pins.length}件</span>
            </div>
            <button
              onClick={onComplete}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              完了
            </button>
          </div>
        </div>
      </div>

      {/* 右側のピン一覧パネル */}
      <div className="absolute top-4 right-4 bottom-4 w-80 z-[1000]">
        <div className="h-full bg-white rounded-lg shadow-lg overflow-hidden">
          <PinListPanel
            pins={pins}
            selectedPinId={selectedPinId}
            onPinSelect={handlePinSelect}
            onPinEdit={handlePinEdit}
            onPinDelete={handlePinDeleteRequest}
          />
        </div>
      </div>

      {/* 理由選択ダイアログ */}
      <ReasonDialog
        isOpen={reasonDialogOpen}
        onClose={() => {
          setReasonDialogOpen(false);
          setEditingPin(null);
          setPendingLocation(null);
        }}
        onSubmit={handleReasonSubmit}
        initialReasons={editingPin?.reasons || []}
        initialDetail={editingPin?.reasonDetail || ""}
        mode={editingPin ? "edit" : "create"}
      />

      {/* 削除確認ダイアログ */}
      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        pin={deletingPin}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeletingPin(null);
        }}
        onConfirm={handlePinDeleteConfirm}
      />

      {/* 重複警告ダイアログ */}
      <DuplicatePinWarningDialog
        isOpen={duplicateDialogOpen}
        nearbyPin={nearbyPin}
        onCancel={() => {
          setDuplicateDialogOpen(false);
          setPendingLocation(null);
          setNearbyPin(null);
        }}
        onEditExisting={handleEditExisting}
        onCreateNew={handleCreateNew}
      />
    </>
  );
}
