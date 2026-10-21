// ============================================================
// AutoNear — Driver Service
// ============================================================

import { ref, get, set, update, onValue, off, DataSnapshot } from 'firebase/database'
import { db } from '../config/firebase'
import { DB_PATHS, DriverApprovalStatus, DriverProfile, DriverLocation } from '../types'

// ---- Driver Profile ----

export async function getDriverProfile(uid: string): Promise<DriverProfile | null> {
  const snap = await get(ref(db, `${DB_PATHS.drivers}/${uid}`))
  return snap.exists() ? (snap.val() as DriverProfile) : null
}

export async function updateDriverProfile(
  uid: string,
  updates: Partial<Pick<DriverProfile, 'fullName' | 'phone' | 'vehicleRegNumber'>>
): Promise<void> {
  await update(ref(db, `${DB_PATHS.drivers}/${uid}`), {
    ...updates,
    updatedAt: Date.now(),
  })
}

// ---- Admin: Driver Approval ----

export async function updateDriverApprovalStatus(
  uid: string,
  status: DriverApprovalStatus,
  approvedBy?: string,
  reason?: string
): Promise<void> {
  const updates: Partial<DriverProfile> = {
    approvalStatus: status,
    updatedAt: Date.now(),
  }
  if (status === 'approved' && approvedBy) {
    updates.approvedAt = Date.now()
    updates.approvedBy = approvedBy
  }
  if ((status === 'rejected' || status === 'suspended') && reason) {
    if (status === 'rejected') updates.rejectionReason = reason
    if (status === 'suspended') updates.suspensionReason = reason
  }
  await update(ref(db, `${DB_PATHS.drivers}/${uid}`), updates)
}

// ---- All Drivers (admin) ----

export function subscribeToAllDrivers(
  callback: (drivers: DriverProfile[]) => void
): () => void {
  const driversRef = ref(db, DB_PATHS.drivers)
  const handler = (snap: DataSnapshot) => {
    if (!snap.exists()) {
      callback([])
      return
    }
    const drivers: DriverProfile[] = []
    snap.forEach((child) => {
      drivers.push(child.val() as DriverProfile)
    })
    callback(drivers)
  }
  onValue(driversRef, handler)
  return () => off(driversRef, 'value', handler)
}

// ---- Location: Publish ----

export async function publishDriverLocation(
  uid: string,
  latitude: number,
  longitude: number,
  accuracy: number
): Promise<void> {
  const location: DriverLocation = {
    uid,
    latitude,
    longitude,
    accuracy,
    timestamp: Date.now(),
    isOnline: true,
  }
  await set(ref(db, `${DB_PATHS.locations}/${uid}`), location)
}

// ---- Location: Go Offline ----

export async function setDriverOffline(uid: string): Promise<void> {
  await set(ref(db, `${DB_PATHS.locations}/${uid}`), {
    uid,
    latitude: 0,
    longitude: 0,
    accuracy: 0,
    timestamp: Date.now(),
    isOnline: false,
  })
}

// ---- Location: Subscribe to all online locations ----

export function subscribeToOnlineDriverLocations(
  callback: (locations: DriverLocation[]) => void
): () => void {
  const locRef = ref(db, DB_PATHS.locations)
  const handler = (snap: DataSnapshot) => {
    if (!snap.exists()) {
      callback([])
      return
    }
    const locs: DriverLocation[] = []
    snap.forEach((child) => {
      const loc = child.val() as DriverLocation
      if (loc.isOnline) locs.push(loc)
    })
    callback(locs)
  }
  onValue(locRef, handler)
  return () => off(locRef, 'value', handler)
}

// ---- Location: Get single driver ----

export async function getDriverLocation(uid: string): Promise<DriverLocation | null> {
  const snap = await get(ref(db, `${DB_PATHS.locations}/${uid}`))
  return snap.exists() ? (snap.val() as DriverLocation) : null
}

// ---- Pending drivers count ----

export async function getPendingDrivers(): Promise<DriverProfile[]> {
  const snap = await get(ref(db, DB_PATHS.drivers))
  if (!snap.exists()) return []
  const pending: DriverProfile[] = []
  snap.forEach((child) => {
    const d = child.val() as DriverProfile
    if (d.approvalStatus === 'pending') pending.push(d)
  })
  return pending
}
