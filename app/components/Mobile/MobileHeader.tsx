"use client";

import { useState } from "react";

export type MenuTab = "route" | "explore" | "pin" | "help";

interface MobileHeaderProps {
  activeTab: MenuTab;
  onTabChange: (tab: MenuTab) => void;
  pinCount?: number; // マイ危険ポイントの設置数
}

interface MenuItem {
  id: MenuTab;
  icon: string;
  label: string;
  badge?: number;
}

const createMenuItems = (pinCount?: number): MenuItem[] => [
  { id: "route", icon: "🔍", label: "経路検索" },
  { id: "explore", icon: "🎒", label: "通学路探検" },
  { id: "pin", icon: "📍", label: "ピン設置", badge: pinCount },
  { id: "help", icon: "❓", label: "アイコン説明" },
];

export function MobileHeader({ activeTab, onTabChange, pinCount }: MobileHeaderProps) {
  const menuItems = createMenuItems(pinCount);

  return (
    <header className="h-12 bg-white border-b border-gray-200 flex items-center justify-around touch-manipulation">
      {menuItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onTabChange(item.id)}
          className={`
            flex-1 h-full flex items-center justify-center gap-1 relative
            text-xs font-medium transition-colors
            ${
              activeTab === item.id
                ? item.id === "pin"
                  ? "text-purple-600 bg-purple-50 border-b-2 border-purple-600"
                  : "text-blue-600 bg-blue-50 border-b-2 border-blue-600"
                : "text-gray-600 hover:bg-gray-50 active:bg-gray-100"
            }
          `}
          style={{ touchAction: "manipulation" }}
        >
          <span className="text-sm">{item.icon}</span>
          <span className="truncate">{item.label}</span>
          {/* ピン数バッジ */}
          {item.badge !== undefined && item.badge > 0 && (
            <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-purple-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {item.badge}
            </span>
          )}
        </button>
      ))}
    </header>
  );
}
