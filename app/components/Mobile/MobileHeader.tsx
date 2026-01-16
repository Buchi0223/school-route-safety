"use client";

import { useState } from "react";

export type MenuTab = "route" | "explore" | "help";

interface MobileHeaderProps {
  activeTab: MenuTab;
  onTabChange: (tab: MenuTab) => void;
}

interface MenuItem {
  id: MenuTab;
  icon: string;
  label: string;
}

const menuItems: MenuItem[] = [
  { id: "route", icon: "🔍", label: "経路検索" },
  { id: "explore", icon: "🎒", label: "通学路探検" },
  { id: "help", icon: "❓", label: "アイコン説明" },
];

export function MobileHeader({ activeTab, onTabChange }: MobileHeaderProps) {
  return (
    <header className="h-12 bg-white border-b border-gray-200 flex items-center justify-around touch-manipulation">
      {menuItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onTabChange(item.id)}
          className={`
            flex-1 h-full flex items-center justify-center gap-1.5
            text-sm font-medium transition-colors
            ${
              activeTab === item.id
                ? "text-blue-600 bg-blue-50 border-b-2 border-blue-600"
                : "text-gray-600 hover:bg-gray-50 active:bg-gray-100"
            }
          `}
          style={{ touchAction: "manipulation" }}
        >
          <span className="text-base">{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </header>
  );
}
