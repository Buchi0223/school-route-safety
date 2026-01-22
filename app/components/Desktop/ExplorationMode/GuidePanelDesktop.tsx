"use client";

import { memo, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ExplorationState } from "@/lib/useExplorationMode";
import { HazardPoint } from "@/lib/types";
import {
  MousePointer,
  MousePointerClick,
  Move,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  MapPin,
} from "lucide-react";
import Image from "next/image";

interface GuidePanelDesktopProps {
  state: ExplorationState;
  nearbyHazard?: HazardPoint | null;
  onResumeFromHazard?: () => void;
  // 危険地点停止時のセリフ進行用
  speechIndex?: number;
  onSpeechNext?: () => void;
}

// 危険地点停止時のセリフシーケンス
const HAZARD_SPEECH_SEQUENCE = [
  {
    message: "どこに危険があるかな？3つ探してみよう！",
    subMessage: "まわりをよく見てみよう",
  },
  {
    message: "危険から身を守るためにどう注意したらいいと思う？",
    subMessage: "考えてみよう",
  },
  {
    message: "探検を続けよう！",
    subMessage: "クリックでツアーを再開",
  },
];

export const GuidePanelDesktop = memo(function GuidePanelDesktop({
  state,
  nearbyHazard,
  onResumeFromHazard,
  speechIndex = 0,
  onSpeechNext,
}: GuidePanelDesktopProps) {
  const [isCharacterVisible, setIsCharacterVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsCharacterVisible(true), 300);
    return () => clearTimeout(timer);
  }, [state]);

  // 経路設定中
  if (state === "route_setting") {
    return (
      <Card className="h-full bg-white/95 backdrop-blur shadow-lg flex flex-col">
        <CardContent className="flex-1 p-4 flex flex-col">
          {/* キャラクターとメッセージ */}
          <div className="flex items-start gap-3 mb-4">
            <div
              className={`shrink-0 transition-all duration-500 ${
                isCharacterVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <div className="w-16 h-16 relative">
                <Image
                  src="/images/character_v2.png"
                  alt="セーフティにゃん"
                  fill
                  className="object-contain drop-shadow-md"
                  priority
                />
              </div>
            </div>
            <div className="flex-1 bg-yellow-50 rounded-xl p-3 border-2 border-yellow-300 relative">
              {/* 吹き出しの尻尾 */}
              <div className="absolute left-[-8px] top-4 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[8px] border-r-yellow-300" />
              <div className="absolute left-[-5px] top-4 w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-r-[6px] border-r-yellow-50" />
              <p className="text-sm font-bold text-gray-800">準備はいいかな？</p>
              <p className="text-xs text-gray-600 mt-1">地図をクリックして通学路を設定しよう！</p>
            </div>
          </div>

          {/* 操作ヒント */}
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              操作ヒント
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-2 bg-gray-50 rounded-lg">
                <MousePointer className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">シングルクリック</p>
                  <p className="text-xs text-gray-500">出発地点・経由地点を追加</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-2 bg-gray-50 rounded-lg">
                <MousePointerClick className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">ダブルクリック</p>
                  <p className="text-xs text-gray-500">目的地（ゴール）を設定</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-2 bg-gray-50 rounded-lg">
                <Move className="h-5 w-5 text-purple-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">マーカーをドラッグ</p>
                  <p className="text-xs text-gray-500">地点の位置を変更</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ツアー中
  if (state === "touring") {
    return (
      <Card className="h-full bg-white/95 backdrop-blur shadow-lg flex flex-col">
        <CardContent className="flex-1 p-4 flex flex-col">
          {/* キャラクターとメッセージ */}
          <div className="flex items-start gap-3 mb-4">
            <div className="w-16 h-16 relative shrink-0">
              <Image
                src="/images/character_v2.png"
                alt="セーフティにゃん"
                fill
                className="object-contain drop-shadow-md"
                priority
              />
            </div>
            <div className="flex-1 bg-blue-50 rounded-xl p-3 border-2 border-blue-300 relative">
              <div className="absolute left-[-8px] top-4 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[8px] border-r-blue-300" />
              <div className="absolute left-[-5px] top-4 w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-r-[6px] border-r-blue-50" />
              <p className="text-sm font-bold text-gray-800">いい調子だね！</p>
              <p className="text-xs text-gray-600 mt-1">危険な場所に気をつけて進もう</p>
            </div>
          </div>

          {/* 情報表示エリア */}
          <div className="flex-1 flex flex-col justify-center items-center text-gray-500">
            <MapPin className="h-12 w-12 mb-2 opacity-30" />
            <p className="text-sm">ツアーを進行中...</p>
            <p className="text-xs mt-1">危険地点に近づくと自動で停止します</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 危険地点で停止中
  if (state === "hazard_stop" && nearbyHazard) {
    const currentSpeech = HAZARD_SPEECH_SEQUENCE[speechIndex] || HAZARD_SPEECH_SEQUENCE[0];
    const isLastSpeech = speechIndex >= HAZARD_SPEECH_SEQUENCE.length - 1;

    const handleClick = () => {
      if (isLastSpeech && onResumeFromHazard) {
        onResumeFromHazard();
      } else if (onSpeechNext) {
        onSpeechNext();
      }
    };

    return (
      <Card className="h-full bg-white/95 backdrop-blur shadow-lg flex flex-col border-red-200">
        <CardContent className="flex-1 p-4 flex flex-col">
          {/* 危険地点ヘッダー */}
          <div className="flex items-center gap-2 mb-3 p-2 bg-red-50 rounded-lg border border-red-200">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <div className="flex-1">
              <p className="text-sm font-bold text-red-700">{nearbyHazard.title}</p>
              <p className="text-xs text-red-600">{nearbyHazard.type}</p>
            </div>
          </div>

          {/* キャラクターとセリフ */}
          <div className="flex items-start gap-3 mb-4">
            <div className="w-16 h-16 relative shrink-0">
              <Image
                src="/images/character_v2.png"
                alt="セーフティにゃん"
                fill
                className="object-contain drop-shadow-md"
                priority
              />
            </div>
            <div
              className="flex-1 bg-yellow-50 rounded-xl p-3 border-2 border-yellow-400 relative cursor-pointer hover:bg-yellow-100 transition-colors"
              onClick={handleClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && handleClick()}
            >
              <div className="absolute left-[-8px] top-4 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[8px] border-r-yellow-400" />
              <div className="absolute left-[-5px] top-4 w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-r-[6px] border-r-yellow-50" />
              <p className="text-sm font-bold text-gray-800">{currentSpeech.message}</p>
              <p className="text-xs text-gray-600 mt-1">{currentSpeech.subMessage}</p>
              <div className="flex items-center justify-between mt-2">
                <div className="flex gap-1">
                  {HAZARD_SPEECH_SEQUENCE.map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i <= speechIndex ? "bg-yellow-500" : "bg-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-400">
                  {isLastSpeech ? "クリックで再開" : "クリックで次へ →"}
                </span>
              </div>
            </div>
          </div>

          {/* チェックポイント */}
          <div className="flex-1">
            <p className="text-xs font-bold text-gray-700 mb-2">チェックポイント</p>
            <div className="space-y-2">
              {nearbyHazard.checkPoints.map((point, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-gray-700">{point}</span>
                </div>
              ))}
            </div>
            {nearbyHazard.safetyTips && nearbyHazard.safetyTips.length > 0 && (
              <div className="mt-3 p-2 bg-green-50 rounded-lg border border-green-200">
                <p className="text-xs font-bold text-green-700 mb-1">安全のヒント</p>
                <p className="text-xs text-green-600">{nearbyHazard.safetyTips.join("・")}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // 完了
  if (state === "completed") {
    return (
      <Card className="h-full bg-gradient-to-b from-yellow-50 to-orange-50 backdrop-blur shadow-lg flex flex-col">
        <CardContent className="flex-1 p-4 flex flex-col items-center justify-center">
          <div className="w-20 h-20 relative mb-4">
            <Image
              src="/images/character_v2.png"
              alt="セーフティにゃん"
              fill
              className="object-contain drop-shadow-md"
              priority
            />
          </div>
          <p className="text-lg font-bold text-yellow-700 text-center">
            おめでとう！
          </p>
          <p className="text-sm text-yellow-600 text-center mt-1">
            通学路の安全マスターだね！
          </p>
        </CardContent>
      </Card>
    );
  }

  return null;
});
