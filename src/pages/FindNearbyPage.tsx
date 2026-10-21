// ============================================================
// AutoNear — Find Nearby Autos (Main Passenger Feature)
// ============================================================

import React, { useState, useCallback, Suspense, lazy } from 'react'
import {
  MapPin, Navigation, Search, RotateCcw,
  SlidersHorizontal, Car
} from 'lucide-react'
import { useNearbyDrivers } from '../hooks/useNearbyDrivers'
import { PassengerLocation, SearchFilters, RadiusOption, SortOption } from '../types'
import { isValidCoordinate } from '../utils/geo'
import { Alert, Badge, Button, Spinner } from '../components/ui'
import DriverCard from '../components/DriverCard'
import { AuthOnlyRoute } from '../components/ProtectedRoute'

// Lazy-load the map to avoid SSR issues with Leaflet
const AutoNearMap = lazy(() => import('../components/AutoNearMap'))

const RADIUS_OPTIONS: { value: RadiusOption; label: string }[] = [
  { value: 1, label: '1 km' },
  { value: 3, label: '3 km' },
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km' },
  { value: 25, label: '25 km' },
  { value: 50, label: '50 km' },
]

const defaultFilters: SearchFilters = {
  radius: 50,
  sort: 'distance',
  onlineOnly: true,
}

