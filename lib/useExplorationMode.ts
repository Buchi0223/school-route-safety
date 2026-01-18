"use client";

import { useState, useCallback } from "react";
import { Waypoint } from "./types";

// 探検モードの状態
export type ExplorationState =
  | "idle" // 未開始
  | "route_setting" // 経路設定中
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

  // アクション
  startExploration: () => void;
  setRoutePoints: (start: Waypoint | null, goal: Waypoint | null) => void;
  startTour: () => void;
  stopAtHazard: () => void;
  resumeTour: () => void;
  completeTour: () => void;
  resetExploration: () => void;
  exitExploration: () => void;
}

export function useExplorationMode(): UseExplorationModeReturn {
  const [state, setState] = useState<ExplorationState>("idle");
  const [startPoint, setStartPoint] = useState<Waypoint | null>(null);
  const [goalPoint, setGoalPoint] = useState<Waypoint | null>(null);

  // 探検モードがアクティブかどうか
  const isActive = state !== "idle";

  // 有効な経路が設定されているか
  const hasValidRoute = startPoint !== null && goalPoint !== null;

  // 探検モードを開始（経路設定画面へ）
  const startExploration = useCallback(() => {
    setState("route_setting");
    setStartPoint(null);
    setGoalPoint(null);
  }, []);

  // 経路の地点を設定
  const setRoutePoints = useCallback((start: Waypoint | null, goal: Waypoint | null) => {
    setStartPoint(start);
    setGoalPoint(goal);
  }, []);

  // ツアーを開始
  const startTour = useCallback(() => {
    // 経路設定画面からツアーへ遷移
    // hasValidRouteは外部（page.tsx）で管理されているため、条件チェックはそちらで行う
    setState("touring");
  }, []);

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
  }, []);

  // 探検モードを終了
  const exitExploration = useCallback(() => {
    setState("idle");
    setStartPoint(null);
    setGoalPoint(null);
  }, []);

  return {
    state,
    isActive,
    startPoint,
    goalPoint,
    hasValidRoute,
    startExploration,
    setRoutePoints,
    startTour,
    stopAtHazard,
    resumeTour,
    completeTour,
    resetExploration,
    exitExploration,
  };
}
