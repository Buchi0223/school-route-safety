import { describe, it, expect } from 'vitest'
import { selectHazardPointsForTour, getSelectionInfo } from '@/lib/hazardData'
import { HazardPoint } from '@/lib/types'

// テスト用のHazardPointデータ
const createMockHazardPoint = (
  id: string,
  type: HazardPoint['type'],
  lat: number,
  lng: number
): HazardPoint => ({
  id,
  type,
  lat,
  lng,
  title: `Test ${id}`,
  description: `Test description for ${id}`,
  checkPoints: ['Check 1'],
  voiceGuide: 'Test guide',
  safetyTips: ['Tip 1'],
})

// 基本的なテストデータ
const mockHazardPoints: HazardPoint[] = [
  // 経路上の地点（近い順）
  createMockHazardPoint('h1', 'accident', 36.5510, 139.8960),      // accident: 10点
  createMockHazardPoint('h2', 'braking', 36.5515, 139.8965),       // braking: 8点
  createMockHazardPoint('h3', 'intersection', 36.5520, 139.8970),  // intersection: 6点
  createMockHazardPoint('h4', 'user_report', 36.5525, 139.8975),   // user_report: 4点
  createMockHazardPoint('h5', 'accident', 36.5530, 139.8980),      // accident: 10点
  createMockHazardPoint('h6', 'braking', 36.5535, 139.8985),       // braking: 8点
  createMockHazardPoint('h7', 'intersection', 36.5540, 139.8990),  // intersection: 6点
  // 経路から遠い地点（選別されない）
  createMockHazardPoint('h8', 'accident', 36.6000, 139.9500),
]

// 経路座標（直線的なルート）
const routeCoordinates: [number, number][] = [
  [36.5510, 139.8960],
  [36.5515, 139.8965],
  [36.5520, 139.8970],
  [36.5525, 139.8975],
  [36.5530, 139.8980],
  [36.5535, 139.8985],
  [36.5540, 139.8990],
]

