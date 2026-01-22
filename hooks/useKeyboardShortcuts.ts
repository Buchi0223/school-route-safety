"use client";

import { useEffect, useCallback } from "react";

interface KeyboardShortcutsOptions {
  // ツアーコントロール
  onPlayPause?: () => void;
  onForward?: () => void;
  onBackward?: () => void;
  onStop?: () => void;
  onSpeedChange?: (speed: number) => void;

  // セリフ進行（危険地点停止時）
  onSpeechNext?: () => void;

  // 状態
  isActive?: boolean;
  isHazardStop?: boolean;
}

export function useKeyboardShortcuts({
  onPlayPause,
  onForward,
  onBackward,
  onStop,
  onSpeedChange,
  onSpeechNext,
  isActive = false,
  isHazardStop = false,
}: KeyboardShortcutsOptions) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // アクティブでない場合は無視
      if (!isActive) return;

      // 入力フィールドにフォーカスがある場合は無視
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      switch (event.key) {
        case " ": // Space
          event.preventDefault();
          if (isHazardStop) {
            onSpeechNext?.();
          } else {
            onPlayPause?.();
          }
          break;

        case "ArrowRight":
          event.preventDefault();
          if (!isHazardStop) {
            onForward?.();
          }
          break;

        case "ArrowLeft":
          event.preventDefault();
          if (!isHazardStop) {
            onBackward?.();
          }
          break;

        case "Escape":
          event.preventDefault();
          onStop?.();
          break;

        case "Enter":
          if (isHazardStop) {
            event.preventDefault();
            onSpeechNext?.();
          }
          break;

        case "1":
          event.preventDefault();
          onSpeedChange?.(1);
          break;

        case "2":
          event.preventDefault();
          onSpeedChange?.(2);
          break;

        case "3":
          event.preventDefault();
          onSpeedChange?.(3);
          break;

        case "+":
        case "=": // Shift無しの+
          event.preventDefault();
          // 現在の速度を上げる（1->2, 2->3）
          // 速度状態は親コンポーネントで管理するため、個別に処理
          break;

        case "-":
          event.preventDefault();
          // 現在の速度を下げる（3->2, 2->1）
          break;

        default:
          break;
      }
    },
    [isActive, isHazardStop, onPlayPause, onForward, onBackward, onStop, onSpeedChange, onSpeechNext]
  );

  useEffect(() => {
    if (isActive) {
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isActive, handleKeyDown]);
}
