"use client";

import { ExplorationState } from "@/lib/useExplorationMode";
import { RouteSetup } from "./RouteSetup";
import { TourScreen } from "./TourScreen";
import { HazardStopScreen } from "./HazardStopScreen";
import { CertificateModal } from "./CertificateModal";
import { TourTargetBottomSheet } from "./TourTargetBottomSheet";
import { HazardPoint, TourStopPoint, TourTarget, MyHazardPoint } from "@/lib/types";

interface ExplorationModeProps {
  state: ExplorationState;
  hasValidRoute: boolean;
  onStartTour: () => void;
  onExit: () => void;
  // ツアー用プロパティ
  apiKey?: string;
  routeCoordinates?: [number, number][];
  hazardPoints?: HazardPoint[];
  tourPoints?: [number, number][];
  currentIndex?: number;
  currentPosition?: [number, number] | null;
  heading?: number;
  progress?: number;
  speed?: number;
  isPlaying?: boolean;
  nearbyHazard?: TourStopPoint | null;
  onPlay?: () => void;
  onPause?: () => void;
  onForward?: () => void;
  onBackward?: () => void;
  onSpeedChange?: (speed: number) => void;
  onGoToIndex?: (index: number) => void;
  onExitTour?: () => void;
  onResumeFromHazard?: () => void;
  // 完了画面用プロパティ
  routeDistance?: number;
  onRetry?: () => void;
  // 巡回対象選択用プロパティ
  showTargetSelect?: boolean;
  myHazardPointCount?: number;
  selectedHazardPoints?: HazardPoint[];
  onTargetSelectClose?: () => void;
  onTargetSelect?: (target: TourTarget) => void;
  // 完了画面用: Phase 9
  tourTarget?: TourTarget | null;
  myHazardPoints?: MyHazardPoint[];
}

export function ExplorationMode({
  state,
  hasValidRoute,
  onStartTour,
  onExit,
  // ツアー用プロパティ
  apiKey = "",
  routeCoordinates = [],
  hazardPoints = [],
  tourPoints = [],
  currentIndex = 0,
  currentPosition = null,
  heading = 0,
  progress = 0,
  speed = 3,
  isPlaying = false,
  nearbyHazard = null,
  onPlay = () => {},
  onPause = () => {},
  onForward = () => {},
  onBackward = () => {},
  onSpeedChange = () => {},
  onGoToIndex = () => {},
  onExitTour = () => {},
  onResumeFromHazard = () => {},
  // 完了画面用プロパティ
  routeDistance = 0,
  onRetry = () => {},
  // 巡回対象選択用プロパティ
  showTargetSelect = false,
  myHazardPointCount = 0,
  selectedHazardPoints = [],
  onTargetSelectClose = () => {},
  onTargetSelect = () => {},
  // 完了画面用: Phase 9
  tourTarget = null,
  myHazardPoints = [],
}: ExplorationModeProps) {
  // 経路設定中の場合
  if (state === "route_setting") {
    return (
      <RouteSetup
        hasValidRoute={hasValidRoute}
        onStartTour={onStartTour}
        onExit={onExit}
      />
    );
  }

  // 危険地点で停止中の場合
  if (state === "hazard_stop" && nearbyHazard) {
    return (
      <HazardStopScreen
        apiKey={apiKey}
        hazard={nearbyHazard}
        routeCoordinates={routeCoordinates}
        currentPosition={currentPosition}
        heading={heading}
        onResume={onResumeFromHazard}
      />
    );
  }

  // ツアー中の場合
  if (state === "touring") {
    return (
      <TourScreen
        apiKey={apiKey}
        routeCoordinates={routeCoordinates}
        hazardPoints={hazardPoints}
        tourPoints={tourPoints}
        currentIndex={currentIndex}
        currentPosition={currentPosition}
        heading={heading}
        progress={progress}
        speed={speed}
        isPlaying={isPlaying}
        nearbyHazard={nearbyHazard}
        onPlay={onPlay}
        onPause={onPause}
        onForward={onForward}
        onBackward={onBackward}
        onSpeedChange={onSpeedChange}
        onGoToIndex={onGoToIndex}
        onExit={onExitTour}
      />
    );
  }

  // 完了画面
  if (state === "completed") {
    // 巡回対象に応じた地点数を計算
    const hazardCount = tourTarget === "my_hazard_points"
      ? myHazardPoints.length
      : selectedHazardPoints.length;

    return (
      <CertificateModal
        hazardCount={hazardCount}
        distance={routeDistance}
        onRetry={onRetry}
        onHome={onExit}
        tourTarget={tourTarget}
        myHazardPoints={myHazardPoints}
        checkedHazardPoints={selectedHazardPoints}
      />
    );
  }

  // 巡回対象選択画面（ボトムシート）
  // state === "target_select" または showTargetSelect が true の場合
  if (state === "target_select" || showTargetSelect) {
    return (
      <>
        {/* 経路設定画面を背景に表示 */}
        <RouteSetup
          hasValidRoute={hasValidRoute}
          onStartTour={() => {}} // ボトムシート表示中は無効化
          onExit={onExit}
        />
        {/* 巡回対象選択ボトムシート */}
        <TourTargetBottomSheet
          isOpen={true}
          onClose={onTargetSelectClose}
          onStartTour={onTargetSelect}
          myHazardPointCount={myHazardPointCount}
          selectedHazardPoints={selectedHazardPoints}
        />
      </>
    );
  }

  return null;
}