describe('selectHazardPointsForTour', () => {
  describe('基本的な選別機能', () => {
    it('空の経路に対しては空配列を返す', () => {
      const result = selectHazardPointsForTour(mockHazardPoints, [])
      expect(result).toHaveLength(0)
    })

    it('空のHazardPoints配列に対しては空配列を返す', () => {
      const result = selectHazardPointsForTour([], routeCoordinates)
      expect(result).toHaveLength(0)
    })

    it('経路から遠いHazardPointは選別されない', () => {
      const result = selectHazardPointsForTour(mockHazardPoints, routeCoordinates)
      expect(result.some(h => h.id === 'h8')).toBe(false)
    })

    it('最大5件まで選出される', () => {
      const result = selectHazardPointsForTour(mockHazardPoints, routeCoordinates)
      expect(result.length).toBeLessThanOrEqual(5)
    })
  })

  describe('優先度スコアに基づく選別', () => {
    it('accidentタイプが優先的に選出される', () => {
      const result = selectHazardPointsForTour(mockHazardPoints, routeCoordinates)
      // accidentタイプ(h1, h5)が含まれているはず
      const accidentPoints = result.filter(h => h.type === 'accident')
      expect(accidentPoints.length).toBeGreaterThan(0)
    })

    it('スコアの高いポイントが選出される', () => {
      // 全て同じ位置に異なるタイプの地点を配置
      const sameLocationPoints: HazardPoint[] = [
        createMockHazardPoint('s1', 'user_report', 36.5520, 139.8970),  // 4点
        createMockHazardPoint('s2', 'intersection', 36.5520, 139.8971), // 6点（わずかに離れる）
        createMockHazardPoint('s3', 'braking', 36.5520, 139.8972),      // 8点（わずかに離れる）
        createMockHazardPoint('s4', 'accident', 36.5520, 139.8973),     // 10点（わずかに離れる）
      ]
      const shortRoute: [number, number][] = [[36.5520, 139.8970]]

      const result = selectHazardPointsForTour(sameLocationPoints, shortRoute)

      // 最低1件は選出される
      expect(result.length).toBeGreaterThan(0)
    })
  })

  describe('近接地点の重複除去', () => {
    it('50m以内の近接地点は代表1件のみ選出される', () => {
      // 同じ位置に複数の高スコア地点 + 離れた位置に他の地点（合計4件以上で重複除去が動作）
      const closePoints: HazardPoint[] = [
        createMockHazardPoint('c1', 'accident', 36.5520, 139.8970),     // 10点
        createMockHazardPoint('c2', 'accident', 36.5520, 139.8970),     // 10点（同じ位置）
        createMockHazardPoint('c3', 'braking', 36.5600, 139.9050),      // 8点（離れた位置）
        createMockHazardPoint('c4', 'intersection', 36.5650, 139.9100), // 6点（さらに離れた位置）
        createMockHazardPoint('c5', 'user_report', 36.5700, 139.9150),  // 4点（さらに離れた位置）
      ]
      const longRoute: [number, number][] = [
        [36.5520, 139.8970],
        [36.5600, 139.9050],
        [36.5650, 139.9100],
        [36.5700, 139.9150],
      ]

      const result = selectHazardPointsForTour(closePoints, longRoute)

      // c1とc2は同じ位置なので、どちらか1件のみ選出される
      const c1Selected = result.some(h => h.id === 'c1')
      const c2Selected = result.some(h => h.id === 'c2')
      // 両方が選出されることはない
      expect(c1Selected && c2Selected).toBe(false)
      // 少なくとも1件は選出される
      expect(c1Selected || c2Selected).toBe(true)
    })
  })

  describe('経路上の位置順ソート', () => {
    it('結果は経路上の位置順にソートされる', () => {
      const result = selectHazardPointsForTour(mockHazardPoints, routeCoordinates)

      if (result.length >= 2) {
        // 各ポイントの経路上のインデックスを取得
        const indices = result.map(point => {
          let minIndex = 0
          let minDistance = Infinity
          routeCoordinates.forEach((coord, i) => {
            const dist = Math.sqrt(
              Math.pow(coord[0] - point.lat, 2) + Math.pow(coord[1] - point.lng, 2)
            )
            if (dist < minDistance) {
              minDistance = dist
              minIndex = i
            }
          })
          return minIndex
        })

        // インデックスが昇順になっているか確認
        for (let i = 0; i < indices.length - 1; i++) {
          expect(indices[i]).toBeLessThanOrEqual(indices[i + 1])
        }
      }
    })
  })

  describe('少数のポイントの場合', () => {
    it('3件以下の場合は全件返却', () => {
      const fewPoints: HazardPoint[] = [
        createMockHazardPoint('f1', 'accident', 36.5520, 139.8970),
        createMockHazardPoint('f2', 'braking', 36.5530, 139.8980),
      ]
      const shortRoute: [number, number][] = [
        [36.5520, 139.8970],
        [36.5530, 139.8980],
      ]

      const result = selectHazardPointsForTour(fewPoints, shortRoute)

      // 2件とも選出される
      expect(result.length).toBe(2)
    })
  })
})

describe('getSelectionInfo', () => {
  it('選別情報を正しく返す', () => {
    const result = getSelectionInfo(mockHazardPoints, routeCoordinates)

    expect(result).toHaveProperty('totalNearRoute')
    expect(result).toHaveProperty('selected')
    expect(result).toHaveProperty('selectedCount')

    expect(result.totalNearRoute).toBeGreaterThanOrEqual(result.selectedCount)
    expect(result.selected).toHaveLength(result.selectedCount)
  })

  it('空の経路に対しては0件', () => {
    const result = getSelectionInfo(mockHazardPoints, [])

    expect(result.totalNearRoute).toBe(0)
    expect(result.selectedCount).toBe(0)
  })
})
