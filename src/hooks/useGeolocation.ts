// ============================================================
// AutoNear — useGeolocation Hook
// Wraps the browser's Geolocation API with proper cleanup,
// error handling, and state management.
// ============================================================

import { useState, useEffect, useRef, useCallback } from 'react'
import type { GeolocationState } from '../types'

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean
  maximumAge?: number
  timeout?: number
  /** If true, automatically starts watching position on mount */
  autoStart?: boolean
}

interface UseGeolocationReturn extends GeolocationState {
  startWatching: () => void
  stopWatching: () => void
  isWatching: boolean
}

const GEO_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  maximumAge: 5000,    // Accept a position up to 5 seconds old
  timeout: 15000,      // Fail if no position within 15 seconds
}

export function useGeolocation(options: UseGeolocationOptions = {}): UseGeolocationReturn {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    loading: false,
    permissionStatus: null,
  })
  const [isWatching, setIsWatching] = useState(false)
  const watchIdRef = useRef<number | null>(null)

  const mergedOptions: PositionOptions = {
    ...GEO_OPTIONS,
    enableHighAccuracy: options.enableHighAccuracy ?? true,
    maximumAge: options.maximumAge ?? 5000,
    timeout: options.timeout ?? 15000,
  }

  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    setIsWatching(false)
  }, [])

  const startWatching = useCallback(() => {
    if (!navigator.geolocation) {
      setState((s) => ({
        ...s,
        error: 'Geolocation is not supported by this browser.',
        loading: false,
      }))
      return
    }

    // Stop any existing watcher first
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
    }

    setState((s) => ({ ...s, loading: true, error: null }))
    setIsWatching(true)

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          error: null,
          loading: false,
          permissionStatus: 'granted',
        })
      },
      (geoError) => {
        let message: string
        switch (geoError.code) {
          case geoError.PERMISSION_DENIED:
            message =
              'Location permission was denied. Please allow location access in your browser settings and try again.'
            break
          case geoError.POSITION_UNAVAILABLE:
            message =
              'Location information is currently unavailable. Please ensure GPS or network location is enabled.'
            break
          case geoError.TIMEOUT:
            message =
              'Location request timed out. Please check your GPS signal and try again.'
            break
          default:
            message = 'An unknown location error occurred.'
        }
        setState((s) => ({
          ...s,
          error: message,
          loading: false,
          permissionStatus:
            geoError.code === geoError.PERMISSION_DENIED ? 'denied' : 'granted',
        }))
        setIsWatching(false)
      },
      mergedOptions
    )
  }, [mergedOptions.enableHighAccuracy, mergedOptions.maximumAge, mergedOptions.timeout])

  // Query current permission status on mount
  useEffect(() => {
    if (navigator.permissions) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((result) => {
          setState((s) => ({ ...s, permissionStatus: result.state }))
          result.onchange = () => {
            setState((s) => ({ ...s, permissionStatus: result.state }))
          }
        })
        .catch(() => {
          // Permissions API may not be available in all environments
        })
    }

    if (options.autoStart) {
      startWatching()
    }

    return () => {
      stopWatching()
    }
  }, []) // Only on mount/unmount

  return { ...state, startWatching, stopWatching, isWatching }
}
