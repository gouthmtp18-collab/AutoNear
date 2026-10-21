// ============================================================
// AutoNear — useNearbyDrivers Hook
// Subscribes to live driver location updates from Firebase
// and filters by radius, staleness, and approval status.
// ============================================================

import { useState, useEffect } from 'react'
import { subscribeToOnlineDriverLocations } from '../services/driverService'
import { getDriverProfile } from '../services/driverService'
import {
  DriverLocation,
  DriverProfile,
  NearbyDriver,
  SearchFilters,
  LOCATION_STALE_THRESHOLD_SECONDS,
} from '../types'
import { haversineDistanceKm, isValidCoordinate, isLocationStale } from '../utils/geo'

interface UseNearbyDriversParams {
  passengerLat: number | null
  passengerLon: number | null
  filters: SearchFilters
  enabled: boolean
}

interface UseNearbyDriversReturn {
  drivers: NearbyDriver[]
  loading: boolean
  error: string | null
}

// Cache driver profiles to avoid re-fetching on every location update
const profileCache = new Map<string, DriverProfile>()

export function useNearbyDrivers({
  passengerLat,
  passengerLon,
  filters,
  enabled,
}: UseNearbyDriversParams): UseNearbyDriversReturn {
  const [allLocations, setAllLocations] = useState<DriverLocation[]>([])
  const [drivers, setDrivers] = useState<NearbyDriver[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Subscribe to live location updates
  useEffect(() => {
    if (!enabled) return

    setLoading(true)
    const unsubscribe = subscribeToOnlineDriverLocations((locs) => {
      setAllLocations(locs)
      setLoading(false)
    })
    return unsubscribe
  }, [enabled])

  // Compute nearby drivers whenever locations or passenger position changes
  useEffect(() => {
    if (
      passengerLat === null ||
      passengerLon === null ||
      !isValidCoordinate(passengerLat, passengerLon)
    ) {
      setDrivers([])
      return
    }

    const resolveDrivers = async () => {
      const results: NearbyDriver[] = []

      for (const loc of allLocations) {
        // Skip invalid coordinates
        if (!isValidCoordinate(loc.latitude, loc.longitude)) continue
        // Skip offline drivers
        if (!loc.isOnline) continue

        const stale = isLocationStale(loc.timestamp, LOCATION_STALE_THRESHOLD_SECONDS)

        // Calculate distance using Haversine formula
        const distanceKm = haversineDistanceKm(
          passengerLat,
          passengerLon,
          loc.latitude,
          loc.longitude
        )

        // Apply radius filter
        if (distanceKm > filters.radius) continue

        // Fetch driver profile (use cache to reduce reads)
        let profile = profileCache.get(loc.uid)
        if (!profile) {
          try {
            const fetched = await getDriverProfile(loc.uid)
            if (!fetched) continue
            profile = fetched
            profileCache.set(loc.uid, fetched)
          } catch {
            continue
          }
        }

        // Invalidate cached profile if it seems stale
        if (profile && profile.approvalStatus !== 'approved') continue

        results.push({ profile, location: loc, distanceKm, isStale: stale })
      }

      // Sort results
      if (filters.sort === 'distance') {
        results.sort((a, b) => a.distanceKm - b.distanceKm)
      } else {
        results.sort((a, b) => a.profile.fullName.localeCompare(b.profile.fullName))
      }

      setDrivers(results)
      setError(null)
    }

    resolveDrivers().catch((err) => {
      console.error('[useNearbyDrivers]', err)
      setError('Failed to load driver information. Please try again.')
    })
  }, [allLocations, passengerLat, passengerLon, filters.radius, filters.sort])

  return { drivers, loading, error }
}
