"use client";

import { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { RouteControls, TourControls, MobileViewTabs, MobileViewTab } from "./components/Controls";
import { MobileHeader, MenuTab } from "./components/Mobile/MobileHeader";
import { Overlay } from "./components/Mobile/Overlay";
import { RouteSearchOverlay } from "./components/Mobile/RouteSearchOverlay";
import { useOverlay } from "@/lib/useOverlay";
import { StreetViewPanel } from "./components/StreetView";
import { SafetyGuideOverlay, SafetyGuidePanel } from "./components/Guide";
import { Waypoint, HazardPoint } from "@/lib/types";
import { loadHazardPoints, getHazardsAlongRoute } from "@/lib/hazardData";
import { getWalkingRoute, calculateRouteDistance, sortWaypointsByRoute } from "@/lib/routing";
import { useTour } from "@/lib/useTour";
import { Shield } from "lucide-react";

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

  // 環境変数からAPIキーを取得
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  // ツアー用の状態
  const [tourPosition, setTourPosition] = useState<[number, number] | null>(null);
  const [tourHeading, setTourHeading] = useState(0);

  // モバイル用タブ状態
  const [mobileActiveTab, setMobileActiveTab] = useState<MobileViewTab>("map");

  // モバイル用新UI状態
  const [mobileMenuTab, setMobileMenuTab] = useState<MenuTab>("route");
  const routeOverlay = useOverlay(false);
  const helpOverlay = useOverlay(false);

  // ツアーフック
  const tour = useTour({
    routeCoordinates,
    hazardPoints: displayedHazards,
    onPositionChange: (position, heading) => {
      setTourPosition(position);
      setTourHeading(heading);
    },
    onHazardApproach: (hazard) => {
      setSelectedHazard(hazard);
    },
    onTourEnd: () => {
      // ツアー終了時の処理
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

  // 地点追加ハンドラ（連続クリック用）
  const handleWaypointAdd = useCallback((lat: number, lng: number) => {
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
  }, [waypoints]);

  // ダブルクリックでゴール設定
  const handleWaypointDoubleClick = useCallback((lat: number, lng: number) => {
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
  }, [waypoints]);

  // 地点削除ハンドラ
  const handleWaypointDelete = useCallback((id: string) => {
    setWaypoints((prev) => prev.filter((wp) => wp.id !== id));
    setRouteCoordinates(null);
    setRouteDistance(null);
  }, []);

  // 地点移動ハンドラ（ドラッグ後）
  const handleWaypointMove = useCallback(
    (id: string, lat: number, lng: number) => {
      setWaypoints((prev) =>
        prev.map((wp) => (wp.id === id ? { ...wp, lat, lng } : wp))
      );
      // ルートがある場合は再計算
      setRouteCoordinates(null);
      setRouteDistance(null);
    },
    []
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
  }, []);

  // モバイルメニュータブ変更ハンドラ
  const handleMobileMenuTabChange = useCallback((tab: MenuTab) => {
    setMobileMenuTab(tab);
    // タブに応じてオーバーレイを開く
    if (tab === "route") {
      routeOverlay.open();
      helpOverlay.close();
      // 経路検索時は自動で描画モードを有効化
      setIsDrawingRoute(true);
    } else if (tab === "help") {
      helpOverlay.open();
      routeOverlay.close();
      setIsDrawingRoute(false);
    } else if (tab === "explore") {
      // 探検モードは Phase 4 で実装
      routeOverlay.close();
      helpOverlay.close();
      setIsDrawingRoute(false);
    }
  }, [routeOverlay, helpOverlay]);

  return (
    <main className="h-screen flex flex-col">
      {/* ヘッダー */}
      <header className="bg-blue-600 text-white px-4 py-2 shadow-md">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6" />
          <div>
            <h1 className="text-lg font-bold">通学路安全確認デモアプリ</h1>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      {/* デスクトップ: 横並びレイアウト */}
      <div className="flex-1 hidden lg:flex lg:flex-row overflow-hidden">
        {/* 左側：地図エリア（60%） */}
        <div className="lg:w-3/5 h-full relative">
          <MapContainer
            waypoints={waypoints}
            onWaypointAdd={handleWaypointAdd}
            onWaypointDoubleClick={handleWaypointDoubleClick}
            onWaypointDelete={handleWaypointDelete}
            onWaypointMove={handleWaypointMove}
            isDrawingRoute={isDrawingRoute}
            routeCoordinates={routeCoordinates}
            onRouteDrag={handleRouteDrag}
            hazardPoints={displayedHazards}
            onHazardClick={handleHazardClick}
            selectedHazardId={selectedHazard?.id || null}
            tourPosition={tourPosition}
            tourHeading={tourHeading}
            isTourActive={isTourActive}
          >
            {/* 安全ガイドオーバーレイ */}
            <SafetyGuideOverlay
              selectedHazard={selectedHazard}
              onClose={handleCloseGuide}
            />
          </MapContainer>

          {/* 経路設定コントロール（地図上に重ねる） */}
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
        </div>

        {/* 右側：Street Viewエリア（40%） */}
        <div className="lg:w-2/5 h-full flex flex-col overflow-hidden bg-gray-50">
          <div className="flex-1 p-3 min-h-0">
            <StreetViewPanel
              selectedHazard={selectedHazard}
              apiKey={googleMapsApiKey}
              tourPosition={tourPosition}
              tourHeading={tourHeading}
              isTourActive={isTourActive}
            />
          </div>
        </div>
      </div>

      {/* モバイル: 新UIレイアウト */}
      <div className="flex-1 flex flex-col lg:hidden overflow-hidden">
        {/* 新しいモバイルヘッダーメニュー */}
        <MobileHeader
          activeTab={mobileMenuTab}
          onTabChange={handleMobileMenuTabChange}
        />

        {/* 地図（フルスクリーン） */}
        <div className="flex-1 relative">
          <MapContainer
            waypoints={waypoints}
            onWaypointAdd={handleWaypointAdd}
            onWaypointDoubleClick={handleWaypointDoubleClick}
            onWaypointDelete={handleWaypointDelete}
            onWaypointMove={handleWaypointMove}
            isDrawingRoute={isDrawingRoute}
            routeCoordinates={routeCoordinates}
            onRouteDrag={handleRouteDrag}
            hazardPoints={displayedHazards}
            onHazardClick={handleHazardClick}
            selectedHazardId={selectedHazard?.id || null}
            tourPosition={tourPosition}
            tourHeading={tourHeading}
            isTourActive={isTourActive}
          >
            {/* 安全ガイドオーバーレイ（モバイルでも地図上に表示） */}
            <SafetyGuideOverlay
              selectedHazard={selectedHazard}
              onClose={handleCloseGuide}
            />
          </MapContainer>
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
        <Overlay
          isOpen={helpOverlay.isOpen}
          onClose={helpOverlay.close}
          title="アイコン説明"
        >
          <div className="p-4 space-y-4">
            <div>
              <h3 className="font-bold text-gray-800 mb-2">危険地点の種類</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <span className="text-xl">⚠️</span>
                  <span className="text-sm">見通しの悪い交差点</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-xl">🔴</span>
                  <span className="text-sm">事故多発エリア</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-xl">🟠</span>
                  <span className="text-sm">急ブレーキ多発地点</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-xl">💬</span>
                  <span className="text-sm">ユーザー投稿情報</span>
                </li>
              </ul>
            </div>
            <hr className="border-gray-200" />
            <div>
              <h3 className="font-bold text-gray-800 mb-2">操作方法</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>・地図をタップして経路のスタート/ゴールを設定</li>
                <li>・危険マーカーをタップして詳細を確認</li>
                <li>・「通学路探検」で一緒に安全学習</li>
              </ul>
            </div>
          </div>
        </Overlay>
      </div>
    </main>
  );
}
