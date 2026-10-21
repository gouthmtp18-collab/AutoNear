// ============================================================
// AutoNear — Passenger Login Page
// ============================================================

import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MapPin, Eye, EyeOff } from 'lucide-react'
import { signIn, getUserProfile, isAdmin } from '../services/authService'
import { FormField, Alert, Button } from '../components/ui'
import { GuestOnlyRoute } from '../components/ProtectedRoute'

function LoginForm() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password) {
      setError('Please enter your email and password.')
      return
    }
    setLoading(true)
    try {
      const user = await signIn(email.trim().toLowerCase(), password)
      const [profile, admin] = await Promise.all([
        getUserProfile(user.uid),
        isAdmin(user.uid),
      ])
      if (admin) {
        navigate('/admin')
      } else if (profile?.role === 'driver') {
        navigate('/driver-dashboard')
      } else {
        navigate('/find')
      }
    } catch (err: unknown) {
      const code = (err as { code?: string }).code
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError('Incorrect email or password. Please try again.')
      } else if (code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please wait a few minutes before trying again.')
      } else if (code === 'auth/network-request-failed') {
        setError('Network error. Please check your connection and try again.')
      } else {
        setError('Sign in failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm animate-slide-up">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-8 h-8 bg-[#F5F5F5] rounded-lg flex items-center justify-center">
            <MapPin className="w-4 h-4 text-[#090909]" />
          </div>
          <span className="text-[#F5F5F5] font-bold text-lg">AutoNear</span>
        </div>

        <div className="bg-[#111111] border border-[#303030] rounded-2xl p-7">
          <h1 className="text-xl font-bold text-[#F5F5F5] mb-1">Sign In</h1>
          <p className="text-sm text-[#737373] mb-6">
            Access your passenger or driver account.
          </p>

          {error && (
            <Alert variant="error" className="mb-5">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <FormField
              id="login-email"
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              placeholder="you@example.com"
            />

            <div className="relative">
              <FormField
                id="login-password"
                label="Password"
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-[34px] text-[#737373] hover:text-[#A3A3A3] transition-colors"
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full mt-2"
              id="login-submit-btn"
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#303030] space-y-3 text-center">
            <p className="text-sm text-[#737373]">
              New passenger?{' '}
              <Link to="/register" className="text-[#F5F5F5] hover:underline font-medium">
                Create an account
              </Link>
            </p>
            <p className="text-sm text-[#737373]">
              Auto driver?{' '}
              <Link to="/register-driver" className="text-[#F5F5F5] hover:underline font-medium">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <GuestOnlyRoute>
      <LoginForm />
    </GuestOnlyRoute>
  )
}
