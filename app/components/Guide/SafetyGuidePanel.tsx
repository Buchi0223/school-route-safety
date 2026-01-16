"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CheckCircle2, MessageCircle, Lightbulb, BookOpen, Circle } from "lucide-react";
import { HazardPoint, HAZARD_TYPE_INFO } from "@/lib/types";

interface SafetyGuidePanelProps {
  selectedHazard: HazardPoint | null;
}

export function SafetyGuidePanel({ selectedHazard }: SafetyGuidePanelProps) {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  // 危険地点が変わったらチェック状態をリセット
  useEffect(() => {
    if (selectedHazard) {
      const initialState: Record<string, boolean> = {};
      selectedHazard.checkPoints.forEach((_, index) => {
        initialState[`${selectedHazard.id}-${index}`] = false;
      });
      setCheckedItems(initialState);
    }
  }, [selectedHazard]);

  const toggleCheck = (key: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (!selectedHazard) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            安全学習ガイド
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 flex items-center justify-center">
            <p className="text-gray-500 text-sm text-center">
              危険地点を選択すると
              <br />
              学習ガイドが表示されます
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hazardInfo = HAZARD_TYPE_INFO[selectedHazard.type];

  return (
    <Card className="h-full overflow-auto">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          安全学習ガイド
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* 危険地点情報 */}
        <div className="p-3 rounded-lg bg-gray-50">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{hazardInfo.icon}</span>
            <div>
              <p className="font-bold">{selectedHazard.title}</p>
              <span
                className="px-2 py-0.5 rounded text-xs text-white inline-block"
                style={{ backgroundColor: hazardInfo.color }}
              >
                {hazardInfo.label}
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-600">{selectedHazard.description}</p>
        </div>

        <Accordion type="multiple" defaultValue={["checkpoints", "voice"]}>
          {/* チェックポイント */}
          <AccordionItem value="checkpoints">
            <AccordionTrigger className="py-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>確認ポイント</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-2">
                {selectedHazard.checkPoints.map((point, index) => {
                  const key = `${selectedHazard.id}-${index}`;
                  const isChecked = checkedItems[key] || false;
                  return (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors"
                      onClick={() => toggleCheck(key)}
                    >
                      {isChecked ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      )}
                      <span className={isChecked ? "text-green-700 line-through" : ""}>
                        {point}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </AccordionContent>
          </AccordionItem>

          {/* 声かけ例 */}
          <AccordionItem value="voice">
            <AccordionTrigger className="py-2">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-blue-600" />
                <span>声かけ例</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800 italic">
                  「{selectedHazard.voiceGuide}」
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 安全のヒント */}
          <AccordionItem value="tips">
            <AccordionTrigger className="py-2">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-yellow-600" />
                <span>安全のヒント</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-wrap gap-2">
                {selectedHazard.safetyTips.map((tip, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm"
                  >
                    {tip}
                  </span>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
