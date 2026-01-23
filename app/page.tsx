"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { RouteControls, TourControls, MobileViewTabs, MobileViewTab } from "./components/Controls";
import { MobileHeader, MenuTab } from "./components/Mobile/MobileHeader";
import { Overlay } from "./components/Mobile/Overlay";
import { RouteSearchOverlay } from "./components/Mobile/RouteSearchOverlay";
import { HelpOverlay } from "./components/Mobile/HelpOverlay";
import { ExplorationMode } from "./components/Mobile/ExplorationMode";
import { TourTargetBottomSheet } from "./components/Mobile/ExplorationMode/TourTargetBottomSheet";
import { ExplorationModeDesktop } from "./components/Desktop/ExplorationMode";
import { MyHazardPointModeDesktop } from "./components/Desktop/MyHazardPointMode";
import { MyHazardPointModeMobile } from "./components/Mobile/MyHazardPointMode";
import { GuidePanelDesktop } from "./components/Desktop/ExplorationMode/GuidePanelDesktop";
import { TourControlsBarDesktop } from "./components/Desktop/ExplorationMode/TourControlsBarDesktop";
import { HazardStopPanelDesktop } from "./components/Desktop/ExplorationMode/HazardStopPanelDesktop";
import { CertificateModalDesktop } from "./components/Desktop/ExplorationMode/CertificateModalDesktop";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useOverlay } from "@/lib/useOverlay";
import { useExplorationMode } from "@/lib/useExplorationMode";
import { StreetViewPanel } from "./components/StreetView";
import { SafetyGuideOverlay, SafetyGuidePanel } from "./components/Guide";
import { Waypoint, HazardPoint, TourTarget, TourStopPoint, isHazardPoint } from "@/lib/types";
import { loadHazardPoints, getHazardsAlongRoute, selectHazardPointsForTour } from "@/lib/hazardData";
import { getWalkingRoute, calculateRouteDistance, sortWaypointsByRoute } from "@/lib/routing";
import { useTour } from "@/lib/useTour";
import { useMyHazardPoints } from "@/lib/useMyHazardPoints";
import { Shield, MapPin } from "lucide-react";

// MapContainer を動的インポート（SSR無効）
const MapContainer = dynamic(
  () => import("./components/Map/MapContainer"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">地図を読み込み中...</p>
      </div>
    ),
  }
);

