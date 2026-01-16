"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, MessageCircle, Lightbulb, X, ChevronDown, ChevronUp } from "lucide-react";
import { HazardPoint, HAZARD_TYPE_INFO } from "@/lib/types";

interface SafetyGuideOverlayProps {
  selectedHazard: HazardPoint | null;
  onClose: () => void;
}

export function SafetyGuideOverlay({ selectedHazard, onClose }: SafetyGuideOverlayProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!selectedHazard) return null;

  const hazardInfo = HAZARD_TYPE_INFO[selectedHazard.type];

  return (
    <div className="absolute bottom-4 left-4 z-[1000] w-80 max-w-[calc(100%-2rem)]">
      <Card className="shadow-lg border-2" style={{ borderColor: hazardInfo.color }}>
        <CardHeader className="py-2 px-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">{hazardInfo.icon}</span>
              <CardTitle className="text-sm font-bold truncate">
                {selectedHazard.title}
              </CardTitle>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <span
            className="px-2 py-0.5 rounded text-xs text-white inline-block w-fit"
            style={{ backgroundColor: hazardInfo.color }}
          >
            {hazardInfo.label}
          </span>
        </CardHeader>

        {isExpanded && (
          <CardContent className="py-2 px-3 space-y-3 max-h-60 overflow-y-auto">
            {/* 説明 */}
            <p className="text-xs text-gray-600">{selectedHazard.description}</p>

            {/* チェックポイント */}
            <div>
              <div className="flex items-center gap-1 mb-1">
                <CheckCircle2 className="h-3 w-3 text-green-600" />
                <span className="text-xs font-bold text-green-700">確認ポイント</span>
              </div>
              <ul className="space-y-0.5 pl-4">
                {selectedHazard.checkPoints.map((point, index) => (
                  <li key={index} className="text-xs text-gray-700 list-disc">
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            {/* 声かけ例 */}
            <div className="bg-blue-50 p-2 rounded">
              <div className="flex items-center gap-1 mb-1">
                <MessageCircle className="h-3 w-3 text-blue-600" />
                <span className="text-xs font-bold text-blue-700">声かけ例</span>
              </div>
              <p className="text-xs text-blue-800 italic">
                「{selectedHazard.voiceGuide}」
              </p>
            </div>

            {/* 安全のヒント */}
            <div>
              <div className="flex items-center gap-1 mb-1">
                <Lightbulb className="h-3 w-3 text-yellow-600" />
                <span className="text-xs font-bold text-yellow-700">安全のヒント</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {selectedHazard.safetyTips.map((tip, index) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs"
                  >
                    {tip}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
