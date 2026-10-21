// ============================================================
// AutoNear — Driver Dashboard Page
// Real GPS tracking with watchPosition, Firebase publishing,
// and clear status communication.
// ============================================================

import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  Navigation, WifiOff, MapPin,
  CheckCircle, Clock, Car, User, Crosshair, RefreshCw
} from 'lucide-react'
import { useAuth } from '../features/auth/AuthContext'
import { publishDriverLocation, setDriverOffline } from '../services/driverService'
import { isValidCoordinate } from '../utils/geo'
import { formatRelativeTime } from '../utils/geo'
import { Alert, Badge, Button, Card, Spinner } from '../components/ui'
import { ProtectedRoute } from '../components/ProtectedRoute'

interface TrackingState {
  isOnline: boolean
  isWatching: boolean
  latitude: number | null
  longitude: number | null
  accuracy: number | null
  lastUpdated: number | null
  error: string | null
  gpsLoading: boolean
  publishCount: number
}

const initialState: TrackingState = {
  isOnline: false,
  isWatching: false,
  latitude: null,
  longitude: null,
  accuracy: null,
  lastUpdated: null,
  error: null,
  gpsLoading: false,
  publishCount: 0,
}

// Minimum distance (metres) before publishing a new location update
// to avoid flooding the database when stationary.
const MIN_MOVE_THRESHOLD_METRES = 10

