// ============================================================
// AutoNear — Unit Tests
// ============================================================

import { describe, it, expect } from 'vitest'
import { haversineDistanceKm, isValidCoordinate, isLocationStale, formatDistance, formatRelativeTime } from '../utils/geo'
import { validateFullName, validateEmail, validatePhone, validateVehicleRegNumber, validatePassword, validatePasswordConfirmation } from '../utils/validation'

// ── Haversine Distance ────────────────────────────────────────

describe('haversineDistanceKm', () => {
  it('returns 0 for identical coordinates', () => {
    expect(haversineDistanceKm(12.9716, 77.5946, 12.9716, 77.5946)).toBeCloseTo(0, 3)
  })

  it('calculates Bengaluru to Mumbai (~840km)', () => {
    const d = haversineDistanceKm(12.9716, 77.5946, 19.0760, 72.8777)
    expect(d).toBeGreaterThan(800)
    expect(d).toBeLessThan(900)
  })

  it('respects 1km filter', () => {
    // ~111m per 0.001 degree latitude
    const d = haversineDistanceKm(12.9716, 77.5946, 12.9726, 77.5946)
    expect(d).toBeLessThan(1)
  })

  it('correctly identifies a driver outside 5km radius', () => {
    const d = haversineDistanceKm(12.9716, 77.5946, 13.0827, 80.2707) // Chennai
    expect(d).toBeGreaterThan(5)
  })

  it('handles north/south pole coordinates', () => {
    const d = haversineDistanceKm(90, 0, -90, 0)
    expect(d).toBeCloseTo(20015, -2) // Half of Earth's circumference
  })
})

// ── Coordinate Validation ─────────────────────────────────────

describe('isValidCoordinate', () => {
  it('accepts valid coordinates', () => {
    expect(isValidCoordinate(12.9716, 77.5946)).toBe(true)
    expect(isValidCoordinate(-33.8688, 151.2093)).toBe(true)
  })

  it('rejects null island (0, 0)', () => {
    expect(isValidCoordinate(0, 0)).toBe(false)
  })

  it('rejects out-of-range latitude', () => {
    expect(isValidCoordinate(91, 0)).toBe(false)
    expect(isValidCoordinate(-91, 0)).toBe(false)
  })

  it('rejects out-of-range longitude', () => {
    expect(isValidCoordinate(0, 181)).toBe(false)
    expect(isValidCoordinate(0, -181)).toBe(false)
  })

  it('rejects non-finite values', () => {
    expect(isValidCoordinate(NaN, 77)).toBe(false)
    expect(isValidCoordinate(12, Infinity)).toBe(false)
  })
})

// ── Location Staleness ────────────────────────────────────────

describe('isLocationStale', () => {
  it('fresh location is not stale', () => {
    expect(isLocationStale(Date.now() - 10_000, 60)).toBe(false)
  })

  it('60-second-old location is stale with default threshold', () => {
    expect(isLocationStale(Date.now() - 61_000, 60)).toBe(true)
  })

  it('exactly at threshold is stale', () => {
    expect(isLocationStale(Date.now() - 60_001, 60)).toBe(true)
  })

  it('respects custom threshold', () => {
    expect(isLocationStale(Date.now() - 30_000, 120)).toBe(false)
    expect(isLocationStale(Date.now() - 121_000, 120)).toBe(true)
  })
})

// ── Distance Formatting ───────────────────────────────────────

describe('formatDistance', () => {
  it('formats sub-km distances in metres', () => {
    expect(formatDistance(0.5)).toBe('500 m')
  })

  it('formats km distances with 1 decimal', () => {
    expect(formatDistance(2.35)).toBe('2.4 km')
  })

  it('formats 1km exactly', () => {
    expect(formatDistance(1.0)).toBe('1.0 km')
  })
})

// ── Validation: Full Name ─────────────────────────────────────

describe('validateFullName', () => {
  it('accepts valid names', () => {
    expect(validateFullName('Ravi Kumar').valid).toBe(true)
    expect(validateFullName("O'Brien").valid).toBe(true)
  })

  it('rejects empty name', () => {
    expect(validateFullName('').valid).toBe(false)
  })

  it('rejects single character', () => {
    expect(validateFullName('A').valid).toBe(false)
  })

  it('rejects names with numbers', () => {
    expect(validateFullName('User123').valid).toBe(false)
  })
})

