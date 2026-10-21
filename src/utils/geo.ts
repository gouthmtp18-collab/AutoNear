// ============================================================
// AutoNear — Haversine Distance Utility
// ============================================================

/**
 * Calculate the great-circle distance between two GPS coordinates
 * using the Haversine formula.
 *
 * @param lat1 Latitude of point A (degrees)
 * @param lon1 Longitude of point A (degrees)
 * @param lat2 Latitude of point B (degrees)
 * @param lon2 Longitude of point B (degrees)
 * @returns Distance in kilometres
 */
export function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Earth's mean radius in km
  const toRad = (deg: number) => (deg * Math.PI) / 180

  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Returns true if the given latitude/longitude values are plausibly valid.
 * Does NOT guarantee real-world accuracy — only basic sanity check.
 */
export function isValidCoordinate(lat: number, lon: number): boolean {
  return (
    typeof lat === 'number' &&
    typeof lon === 'number' &&
    isFinite(lat) &&
    isFinite(lon) &&
    lat >= -90 &&
    lat <= 90 &&
    lon >= -180 &&
    lon <= 180 &&
    // Reject the null island (0,0) which can indicate a GPS failure
    !(lat === 0 && lon === 0)
  )
}

/**
 * Format a distance in km to a human-readable string.
 */
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`
  return `${km.toFixed(1)} km`
}

/**
 * Format a Unix timestamp to a relative time string.
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diffMs = now - timestamp
  const diffSec = Math.floor(diffMs / 1000)

  if (diffSec < 5) return 'Just now'
  if (diffSec < 60) return `${diffSec}s ago`
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  return new Date(timestamp).toLocaleDateString()
}

/**
 * Check whether a location timestamp is considered stale.
 * @param timestamp Unix timestamp in milliseconds
 * @param thresholdSeconds Max acceptable age in seconds
 */
export function isLocationStale(
  timestamp: number,
  thresholdSeconds: number = 60
): boolean {
  return (Date.now() - timestamp) / 1000 > thresholdSeconds
}
