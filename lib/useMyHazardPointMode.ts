'use client';

import { useState, useCallback } from 'react';
import { MyHazardPoint, MyHazardReason } from './types';

// マイ危険ポイント設置モードの状態
export type MyHazardPointModeState =
  | 'pin_idle'     // 初期状態（ピン設置待ち）
  | 'pin_editing'; // ピン編集中

// 新規ピンの一時データ
export interface PendingPin {
  lat: number;
  lng: number;
}

interface UseMyHazardPointModeReturn {
  // 状態
  state: MyHazardPointModeState;
  isActive: boolean;

  // 選択中ピン
  selectedPinId: string | null;
  selectedPin: MyHazardPoint | null;

  // 新規ピン位置
  pendingPin: PendingPin | null;

  // アクション
  startMode: () => void;
  exitMode: () => void;

  // ピン操作
  selectPin: (pin: MyHazardPoint) => void;
  deselectPin: () => void;
  startNewPin: (lat: number, lng: number) => void;
  cancelNewPin: () => void;
  startEditPin: (pin: MyHazardPoint) => void;
  finishEdit: () => void;
}

export function useMyHazardPointMode(): UseMyHazardPointModeReturn {
  const [state, setState] = useState<MyHazardPointModeState>('pin_idle');
  const [isActive, setIsActive] = useState(false);
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const [selectedPin, setSelectedPin] = useState<MyHazardPoint | null>(null);
  const [pendingPin, setPendingPin] = useState<PendingPin | null>(null);

  // モードを開始
  const startMode = useCallback(() => {
    setIsActive(true);
    setState('pin_idle');
    setSelectedPinId(null);
    setSelectedPin(null);
    setPendingPin(null);
  }, []);

  // モードを終了
  const exitMode = useCallback(() => {
    setIsActive(false);
    setState('pin_idle');
    setSelectedPinId(null);
    setSelectedPin(null);
    setPendingPin(null);
  }, []);

  // ピンを選択
  const selectPin = useCallback((pin: MyHazardPoint) => {
    setSelectedPinId(pin.id);
    setSelectedPin(pin);
    setPendingPin(null);
  }, []);

  // ピン選択を解除
  const deselectPin = useCallback(() => {
    setSelectedPinId(null);
    setSelectedPin(null);
  }, []);

  // 新規ピン位置を設定（地図クリック時）
  const startNewPin = useCallback((lat: number, lng: number) => {
    setPendingPin({ lat, lng });
    setSelectedPinId(null);
    setSelectedPin(null);
    setState('pin_editing');
  }, []);

  // 新規ピン作成をキャンセル
  const cancelNewPin = useCallback(() => {
    setPendingPin(null);
    setState('pin_idle');
  }, []);

  // 既存ピンの編集を開始
  const startEditPin = useCallback((pin: MyHazardPoint) => {
    setSelectedPinId(pin.id);
    setSelectedPin(pin);
    setPendingPin(null);
    setState('pin_editing');
  }, []);

  // 編集を完了（idle状態に戻る）
  const finishEdit = useCallback(() => {
    setPendingPin(null);
    setState('pin_idle');
    // 選択状態は維持（編集後もピンを選択したまま）
  }, []);

  return {
    state,
    isActive,
    selectedPinId,
    selectedPin,
    pendingPin,
    startMode,
    exitMode,
    selectPin,
    deselectPin,
    startNewPin,
    cancelNewPin,
    startEditPin,
    finishEdit,
  };
}

export default useMyHazardPointMode;
