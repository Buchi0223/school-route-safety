import { describe, it, expect, vi } from 'vitest'
import {
  calculateRouteDistance,
  sortWaypointsByRoute,
  interpolateRoutePoints,
} from '@/lib/routing'
import { Waypoint } from '@/lib/types'

describe('calculateRouteDistance', () => {
  it('should return 0 for empty coordinates', () => {
    expect(calculateRouteDistance([])).toBe(0)
  })

  it('should return 0 for single coordinate', () => {
    expect(calculateRouteDistance([[35.6812, 139.7671]])).toBe(0)
  })

  it('should calculate distance between two points', () => {
    // 東京駅から皇居（約1.5km）
    const coordinates: [number, number][] = [
      [35.6812, 139.7671], // 東京駅
      [35.6852, 139.7528], // 皇居
    ]
    const distance = calculateRouteDistance(coordinates)
    // 約1.3-1.5km程度の距離
    expect(distance).toBeGreaterThan(1000)
    expect(distance).toBeLessThan(2000)
  })

  it('should sum distances for multiple points', () => {
    const coordinates: [number, number][] = [
      [36.5516, 139.8967], // 宇都宮
      [36.5520, 139.8970],
      [36.5525, 139.8975],
    ]
    const distance = calculateRouteDistance(coordinates)
    expect(distance).toBeGreaterThan(0)
  })
})

describe('sortWaypointsByRoute', () => {
  it('should return original array if no start point', () => {
    const waypoints: Waypoint[] = [
      { id: '1', lat: 36.55, lng: 139.89, type: 'via' },
      { id: '2', lat: 36.56, lng: 139.90, type: 'end' },
    ]
    const result = sortWaypointsByRoute(waypoints)
    expect(result).toEqual(waypoints)
  })

  it('should return original array if no end point', () => {
    const waypoints: Waypoint[] = [
      { id: '1', lat: 36.55, lng: 139.89, type: 'start' },
      { id: '2', lat: 36.56, lng: 139.90, type: 'via' },
    ]
    const result = sortWaypointsByRoute(waypoints)
    expect(result).toEqual(waypoints)
  })

  it('should return original array if no via points', () => {
    const waypoints: Waypoint[] = [
      { id: '1', lat: 36.55, lng: 139.89, type: 'start' },
      { id: '2', lat: 36.56, lng: 139.90, type: 'end' },
    ]
    const result = sortWaypointsByRoute(waypoints)
    expect(result).toEqual(waypoints)
  })

  it('should sort via points by distance from start', () => {
    const waypoints: Waypoint[] = [
      { id: 'start', lat: 36.55, lng: 139.89, type: 'start' },
      { id: 'far', lat: 36.58, lng: 139.92, type: 'via' }, // 遠い
      { id: 'near', lat: 36.56, lng: 139.90, type: 'via' }, // 近い
      { id: 'end', lat: 36.60, lng: 139.94, type: 'end' },
    ]
    const result = sortWaypointsByRoute(waypoints)

    expect(result[0].id).toBe('start')
    expect(result[1].id).toBe('near')
    expect(result[2].id).toBe('far')
    expect(result[3].id).toBe('end')
  })
})

describe('interpolateRoutePoints', () => {
  it('should return original array for less than 2 coordinates', () => {
    const coordinates: [number, number][] = [[36.55, 139.89]]
    expect(interpolateRoutePoints(coordinates)).toEqual(coordinates)
  })

  it('should include start and end points', () => {
    const coordinates: [number, number][] = [
      [36.55, 139.89],
      [36.56, 139.90],
    ]
    const result = interpolateRoutePoints(coordinates, 50)

    expect(result[0]).toEqual(coordinates[0])
    expect(result[result.length - 1]).toEqual(coordinates[coordinates.length - 1])
  })

  it('should create more points with smaller interval', () => {
    const coordinates: [number, number][] = [
      [36.55, 139.89],
      [36.56, 139.90],
    ]
    const largeInterval = interpolateRoutePoints(coordinates, 100)
    const smallInterval = interpolateRoutePoints(coordinates, 20)

    expect(smallInterval.length).toBeGreaterThan(largeInterval.length)
  })
})
