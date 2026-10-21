// ============================================================
// AutoNear — Authentication Service
// ============================================================

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  sendEmailVerification,
  updateProfile,
} from 'firebase/auth'
import { ref, set, get } from 'firebase/database'
import { auth, db } from '../config/firebase'
import type { UserProfile, DriverProfile } from '../types'
import { DB_PATHS } from '../types'

// ---- User Profile ----

export async function createUserProfile(
  uid: string,
  email: string,
  role: 'passenger' | 'driver'
): Promise<void> {
  const profile: UserProfile = {
    uid,
    email,
    role,
    createdAt: Date.now(),
  }
  await set(ref(db, `${DB_PATHS.users}/${uid}`), profile)
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await get(ref(db, `${DB_PATHS.users}/${uid}`))
  return snap.exists() ? (snap.val() as UserProfile) : null
}

// ---- Passenger Sign-up ----

export async function registerPassenger(
  email: string,
  password: string
): Promise<User> {
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  await createUserProfile(cred.user.uid, email, 'passenger')
  await sendEmailVerification(cred.user)
  return cred.user
}

// ---- Driver Registration ----

export async function registerDriver(
  email: string,
  password: string,
  profile: Omit<DriverProfile, 'uid' | 'createdAt' | 'updatedAt' | 'approvalStatus'>
): Promise<User> {
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  const uid = cred.user.uid
  const now = Date.now()

  // Set display name in Firebase Auth
  await updateProfile(cred.user, { displayName: profile.fullName })

  // Create user profile record
  await createUserProfile(uid, email, 'driver')

  // Create driver profile record (pending approval by default)
  const driverProfile: DriverProfile = {
    uid,
    email,
    fullName: profile.fullName,
    phone: profile.phone,
    vehicleRegNumber: profile.vehicleRegNumber,
    approvalStatus: 'pending',
    createdAt: now,
    updatedAt: now,
  }
  await set(ref(db, `${DB_PATHS.drivers}/${uid}`), driverProfile)

  await sendEmailVerification(cred.user)
  return cred.user
}

// ---- Sign In ----

export async function signIn(email: string, password: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email, password)
  return cred.user
}

// ---- Sign Out ----

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth)
}

// ---- Auth State Observer ----

export function observeAuthState(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback)
}

// ---- Admin Check ----

export async function isAdmin(uid: string): Promise<boolean> {
  const snap = await get(ref(db, `${DB_PATHS.admins}/${uid}`))
  return snap.exists() && snap.val() === true
}
