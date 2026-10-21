// ============================================================
// AutoNear — Map Component (Leaflet + React-Leaflet)
// ============================================================

import React, { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { NearbyDriver, PassengerLocation, LOCATION_STALE_THRESHOLD_SECONDS } from '../types'
import { formatRelativeTime, formatDistance, isLocationStale } from '../utils/geo'
import { Badge } from './ui'

// Fix default Leaflet marker icons (broken in Webpack/Vite builds)
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// ---- Handle map size calculation on mobile/responsive layouts ----

function InvalidateMapSize() {
  const map = useMap()

  useEffect(() => {
    // Initial size calculation
    map.invalidateSize()

    // Additional passes after animations / flex layout settles
    const timer1 = setTimeout(() => map.invalidateSize(), 150)
    const timer2 = setTimeout(() => map.invalidateSize(), 500)

    const handleResize = () => {
      map.invalidateSize()
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
    }
  }, [map])

  return null
}

// ---- Custom Icons ----

const driverIcon = L.divIcon({
  className: '',
  html: `<div class="driver-marker-icon">🛺</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
})

const staleDriverIcon = L.divIcon({
  className: '',
  html: `<div class="driver-marker-icon stale">🛺</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
})

const passengerIcon = L.divIcon({
  className: '',
  html: `<div class="passenger-marker-icon">📍</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
})

// ---- Map Recenter Control ----

function RecenterControl({
  center,
  zoom,
}: {
  center: [number, number]
  zoom: number
}) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom)
  }, [center, zoom, map])
  return null
}

interface RecenterButtonProps {
  passengerLat: number
  passengerLon: number
}

function RecenterButton({ passengerLat, passengerLon }: RecenterButtonProps) {
  const map = useMap()
  return (
    <div className="leaflet-top leaflet-right" style={{ marginTop: '10px', marginRight: '10px' }}>
      <div className="leaflet-control">
        <button
          onClick={() => map.setView([passengerLat, passengerLon], 14)}
          title="Go to my location"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            background: '#171717',
            border: '1px solid #303030',
            borderRadius: '6px',
            color: '#F5F5F5',
            cursor: 'pointer',
            fontSize: '16px',
          }}
        >
          ◎
        </button>
      </div>
    </div>
  )
}

// ---- Main Map Props ----

interface AutoNearMapProps {
  passenger: PassengerLocation | null
  drivers: NearbyDriver[]
  focusDriverId?: string | null
  defaultCenter?: [number, number]
  defaultZoom?: number
  height?: string
}

// Default center: Bengaluru, India
const DEFAULT_CENTER: [number, number] = [12.9716, 77.5946]
const DEFAULT_ZOOM = 13

export default function AutoNearMap({
  passenger,
  drivers,
  focusDriverId,
  defaultCenter = DEFAULT_CENTER,
  defaultZoom = DEFAULT_ZOOM,
  height = '100%',
}: AutoNearMapProps) {
  const mapRef = useRef<L.Map | null>(null)

  // Focus on a specific driver when focusDriverId changes
  useEffect(() => {
    if (focusDriverId && mapRef.current) {
      const driver = drivers.find((d) => d.profile.uid === focusDriverId)
      if (driver) {
        mapRef.current.setView(
          [driver.location.latitude, driver.location.longitude],
          16,
          { animate: true }
        )
      }
    }
  }, [focusDriverId, drivers])

  const center: [number, number] = passenger
    ? [passenger.latitude, passenger.longitude]
    : defaultCenter

  return (
    <MapContainer
      center={center}
      zoom={DEFAULT_ZOOM}
      style={{ height, width: '100%' }}
      zoomControl={false}
      ref={mapRef}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        maxZoom={19}
      />

      <ZoomControl position="topleft" />
      <InvalidateMapSize />

      {/* Passenger Location */}
      {passenger && (
        <>
          <RecenterControl center={[passenger.latitude, passenger.longitude]} zoom={defaultZoom} />
          <RecenterButton passengerLat={passenger.latitude} passengerLon={passenger.longitude} />
          <Marker
            position={[passenger.latitude, passenger.longitude]}
            icon={passengerIcon}
          >
            <Popup>
              <div className="text-center">
                <p className="font-semibold text-sm">Your Location</p>
                {passenger.accuracy && (
                  <p className="text-xs text-[#737373] mt-1">
                    Accuracy: ±{Math.round(passenger.accuracy)} m
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        </>
      )}

      {/* Driver Markers */}
      {drivers.map((driver) => {
        const stale = isLocationStale(
          driver.location.timestamp,
          LOCATION_STALE_THRESHOLD_SECONDS
        )
        return (
          <Marker
            key={driver.profile.uid}
            position={[driver.location.latitude, driver.location.longitude]}
            icon={stale ? staleDriverIcon : driverIcon}
          >
            <Popup>
              <div style={{ minWidth: '180px', fontFamily: 'Inter, sans-serif' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm">{driver.profile.fullName}</span>
                  {stale ? (
                    <span className="text-xs text-[#fbbf24]">Location may be outdated</span>
                  ) : (
                    <span
                      className="inline-flex items-center gap-1 text-xs"
                      style={{ color: '#4ade80' }}
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          background: '#4ade80',
                          borderRadius: '50%',
                          display: 'inline-block',
                        }}
                      />
                      Live
                    </span>
                  )}
                </div>
                <div className="space-y-1 text-xs text-[#A3A3A3]">
                  <p>🚗 {driver.profile.vehicleRegNumber}</p>
                  <p>📍 {formatDistance(driver.distanceKm)} away</p>
                  <p>🕐 Updated {formatRelativeTime(driver.location.timestamp)}</p>
                  {driver.location.accuracy > 0 && (
                    <p>🎯 Accuracy ±{Math.round(driver.location.accuracy)} m</p>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
