"use client";

import { Map, Camera, BookOpen } from "lucide-react";

export type MobileViewTab = "map" | "streetview" | "guide";

interface MobileViewTabsProps {
  activeTab: MobileViewTab;
  onTabChange: (tab: MobileViewTab) => void;
  hasSelectedHazard: boolean;
}

export function MobileViewTabs({
  activeTab,
  onTabChange,
  hasSelectedHazard,
}: MobileViewTabsProps) {
  const tabs: { id: MobileViewTab; label: string; icon: React.ReactNode }[] = [
    { id: "map", label: "地図", icon: <Map className="h-5 w-5" /> },
    { id: "streetview", label: "Street View", icon: <Camera className="h-5 w-5" /> },
    { id: "guide", label: "ガイド", icon: <BookOpen className="h-5 w-5" /> },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[2000] bg-white border-t border-gray-200 shadow-lg">
      <div className="flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 flex flex-col items-center justify-center py-2 px-1 transition-colors touch-manipulation ${
              activeTab === tab.id
                ? "text-blue-600 bg-blue-50"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50 active:bg-gray-100"
            }`}
          >
            <div className="relative">
              {tab.icon}
              {tab.id === "guide" && hasSelectedHazard && (
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full" />
              )}
            </div>
            <span className="text-xs mt-0.5 font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
