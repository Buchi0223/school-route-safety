"use client";

import { useState, useCallback } from "react";
import { Waypoint, HazardPoint, TourTarget } from "./types";

// 探検モードの状態
export type ExplorationState =
  | "idle" // 未開始
  | "route_setting" // 経路設定中
  | "target_select" // 巡回対象選択
  | "touring" // ツアー中
  | "hazard_stop" // 危険地点で停止
  | "completed"; // 完了

interface UseExplorationModeReturn {
  // 状態
  state: ExplorationState;
  isActive: boolean;

  // 経路情報
  startPoint: Waypoint | null;
  goalPoint: Waypoint | null;
  hasValidRoute: boolean;

  // 巡回対象
  tourTarget: TourTarget | null;
  selectedHazardPoints: HazardPoint[];

  // アクション
  startExploration: () => void;
  setRoutePoints: (start: Waypoint | null, goal: Waypoint | null) => void;
  proceedToTargetSelect: () => void;
  setTourTarget: (target: TourTarget) => void;
  setSelectedHazardPoints: (points: HazardPoint[]) => void;
  startTour: () => void;
  stopAtHazard: () => void;
  resumeTour: () => void;
  completeTour: () => void;
  resetExploration: () => void;
  exitExploration: () => void;
  backToRouteSetting: () => void;
}

export function useExplorationMode(): UseExplorationModeReturn {
  const [state, setState] = useState<ExplorationState>("idle");
  const [startPoint, setStartPoint] = useState<Waypoint | null>(null);
  const [goalPoint, setGoalPoint] = useState<Waypoint | null>(null);
  const [tourTarget, setTourTargetState] = useState<TourTarget | null>(null);
  const [selectedHazardPoints, setSelectedHazardPointsState] = useState<HazardPoint[]>([]);

  // 探検モードがアクティブかどうか
  const isActive = state !== "idle";

  // 有効な経路が設定されているか
  const hasValidRoute = startPoint !== null && goalPoint !== null;

  // 探検モードを開始（経路設定画面へ）
  const startExploration = useCallback(() => {
    setState("route_setting");
    setStartPoint(null);
    setGoalPoint(null);
    setTourTargetState(null);
    setSelectedHazardPointsState([]);
  }, []);

  // 経路の地点を設定
  const setRoutePoints = useCallback((start: Waypoint | null, goal: Waypoint | null) => {
    setStartPoint(start);
    setGoalPoint(goal);
  }, []);

  // 経路設定完了後、巡回対象選択画面へ進む
  const proceedToTargetSelect = useCallback(() => {
    if (state === "route_setting") {
      setState("target_select");
    }
  }, [state]);

  // 巡回対象を設定
  const setTourTarget = useCallback((target: TourTarget) => {
    setTourTargetState(target);
  }, []);

  // 選別されたHazardPointを設定
  const setSelectedHazardPoints = useCallback((points: HazardPoint[]) => {
    setSelectedHazardPointsState(points);
  }, []);

  // ツアーを開始
  const startTour = useCallback(() => {
    // 巡回対象選択画面からツアーへ遷移
    if (state === "target_select" || state === "route_setting") {
      setState("touring");
    }
  }, [state]);

  // 危険地点で停止
  const stopAtHazard = useCallback(() => {
    if (state === "touring") {
      setState("hazard_stop");
    }
  }, [state]);

  // ツアーを再開
  const resumeTour = useCallback(() => {
    if (state === "hazard_stop") {
      setState("touring");
    }
  }, [state]);

  // ツアー完了
  const completeTour = useCallback(() => {
    if (state === "touring") {
      setState("completed");
    }
  }, [state]);

  // 探検モードをリセット（経路設定画面に戻る）
  const resetExploration = useCallback(() => {
    setState("route_setting");
    setStartPoint(null);
    setGoalPoint(null);
    setTourTargetState(null);
    setSelectedHazardPointsState([]);
  }, []);

  // 探検モードを終了
  const exitExploration = useCallback(() => {
    setState("idle");
    setStartPoint(null);
    setGoalPoint(null);
    setTourTargetState(null);
    setSelectedHazardPointsState([]);
  }, []);

  // 経路設定画面に戻る（巡回対象選択画面から）
  const backToRouteSetting = useCallback(() => {
    if (state === "target_select") {
      setState("route_setting");
      setTourTargetState(null);
      setSelectedHazardPointsState([]);
    }
  }, [state]);

  return {
    state,
    isActive,
    startPoint,
    goalPoint,
    hasValidRoute,
    tourTarget,
    selectedHazardPoints,
    startExploration,
    setRoutePoints,
    proceedToTargetSelect,
    setTourTarget,
    setSelectedHazardPoints,
    startTour,
    stopAtHazard,
    resumeTour,
    completeTour,
    resetExploration,
    exitExploration,
    backToRouteSetting,
  };
}
