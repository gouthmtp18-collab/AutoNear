// ============================================================
// AutoNear — Protected Route Components
// ============================================================

import React, { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext'
import { Spinner } from './ui'

interface ProtectedRouteProps {
  children: ReactNode
  requireAdmin?: boolean
  requireDriver?: boolean
  requirePassenger?: boolean
}

function LoadingScreen() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <Spinner className="w-8 h-8 mx-auto mb-3" />
        <p className="text-[#737373] text-sm">Verifying session…</p>
      </div>
    </div>
  )
}

export function ProtectedRoute({
  children,
  requireAdmin = false,
  requireDriver = false,
  requirePassenger = false,
}: ProtectedRouteProps) {
  const { user, userProfile, adminStatus, loading } = useAuth()

  if (loading) return <LoadingScreen />

  if (!user) return <Navigate to="/login" replace />

  if (requireAdmin && !adminStatus) {
    return <Navigate to="/" replace />
  }

  if (requireDriver && userProfile?.role !== 'driver' && !adminStatus) {
    return <Navigate to="/" replace />
  }

  if (requirePassenger && userProfile?.role !== 'passenger' && !adminStatus) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export function AuthOnlyRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

export function GuestOnlyRoute({ children }: { children: ReactNode }) {
  const { user, loading, userProfile, adminStatus } = useAuth()
  if (loading) return <LoadingScreen />
  if (user) {
    if (adminStatus) return <Navigate to="/admin" replace />
    if (userProfile?.role === 'driver') return <Navigate to="/driver-dashboard" replace />
    return <Navigate to="/find" replace />
  }
  return <>{children}</>
}
