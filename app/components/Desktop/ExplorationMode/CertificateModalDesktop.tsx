"use client";

import { memo, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RotateCcw, Home, Award } from "lucide-react";
import Image from "next/image";

interface CertificateModalDesktopProps {
  hazardCount: number;
  routeDistance: number;
  onRetry: () => void;
  onExit: () => void;
}

// 紙吹雪のパーティクル
interface ConfettiParticle {
  id: number;
  x: number;
  color: string;
  size: number;
  rotation: number;
  delay: number;
}

// 紙吹雪の色
const CONFETTI_COLORS = [
  "#FFD700", // ゴールド
  "#FF6B6B", // レッド
  "#4ECDC4", // ティール
  "#45B7D1", // スカイブルー
  "#96CEB4", // ミント
  "#FFEAA7", // イエロー
  "#DDA0DD", // プラム
  "#98D8C8", // シーグリーン
];

// 紙吹雪コンポーネント
const Confetti = memo(function Confetti() {
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);

  useEffect(() => {
    // 40個のパーティクルを生成
    const newParticles: ConfettiParticle[] = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100, // 0-100%
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      size: Math.random() * 8 + 6, // 6-14px
      rotation: Math.random() * 360,
      delay: Math.random() * 1, // 0-1秒の遅延
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-confetti-fall"
          style={{
            left: `${particle.x}%`,
            top: "-20px",
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            transform: `rotate(${particle.rotation}deg)`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${3 + Math.random() * 2}s`,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
          }}
        />
      ))}
    </div>
  );
});

export const CertificateModalDesktop = memo(function CertificateModalDesktop({
  hazardCount,
  routeDistance,
  onRetry,
  onExit,
}: CertificateModalDesktopProps) {
  const [isVisible, setIsVisible] = useState(false);
  const today = new Date();
  const dateString = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;

  useEffect(() => {
    // マウント後にアニメーション開始
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center">
      {/* 背景オーバーレイ */}
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        onClick={onExit}
      />

      {/* 紙吹雪 */}
      <Confetti />

      {/* 修了証カード */}
      <Card
        className={`relative z-10 w-[480px] max-w-[90vw] bg-gradient-to-b from-yellow-50 via-white to-orange-50 shadow-2xl border-4 border-yellow-400 transition-all duration-700 ${
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"
        }`}
      >
        <CardContent className="p-8">
          {/* 装飾リボン */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 text-white px-6 py-1.5 rounded-full shadow-lg flex items-center gap-2">
              <Award className="h-4 w-4" />
              <span className="text-sm font-bold">CERTIFICATE</span>
              <Award className="h-4 w-4" />
            </div>
          </div>

          {/* タイトル */}
          <div className="text-center mt-4 mb-6">
            <h2 className="text-3xl font-bold text-yellow-700 mb-1">修了証</h2>
            <p className="text-lg text-yellow-600">通学路の安全マスター</p>
          </div>

          {/* キャラクター */}
          <div className="flex justify-center mb-6">
            <div className="relative w-24 h-24">
              <Image
                src="/images/character_v2.png"
                alt="セーフティにゃん"
                fill
                className="object-contain drop-shadow-lg"
                priority
              />
            </div>
          </div>

          {/* メッセージ */}
          <div className="text-center mb-6">
            <p className="text-gray-700 leading-relaxed">
              あなたは通学路の安全について
              <br />
              しっかり学ぶことができました！
            </p>
          </div>

          {/* 実績 */}
          <div className="bg-white/80 rounded-xl p-4 mb-6 border border-yellow-200 shadow-inner">
            <h3 className="text-sm font-bold text-gray-600 mb-3 text-center">
              学習実績
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-500">{hazardCount}</p>
                <p className="text-xs text-gray-500">確認した危険地点</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-500">
                  {routeDistance.toFixed(0)}
                  <span className="text-lg">m</span>
                </p>
                <p className="text-xs text-gray-500">歩行距離</p>
              </div>
            </div>
          </div>

          {/* 日付 */}
          <div className="text-center mb-6">
            <p className="text-sm text-gray-500">{dateString}</p>
          </div>

          {/* 署名 */}
          <div className="text-center mb-6 border-t border-dashed border-yellow-300 pt-4">
            <p className="text-sm text-gray-600 italic">
              「これからも安全に気をつけてね！」
            </p>
            <p className="text-sm font-bold text-yellow-700 mt-1">
              — セーフティにゃん —
            </p>
          </div>

          {/* アクションボタン */}
          <div className="flex gap-3">
            <Button
              onClick={onRetry}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              もう一度探検
            </Button>
            <Button
              onClick={onExit}
              variant="outline"
              className="flex-1 border-gray-300"
            >
              <Home className="h-4 w-4 mr-2" />
              ホームに戻る
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});
