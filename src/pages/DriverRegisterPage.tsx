// ============================================================
// AutoNear — Driver Registration Page
// ============================================================

import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MapPin, Eye, EyeOff, CheckCircle, Car, Info } from 'lucide-react'
import { registerDriver } from '../services/authService'
import {
  validateFullName,
  validateEmail,
  validatePhone,
  validateVehicleRegNumber,
  validatePassword,
  validatePasswordConfirmation,
} from '../utils/validation'
import { FormField, Alert, Button } from '../components/ui'
import { GuestOnlyRoute } from '../components/ProtectedRoute'

interface DriverForm {
  fullName: string
  email: string
  phone: string
  vehicleRegNumber: string
  password: string
  confirm: string
  consent: boolean
}

const initialForm: DriverForm = {
  fullName: '',
  email: '',
  phone: '',
  vehicleRegNumber: '',
  password: '',
  confirm: '',
  consent: false,
}

function DriverRegisterForm() {
  const navigate = useNavigate()
  const [form, setForm] = useState<DriverForm>(initialForm)
  const [errors, setErrors] = useState<Partial<Record<keyof DriverForm, string>>>({})
  const [showPw, setShowPw] = useState(false)
  const [globalError, setGlobalError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [registeredName, setRegisteredName] = useState('')

  const update = (field: keyof DriverForm, value: string | boolean) => {
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((e) => ({ ...e, [field]: '' }))
  }

  const validate = (): boolean => {
    const e: Partial<Record<keyof DriverForm, string>> = {}
    const nameR = validateFullName(form.fullName)
    if (!nameR.valid) e.fullName = nameR.error
    const emailR = validateEmail(form.email)
    if (!emailR.valid) e.email = emailR.error
    const phoneR = validatePhone(form.phone)
    if (!phoneR.valid) e.phone = phoneR.error
    const regR = validateVehicleRegNumber(form.vehicleRegNumber)
    if (!regR.valid) e.vehicleRegNumber = regR.error
    const pwR = validatePassword(form.password)
    if (!pwR.valid) e.password = pwR.error
    const cfR = validatePasswordConfirmation(form.password, form.confirm)
    if (!cfR.valid) e.confirm = cfR.error
    if (!form.consent)
      e.consent = 'You must consent to the location-sharing policy to register.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    setGlobalError('')
    if (!validate()) return
    setLoading(true)
    try {
      await registerDriver(form.email.trim().toLowerCase(), form.password, {
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        vehicleRegNumber: form.vehicleRegNumber.trim().toUpperCase().replace(/\s+/g, ''),
      })
      setRegisteredName(form.fullName.trim())
      setSuccess(true)
    } catch (err: unknown) {
      const code = (err as { code?: string }).code
      if (code === 'auth/email-already-in-use') {
        setGlobalError('An account with this email already exists.')
      } else if (code === 'auth/network-request-failed') {
        setGlobalError('Network error. Please check your connection.')
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
        <div className="w-full max-w-md text-center animate-slide-up">
          <div className="w-16 h-16 bg-[#0d1f0f] border border-[#1a3a1e] rounded-full
            flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-8 h-8 text-[#4ade80]" />
          </div>
          <h1 className="text-2xl font-bold text-[#F5F5F5] mb-2">
            Registration Submitted
          </h1>
          <p className="text-sm text-[#737373] mb-3">
            Thank you, <span className="text-[#A3A3A3] font-medium">{registeredName}</span>. 
            Your application is pending admin review.
          </p>
          <div className="bg-[#111111] border border-[#303030] rounded-xl p-5 text-left mb-6 space-y-2">
            <p className="text-sm text-[#A3A3A3]">
              ✉️ A verification email has been sent to your address. Please verify it.
            </p>
            <p className="text-sm text-[#A3A3A3]">
              🕐 An administrator will review your registration and approve or reject it.
            </p>
            <p className="text-sm text-[#A3A3A3]">
              ✅ Once approved, you can log in and go online from your Driver Dashboard.
            </p>
          </div>
          <Button onClick={() => navigate('/login')} className="w-full">
            Go to Sign In
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg animate-fade-in">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-8 h-8 bg-[#F5F5F5] rounded-lg flex items-center justify-center">
            <MapPin className="w-4 h-4 text-[#090909]" />
          </div>
          <span className="text-[#F5F5F5] font-bold text-lg">AutoNear</span>
        </div>

        <div className="bg-[#111111] border border-[#303030] rounded-2xl p-7">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-[#202020] border border-[#303030] rounded-xl
              flex items-center justify-center">
              <Car className="w-5 h-5 text-[#A3A3A3]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#F5F5F5]">Driver Registration</h1>
              <p className="text-xs text-[#737373]">Register to share your live GPS location</p>
            </div>
          </div>

          <Alert variant="info" className="mb-5">
            <p className="text-xs">
              Submitting vehicle information does <strong>not</strong> automatically verify
              your official registration. An administrator will review your application
              before your account is approved.
            </p>
          </Alert>

          {globalError && (
            <Alert variant="error" className="mb-5">{globalError}</Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Personal Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                id="drv-fullname"
                label="Full Name"
                type="text"
                value={form.fullName}
                onChange={(e) => update('fullName', e.target.value)}
                error={errors.fullName}
                autoComplete="name"
                required
                placeholder="Your real name"
              />
              <FormField
                id="drv-phone"
                label="Phone Number"
                type="tel"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                error={errors.phone}
                autoComplete="tel"
                required
                placeholder="9876543210"
              />
            </div>

            <FormField
              id="drv-email"
              label="Email Address"
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              error={errors.email}
              autoComplete="email"
              required
              placeholder="you@example.com"
            />

            <FormField
              id="drv-vrn"
              label="Vehicle Registration Number"
              type="text"
              value={form.vehicleRegNumber}
              onChange={(e) => update('vehicleRegNumber', e.target.value.toUpperCase())}
              error={errors.vehicleRegNumber}
              hint="Example: MH12AB1234"
              required
              placeholder="MH12AB1234"
            />

            {/* Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <FormField
                  id="drv-password"
                  label="Password"
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  error={errors.password}
                  hint="8+ chars, 1 uppercase, 1 number"
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
                id="drv-confirm"
                label="Confirm Password"
                type="password"
                value={form.confirm}
                onChange={(e) => update('confirm', e.target.value)}
                error={errors.confirm}
                autoComplete="new-password"
                required
                placeholder="••••••••"
              />
            </div>

            {/* Consent */}
            <div className="bg-[#171717] border border-[#303030] rounded-xl p-4">
              <div className="flex items-start gap-3">
                <input
                  id="drv-consent"
                  type="checkbox"
                  checked={form.consent}
                  onChange={(e) => update('consent', e.target.checked)}
                  className="mt-0.5 w-4 h-4 flex-shrink-0 accent-[#F5F5F5]"
                />
                <label htmlFor="drv-consent" className="text-xs text-[#A3A3A3] cursor-pointer leading-relaxed">
                  I understand that when I am online, my GPS location will be shared with
                  the AutoNear service and visible to authenticated passengers. I can stop
                  sharing at any time by going offline. I consent to this use of my location.
                </label>
              </div>
              {errors.consent && (
                <p className="text-xs text-[#f87171] mt-2 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" />
                  {errors.consent}
                </p>
              )}
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full mt-2"
              id="driver-register-submit-btn"
            >
              Submit Registration
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-[#737373]">
            Already registered?{' '}
            <Link to="/login" className="text-[#F5F5F5] hover:underline font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function DriverRegisterPage() {
  return (
    <GuestOnlyRoute>
      <DriverRegisterForm />
    </GuestOnlyRoute>
  )
}
