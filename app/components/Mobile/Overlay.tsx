"use client";

import { useEffect, useCallback } from "react";
import { X } from "lucide-react";

interface OverlayProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  /** 背景タップで閉じないようにする（地図操作を許可） */
  disableBackgroundClose?: boolean;
}

export function Overlay({ isOpen, onClose, title, children, disableBackgroundClose = false }: OverlayProps) {
  // ESCキーで閉じる
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    },
    [isOpen, onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

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

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-x-0 top-0 z-50 flex flex-col ${disableBackgroundClose ? 'pointer-events-none' : ''}`}>
      {/* 背景オーバーレイ（タップで閉じる、または透過） */}
      {!disableBackgroundClose && (
        <div
          className="absolute inset-0 bg-black/30 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* オーバーレイコンテンツ */}
      <div
        className={`
          relative bg-white rounded-b-2xl shadow-lg
          transform transition-transform duration-300 ease-out
          ${isOpen ? "translate-y-0" : "-translate-y-full"}
          ${disableBackgroundClose ? 'pointer-events-auto' : ''}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation"
            aria-label="閉じる"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* コンテンツ */}
        <div className="max-h-[70vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