// ── Validation: Email ─────────────────────────────────────────

describe('validateEmail', () => {
  it('accepts valid emails', () => {
    expect(validateEmail('test@example.com').valid).toBe(true)
    expect(validateEmail('user+tag@sub.domain.org').valid).toBe(true)
  })

  it('rejects missing @ symbol', () => {
    expect(validateEmail('testexample.com').valid).toBe(false)
  })

  it('rejects empty input', () => {
    expect(validateEmail('').valid).toBe(false)
  })
})

// ── Validation: Phone ─────────────────────────────────────────

describe('validatePhone', () => {
  it('accepts 10-digit Indian mobile numbers', () => {
    expect(validatePhone('9876543210').valid).toBe(true)
    expect(validatePhone('+919876543210').valid).toBe(true)
  })

  it('rejects invalid starting digit', () => {
    expect(validatePhone('1234567890').valid).toBe(false)
  })

  it('rejects 9-digit numbers', () => {
    expect(validatePhone('987654321').valid).toBe(false)
  })
})

// ── Validation: Vehicle Registration ─────────────────────────

describe('validateVehicleRegNumber', () => {
  it('accepts valid Indian vehicle numbers', () => {
    expect(validateVehicleRegNumber('MH12AB1234').valid).toBe(true)
    expect(validateVehicleRegNumber('KA05EF4567').valid).toBe(true)
    expect(validateVehicleRegNumber('TN01C1234').valid).toBe(true)
  })

  it('rejects empty input', () => {
    expect(validateVehicleRegNumber('').valid).toBe(false)
  })

  it('rejects non-standard format', () => {
    expect(validateVehicleRegNumber('ABC-1234').valid).toBe(false)
    expect(validateVehicleRegNumber('12345678').valid).toBe(false)
  })
})

// ── Validation: Password ──────────────────────────────────────

describe('validatePassword', () => {
  it('accepts strong passwords', () => {
    expect(validatePassword('Password1').valid).toBe(true)
    expect(validatePassword('Secure@2024').valid).toBe(true)
  })

  it('rejects passwords shorter than 8 characters', () => {
    expect(validatePassword('Pass1').valid).toBe(false)
  })

  it('rejects passwords without uppercase', () => {
    expect(validatePassword('password1').valid).toBe(false)
  })

  it('rejects passwords without numbers', () => {
    expect(validatePassword('Password').valid).toBe(false)
  })
})

// ── Validation: Password Confirmation ────────────────────────

describe('validatePasswordConfirmation', () => {
  it('passes when passwords match', () => {
    expect(validatePasswordConfirmation('Password1', 'Password1').valid).toBe(true)
  })

  it('fails when passwords differ', () => {
    expect(validatePasswordConfirmation('Password1', 'Different1').valid).toBe(false)
  })

  it('fails on empty confirmation', () => {
    expect(validatePasswordConfirmation('Password1', '').valid).toBe(false)
  })
})

// ── Radius Filter Logic ───────────────────────────────────────

describe('radius filter integration', () => {
  const passengerLat = 12.9716
  const passengerLon = 77.5946

  const drivers = [
    { lat: 12.9750, lon: 77.5970 }, // ~0.4 km
    { lat: 12.9950, lon: 77.5946 }, // ~2.6 km
    { lat: 13.0827, lon: 77.5946 }, // ~12.4 km (outside 10km)
  ]

  it('1km filter includes only closest driver', () => {
    const inside = drivers.filter(
      (d) => haversineDistanceKm(passengerLat, passengerLon, d.lat, d.lon) <= 1
    )
    expect(inside.length).toBe(1)
  })

  it('3km filter includes two drivers', () => {
    const inside = drivers.filter(
      (d) => haversineDistanceKm(passengerLat, passengerLon, d.lat, d.lon) <= 3
    )
    expect(inside.length).toBe(2)
  })

  it('10km filter excludes distant driver', () => {
    const inside = drivers.filter(
      (d) => haversineDistanceKm(passengerLat, passengerLon, d.lat, d.lon) <= 10
    )
    expect(inside.length).toBe(2)
  })
})
