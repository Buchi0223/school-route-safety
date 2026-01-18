"use client";

import { Overlay } from "./Overlay";
import { AlertTriangle, Circle, MessageCircle, MapPin, Navigation, Backpack } from "lucide-react";

interface HelpOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

// 危険地点の種類
const hazardTypes = [
  {
    icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
    label: "見通しの悪い交差点",
    description: "塀や建物で左右の確認が難しい交差点",
    color: "bg-yellow-50 border-yellow-200",
  },
  {
    icon: <Circle className="h-5 w-5 text-red-500 fill-red-500" />,
    label: "事故多発エリア",
    description: "過去に事故が報告されている場所",
    color: "bg-red-50 border-red-200",
  },
  {
    icon: <Circle className="h-5 w-5 text-orange-500 fill-orange-500" />,
    label: "急ブレーキ多発地点",
    description: "車が急停止することが多い場所",
    color: "bg-orange-50 border-orange-200",
  },
  {
    icon: <MessageCircle className="h-5 w-5 text-blue-500" />,
    label: "ユーザー投稿情報",
    description: "地域住民からの危険報告",
    color: "bg-blue-50 border-blue-200",
  },
];

// 操作方法
const operationGuides = [
  {
    icon: <MapPin className="h-5 w-5 text-green-600" />,
    label: "地図をタップ",
    description: "経由地点を追加（経路描画中）",
  },
  {
    icon: <Navigation className="h-5 w-5 text-blue-600" />,
    label: "マーカーをタップ",
    description: "移動/削除ボタンで操作",
  },
  {
    icon: <Backpack className="h-5 w-5 text-purple-600" />,
    label: "探検モード",
    description: "Street Viewで通学路を体験（準備中）",
  },
];

export function HelpOverlay({ isOpen, onClose }: HelpOverlayProps) {
  return (
    <Overlay isOpen={isOpen} onClose={onClose} title="ヘルプ">
      <div className="p-4 space-y-6">
        {/* 危険地点の種類 */}
        <section>
          <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            危険地点の種類
          </h3>
          <div className="space-y-2">
            {hazardTypes.map((hazard, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 p-3 rounded-lg border ${hazard.color}`}
              >
                <div className="flex-shrink-0 mt-0.5">{hazard.icon}</div>
                <div>
                  <p className="font-medium text-gray-800 text-sm">{hazard.label}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{hazard.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 区切り線 */}
        <hr className="border-gray-200" />

        {/* 操作方法 */}
        <section>
          <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-green-600" />
            操作方法
          </h3>
          <div className="space-y-2">
            {operationGuides.map((guide, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200"
              >
                <div className="flex-shrink-0 mt-0.5">{guide.icon}</div>
                <div>
                  <p className="font-medium text-gray-800 text-sm">{guide.label}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{guide.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 経路ノード操作の詳細 */}
        <section>
          <h3 className="text-sm font-bold text-gray-800 mb-3">経路ノードの操作</h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">
                S
              </div>
              <span className="text-gray-700">出発地点（スタート）</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold">
                G
              </div>
              <span className="text-gray-700">目的地（ゴール）</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-[10px] font-bold">
                1
              </div>
              <span className="text-gray-700">経由地点（番号順）</span>
            </div>
            <hr className="border-blue-200 my-2" />
            <p className="text-xs text-blue-700">
              マーカーをタップするとポップアップが表示され、「移動」「削除」ボタンで操作できます。
            </p>
          </div>
        </section>

        {/* バージョン情報 */}
        <div className="text-center text-xs text-gray-400 pt-2">
          通学路安全確認デモアプリ v0.1.0
        </div>
      </div>
    </Overlay>
  );
}
