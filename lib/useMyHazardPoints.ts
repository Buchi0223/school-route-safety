'use client';

import { useState, useEffect, useCallback } from 'react';
import { MyHazardPoint, MyHazardStorage, MyHazardReason } from './types';
import { haversineDistance } from './routing';

// ローカルストレージのキー
const STORAGE_KEY = 'my_hazard_points';

// 現在のスキーマバージョン
const CURRENT_VERSION = 1;

// デフォルトのストレージ状態
const DEFAULT_STORAGE: MyHazardStorage = {
  version: CURRENT_VERSION,
  pins: [],
  lastUpdated: new Date().toISOString(),
};

/**
 * UUID v4 を生成
 */
function generateUUID(): string {
  // crypto.randomUUID() がサポートされている場合は使用
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // フォールバック: 簡易的なUUID生成
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * ローカルストレージからデータを読み込み
 */
function loadFromStorage(): MyHazardStorage {
  if (typeof window === 'undefined') {
    return DEFAULT_STORAGE;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_STORAGE;
    }

    const data = JSON.parse(raw) as MyHazardStorage;

    // バージョンマイグレーション
    if (data.version < CURRENT_VERSION) {
      return migrateStorage(data);
    }

    return data;
  } catch (error) {
    console.error('Failed to load my hazard points from localStorage:', error);
    return DEFAULT_STORAGE;
  }
}

/**
 * ローカルストレージにデータを保存
 */
function saveToStorage(storage: MyHazardStorage): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const data: MyHazardStorage = {
      ...storage,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save my hazard points to localStorage:', error);
  }
}

/**
 * ストレージのマイグレーション
 * 将来のバージョンアップ時に使用
 */
function migrateStorage(oldStorage: MyHazardStorage): MyHazardStorage {
  let storage = { ...oldStorage };

  // バージョン1へのマイグレーション（将来用）
  // if (storage.version < 1) {
  //   // マイグレーション処理
  //   storage.version = 1;
  // }

  storage.version = CURRENT_VERSION;
  saveToStorage(storage);

  return storage;
}

/**
 * 2点間の距離を計算（メートル）
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  return haversineDistance(lat1, lng1, lat2, lng2);
}

/**
 * 指定した地点から一定距離以内にあるピンを検索
 */
export function findNearbyPins(
  pins: MyHazardPoint[],
  lat: number,
  lng: number,
  radiusMeters: number
): MyHazardPoint[] {
  return pins.filter((pin) => {
    const distance = calculateDistance(lat, lng, pin.lat, pin.lng);
    return distance <= radiusMeters;
  });
}

/**
 * マイ危険ポイント管理Hook
 */
export function useMyHazardPoints() {
  const [pins, setPins] = useState<MyHazardPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 初期読み込み
  useEffect(() => {
    const storage = loadFromStorage();
    setPins(storage.pins);
    setIsLoading(false);
  }, []);

  // 全ピン取得
  const getAll = useCallback((): MyHazardPoint[] => {
    return pins;
  }, [pins]);

  // ピン追加
  const add = useCallback((
    data: Omit<MyHazardPoint, 'id' | 'createdAt' | 'updatedAt'>
  ): MyHazardPoint => {
    const now = new Date().toISOString();
    const newPin: MyHazardPoint = {
      ...data,
      id: generateUUID(),
      createdAt: now,
      updatedAt: now,
    };

    setPins((prev) => {
      const updated = [...prev, newPin];
      saveToStorage({
        version: CURRENT_VERSION,
        pins: updated,
        lastUpdated: now,
      });
      return updated;
    });

    return newPin;
  }, []);

  // ピン更新
  const update = useCallback((
    id: string,
    data: Partial<Omit<MyHazardPoint, 'id' | 'createdAt' | 'updatedAt'>>
  ): MyHazardPoint | null => {
    let updatedPin: MyHazardPoint | null = null;

    setPins((prev) => {
      const index = prev.findIndex((pin) => pin.id === id);
      if (index === -1) {
        return prev;
      }

      const now = new Date().toISOString();
      updatedPin = {
        ...prev[index],
        ...data,
        updatedAt: now,
      };

      const updated = [...prev];
      updated[index] = updatedPin;

      saveToStorage({
        version: CURRENT_VERSION,
        pins: updated,
        lastUpdated: now,
      });

      return updated;
    });

    return updatedPin;
  }, []);

  // ピン削除
  const remove = useCallback((id: string): boolean => {
    let removed = false;

    setPins((prev) => {
      const index = prev.findIndex((pin) => pin.id === id);
      if (index === -1) {
        return prev;
      }

      removed = true;
      const updated = prev.filter((pin) => pin.id !== id);

      saveToStorage({
        version: CURRENT_VERSION,
        pins: updated,
        lastUpdated: new Date().toISOString(),
      });

      return updated;
    });

    return removed;
  }, []);

  // 全削除
  const clear = useCallback((): void => {
    setPins([]);
    saveToStorage({
      version: CURRENT_VERSION,
      pins: [],
      lastUpdated: new Date().toISOString(),
    });
  }, []);

  // IDでピンを取得
  const getById = useCallback((id: string): MyHazardPoint | undefined => {
    return pins.find((pin) => pin.id === id);
  }, [pins]);

  // 近くのピンを検索（重複防止用）
  const findNearby = useCallback((
    lat: number,
    lng: number,
    radiusMeters: number = 30
  ): MyHazardPoint[] => {
    return findNearbyPins(pins, lat, lng, radiusMeters);
  }, [pins]);

  // ピン数を取得
  const count = pins.length;

  return {
    pins,
    isLoading,
    count,
    getAll,
    getById,
    add,
    update,
    remove,
    clear,
    findNearby,
  };
}

export default useMyHazardPoints;
