"use client";

import { memo, useState, useEffect } from "react";
import { X } from "lucide-react";
import Image from "next/image";

interface RouteSetupProps {
  hasValidRoute: boolean;
  onStartTour: () => void;
  onExit: () => void;
}

export const RouteSetup = memo(function RouteSetup({
  hasValidRoute,
  onStartTour,
  onExit,
}: RouteSetupProps) {
  const [isVisible, setIsVisible] = useState(false);

  // 登場アニメーション
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // 吹き出しクリック時の処理
  const handleBubbleClick = () => {
    if (hasValidRoute) {
      onStartTour();
    }
  };

  return (
    <>
      {/* 上部の操作説明バー */}
      <div className="fixed top-[88px] left-0 right-0 z-40 pointer-events-auto">
        <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 py-2">
          {/* S/Gアイコンと説明 */}
          <div className="flex items-center justify-center gap-4 mb-1">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded bg-green-500 flex items-center justify-center text-white text-xs font-bold">
                S
              </div>
              <span className="text-xs text-gray-600">タップで設定</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded bg-red-500 flex items-center justify-center text-white text-xs font-bold">
                G
              </div>
              <span className="text-xs text-gray-600">ダブルタップ</span>
            </div>
          </div>
          {/* 操作ヒント */}
          <p className="text-xs text-center text-gray-500">
            タップ→S/経由追加｜ダブルタップ→G設定｜長押し→削除
          </p>
        </div>
      </div>

      {/* キャラクターと吹き出し - 左下に配置 */}
      <div
        className={`fixed left-2 z-40 pointer-events-auto transition-all duration-500 ease-out ${
          isVisible ? "bottom-16 opacity-100" : "-bottom-40 opacity-0"
        }`}
      >
        <div className="flex items-end">
          {/* キャラクター */}
          <div
            className={`relative transition-transform duration-500 ${
              isVisible ? "animate-bounce-once" : ""
            }`}
            style={{ marginBottom: "-8px" }}
          >
            {/* 閉じるボタン */}
            <button
              onClick={onExit}
              className="absolute -top-1 -right-1 w-5 h-5 bg-gray-600 hover:bg-gray-700 rounded-full flex items-center justify-center shadow-md z-10 touch-manipulation"
              aria-label="閉じる"
            >
              <X className="h-3 w-3 text-white" />
            </button>
            <div className="w-24 h-28">
              <Image
                src="/images/character_v2.png"
                alt="セーフティにゃん"
                width={96}
                height={112}
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* 吹き出し */}
          <div
            className={`relative transition-all duration-300 delay-200 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
            }`}
            style={{ marginLeft: "-12px", marginBottom: "24px" }}
          >
            <button
              onClick={handleBubbleClick}
              disabled={!hasValidRoute}
              className={`bg-white rounded-2xl px-4 py-3 shadow-lg relative border-2 transition-all ${
                hasValidRoute
                  ? "border-yellow-400 active:scale-95"
                  : "border-gray-200"
              }`}
            >
              {/* 吹き出しの三角形 */}
              <div
                className={`absolute left-[-8px] bottom-3 w-0 h-0 border-t-[6px] border-t-transparent border-r-[8px] border-b-[6px] border-b-transparent ${
                  hasValidRoute ? "border-r-yellow-400" : "border-r-gray-200"
                }`}
              />
              <div className="absolute left-[-5px] bottom-3 w-0 h-0 border-t-[6px] border-t-transparent border-r-[8px] border-r-white border-b-[6px] border-b-transparent" />

              <p className={`text-sm font-bold leading-tight ${
                hasValidRoute ? "text-purple-600" : "text-gray-800"
              }`}>
                {hasValidRoute ? "探検スタートしよう！" : "通学路を教えてね！"}
              </p>
              {hasValidRoute && (
                <p className="text-[10px] text-gray-400 mt-1 text-center">
                  吹き出しタップでスタート
                </p>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* バウンスアニメーション用CSS */}
      <style jsx>{`
        @keyframes bounce-once {
          0% {
            transform: translateY(120px);
          }
          50% {
            transform: translateY(-15px);
          }
          70% {
            transform: translateY(8px);
          }
          100% {
            transform: translateY(0);
          }
        }
        .animate-bounce-once {
          animation: bounce-once 0.6s ease-out;
        }
      `}</style>
    </>
  );
});