export default function Home() {
  // 経由地点の状態
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [isDrawingRoute, setIsDrawingRoute] = useState(false);

  // ルートの状態
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][] | null>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [routeDistance, setRouteDistance] = useState<number | null>(null);

  // 危険地点の状態
  const [allHazardPoints, setAllHazardPoints] = useState<HazardPoint[]>([]);
  const [displayedHazards, setDisplayedHazards] = useState<HazardPoint[]>([]);
  const [selectedHazard, setSelectedHazard] = useState<HazardPoint | null>(null);

  // マイ危険ポイント
  const myHazardPoints = useMyHazardPoints();
  const [selectedMyHazardPinId, setSelectedMyHazardPinId] = useState<string | null>(null);
  const [pendingPinLocation, setPendingPinLocation] = useState<{ lat: number; lng: number } | null>(null);

  // 環境変数からAPIキーを取得
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  // ツアー用の状態
  const [tourPosition, setTourPosition] = useState<[number, number] | null>(null);
  const [tourHeading, setTourHeading] = useState(0);

  // モバイル用タブ状態
  const [mobileActiveTab, setMobileActiveTab] = useState<MobileViewTab>("map");

  // モバイル版Street View表示用
  const [showMobileStreetView, setShowMobileStreetView] = useState(false);

  // モバイルピン設置モード
  const [isMobilePinMode, setIsMobilePinMode] = useState(false);

  // モバイル用新UI状態
  const [mobileMenuTab, setMobileMenuTab] = useState<MenuTab>("route");
  const routeOverlay = useOverlay(false);
  const helpOverlay = useOverlay(false);

  // デスクトップ用探検モードタブ状態
  type DesktopTab = "route" | "explore" | "pin";
  const [desktopTab, setDesktopTab] = useState<DesktopTab>("route");

  // 探検モード
  const exploration = useExplorationMode();
  const [explorationWaypoints, setExplorationWaypoints] = useState<Waypoint[]>([]);
  const [isExplorationDrawingRoute, setIsExplorationDrawingRoute] = useState(false);
  const [explorationRouteCoordinates, setExplorationRouteCoordinates] = useState<[number, number][] | null>(null);
  const [explorationTourHeading, setExplorationTourHeading] = useState(0);
  const [explorationRouteDistance, setExplorationRouteDistance] = useState(0);

  // 通常のツアーフック
  const tour = useTour({
    routeCoordinates,
    hazardPoints: displayedHazards,
    onPositionChange: (position, heading) => {
      setTourPosition(position);
      setTourHeading(heading);
    },
    onHazardApproach: (hazard) => {
      // 通常ツアーはHazardPointのみ使用
      if (isHazardPoint(hazard)) {
        setSelectedHazard(hazard);
      }
    },
    onTourEnd: () => {
      // ツアー終了時の処理
    },
  });

  // 探検モードの停止地点を計算
  const explorationStopPoints: TourStopPoint[] = useMemo(() => {
    if (exploration.tourTarget === "my_hazard_points") {
      // マイ危険ポイントを巡回
      return myHazardPoints.pins;
    } else {
      // Safety Mapを巡回（選別された地点があればそちらを使用）
      return exploration.selectedHazardPoints.length > 0
        ? exploration.selectedHazardPoints
        : displayedHazards;
    }
  }, [exploration.tourTarget, exploration.selectedHazardPoints, myHazardPoints.pins, displayedHazards]);

  // 探検モード用ツアーフック
  const explorationTour = useTour({
    routeCoordinates: explorationRouteCoordinates,
    stopPoints: explorationStopPoints,
    onPositionChange: (position, heading) => {
      setTourPosition(position);
      setExplorationTourHeading(heading);
    },
    onHazardApproach: (stopPoint) => {
      // HazardPointの場合はselectedHazardを設定
      if (isHazardPoint(stopPoint)) {
        setSelectedHazard(stopPoint);
      }
      exploration.stopAtHazard();
    },
    onTourEnd: () => {
      exploration.completeTour();
      setSelectedHazard(null); // ゴール時に危険地点選択をクリア
    },
  });

  const isTourActive = tour.status === "playing" || tour.status === "paused";

  // 危険地点データを読み込み
  useEffect(() => {
    loadHazardPoints().then((points) => {
      setAllHazardPoints(points);
      setDisplayedHazards(points);
    });
  }, []);

  // 探検モードで経路が設定されたら自動で経路計算
  useEffect(() => {
    const hasStart = explorationWaypoints.some((wp) => wp.type === "start");
    const hasEnd = explorationWaypoints.some((wp) => wp.type === "end");

    if (exploration.state === "route_setting" && hasStart && hasEnd) {
      // 経路計算
      const calculateExplorationRoute = async () => {
        const orderedWaypoints = sortWaypointsByRoute(explorationWaypoints);
        try {
          const route = await getWalkingRoute(orderedWaypoints);
          if (route) {
            setExplorationRouteCoordinates(route);
          }
        } catch (error) {
          console.error("Exploration route calculation failed:", error);
        }
      };
      calculateExplorationRoute();
    }
  }, [explorationWaypoints, exploration.state]);

  // 地点追加ハンドラ（連続クリック用）
  const handleWaypointAdd = useCallback((lat: number, lng: number) => {
    // ピン設置モードの場合（デスクトップ・モバイル共通）
    if (desktopTab === "pin" || isMobilePinMode) {
      setPendingPinLocation({ lat, lng });
      return;
    }

    // 探検モードの経路設定中
    if (exploration.state === "route_setting" && isExplorationDrawingRoute) {
      const hasStart = explorationWaypoints.some((wp) => wp.type === "start");
      const type: Waypoint["type"] = hasStart ? "via" : "start";

      const newWaypoint: Waypoint = {
        id: `exp-${Date.now()}`,
        lat,
        lng,
        type,
      };

      setExplorationWaypoints((prev) => [...prev, newWaypoint]);
      return;
    }

    const hasStart = waypoints.some((wp) => wp.type === "start");

    // 最初のクリックは出発地点、以降は経由地点
    const type: Waypoint["type"] = hasStart ? "via" : "start";

    const newWaypoint: Waypoint = {
      id: `wp-${Date.now()}`,
      lat,
      lng,
      type,
    };

    setWaypoints((prev) => [...prev, newWaypoint]);
    // ルートをリセット
    setRouteCoordinates(null);
    setRouteDistance(null);
  }, [waypoints, exploration.state, isExplorationDrawingRoute, explorationWaypoints, desktopTab, isMobilePinMode]);

  // ダブルクリックでゴール設定
  const handleWaypointDoubleClick = useCallback((lat: number, lng: number) => {
    // 探検モードの経路設定中
    if (exploration.state === "route_setting" && isExplorationDrawingRoute) {
      const hasStart = explorationWaypoints.some((wp) => wp.type === "start");

      if (!hasStart) {
        const newWaypoint: Waypoint = {
          id: `exp-${Date.now()}`,
          lat,
          lng,
          type: "start",
        };
        setExplorationWaypoints((prev) => [...prev, newWaypoint]);
      } else {
        const newWaypoint: Waypoint = {
          id: `exp-${Date.now()}`,
          lat,
          lng,
          type: "end",
        };
        setExplorationWaypoints((prev) => [...prev, newWaypoint]);
      }
      // 描画モードを終了
      setIsExplorationDrawingRoute(false);
      return;
    }

    const hasStart = waypoints.some((wp) => wp.type === "start");

    if (!hasStart) {
      // 出発地点がない場合は、ここを出発地点にして終了
      const newWaypoint: Waypoint = {
        id: `wp-${Date.now()}`,
        lat,
        lng,
        type: "start",
      };
      setWaypoints((prev) => [...prev, newWaypoint]);
    } else {
      // ゴール地点を設定
      const newWaypoint: Waypoint = {
        id: `wp-${Date.now()}`,
        lat,
        lng,
        type: "end",
      };
      setWaypoints((prev) => [...prev, newWaypoint]);
    }

    // 描画モードを終了
    setIsDrawingRoute(false);
    setRouteCoordinates(null);
    setRouteDistance(null);
  }, [waypoints, exploration.state, isExplorationDrawingRoute, explorationWaypoints]);

  // 地点削除ハンドラ
  const handleWaypointDelete = useCallback((id: string) => {
    // 探検モードの場合
    if (exploration.state === "route_setting" && id.startsWith("exp-")) {
      setExplorationWaypoints((prev) => prev.filter((wp) => wp.id !== id));
      return;
    }
    setWaypoints((prev) => prev.filter((wp) => wp.id !== id));
    setRouteCoordinates(null);
    setRouteDistance(null);
  }, [exploration.state]);

  // 地点移動ハンドラ（ドラッグ後）
  const handleWaypointMove = useCallback(
    (id: string, lat: number, lng: number) => {
      // 探検モードの場合
      if (exploration.state === "route_setting" && id.startsWith("exp-")) {
        setExplorationWaypoints((prev) =>
          prev.map((wp) => (wp.id === id ? { ...wp, lat, lng } : wp))
        );
        return;
      }
      setWaypoints((prev) =>
        prev.map((wp) => (wp.id === id ? { ...wp, lat, lng } : wp))
      );
      // ルートがある場合は再計算
      setRouteCoordinates(null);
      setRouteDistance(null);
    },
    [exploration.state]
  );

  // 経路ドラッグハンドラ（経由地点を置換または追加して再計算）
  const handleRouteDrag = useCallback(
    async (lat: number, lng: number, segmentIndex: number) => {
      const viaPoints = waypoints.filter((wp) => wp.type === "via");
      let newWaypoints: Waypoint[];

      if (viaPoints.length === 0) {
        // 経由地点がない場合は新規追加
        const newWaypoint: Waypoint = {
          id: `wp-${Date.now()}`,
          lat,
          lng,
          type: "via",
        };
        newWaypoints = [...waypoints, newWaypoint];
      } else {
        // 経由地点がある場合は、segmentIndexに最も近い経由地点を置換
        // segmentIndex: 0.0（出発点付近）〜 1.0（ゴール付近）

        // 経由地点をソートして、segmentIndexに最も近いものを探す
        const startPoint = waypoints.find((wp) => wp.type === "start");
        const endPoint = waypoints.find((wp) => wp.type === "end");

        if (!startPoint || !endPoint) {
          return;
        }

        // 経由地点の経路上の相対位置を計算
        const viaWithPosition = viaPoints.map((via) => {
          const distFromStart = Math.sqrt(
            Math.pow(via.lat - startPoint.lat, 2) + Math.pow(via.lng - startPoint.lng, 2)
          );
          const distFromEnd = Math.sqrt(
            Math.pow(via.lat - endPoint.lat, 2) + Math.pow(via.lng - endPoint.lng, 2)
          );
          const totalDist = distFromStart + distFromEnd;
          const position = totalDist > 0 ? distFromStart / totalDist : 0;
          return { via, position };
        });

        // segmentIndexに最も近い経由地点を見つける
        let closestVia = viaWithPosition[0];
        let minDiff = Math.abs(closestVia.position - segmentIndex);

        for (const item of viaWithPosition) {
          const diff = Math.abs(item.position - segmentIndex);
          if (diff < minDiff) {
            minDiff = diff;
            closestVia = item;
          }
        }

        // その経由地点を新しい位置に更新
        newWaypoints = waypoints.map((wp) =>
          wp.id === closestVia.via.id ? { ...wp, lat, lng } : wp
        );
      }

      setWaypoints(newWaypoints);

      // 自動でルート再計算
      const startPoint = newWaypoints.find((wp) => wp.type === "start");
      const endPoint = newWaypoints.find((wp) => wp.type === "end");

      if (startPoint && endPoint) {
        setIsCalculatingRoute(true);
        try {
          const orderedWaypoints = sortWaypointsByRoute(newWaypoints);
          const route = await getWalkingRoute(orderedWaypoints);
          if (route) {
            setRouteCoordinates(route);
            setRouteDistance(calculateRouteDistance(route));
          }
        } catch (error) {
          console.error("Route calculation failed:", error);
        } finally {
          setIsCalculatingRoute(false);
        }
      }
    },
    [waypoints]
  );

  // 全地点クリア
  const handleClearWaypoints = useCallback(() => {
    setWaypoints([]);
    setRouteCoordinates(null);
    setRouteDistance(null);
    setDisplayedHazards(allHazardPoints);
    setIsDrawingRoute(false);
  }, [allHazardPoints]);

  // ルート計算
  const handleCalculateRoute = useCallback(async () => {
    const startPoint = waypoints.find((wp) => wp.type === "start");
    const endPoint = waypoints.find((wp) => wp.type === "end");

    if (!startPoint || !endPoint) return;

    // 経由地点を出発点からの距離順にソートして最適な経路順序にする
    const orderedWaypoints = sortWaypointsByRoute(waypoints);

    setIsCalculatingRoute(true);

    try {
      const route = await getWalkingRoute(orderedWaypoints);
      if (route) {
        setRouteCoordinates(route);
        setRouteDistance(calculateRouteDistance(route));
        // 危険地点は常に全て表示する（消さない）
        setDisplayedHazards(allHazardPoints);
      }
    } catch (error) {
      console.error("Route calculation failed:", error);
    } finally {
      setIsCalculatingRoute(false);
    }
  }, [waypoints, allHazardPoints]);

  // 危険地点クリックハンドラ
  const handleHazardClick = useCallback((hazard: HazardPoint) => {
    setSelectedHazard(hazard);
  }, []);

  // 安全ガイドを閉じる
  const handleCloseGuide = useCallback(() => {
    setSelectedHazard(null);
    setShowMobileStreetView(false);
  }, []);

  // モバイル版でStreet Viewを表示
  const handleShowMobileStreetView = useCallback(() => {
    setShowMobileStreetView(true);
  }, []);

  // モバイル版Street Viewを閉じる
  const handleCloseMobileStreetView = useCallback(() => {
    setShowMobileStreetView(false);
  }, []);

  // モバイルメニュータブ変更ハンドラ
  const handleMobileMenuTabChange = useCallback((tab: MenuTab) => {
    setMobileMenuTab(tab);
    // タブに応じてオーバーレイを開く
    if (tab === "route") {
      routeOverlay.open();
      helpOverlay.close();
      exploration.exitExploration();
      setExplorationWaypoints([]);
      setIsExplorationDrawingRoute(false);
      setIsMobilePinMode(false);
      // 経路検索時は自動で描画モードを有効化
      setIsDrawingRoute(true);
    } else if (tab === "help") {
      helpOverlay.open();
      routeOverlay.close();
      exploration.exitExploration();
      setExplorationWaypoints([]);
      setIsExplorationDrawingRoute(false);
      setIsDrawingRoute(false);
      setIsMobilePinMode(false);
    } else if (tab === "explore") {
      // 探検モードを開始
      routeOverlay.close();
      helpOverlay.close();
      setIsDrawingRoute(false);
      setIsMobilePinMode(false);
      exploration.startExploration();
      setExplorationWaypoints([]);
      setIsExplorationDrawingRoute(true); // 探検モード開始時は描画モードを有効化
    } else if (tab === "pin") {
      // ピン設置モードを開始
      routeOverlay.close();
      helpOverlay.close();
      exploration.exitExploration();
      setExplorationWaypoints([]);
      setIsExplorationDrawingRoute(false);
      setIsDrawingRoute(false);
      setIsMobilePinMode(true);
    }
  }, [routeOverlay, helpOverlay, exploration]);

  // 探検モード：経路確定後、巡回対象選択へ進む（モバイル）
  const handleExplorationProceedToTargetSelect = useCallback(async () => {
    // 経路を計算
    const startPoint = explorationWaypoints.find((wp) => wp.type === "start");
    const endPoint = explorationWaypoints.find((wp) => wp.type === "end");

    if (!startPoint || !endPoint) return;

    const orderedWaypoints = sortWaypointsByRoute(explorationWaypoints);

    try {
      const route = await getWalkingRoute(orderedWaypoints);
      if (route) {
        setExplorationRouteCoordinates(route);
        // 経路距離を計算
        setExplorationRouteDistance(calculateRouteDistance(route));
        // Safety Map用に危険地点を選別
        const selectedPoints = selectHazardPointsForTour(allHazardPoints, route);
        exploration.setSelectedHazardPoints(selectedPoints);
        // 巡回対象選択画面へ
        exploration.proceedToTargetSelect();
      }
    } catch (error) {
      console.error("Route calculation failed:", error);
    }
  }, [explorationWaypoints, allHazardPoints, exploration]);

  // 探検モード：巡回対象選択後にツアー開始（モバイル）
  const handleExplorationTargetSelect = useCallback((target: TourTarget) => {
    exploration.setTourTarget(target);
    exploration.startTour();
    // 少し待ってからツアー再生を開始（ルートが初期化されるまで待つ）
    setTimeout(() => {
      explorationTour.play();
    }, 500);
  }, [exploration, explorationTour]);

  // 探検モード：巡回対象選択をキャンセル（経路設定に戻る）
  const handleExplorationTargetSelectClose = useCallback(() => {
    exploration.backToRouteSetting();
  }, [exploration]);

  // 探検モードのツアー開始（デスクトップ用 - 直接ツアー開始）
  const handleExplorationStartTour = useCallback(async () => {
    // 経路を計算
    const startPoint = explorationWaypoints.find((wp) => wp.type === "start");
    const endPoint = explorationWaypoints.find((wp) => wp.type === "end");

    if (!startPoint || !endPoint) return;

    const orderedWaypoints = sortWaypointsByRoute(explorationWaypoints);

    try {
      const route = await getWalkingRoute(orderedWaypoints);
      if (route) {
        setExplorationRouteCoordinates(route);
        // 経路距離を計算
        setExplorationRouteDistance(calculateRouteDistance(route));
        // ツアー開始
        exploration.startTour();
        // 少し待ってからツアー再生を開始（ルートが初期化されるまで待つ）
        setTimeout(() => {
          explorationTour.play();
        }, 500);
      }
    } catch (error) {
      console.error("Route calculation failed:", error);
    }
  }, [explorationWaypoints, exploration, explorationTour]);

  // 探検モードの終了
  const handleExplorationExit = useCallback(() => {
    exploration.exitExploration();
    explorationTour.stop();
    setExplorationWaypoints([]);
    setIsExplorationDrawingRoute(false);
    setExplorationRouteCoordinates(null);
  }, [exploration, explorationTour]);

  // 探検モードのツアー終了（TourScreenの終了ボタン）
  const handleExplorationExitTour = useCallback(() => {
    explorationTour.stop();
    exploration.startExploration(); // 経路設定画面に戻る
    setExplorationRouteCoordinates(null);
  }, [exploration, explorationTour]);

  // 探検モード：危険地点からツアー再開
  const handleResumeFromHazard = useCallback(() => {
    exploration.resumeTour();
    explorationTour.play();
  }, [exploration, explorationTour]);

  // 探検モード：もう一度探検する
  const handleExplorationRetry = useCallback(() => {
    explorationTour.stop();
    exploration.resetExploration();
    setExplorationWaypoints([]);
    setExplorationRouteCoordinates(null);
    setExplorationRouteDistance(0);
    setIsExplorationDrawingRoute(true);
  }, [exploration, explorationTour]);

  // 探検モードのゴール設定状態をチェック
  const explorationHasValidRoute = explorationWaypoints.some((wp) => wp.type === "start") &&
    explorationWaypoints.some((wp) => wp.type === "end");

  // 巡回対象選択フェーズに進む
  const handleProceedToTargetSelect = useCallback(() => {
    if (!explorationRouteCoordinates) return;
    // Safety Mapの自動選別を実行
    const selected = selectHazardPointsForTour(displayedHazards, explorationRouteCoordinates);
    exploration.setSelectedHazardPoints(selected);
    exploration.proceedToTargetSelect();
  }, [explorationRouteCoordinates, displayedHazards, exploration]);

  // 巡回対象選択から経路設定に戻る
  const handleBackToRouteSetting = useCallback(() => {
    exploration.backToRouteSetting();
  }, [exploration]);

  // 巡回対象の変更
  const handleTourTargetChange = useCallback((target: TourTarget) => {
    exploration.setTourTarget(target);
  }, [exploration]);

  // デスクトップ版探検モード：危険地点停止時のセリフインデックス
  const [desktopSpeechIndex, setDesktopSpeechIndex] = useState(0);

  // 危険地点停止時にセリフインデックスをリセット
  useEffect(() => {
    if (exploration.state === "hazard_stop") {
      setDesktopSpeechIndex(0);
    }
  }, [exploration.state]);

  // セリフを次に進める
  const handleDesktopSpeechNext = useCallback(() => {
    setDesktopSpeechIndex((prev) => Math.min(prev + 1, 2));
  }, []);

  // ピン設置モード：ピン選択
  const handleMyHazardPinSelect = useCallback((pin: { id: string } | null) => {
    setSelectedMyHazardPinId(pin?.id || null);
  }, []);

  // ピン設置モード：完了
  const handlePinModeComplete = useCallback(() => {
    setSelectedMyHazardPinId(null);
    setPendingPinLocation(null);
    // 経路検索モードに戻る
    setDesktopTab("route");
  }, []);

  // デスクトップ用タブ切り替えハンドラ
  const handleDesktopTabChange = useCallback((tab: DesktopTab) => {
    setDesktopTab(tab);
    if (tab === "route") {
      // 経路検索モード
      exploration.exitExploration();
      explorationTour.stop();
      setExplorationWaypoints([]);
      setIsExplorationDrawingRoute(false);
      setExplorationRouteCoordinates(null);
    } else if (tab === "explore") {
      // 探検モードを開始
      exploration.startExploration();
      setExplorationWaypoints([]);
      setIsExplorationDrawingRoute(true);
      // 通常のルート設定をクリア
      setIsDrawingRoute(false);
    } else if (tab === "pin") {
      // マイ危険ポイント設置モード
      exploration.exitExploration();
      explorationTour.stop();
      setExplorationWaypoints([]);
      setIsExplorationDrawingRoute(false);
      setExplorationRouteCoordinates(null);
      setIsDrawingRoute(false);
    }
  }, [exploration, explorationTour]);

  // デスクトップ探検モード終了ハンドラ
  const handleDesktopExplorationExit = useCallback(() => {
    handleDesktopTabChange("route");
  }, [handleDesktopTabChange]);

  // キーボードショートカット：再生/一時停止トグル
  const handleKeyboardPlayPause = useCallback(() => {
    if (explorationTour.status === "playing") {
      explorationTour.pause();
    } else {
      explorationTour.play();
    }
  }, [explorationTour]);

  // デスクトップ版探検モードのキーボードショートカット
  useKeyboardShortcuts({
    onPlayPause: handleKeyboardPlayPause,
    onForward: explorationTour.forward,
    onBackward: explorationTour.backward,
    onStop: handleExplorationExitTour,
    onSpeedChange: explorationTour.setSpeed,
    onSpeechNext: handleDesktopSpeechNext,
    isActive: desktopTab === "explore" && (exploration.state === "touring" || exploration.state === "hazard_stop"),
    isHazardStop: exploration.state === "hazard_stop",
  });

  return (
    <main className="h-screen flex flex-col">
      {/* ヘッダー */}
      <header className="bg-blue-600 text-white px-4 py-2 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6" />
            <div>
              <h1 className="text-lg font-bold">通学路安全確認デモアプリ</h1>
            </div>
          </div>
          {/* デスクトップ用タブ */}
          <div className="hidden lg:flex items-center gap-1 bg-blue-700/50 rounded-lg p-1">
            <button
              onClick={() => handleDesktopTabChange("route")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                desktopTab === "route"
                  ? "bg-white text-blue-600"
                  : "text-white/80 hover:text-white hover:bg-blue-500/50"
              }`}
            >
              経路検索
            </button>
            <button
              onClick={() => handleDesktopTabChange("explore")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                desktopTab === "explore"
                  ? "bg-white text-blue-600"
                  : "text-white/80 hover:text-white hover:bg-blue-500/50"
              }`}
            >
              通学路探検
            </button>
            <button
              onClick={() => handleDesktopTabChange("pin")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                desktopTab === "pin"
                  ? "bg-white text-purple-600"
                  : "text-white/80 hover:text-white hover:bg-blue-500/50"
              }`}
            >
              <MapPin className="w-4 h-4" />
              マイ危険ポイント設置
              {myHazardPoints.pins.length > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  desktopTab === "pin" ? "bg-purple-100" : "bg-white/20"
                }`}>
                  {myHazardPoints.pins.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      {/* デスクトップ: 横並びレイアウト */}
      <div className="flex-1 hidden lg:flex lg:flex-row overflow-hidden">
        {/* 左側：地図エリア（60%、ピン設置モード時は100%） */}
        <div className={`h-full relative ${desktopTab === "pin" ? "w-full" : "lg:w-3/5"}`}>
          <MapContainer
            waypoints={desktopTab === "explore" ? explorationWaypoints : (desktopTab === "pin" ? [] : waypoints)}
            onWaypointAdd={handleWaypointAdd}
            onWaypointDoubleClick={handleWaypointDoubleClick}
            onWaypointDelete={handleWaypointDelete}
            onWaypointMove={handleWaypointMove}
            isDrawingRoute={desktopTab === "explore" ? isExplorationDrawingRoute : (desktopTab === "pin" ? true : isDrawingRoute)}
            routeCoordinates={desktopTab === "explore" ? explorationRouteCoordinates : (desktopTab === "pin" ? null : routeCoordinates)}
            onRouteDrag={handleRouteDrag}
            hazardPoints={displayedHazards}
            onHazardClick={handleHazardClick}
            selectedHazardId={selectedHazard?.id || null}
            // マイ危険ポイント用プロパティ
            myHazardPoints={myHazardPoints.pins}
            onMyHazardPinClick={(pin) => handleMyHazardPinSelect(pin)}
            selectedMyHazardPinId={selectedMyHazardPinId}
            showMyHazardPopup={desktopTab !== "pin"}
            tourPosition={tourPosition}
            tourHeading={desktopTab === "explore" ? explorationTourHeading : tourHeading}
            isTourActive={desktopTab === "explore" ? (exploration.state === "touring" || exploration.state === "hazard_stop") : isTourActive}
          >
            {/* 安全ガイドオーバーレイ（探検モード・ピン設置モード中は非表示） */}
            {desktopTab !== "explore" && desktopTab !== "pin" && (
              <SafetyGuideOverlay
                selectedHazard={selectedHazard}
                onClose={handleCloseGuide}
              />
            )}
          </MapContainer>

          {/* 経路設定コントロール（地図上に重ねる） - 通常モード時のみ */}
          {desktopTab === "route" && (
            <div className="absolute top-4 left-4 z-[1000] w-80 max-w-[calc(100%-2rem)] space-y-3">
              <RouteControls
                waypoints={waypoints}
                isDrawingRoute={isDrawingRoute}
                onStartDrawing={() => setIsDrawingRoute(true)}
                onStopDrawing={() => setIsDrawingRoute(false)}
                onClearWaypoints={handleClearWaypoints}
                onCalculateRoute={handleCalculateRoute}
                isCalculatingRoute={isCalculatingRoute}
                routeDistance={routeDistance}
              />
              {/* ツアーコントロール */}
              <TourControls
                status={tour.status}
                progress={tour.progress}
                speed={tour.speed}
                isReady={tour.isReady}
                nearbyHazard={tour.nearbyHazard}
                onPlay={tour.play}
                onPause={tour.pause}
              onStop={tour.stop}
              onForward={tour.forward}
              onBackward={tour.backward}
              onSpeedChange={tour.setSpeed}
              onProgressChange={tour.goToIndex}
              totalPoints={tour.tourPoints.length}
              currentIndex={tour.currentIndex}
            />
            </div>
          )}

          {/* デスクトップ版探検モードコントロール */}
          {desktopTab === "explore" && exploration.isActive && (
            <>
              <div className="absolute top-4 left-4 z-[1000] w-80 max-w-[calc(100%-2rem)]">
                <ExplorationModeDesktop
                  state={exploration.state}
                  hasValidRoute={explorationHasValidRoute}
                  waypoints={explorationWaypoints}
                  routeDistance={explorationRouteDistance || null}
                  onStartTour={handleExplorationStartTour}
                  onExit={handleDesktopExplorationExit}
                  onReset={handleExplorationRetry}
                  // 巡回対象選択用
                  tourTarget={exploration.tourTarget}
                  onTourTargetChange={handleTourTargetChange}
                  myHazardPointCount={myHazardPoints.pins.length}
                  selectedHazardPoints={exploration.selectedHazardPoints}
                  onProceedToTargetSelect={handleProceedToTargetSelect}
                  onBackToRouteSetting={handleBackToRouteSetting}
                  // ツアー用
                  apiKey={googleMapsApiKey}
                  routeCoordinates={explorationRouteCoordinates || []}
                  hazardPoints={displayedHazards}
                  tourPoints={explorationTour.tourPoints}
                  currentIndex={explorationTour.currentIndex}
                  currentPosition={explorationTour.currentPosition}
                  heading={explorationTourHeading}
                  progress={explorationTour.progress}
                  speed={explorationTour.speed}
                  isPlaying={explorationTour.status === "playing"}
                  nearbyHazard={explorationTour.nearbyHazard}
                  onPlay={explorationTour.play}
                  onPause={explorationTour.pause}
                  onForward={explorationTour.forward}
                  onBackward={explorationTour.backward}
                  onSpeedChange={explorationTour.setSpeed}
                  onGoToIndex={explorationTour.goToIndex}
                  onExitTour={handleExplorationExitTour}
                  onResumeFromHazard={handleResumeFromHazard}
                  onRetry={handleExplorationRetry}
                />
              </div>

              {/* ツアー中のコントロールバー（下部固定） */}
              {(exploration.state === "touring" || exploration.state === "hazard_stop") && (
                <div className="absolute bottom-4 left-4 right-4 z-[1000]">
                  <TourControlsBarDesktop
                    currentIndex={explorationTour.currentIndex}
                    totalPoints={explorationTour.tourPoints.length}
                    progress={explorationTour.progress}
                    isPlaying={explorationTour.status === "playing"}
                    speed={explorationTour.speed}
                    onPlay={explorationTour.play}
                    onPause={explorationTour.pause}
                    onForward={explorationTour.forward}
                    onBackward={explorationTour.backward}
                    onStop={handleExplorationExitTour}
                    onSpeedChange={explorationTour.setSpeed}
                    onGoToIndex={explorationTour.goToIndex}
                  />
                </div>
              )}
            </>
          )}

          {/* デスクトップ版ピン設置モード */}
          {desktopTab === "pin" && (
            <MyHazardPointModeDesktop
              pins={myHazardPoints.pins}
              onPinAdd={(pin) => myHazardPoints.add(pin)}
              onPinUpdate={(id, updates) => myHazardPoints.update(id, updates)}
              onPinDelete={(id) => myHazardPoints.remove(id)}
              findNearby={myHazardPoints.findNearby}
              selectedPinId={selectedMyHazardPinId}
              onPinSelect={handleMyHazardPinSelect}
              onComplete={handlePinModeComplete}
              mapClickLocation={pendingPinLocation}
              onMapClickLocationClear={() => setPendingPinLocation(null)}
            />
          )}
        </div>

        {/* 右側：Street Viewエリア（40%） - ピン設置モード時は非表示 */}
        <div className={`lg:w-2/5 h-full flex flex-col overflow-hidden bg-gray-50 ${desktopTab === "pin" ? "hidden" : ""}`}>
          {/* 通常モード：Street Viewのみ */}
          {desktopTab === "route" && (
            <div className="flex-1 p-3 min-h-0">
              <StreetViewPanel
                selectedHazard={selectedHazard}
                apiKey={googleMapsApiKey}
                tourPosition={tourPosition}
                tourHeading={tourHeading}
                isTourActive={isTourActive}
              />
            </div>
          )}

          {/* 探検モード：Street View（上60%）+ ガイドパネル（下40%） */}
          {desktopTab === "explore" && (
            <>
              <div className="h-[60%] p-3 pb-1.5 min-h-0 relative">
                {/* 危険地点停止時のヘッダーオーバーレイ */}
                {exploration.state === "hazard_stop" && explorationTour.nearbyHazard && (
                  <HazardStopPanelDesktop hazard={explorationTour.nearbyHazard} />
                )}
                <StreetViewPanel
                  selectedHazard={explorationTour.nearbyHazard}
                  apiKey={googleMapsApiKey}
                  tourPosition={tourPosition}
                  tourHeading={explorationTourHeading}
                  isTourActive={exploration.state === "touring" || exploration.state === "hazard_stop"}
                />
              </div>
              <div className="h-[40%] p-3 pt-1.5 min-h-0">
                <GuidePanelDesktop
                  state={exploration.state}
                  nearbyHazard={explorationTour.nearbyHazard}
                  onResumeFromHazard={handleResumeFromHazard}
                  speechIndex={desktopSpeechIndex}
                  onSpeechNext={handleDesktopSpeechNext}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* デスクトップ版修了証モーダル */}
      {desktopTab === "explore" && exploration.state === "completed" && (
        <CertificateModalDesktop
          hazardCount={exploration.tourTarget === "my_hazard_points" ? myHazardPoints.pins.length : exploration.selectedHazardPoints.length}
          routeDistance={explorationRouteDistance}
          onRetry={handleExplorationRetry}
          onExit={handleDesktopExplorationExit}
          tourTarget={exploration.tourTarget}
          myHazardPoints={myHazardPoints.pins}
          checkedHazardPoints={exploration.selectedHazardPoints}
        />
      )}

      {/* モバイル: 新UIレイアウト */}
      <div className="flex-1 flex flex-col lg:hidden overflow-hidden">
        {/* 新しいモバイルヘッダーメニュー */}
        <MobileHeader
          activeTab={mobileMenuTab}
          onTabChange={handleMobileMenuTabChange}
          pinCount={myHazardPoints.pins.length}
        />

        {/* 地図（フルスクリーン） */}
        <div className="flex-1 relative">
          <MapContainer
            waypoints={exploration.state === "route_setting" ? explorationWaypoints : waypoints}
            onWaypointAdd={handleWaypointAdd}
            onWaypointDoubleClick={handleWaypointDoubleClick}
            onWaypointDelete={handleWaypointDelete}
            onWaypointMove={handleWaypointMove}
            isDrawingRoute={exploration.state === "route_setting" ? isExplorationDrawingRoute : (isMobilePinMode ? true : isDrawingRoute)}
            routeCoordinates={exploration.state === "route_setting" ? explorationRouteCoordinates : routeCoordinates}
            onRouteDrag={handleRouteDrag}
            hazardPoints={displayedHazards}
            onHazardClick={handleHazardClick}
            selectedHazardId={selectedHazard?.id || null}
            // マイ危険ポイント用プロパティ
            myHazardPoints={myHazardPoints.pins}
            onMyHazardPinClick={(pin) => setSelectedMyHazardPinId(pin.id)}
            selectedMyHazardPinId={selectedMyHazardPinId}
            showMyHazardPopup={!isMobilePinMode}
            tourPosition={tourPosition}
            tourHeading={tourHeading}
            isTourActive={isTourActive}
          >
            {/* 安全ガイドオーバーレイ（モバイルでも地図上に表示、ただし探検モード中は非表示） */}
            {!exploration.isActive && (
              <SafetyGuideOverlay
                selectedHazard={selectedHazard}
                onClose={handleCloseGuide}
                onShowStreetView={handleShowMobileStreetView}
              />
            )}
          </MapContainer>

          {/* モバイル版Street Viewオーバーレイ */}
          {showMobileStreetView && selectedHazard && (
            <div className="absolute inset-0 z-[2000] bg-black">
              <div className="h-full flex flex-col">
                <div className="bg-gray-900 px-4 py-3 flex items-center justify-between">
                  <h3 className="text-white font-bold text-sm truncate flex-1">
                    {selectedHazard.title}
                  </h3>
                  <button
                    onClick={handleCloseMobileStreetView}
                    className="ml-2 px-3 py-1 bg-gray-700 text-white rounded text-sm"
                  >
                    閉じる
                  </button>
                </div>
                <div className="flex-1">
                  <StreetViewPanel
                    selectedHazard={selectedHazard}
                    apiKey={googleMapsApiKey}
                    tourPosition={null}
                    tourHeading={0}
                    isTourActive={false}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 経路検索オーバーレイ */}
        <RouteSearchOverlay
          isOpen={routeOverlay.isOpen}
          onClose={() => {
            routeOverlay.close();
            setIsDrawingRoute(false);
          }}
          waypoints={waypoints}
          isDrawingRoute={isDrawingRoute}
          onStartDrawing={() => setIsDrawingRoute(true)}
          onStopDrawing={() => setIsDrawingRoute(false)}
          onClearWaypoints={handleClearWaypoints}
          onCalculateRoute={handleCalculateRoute}
          isCalculatingRoute={isCalculatingRoute}
          routeDistance={routeDistance}
        />

        {/* ヘルプオーバーレイ（アイコン説明） */}
        <HelpOverlay
          isOpen={helpOverlay.isOpen}
          onClose={helpOverlay.close}
        />

        {/* 探検モード */}
        {exploration.isActive && (
          <ExplorationMode
            state={exploration.state}
            hasValidRoute={explorationHasValidRoute}
            onStartTour={handleExplorationProceedToTargetSelect}
            onExit={handleExplorationExit}
            // ツアー用プロパティ
            apiKey={googleMapsApiKey}
            routeCoordinates={explorationRouteCoordinates || []}
            hazardPoints={displayedHazards}
            tourPoints={explorationTour.tourPoints}
            currentIndex={explorationTour.currentIndex}
            currentPosition={explorationTour.currentPosition}
            heading={explorationTourHeading}
            progress={explorationTour.progress}
            speed={explorationTour.speed}
            isPlaying={explorationTour.status === "playing"}
            nearbyHazard={explorationTour.nearbyHazard}
            onPlay={explorationTour.play}
            onPause={explorationTour.pause}
            onForward={explorationTour.forward}
            onBackward={explorationTour.backward}
            onSpeedChange={explorationTour.setSpeed}
            onGoToIndex={explorationTour.goToIndex}
            onExitTour={handleExplorationExitTour}
            onResumeFromHazard={handleResumeFromHazard}
            // 完了画面用プロパティ
            routeDistance={explorationRouteDistance}
            onRetry={handleExplorationRetry}
            // 巡回対象選択用プロパティ
            myHazardPointCount={myHazardPoints.pins.length}
            selectedHazardPoints={exploration.selectedHazardPoints}
            onTargetSelectClose={handleExplorationTargetSelectClose}
            onTargetSelect={handleExplorationTargetSelect}
            // 完了画面用: Phase 9
            tourTarget={exploration.tourTarget}
            myHazardPoints={myHazardPoints.pins}
          />
        )}

        {/* モバイルピン設置モード */}
        {isMobilePinMode && (
          <MyHazardPointModeMobile
            pins={myHazardPoints.pins}
            onPinAdd={myHazardPoints.add}
            onPinUpdate={myHazardPoints.update}
            onPinDelete={myHazardPoints.remove}
            findNearby={myHazardPoints.findNearby}
            selectedPinId={selectedMyHazardPinId}
            onPinSelect={(pin) => setSelectedMyHazardPinId(pin?.id ?? null)}
            mapClickLocation={pendingPinLocation}
            onMapClickLocationClear={() => setPendingPinLocation(null)}
            onClose={() => {
              setIsMobilePinMode(false);
              setMobileMenuTab("route");
            }}
          />
        )}
      </div>
    </main>
  );
}