function FindNearbyContent() {
  const [passenger, setPassenger] = useState<PassengerLocation | null>(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters)
  const [searchActive, setSearchActive] = useState(false)
  const [focusDriverId, setFocusDriverId] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const { drivers, loading: driversLoading, error: driversError } = useNearbyDrivers({
    passengerLat: passenger?.latitude ?? null,
    passengerLon: passenger?.longitude ?? null,
    filters,
    enabled: searchActive && passenger !== null,
  })

  const getMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser.')
      return
    }
    setLocationLoading(true)
    setLocationError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords
        if (!isValidCoordinate(latitude, longitude)) {
          setLocationError(
            'Invalid GPS coordinates received. Please try again with a better signal.'
          )
          setLocationLoading(false)
          return
        }
        setPassenger({ latitude, longitude, accuracy })
        setLocationLoading(false)
        setSearchActive(true)
      },
      (err) => {
        let msg: string
        switch (err.code) {
          case err.PERMISSION_DENIED:
            msg =
              'Location permission denied. Please allow location access in your browser settings, then try again.'
            break
          case err.POSITION_UNAVAILABLE:
            msg =
              'Location unavailable. Please ensure GPS or network location is enabled on your device.'
            break
          case err.TIMEOUT:
            msg = 'Location request timed out. Please check your GPS signal and try again.'
            break
          default:
            msg = 'Failed to get your location. Please try again.'
        }
        setLocationError(msg)
        setLocationLoading(false)
      },
      { enableHighAccuracy: true, timeout: 15000 }
    )
  }, [])

  const handleSearch = () => {
    if (!passenger) {
      setLocationError('Please use your current location first.')
      return
    }
    setSearchActive(true)
    setFocusDriverId(null)
  }

  const handleReset = () => {
    setSearchActive(false)
    setFocusDriverId(null)
    setPassenger(null)
    setLocationError(null)
    setFilters(defaultFilters)
  }

  const updateFilter = <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
    setFilters((f) => ({ ...f, [key]: value }))
  }

  return (
    <div className="flex-1 flex flex-col h-full animate-fade-in" style={{ minHeight: 0 }}>
      {/* ── Top Controls ─────────────────────────────────────── */}
      <div className="border-b border-[#303030] bg-[#090909] px-4 py-3">
        <div className="max-w-7xl mx-auto">
          {/* Title row */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-base font-bold text-[#F5F5F5]">Find Nearby Autos</h1>
              <p className="text-xs text-[#737373]">
                {passenger
                  ? `Searching within ${filters.radius} km`
                  : 'Share your location to begin'}
              </p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#A3A3A3]
                hover:text-[#F5F5F5] border border-[#303030] rounded-lg hover:border-[#3a3a3a]
                transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filters
            </button>
          </div>

          {/* Location button row */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={passenger ? 'secondary' : 'primary'}
              size="sm"
              onClick={getMyLocation}
              loading={locationLoading}
              leftIcon={<Navigation className="w-3.5 h-3.5" />}
              id="use-location-btn"
            >
              {passenger ? 'Update My Location' : 'Use My Current Location'}
            </Button>

            {passenger && (
              <Button
                size="sm"
                onClick={handleSearch}
                leftIcon={<Search className="w-3.5 h-3.5" />}
                id="search-autos-btn"
              >
                Search
              </Button>
            )}

            {(passenger || searchActive) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              >
                Reset
              </Button>
            )}

            {searchActive && (
              <div className="flex items-center gap-1.5 ml-auto">
                <Badge variant={drivers.length > 0 ? 'online' : 'offline'} dot>
                  {driversLoading ? 'Searching…' : `${drivers.length} found`}
                </Badge>
              </div>
            )}
          </div>

          {/* Filters panel */}
          {showFilters && (
            <div className="mt-3 p-3 bg-[#111111] border border-[#303030] rounded-xl
              flex flex-wrap gap-4 animate-fade-in">
              {/* Radius */}
              <div>
                <label className="text-xs text-[#737373] block mb-1.5">Search Radius</label>
                <div className="flex gap-1.5">
                  {RADIUS_OPTIONS.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => updateFilter('radius', value)}
                      className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${
                        filters.radius === value
                          ? 'bg-[#F5F5F5] text-[#090909] border-[#F5F5F5]'
                          : 'bg-[#171717] text-[#A3A3A3] border-[#303030] hover:border-[#3a3a3a]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div>
                <label className="text-xs text-[#737373] block mb-1.5">Sort By</label>
                <div className="flex gap-1.5">
                  {(['distance', 'name'] as SortOption[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => updateFilter('sort', s)}
                      className={`px-2.5 py-1 text-xs rounded-lg border transition-colors capitalize ${
                        filters.sort === s
                          ? 'bg-[#F5F5F5] text-[#090909] border-[#F5F5F5]'
                          : 'bg-[#171717] text-[#A3A3A3] border-[#303030] hover:border-[#3a3a3a]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Errors */}
          {locationError && (
            <Alert variant="error" className="mt-3">
              {locationError}
            </Alert>
          )}
          {driversError && (
            <Alert variant="error" className="mt-3">
              {driversError}
            </Alert>
          )}
        </div>
      </div>

      {/* ── Map + Results ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden" style={{ minHeight: '500px' }}>
        {/* Map */}
        <div className="flex-1 relative" style={{ minHeight: '300px' }}>
          <Suspense
            fallback={
              <div className="w-full h-full flex items-center justify-center bg-[#111111]">
                <Spinner className="w-8 h-8" />
              </div>
            }
          >
            <AutoNearMap
              passenger={passenger}
              drivers={searchActive ? drivers : []}
              focusDriverId={focusDriverId}
              height="100%"
            />
          </Suspense>

          {/* Overlay: not started */}
          {!passenger && (
            <div className="absolute inset-0 flex items-center justify-center
              bg-[#090909]/75 backdrop-blur-sm pointer-events-none">
              <div className="text-center px-6">
                <MapPin className="w-10 h-10 text-[#303030] mx-auto mb-3" />
                <p className="text-[#A3A3A3] font-medium text-sm">
                  Click "Use My Current Location" to begin
                </p>
                <p className="text-[#737373] text-xs mt-1">
                  Your browser will ask for location permission
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Results Panel */}
        <div className="lg:w-80 xl:w-96 border-t lg:border-t-0 lg:border-l border-[#303030]
          bg-[#090909] overflow-y-auto flex flex-col"
          style={{ maxHeight: '100%' }}
        >
          <div className="px-4 py-3 border-b border-[#303030] flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#F5F5F5] flex items-center gap-2">
              <Car className="w-4 h-4 text-[#737373]" />
              Nearby Autos
            </h2>
            {searchActive && (
              <span className="text-xs text-[#737373]">
                within {filters.radius} km
              </span>
            )}
          </div>

          <div className="flex-1 px-3 py-3 space-y-3 overflow-y-auto">
            {!searchActive || !passenger ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Navigation className="w-8 h-8 text-[#303030] mb-3" />
                <p className="text-[#737373] text-sm">
                  Use your location to see nearby autos
                </p>
              </div>
            ) : driversLoading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Spinner className="w-6 h-6 mb-3" />
                <p className="text-[#737373] text-xs">Finding autos nearby…</p>
              </div>
            ) : drivers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                <div className="w-12 h-12 bg-[#171717] border border-[#303030] rounded-full
                  flex items-center justify-center mb-4 text-2xl">
                  🛺
                </div>
                <p className="text-[#A3A3A3] font-medium text-sm mb-1">
                  No available autos found nearby
                </p>
                <p className="text-[#737373] text-xs leading-relaxed">
                  No registered drivers are currently online and sharing
                  their location within {filters.radius} km of your position.
                </p>
              </div>
            ) : (
              drivers.map((driver) => (
                <DriverCard
                  key={driver.profile.uid}
                  driver={driver}
                  onFocusOnMap={(uid) => setFocusDriverId(uid)}
                  selected={focusDriverId === driver.profile.uid}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function FindNearbyPage() {
  return (
    <AuthOnlyRoute>
      <FindNearbyContent />
    </AuthOnlyRoute>
  )
}
