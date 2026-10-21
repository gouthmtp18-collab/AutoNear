// ============================================================
// AutoNear — Passenger Registration Page
// ============================================================

import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MapPin, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { registerPassenger } from '../services/authService'
import {
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
} from '../utils/validation'
import { FormField, Alert, Button } from '../components/ui'
import { GuestOnlyRoute } from '../components/ProtectedRoute'

function RegisterForm() {
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPw, setShowPw] = useState(false)
  const [globalError, setGlobalError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const update = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((e) => ({ ...e, [field]: '' }))
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    const emailR = validateEmail(form.email)
    if (!emailR.valid) newErrors.email = emailR.error!
    const pwR = validatePassword(form.password)
    if (!pwR.valid) newErrors.password = pwR.error!
    const cfR = validatePasswordConfirmation(form.password, form.confirm)
    if (!cfR.valid) newErrors.confirm = cfR.error!
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGlobalError('')
    if (!validate()) return
    setLoading(true)
    try {
      await registerPassenger(form.email.trim().toLowerCase(), form.password)
      setSuccess(true)
    } catch (err: unknown) {
      const code = (err as { code?: string }).code
      if (code === 'auth/email-already-in-use') {
        setGlobalError(
          'An account with this email already exists. Please sign in instead.'
        )
      } else if (code === 'auth/weak-password') {
        setGlobalError('Password is too weak. Please choose a stronger password.')
      } else if (code === 'auth/network-request-failed') {
        setGlobalError('Network error. Please check your connection and try again.')
      } else {
        setGlobalError('Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm text-center animate-slide-up">
          <div className="w-16 h-16 bg-[#0d1f0f] border border-[#1a3a1e] rounded-full
            flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-8 h-8 text-[#4ade80]" />
          </div>
          <h1 className="text-xl font-bold text-[#F5F5F5] mb-2">Account Created</h1>
          <p className="text-sm text-[#737373] mb-6">
            A verification email has been sent to{' '}
            <span className="text-[#A3A3A3]">{form.email}</span>.
            Please verify your email, then sign in.
          </p>
          <Button onClick={() => navigate('/login')} className="w-full">
            Go to Sign In
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-8 h-8 bg-[#F5F5F5] rounded-lg flex items-center justify-center">
            <MapPin className="w-4 h-4 text-[#090909]" />
          </div>
          <span className="text-[#F5F5F5] font-bold text-lg">AutoNear</span>
        </div>

        <div className="bg-[#111111] border border-[#303030] rounded-2xl p-7">
          <h1 className="text-xl font-bold text-[#F5F5F5] mb-1">Passenger Sign Up</h1>
          <p className="text-sm text-[#737373] mb-6">
            Create an account to search for nearby autos.
          </p>

          {globalError && (
            <Alert variant="error" className="mb-5">{globalError}</Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <FormField
              id="reg-email"
              label="Email Address"
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              error={errors.email}
              autoComplete="email"
              required
              placeholder="you@example.com"
            />

            <div className="relative">
              <FormField
                id="reg-password"
                label="Password"
                type={showPw ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                error={errors.password}
                hint="Min. 8 characters, 1 uppercase, 1 number"
                autoComplete="new-password"
                required
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-[34px] text-[#737373] hover:text-[#A3A3A3]"
                aria-label={showPw ? 'Hide' : 'Show'}
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <FormField
              id="reg-confirm"
              label="Confirm Password"
              type="password"
              value={form.confirm}
              onChange={(e) => update('confirm', e.target.value)}
              error={errors.confirm}
              autoComplete="new-password"
              required
              placeholder="••••••••"
            />

            <Button type="submit" loading={loading} className="w-full mt-2" id="register-submit-btn">
              Create Account
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-[#737373]">
            Already have an account?{' '}
            <Link to="/login" className="text-[#F5F5F5] hover:underline font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <GuestOnlyRoute>
      <RegisterForm />
    </GuestOnlyRoute>
  )
}
