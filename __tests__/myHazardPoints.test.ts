import { describe, it, expect, beforeEach, vi } from 'vitest'
import { findNearbyPins, calculateDistance } from '@/lib/useMyHazardPoints'
import { MyHazardPoint } from '@/lib/types'

// テスト用のMyHazardPointデータ
const createMockMyHazardPoint = (
  id: string,
  lat: number,
  lng: number,
  reasons: MyHazardPoint['reasons'] = ['traffic_heavy']
): MyHazardPoint => ({
  id,
  lat,
  lng,
  reasons,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
})

describe('calculateDistance', () => {
  it('同じ地点の距離は0', () => {
    const distance = calculateDistance(36.5510, 139.8960, 36.5510, 139.8960)
    expect(distance).toBe(0)
  })

  it('近い2点間の距離を正しく計算', () => {
    // 約100m離れた2点
    const distance = calculateDistance(36.5510, 139.8960, 36.5519, 139.8960)
    expect(distance).toBeGreaterThan(90)
    expect(distance).toBeLessThan(110)
  })

  it('約1km離れた2点間の距離を計算', () => {
    // 緯度で約0.009度 ≈ 約1km
    const distance = calculateDistance(36.5510, 139.8960, 36.5600, 139.8960)
    expect(distance).toBeGreaterThan(900)
    expect(distance).toBeLessThan(1100)
  })
})

describe('findNearbyPins', () => {
  const mockPins: MyHazardPoint[] = [
    createMockMyHazardPoint('p1', 36.5510, 139.8960),
    createMockMyHazardPoint('p2', 36.5530, 139.8980), // 約300m離れている
    createMockMyHazardPoint('p3', 36.5600, 139.8960), // 約1km離れている
  ]

  it('空の配列に対しては空配列を返す', () => {
    const result = findNearbyPins([], 36.5510, 139.8960, 100)
    expect(result).toHaveLength(0)
  })

  it('指定半径内のピンのみを返す', () => {
    const result = findNearbyPins(mockPins, 36.5510, 139.8960, 100)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('p1')
  })

  it('より大きな半径では複数のピンを返す', () => {
    const result = findNearbyPins(mockPins, 36.5510, 139.8960, 500)
    // p1とp2は500m以内にあるはず
    expect(result.length).toBeGreaterThanOrEqual(2)
    expect(result.some(p => p.id === 'p1')).toBe(true)
    expect(result.some(p => p.id === 'p2')).toBe(true)
  })

  it('十分大きな半径では全ピンを返す', () => {
    const result = findNearbyPins(mockPins, 36.5510, 139.8960, 10000)
    expect(result).toHaveLength(3)
  })

  it('半径0ではちょうど同じ位置のピンのみを返す', () => {
    const result = findNearbyPins(mockPins, 36.5510, 139.8960, 0)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('p1')
  })

  it('範囲外の座標では空配列を返す', () => {
    const result = findNearbyPins(mockPins, 37.0000, 140.0000, 100)
    expect(result).toHaveLength(0)
  })
})

describe('MyHazardPoint型の検証', () => {
  it('必須フィールドを持つ有効なMyHazardPoint', () => {
    const pin = createMockMyHazardPoint('test-id', 36.5510, 139.8960, ['traffic_heavy', 'narrow_road'])

    expect(pin.id).toBe('test-id')
    expect(pin.lat).toBe(36.5510)
    expect(pin.lng).toBe(139.8960)
    expect(pin.reasons).toContain('traffic_heavy')
    expect(pin.reasons).toContain('narrow_road')
    expect(pin.createdAt).toBeTruthy()
    expect(pin.updatedAt).toBeTruthy()
  })

  it('reasonDetailはオプショナル', () => {
    const pin = createMockMyHazardPoint('test-id', 36.5510, 139.8960)
    expect(pin.reasonDetail).toBeUndefined()
  })
})

describe('重複防止ロジック', () => {
  it('30m以内の近接ピンを検出', () => {
    const existingPins: MyHazardPoint[] = [
      createMockMyHazardPoint('existing-1', 36.5510, 139.8960),
    ]

    // 20m程度離れた位置（30m以内）
    const nearbyResult = findNearbyPins(existingPins, 36.5512, 139.8960, 30)
    expect(nearbyResult).toHaveLength(1)
  })

  it('30m以上離れた位置は重複なしと判定', () => {
    const existingPins: MyHazardPoint[] = [
      createMockMyHazardPoint('existing-1', 36.5510, 139.8960),
    ]

    // 約50m離れた位置（30m以上）
    const farResult = findNearbyPins(existingPins, 36.5515, 139.8960, 30)
    expect(farResult).toHaveLength(0)
  })
})
