"use client";

import { ExplorationState } from "@/lib/useExplorationMode";
import { HazardPoint, Waypoint } from "@/lib/types";
import { ExplorationControlsDesktop } from "./ExplorationControlsDesktop";

interface ExplorationModeDesktopProps {
  // 状態
  state: ExplorationState;
  hasValidRoute: boolean;

  // 経路設定用
  waypoints: Waypoint[];
  routeDistance: number | null;

  // アクション
  onStartTour: () => void;
  onExit: () => void;
  onReset: () => void;

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
  nearbyHazard?: HazardPoint | null;
  onPlay?: () => void;
  onPause?: () => void;
  onForward?: () => void;
  onBackward?: () => void;
  onSpeedChange?: (speed: number) => void;
  onGoToIndex?: (index: number) => void;
  onExitTour?: () => void;
  onResumeFromHazard?: () => void;

  // 完了画面用
  onRetry?: () => void;
}

export function ExplorationModeDesktop({
  state,
  hasValidRoute,
  waypoints,
  routeDistance,
  onStartTour,
  onExit,
  onReset,
  // ツアー用
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
  // 完了画面用
  onRetry = () => {},
}: ExplorationModeDesktopProps) {
  // 経路設定中の場合
  if (state === "route_setting") {
    return (
      <ExplorationControlsDesktop
        mode="route_setting"
        waypoints={waypoints}
        hasValidRoute={hasValidRoute}
        routeDistance={routeDistance}
        onStartTour={onStartTour}
        onReset={onReset}
        onExit={onExit}
      />
    );
  }

  // ツアー中の場合
  if (state === "touring") {
    return (
      <ExplorationControlsDesktop
        mode="touring"
        waypoints={waypoints}
        hasValidRoute={hasValidRoute}
        routeDistance={routeDistance}
        currentIndex={currentIndex}
        totalPoints={tourPoints.length}
        progress={progress}
        isPlaying={isPlaying}
        onStartTour={onStartTour}
        onReset={onReset}
        onExit={onExitTour}
      />
    );
  }

  // 危険地点で停止中の場合
  if (state === "hazard_stop" && nearbyHazard) {
    return (
      <ExplorationControlsDesktop
        mode="hazard_stop"
        waypoints={waypoints}
        hasValidRoute={hasValidRoute}
        routeDistance={routeDistance}
        currentIndex={currentIndex}
        totalPoints={tourPoints.length}
        nearbyHazard={nearbyHazard}
        onStartTour={onStartTour}
        onReset={onReset}
        onExit={onExitTour}
        onResume={onResumeFromHazard}
      />
    );
  }

  // 完了画面
  if (state === "completed") {
    return (
      <ExplorationControlsDesktop
        mode="completed"
        waypoints={waypoints}
        hasValidRoute={hasValidRoute}
        routeDistance={routeDistance}
        hazardCount={hazardPoints.length}
        onStartTour={onStartTour}
        onReset={onReset}
        onExit={onExit}
        onRetry={onRetry}
      />
    );
  }

  return null;
}
