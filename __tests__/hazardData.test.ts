import { describe, it, expect } from 'vitest'
import { getNearbyHazards, getHazardsAlongRoute } from '@/lib/hazardData'
import { HazardPoint } from '@/lib/types'

const mockHazardPoints: HazardPoint[] = [
  {
    id: 'hazard-1',
    type: 'intersection',
    lat: 36.5516,
    lng: 139.8967,
    title: '見通しの悪い交差点',
    description: 'テスト用交差点',
    checkPoints: ['左右確認'],
    voiceGuide: '注意して',
    safetyTips: ['止まって確認'],
  },
  {
    id: 'hazard-2',
    type: 'accident',
    lat: 36.5530,
    lng: 139.8980,
    title: '事故多発地点',
    description: 'テスト用事故地点',
    checkPoints: ['周囲確認'],
    voiceGuide: '気をつけて',
    safetyTips: ['ゆっくり歩く'],
  },
  {
    id: 'hazard-3',
    type: 'braking',
    lat: 36.5600,
    lng: 139.9100, // 遠い地点
    title: '急ブレーキ多発',
    description: 'テスト用遠い地点',
    checkPoints: ['確認'],
    voiceGuide: 'テスト',
    safetyTips: ['注意'],
  },
]

describe('getNearbyHazards', () => {
  it('should return empty array when no hazards nearby', () => {
    const result = getNearbyHazards(mockHazardPoints, 35.0, 138.0, 500)
    expect(result).toHaveLength(0)
  })

  it('should return hazards within radius', () => {
    // hazard-1 の近くを検索
    const result = getNearbyHazards(mockHazardPoints, 36.5516, 139.8967, 500)
    expect(result.length).toBeGreaterThan(0)
    expect(result.some(h => h.id === 'hazard-1')).toBe(true)
  })

  it('should respect radius parameter', () => {
    // 小さい半径で検索
    const smallRadius = getNearbyHazards(mockHazardPoints, 36.5516, 139.8967, 10)
    // 大きい半径で検索
    const largeRadius = getNearbyHazards(mockHazardPoints, 36.5516, 139.8967, 5000)

    expect(largeRadius.length).toBeGreaterThanOrEqual(smallRadius.length)
  })

  it('should return hazards at exact location', () => {
    const result = getNearbyHazards(mockHazardPoints, 36.5516, 139.8967, 1)
    expect(result.some(h => h.id === 'hazard-1')).toBe(true)
  })
})

describe('getHazardsAlongRoute', () => {
  it('should return empty array for empty route', () => {
    const result = getHazardsAlongRoute(mockHazardPoints, [], 50)
    expect(result).toHaveLength(0)
  })

  it('should find hazards along route', () => {
    const routeCoordinates: [number, number][] = [
      [36.5516, 139.8967], // hazard-1 の位置
      [36.5520, 139.8970],
      [36.5530, 139.8980], // hazard-2 の位置
    ]
    const result = getHazardsAlongRoute(mockHazardPoints, routeCoordinates, 50)

    expect(result.some(h => h.id === 'hazard-1')).toBe(true)
    expect(result.some(h => h.id === 'hazard-2')).toBe(true)
    // hazard-3 は遠いので含まれない
    expect(result.some(h => h.id === 'hazard-3')).toBe(false)
  })

  it('should not duplicate hazards', () => {
    // 同じ地点を複数回通過するルート
    const routeCoordinates: [number, number][] = [
      [36.5516, 139.8967],
      [36.5517, 139.8968],
      [36.5516, 139.8967], // 同じ地点に戻る
    ]
    const result = getHazardsAlongRoute(mockHazardPoints, routeCoordinates, 50)

    // hazard-1 が1回だけ含まれる
    const hazard1Count = result.filter(h => h.id === 'hazard-1').length
    expect(hazard1Count).toBe(1)
  })
})