function distance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371000
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function DriverDashboardContent() {
  const { user, driverProfile, refreshDriverProfile } = useAuth()
  const [tracking, setTracking] = useState<TrackingState>(initialState)
  const watchIdRef = useRef<number | null>(null)
  const lastPublishedRef = useRef<{ lat: number; lon: number } | null>(null)

  const stopTracking = useCallback(async () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    if (user && tracking.isOnline) {
      try {
        await setDriverOffline(user.uid)
      } catch (err) {
        console.error('[DriverDashboard] Failed to set offline:', err)
      }
    }
    lastPublishedRef.current = null
    setTracking((s) => ({
      ...s,
      isOnline: false,
      isWatching: false,
      gpsLoading: false,
    }))
  }, [user, tracking.isOnline])

  // Clean up watcher on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
      // Note: We don't call setDriverOffline here because the component
      // may unmount during navigation. The driver must explicitly go offline.
    }
  }, [])

  const goOnline = () => {
    if (!navigator.geolocation) {
      setTracking((s) => ({
        ...s,
        error: 'Geolocation is not supported by this browser.',
      }))
      return
    }

    if (!driverProfile || driverProfile.approvalStatus !== 'approved') {
      setTracking((s) => ({
        ...s,
        error: 'Your account must be approved before you can go online.',
      }))
      return
    }

    setTracking((s) => ({ ...s, gpsLoading: true, error: null }))

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords

        if (!isValidCoordinate(latitude, longitude)) {
          setTracking((s) => ({
            ...s,
            error: 'Received invalid GPS coordinates. Please wait for a better signal.',
            gpsLoading: false,
          }))
          return
        }

        // Throttle: only publish if moved enough or first update
        const last = lastPublishedRef.current
        const shouldPublish =
          !last ||
          distance(last.lat, last.lon, latitude, longitude) > MIN_MOVE_THRESHOLD_METRES

        setTracking((s) => ({
          ...s,
          isOnline: true,
          isWatching: true,
          latitude,
          longitude,
          accuracy,
          lastUpdated: Date.now(),
          gpsLoading: false,
          error: null,
          publishCount: shouldPublish ? s.publishCount + 1 : s.publishCount,
        }))

        if (shouldPublish && user) {
          try {
            await publishDriverLocation(user.uid, latitude, longitude, accuracy)
            lastPublishedRef.current = { lat: latitude, lon: longitude }
          } catch (err) {
            console.error('[DriverDashboard] Publish failed:', err)
            setTracking((s) => ({
              ...s,
              error: 'Failed to publish location. Check your internet connection.',
            }))
          }
        }
      },
      (geoError) => {
        let msg: string
        switch (geoError.code) {
          case geoError.PERMISSION_DENIED:
            msg = 'Location permission was denied. Please allow location access and try again.'
            break
          case geoError.POSITION_UNAVAILABLE:
            msg = 'Your GPS signal is unavailable. Please ensure location services are enabled.'
            break
          case geoError.TIMEOUT:
            msg = 'Location request timed out. Please check your GPS signal.'
            break
          default:
            msg = 'An unknown location error occurred.'
        }
        setTracking((s) => ({
          ...s,
          isOnline: false,
          isWatching: false,
          gpsLoading: false,
          error: msg,
        }))
        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current)
          watchIdRef.current = null
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 15000,
      }
    )
  }

  if (!driverProfile && user) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Spinner className="w-8 h-8" />
      </div>
    )
  }

  const isApproved = driverProfile?.approvalStatus === 'approved'
  const isPending = driverProfile?.approvalStatus === 'pending'
  const isRejected = driverProfile?.approvalStatus === 'rejected'
  const isSuspended = driverProfile?.approvalStatus === 'suspended'

  return (
    <div className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-[#202020] border border-[#303030] rounded-xl flex items-center justify-center text-2xl">
          🛺
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#F5F5F5]">Driver Dashboard</h1>
          <p className="text-sm text-[#737373]">
            {driverProfile?.fullName ?? user?.email}
          </p>
        </div>
      </div>

      {/* Account Status */}
      <Card className="mb-5">
        <h2 className="text-xs font-semibold text-[#737373] uppercase tracking-wider mb-4">
          Account Status
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-[#737373] mb-1 flex items-center gap-1.5">
              <User className="w-3 h-3" /> Name
            </p>
            <p className="text-sm font-medium text-[#F5F5F5]">
              {driverProfile?.fullName ?? '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#737373] mb-1 flex items-center gap-1.5">
              <Car className="w-3 h-3" /> Vehicle
            </p>
            <p className="text-sm font-medium text-[#F5F5F5]">
              {driverProfile?.vehicleRegNumber ?? '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#737373] mb-1">Approval</p>
            <Badge
              variant={driverProfile?.approvalStatus as 'pending' | 'approved' | 'rejected' | 'suspended' ?? 'pending'}
              dot
            >
              {driverProfile?.approvalStatus ?? 'pending'}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Approval messages */}
      {isPending && (
        <Alert variant="warning" className="mb-5">
          <p className="text-sm font-semibold mb-1">Pending Admin Approval</p>
          <p className="text-xs">
            Your registration is under review. You cannot go online until an administrator
            approves your account. You will be able to sign in and return here once approved.
          </p>
        </Alert>
      )}
      {isRejected && (
        <Alert variant="error" className="mb-5">
          <p className="text-sm font-semibold mb-1">Registration Rejected</p>
          {driverProfile?.rejectionReason && (
            <p className="text-xs">Reason: {driverProfile.rejectionReason}</p>
          )}
        </Alert>
      )}
      {isSuspended && (
        <Alert variant="error" className="mb-5">
          <p className="text-sm font-semibold mb-1">Account Suspended</p>
          {driverProfile?.suspensionReason && (
            <p className="text-xs">Reason: {driverProfile.suspensionReason}</p>
          )}
        </Alert>
      )}

      {/* Tracking Panel — only shown when approved */}
      {isApproved && (
        <>
          {/* Status Card */}
          <Card className="mb-5">
            <h2 className="text-xs font-semibold text-[#737373] uppercase tracking-wider mb-4">
              Live Tracking Status
            </h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-[#737373] mb-1">Online Status</p>
                <Badge variant={tracking.isOnline ? 'online' : 'offline'} dot>
                  {tracking.isOnline ? 'Online' : 'Offline'}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-[#737373] mb-1">Location Sharing</p>
                <Badge variant={tracking.isWatching ? 'online' : 'offline'} dot>
                  {tracking.isWatching ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              {tracking.latitude !== null && tracking.longitude !== null && (
                <>
                  <div>
                    <p className="text-xs text-[#737373] mb-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Coordinates
                    </p>
                    <p className="text-xs font-mono text-[#A3A3A3]">
                      {tracking.latitude.toFixed(5)}, {tracking.longitude.toFixed(5)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#737373] mb-1 flex items-center gap-1">
                      <Crosshair className="w-3 h-3" /> GPS Accuracy
                    </p>
                    <p className="text-sm font-medium text-[#F5F5F5]">
                      ±{Math.round(tracking.accuracy ?? 0)} m
                    </p>
                  </div>
                </>
              )}

              {tracking.lastUpdated && (
                <div>
                  <p className="text-xs text-[#737373] mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Last Published
                  </p>
                  <p className="text-sm text-[#A3A3A3]">
                    {formatRelativeTime(tracking.lastUpdated)}
                  </p>
                </div>
              )}

              {tracking.isWatching && (
                <div>
                  <p className="text-xs text-[#737373] mb-1">Updates Sent</p>
                  <p className="text-sm font-medium text-[#F5F5F5]">{tracking.publishCount}</p>
                </div>
              )}
            </div>

            {tracking.error && (
              <Alert variant="error" className="mb-4">
                {tracking.error}
              </Alert>
            )}

            {/* Controls */}
            <div className="flex gap-3">
              {!tracking.isOnline ? (
                <Button
                  onClick={goOnline}
                  loading={tracking.gpsLoading}
                  disabled={!isApproved}
                  leftIcon={<Navigation className="w-4 h-4" />}
                  className="flex-1"
                  id="go-online-btn"
                >
                  {tracking.gpsLoading ? 'Requesting GPS…' : 'Go Online'}
                </Button>
              ) : (
                <Button
                  variant="danger"
                  onClick={stopTracking}
                  leftIcon={<WifiOff className="w-4 h-4" />}
                  className="flex-1"
                  id="go-offline-btn"
                >
                  Go Offline
                </Button>
              )}
            </div>
          </Card>

          {/* Information Notice */}
          <Alert variant="info">
            <p className="text-xs leading-relaxed">
              <strong>Important:</strong> Location sharing requires this browser tab to remain
              active. If you lock your phone, switch apps, or close the browser, tracking may
              pause or stop. This is a known browser limitation — the app cannot guarantee
              continuous background tracking. Always press <em>Go Offline</em> before closing.
            </p>
          </Alert>
        </>
      )}

      <div className="mt-6 text-center">
        <button
          onClick={refreshDriverProfile}
          className="inline-flex items-center gap-1.5 text-xs text-[#737373] hover:text-[#A3A3A3] transition-colors"
        >
          <RefreshCw className="w-3 h-3" /> Refresh account status
        </button>
      </div>
    </div>
  )
}

export default function DriverDashboardPage() {
  return (
    <ProtectedRoute requireDriver>
      <DriverDashboardContent />
    </ProtectedRoute>
  )
}
