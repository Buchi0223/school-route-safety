"use client";

import { memo } from "react";
import { HazardPoint } from "@/lib/types";
import { AlertTriangle, Eye } from "lucide-react";

interface HazardStopPanelDesktopProps {
  hazard: HazardPoint;
}

// 危険タイプの日本語ラベル
const HAZARD_TYPE_LABELS: Record<string, string> = {
  intersection: "見通しの悪い交差点",
  accident: "事故多発エリア",
  braking: "急ブレーキ多発地点",
  user_report: "ユーザー投稿情報",
};

export const HazardStopPanelDesktop = memo(function HazardStopPanelDesktop({
  hazard,
}: HazardStopPanelDesktopProps) {
  const typeLabel = HAZARD_TYPE_LABELS[hazard.type] || hazard.type;

  return (
    <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-red-600 to-red-500 text-white px-4 py-3 shadow-lg">
      <div className="flex items-center gap-3">
        {/* アイコン */}
        <div className="shrink-0 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
          <AlertTriangle className="h-6 w-6 text-yellow-300" />
        </div>

        {/* 情報 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium bg-white/20 px-2 py-0.5 rounded">
              {typeLabel}
            </span>
          </div>
          <h3 className="font-bold text-lg truncate mt-1">{hazard.title}</h3>
        </div>

        {/* 周りを見渡すヒント */}
        <div className="shrink-0 flex items-center gap-1 text-white/80 text-xs bg-white/10 px-2 py-1 rounded-lg">
          <Eye className="h-4 w-4" />
          <span>周りを見渡してみよう</span>
        </div>
      </div>
    </div>
  );
});
