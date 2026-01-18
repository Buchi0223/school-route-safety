"use client";

import { memo, useState, useEffect } from "react";
import Image from "next/image";

interface CharacterBubbleProps {
  message: string;
  subMessage?: string;
  onTap?: () => void;
  showTapIndicator?: boolean;
  position?: "left" | "right";
  className?: string;
}

export const CharacterBubble = memo(function CharacterBubble({
  message,
  subMessage,
  onTap,
  showTapIndicator = true,
  position = "left",
  className = "",
}: CharacterBubbleProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isBubbleVisible, setIsBubbleVisible] = useState(false);

  useEffect(() => {
    // キャラクターをバウンスインさせる
    const charTimer = setTimeout(() => setIsVisible(true), 100);
    // 吹き出しを少し遅れて表示
    const bubbleTimer = setTimeout(() => setIsBubbleVisible(true), 400);

    return () => {
      clearTimeout(charTimer);
      clearTimeout(bubbleTimer);
    };
  }, []);

  const handleTap = () => {
    if (onTap) {
      onTap();
    }
  };

  return (
    <div
      className={`flex items-end gap-2 ${
        position === "right" ? "flex-row-reverse" : "flex-row"
      } ${className}`}
    >
      {/* キャラクター */}
      <div
        className={`relative shrink-0 transition-all duration-500 ease-out ${
          isVisible
            ? "translate-y-0 opacity-100"
            : "translate-y-8 opacity-0"
        }`}
        style={{
          animation: isVisible ? "characterBounce 0.5s ease-out" : "none",
        }}
      >
        <div className="w-20 h-20 relative">
          <Image
            src="/images/character_v2.png"
            alt="案内キャラクター"
            fill
            className="object-contain drop-shadow-lg"
            priority
          />
        </div>
      </div>

      {/* 吹き出し */}
      <div
        className={`relative transition-all duration-300 ease-out ${
          isBubbleVisible
            ? "scale-100 opacity-100"
            : "scale-90 opacity-0"
        }`}
      >
        {/* 吹き出し本体 */}
        <div
          className={`
            relative bg-white rounded-2xl px-4 py-3
            border-2 border-yellow-400
            shadow-[0_4px_8px_rgba(0,0,0,0.15)]
            max-w-[220px]
            ${onTap ? "cursor-pointer active:scale-95 transition-transform touch-manipulation" : ""}
          `}
          onClick={handleTap}
          role={onTap ? "button" : undefined}
          tabIndex={onTap ? 0 : undefined}
        >
          {/* 吹き出しの尻尾 */}
          <div
            className={`absolute bottom-3 w-0 h-0
              border-t-[10px] border-t-transparent
              border-b-[10px] border-b-transparent
              ${position === "left"
                ? "left-[-10px] border-r-[12px] border-r-yellow-400"
                : "right-[-10px] border-l-[12px] border-l-yellow-400"
              }
            `}
          />
          <div
            className={`absolute bottom-3 w-0 h-0
              border-t-[8px] border-t-transparent
              border-b-[8px] border-b-transparent
              ${position === "left"
                ? "left-[-6px] border-r-[10px] border-r-white"
                : "right-[-6px] border-l-[10px] border-l-white"
              }
            `}
          />

          {/* メッセージ */}
          <p className="text-sm font-bold text-gray-800 leading-relaxed">
            {message}
          </p>

          {/* サブメッセージ */}
          {subMessage && (
            <p className="text-xs text-gray-500 mt-1">{subMessage}</p>
          )}

          {/* タップインジケーター */}
          {showTapIndicator && onTap && (
            <div className="flex items-center justify-end mt-2 gap-1">
              <span className="text-[10px] text-gray-400">タップして次へ</span>
              <span className="text-gray-400 animate-pulse">▶</span>
            </div>
          )}
        </div>
      </div>

      {/* キャラクターバウンスアニメーション */}
      <style jsx global>{`
        @keyframes characterBounce {
          0% {
            transform: translateY(20px) scale(0.8);
          }
          50% {
            transform: translateY(-10px) scale(1.05);
          }
          70% {
            transform: translateY(5px) scale(0.98);
          }
          100% {
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
});
