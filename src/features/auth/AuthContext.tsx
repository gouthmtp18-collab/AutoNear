// ============================================================
// AutoNear — Authentication Context & Provider
// ============================================================

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from 'firebase/auth'
import { observeAuthState, isAdmin, getUserProfile } from '../../services/authService'
import { getDriverProfile } from '../../services/driverService'
import { UserProfile, DriverProfile } from '../../types'

interface AuthContextValue {
  user: User | null
  userProfile: UserProfile | null
  driverProfile: DriverProfile | null
  adminStatus: boolean
  loading: boolean
  refreshDriverProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  userProfile: null,
  driverProfile: null,
  adminStatus: false,
  loading: true,
  refreshDriverProfile: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [driverProfile, setDriverProfile] = useState<DriverProfile | null>(null)
  const [adminStatus, setAdminStatus] = useState(false)
  const [loading, setLoading] = useState(true)

  const loadProfileData = async (u: User) => {
    try {
      const [uProfile, admin] = await Promise.all([
        getUserProfile(u.uid),
        isAdmin(u.uid),
      ])
      setUserProfile(uProfile)
      setAdminStatus(admin)

      if (uProfile?.role === 'driver' || admin) {
        const dProfile = await getDriverProfile(u.uid)
        setDriverProfile(dProfile)
      } else {
        setDriverProfile(null)
      }
    } catch (err) {
      console.error('[AuthContext] Failed to load profile data:', err)
    }
  }

  const refreshDriverProfile = async () => {
    if (user) {
      const dProfile = await getDriverProfile(user.uid)
      setDriverProfile(dProfile)
    }
  }

  useEffect(() => {
    const unsubscribe = observeAuthState(async (u) => {
      setUser(u)
      if (u) {
        await loadProfileData(u)
      } else {
        setUserProfile(null)
        setDriverProfile(null)
        setAdminStatus(false)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, userProfile, driverProfile, adminStatus, loading, refreshDriverProfile }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
