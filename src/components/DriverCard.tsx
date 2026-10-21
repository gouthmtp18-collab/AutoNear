// ============================================================
// AutoNear — Driver Card Component (Nearby Results Panel)
// ============================================================

import React from 'react'
import { MapPin, Clock, Navigation, Car, Crosshair } from 'lucide-react'
import { NearbyDriver, LOCATION_STALE_THRESHOLD_SECONDS } from '../types'
import { formatRelativeTime, formatDistance, isLocationStale } from '../utils/geo'
import { Badge } from './ui'

interface DriverCardProps {
  driver: NearbyDriver
  onFocusOnMap: (uid: string) => void
  selected?: boolean
}

export default function DriverCard({ driver, onFocusOnMap, selected = false }: DriverCardProps) {
  const { profile, location, distanceKm } = driver
  const stale = isLocationStale(location.timestamp, LOCATION_STALE_THRESHOLD_SECONDS)

  return (
    <div
      className={`
        bg-[#171717] border rounded-xl p-4 transition-all duration-200 animate-slide-up
        ${selected
          ? 'border-[#F5F5F5]/30 ring-1 ring-[#F5F5F5]/10'
          : 'border-[#303030] hover:border-[#3a3a3a]'
        }
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-[#202020] border border-[#303030] rounded-lg flex items-center justify-center text-lg">
            🛺
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#F5F5F5] leading-tight">
              {profile.fullName}
            </h3>
            <p className="text-xs text-[#737373] mt-0.5 flex items-center gap-1">
              <Car className="w-3 h-3" />
              {profile.vehicleRegNumber}
            </p>
          </div>
        </div>
        <Badge variant={stale ? 'offline' : 'online'} dot>
          {stale ? 'May be outdated' : 'Live'}
        </Badge>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="flex items-center gap-1.5 text-xs text-[#A3A3A3]">
          <Navigation className="w-3.5 h-3.5 text-[#737373]" />
          <span className="font-medium text-[#F5F5F5]">{formatDistance(distanceKm)}</span>
          <span>away</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#A3A3A3]">
          <Clock className="w-3.5 h-3.5 text-[#737373]" />
          {formatRelativeTime(location.timestamp)}
        </div>
        {location.accuracy > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-[#A3A3A3] col-span-2">
            <Crosshair className="w-3.5 h-3.5 text-[#737373]" />
            GPS accuracy ±{Math.round(location.accuracy)} m
          </div>
        )}
      </div>

      {/* Stale warning */}
      {stale && (
        <p className="text-xs text-[#fbbf24] mb-3 flex items-center gap-1.5">
          ⚠️ Location was last updated {formatRelativeTime(location.timestamp)}.
          This may not reflect the driver's current position.
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onFocusOnMap(profile.uid)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium
            bg-[#202020] hover:bg-[#2a2a2a] border border-[#303030] hover:border-[#3a3a3a]
            text-[#F5F5F5] rounded-lg transition-colors"
        >
          <MapPin className="w-3.5 h-3.5" />
          View on Map
        </button>
      </div>
    </div>
  )
}
