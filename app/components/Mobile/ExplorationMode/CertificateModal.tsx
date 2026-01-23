"use client";

import { memo, useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Trophy, MapPin, Footprints, Home, RotateCcw, Shield } from "lucide-react";
import { TourTarget, MyHazardPoint, HazardPoint, MyHazardReason, MY_HAZARD_REASON_INFO, HAZARD_TYPE_INFO, HazardType } from "@/lib/types";

interface CertificateModalProps {
  hazardCount: number;
  distance: number; // メートル単位
  onRetry: () => void;
  onHome: () => void;
  // Phase 9: 巡回対象連携
  tourTarget?: TourTarget | null;
  myHazardPoints?: MyHazardPoint[];
  checkedHazardPoints?: HazardPoint[];
}

export const CertificateModal = memo(function CertificateModal({
  hazardCount,
  distance,
  onRetry,
  onHome,
  tourTarget,
  myHazardPoints = [],
  checkedHazardPoints = [],
}: CertificateModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // 賞状のスケールインアニメーション
    const timer1 = setTimeout(() => setIsVisible(true), 100);
    // 紙吹雪エフェクト
    const timer2 = setTimeout(() => setShowConfetti(true), 500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  // マイ危険ポイントの理由別サマリー
  const reasonSummary = useMemo(() => {
    if (tourTarget !== "my_hazard_points" || myHazardPoints.length === 0) return null;
    const counts: Record<MyHazardReason, number> = {} as Record<MyHazardReason, number>;
    myHazardPoints.forEach(pin => {
      pin.reasons.forEach(reason => {
        counts[reason] = (counts[reason] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([reason, count]) => ({
        reason: reason as MyHazardReason,
        count,
        label: MY_HAZARD_REASON_INFO[reason as MyHazardReason].label,
      }));
  }, [tourTarget, myHazardPoints]);

  // Safety Mapのタイプ別サマリー
  const typeSummary = useMemo(() => {
    if (tourTarget !== "safety_map" || checkedHazardPoints.length === 0) return null;
    const counts: Record<HazardType, number> = {} as Record<HazardType, number>;
    checkedHazardPoints.forEach(point => {
      counts[point.type] = (counts[point.type] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .map(([type, count]) => ({
        type: type as HazardType,
        count,
        label: HAZARD_TYPE_INFO[type as HazardType].label,
        icon: HAZARD_TYPE_INFO[type as HazardType].icon,
      }));
  }, [tourTarget, checkedHazardPoints]);

  // 距離をフォーマット（メートル or キロメートル）
  const formatDistance = (meters: number) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${Math.round(meters)} m`;
  };

  // 今日の日付をフォーマット
  const formatDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    return `${year}年${month}月${day}日`;
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex flex-col">
      {/* ヘッダー */}
      <div className="h-14 bg-gradient-to-r from-yellow-500 to-orange-400 flex items-center justify-center px-4 shrink-0">
        <div className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-white" />
          <span className="text-white font-bold text-lg">おつかれさま！</span>
          <Trophy className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden relative">
        {/* 紙吹雪エフェクト */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  backgroundColor: ["#FFD700", "#FF6B6B", "#4CAF50", "#3B82F6", "#E60012"][
                    Math.floor(Math.random() * 5)
                  ],
                }}
              />
            ))}
          </div>
        )}

        {/* 賞状 */}
        <div
          className={`
            relative bg-[#FFFEF0] rounded-lg p-1 max-w-sm w-full
            transition-all duration-500 ease-out
            ${isVisible ? "scale-100 opacity-100" : "scale-75 opacity-0"}
          `}
          style={{
            background: "linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)",
          }}
        >
          {/* 内側の賞状 */}
          <div className="bg-[#FFFEF0] rounded-lg p-4 relative">
            {/* 点線装飾 */}
            <div
              className="absolute inset-3 border-2 border-dashed border-yellow-600/30 rounded-lg pointer-events-none"
            />

            {/* 賞状コンテンツ */}
            <div className="relative z-10 text-center py-4">
              {/* タイトル */}
              <h1 className="text-3xl font-bold text-yellow-700 mb-1" style={{ fontFamily: "serif" }}>
                しょうじょう
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent mx-auto mb-4" />

              {/* 本文 */}
              <p className="text-lg text-gray-800 font-bold mb-4">
                あなたは
                <br />
                <span className="text-2xl text-red-600">通学路の安全マスター</span>
                <br />
                です！
              </p>

              {/* 巡回対象バッジ */}
              {tourTarget && (
                <div className="mb-4">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                    tourTarget === "my_hazard_points"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-blue-100 text-blue-700"
                  }`}>
                    {tourTarget === "my_hazard_points" ? (
                      <>
                        <MapPin className="w-3 h-3" />
                        マイ危険ポイント
                      </>
                    ) : (
                      <>
                        <Shield className="w-3 h-3" />
                        Safety Map
                      </>
                    )}
                  </span>
                </div>
              )}

              {/* 統計情報 */}
              <div className="flex justify-center gap-6 my-4">
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-1 ${
                    tourTarget === "my_hazard_points" ? "bg-purple-100" : "bg-red-100"
                  }`}>
                    <MapPin className={`w-6 h-6 ${
                      tourTarget === "my_hazard_points" ? "text-purple-500" : "text-red-500"
                    }`} />
                  </div>
                  <span className="text-2xl font-bold text-gray-800">{hazardCount}</span>
                  <span className="text-xs text-gray-500">
                    {tourTarget === "my_hazard_points" ? "設置ピン" : "危険地点"}
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-1">
                    <Footprints className="w-6 h-6 text-blue-500" />
                  </div>
                  <span className="text-2xl font-bold text-gray-800">{formatDistance(distance)}</span>
                  <span className="text-xs text-gray-500">あるいた距離</span>
                </div>
              </div>

              {/* マイ危険ポイント: 理由別サマリー */}
              {reasonSummary && reasonSummary.length > 0 && (
                <div className="bg-purple-50 rounded-lg p-2 mb-4 mx-2">
                  <p className="text-[10px] font-bold text-purple-600 mb-1">危険の理由</p>
                  <div className="flex flex-wrap justify-center gap-1">
                    {reasonSummary.map(({ reason, label }) => (
                      <span key={reason} className="text-[10px] bg-white px-2 py-0.5 rounded text-purple-700">
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Safety Map: タイプ別サマリー */}
              {typeSummary && typeSummary.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-2 mb-4 mx-2">
                  <p className="text-[10px] font-bold text-blue-600 mb-1">確認した危険地点</p>
                  <div className="flex flex-wrap justify-center gap-1">
                    {typeSummary.map(({ type, icon, count }) => (
                      <span key={type} className="text-[10px] bg-white px-2 py-0.5 rounded text-gray-700">
                        {icon} ×{count}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 日付 */}
              <p className="text-sm text-gray-600 mb-4">{formatDate()}</p>

              {/* キャラクター署名 */}
              <div className="flex items-center justify-center gap-2">
                <div className="w-12 h-12 relative">
                  <Image
                    src="/images/character_v2.png"
                    alt="案内キャラクター"
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-sm text-gray-600 italic">セーフティにゃん</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ボタンエリア */}
      <div className="shrink-0 p-4 space-y-3">
        <button
          onClick={onRetry}
          className="w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform touch-manipulation"
        >
          <RotateCcw className="w-5 h-5" />
          もう一度探検する
        </button>
        <button
          onClick={onHome}
          className="w-full py-3 bg-white/20 text-white font-bold rounded-xl border-2 border-white/40 flex items-center justify-center gap-2 active:scale-95 transition-transform touch-manipulation"
        >
          <Home className="w-5 h-5" />
          ホームに戻る
        </button>
      </div>

      {/* 紙吹雪アニメーション */}
      <style jsx global>{`
        .confetti {
          position: absolute;
          width: 10px;
          height: 10px;
          top: -10px;
          opacity: 0;
          animation: confettiFall 4s ease-in-out forwards;
        }

        @keyframes confettiFall {
          0% {
            opacity: 1;
            top: -10px;
            transform: rotate(0deg) translateX(0);
          }
          100% {
            opacity: 0;
            top: 100%;
            transform: rotate(720deg) translateX(100px);
          }
        }
      `}</style>
    </div>
  );
});
