// ============================================================
// AutoNear — Landing Page
// ============================================================

import React from 'react'
import { Link } from 'react-router-dom'
import {
  MapPin,
  Navigation,
  Shield,
  Smartphone,
  ArrowRight,
  Car,
  Clock,
  Map,
  CheckCircle,
} from 'lucide-react'

const steps = [
  {
    icon: <Smartphone className="w-5 h-5" />,
    title: 'Register or Sign In',
    description:
      'Passengers sign up for free. Auto drivers register with their vehicle details and wait for admin approval.',
  },
  {
    icon: <Navigation className="w-5 h-5" />,
    title: 'Grant Location Access',
    description:
      'Allow your browser to access your GPS. No tracking happens without your explicit permission.',
  },
  {
    icon: <Map className="w-5 h-5" />,
    title: 'Find Available Autos',
    description:
      'Search within 1–50 km. See only real, online drivers who have actively shared their live location.',
  },
]

const features = [
  {
    icon: <MapPin className="w-5 h-5" />,
    title: 'Real GPS Tracking',
    description:
      'Driver locations come from actual devices with location permission. No simulated positions.',
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: 'Driver Verification',
    description:
      'Every driver registration is reviewed by an admin before they can appear on passenger searches.',
  },
  {
    icon: <Clock className="w-5 h-5" />,
    title: 'Freshness Indicators',
    description:
      'Stale locations are clearly marked. You always know when a position was last updated.',
  },
  {
    icon: <Car className="w-5 h-5" />,
    title: 'Privacy First',
    description:
      'Drivers control when they share their location. Going offline immediately removes them from search.',
  },
]

export default function LandingPage() {
  return (
    <div className="flex-1 page-enter">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(48,48,48,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(48,48,48,0.15) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="max-w-3xl mx-auto text-center">
            {/* Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 rounded-full
              border border-[#303030] bg-[#111111] text-xs text-[#A3A3A3]">
              <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse" />
              Real-time GPS tracking · No demo data
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#F5F5F5] leading-tight mb-6">
              Find Your Nearest Auto.{' '}
              <span className="text-[#A3A3A3]">Get Moving.</span>
            </h1>

            <p className="text-base sm:text-lg text-[#737373] mb-10 leading-relaxed max-w-2xl mx-auto">
              AutoNear connects passengers with available auto-rickshaw drivers in real time using
              genuine GPS locations. Every driver on this platform is a real person who has
              registered and enabled location sharing from their own device.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/find"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5
                  bg-[#F5F5F5] text-[#090909] font-semibold text-sm rounded-xl
                  hover:bg-white transition-colors"
              >
                <MapPin className="w-4 h-4" />
                Find Nearby Autos
              </Link>
              <Link
                to="/register-driver"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5
                  bg-transparent text-[#F5F5F5] font-medium text-sm rounded-xl
                  border border-[#303030] hover:border-[#3a3a3a] hover:bg-[#111111] transition-colors"
              >
                <Car className="w-4 h-4" />
                Register as a Driver
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────── */}
      <section className="border-t border-[#303030] bg-[#111111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-[#F5F5F5] mb-3">How AutoNear Works</h2>
            <p className="text-[#737373] text-sm max-w-lg mx-auto">
              Three straightforward steps. No installation. No simulated data.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step, i) => (
              <div
                key={i}
                className="relative bg-[#171717] border border-[#303030] rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 bg-[#202020] border border-[#303030] rounded-lg
                    flex items-center justify-center text-[#F5F5F5]">
                    {step.icon}
                  </div>
                  <span className="text-xs font-semibold text-[#737373] uppercase tracking-wider">
                    Step {i + 1}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-[#F5F5F5] mb-2">{step.title}</h3>
                <p className="text-sm text-[#737373] leading-relaxed">{step.description}</p>
                {i < steps.length - 1 && (
                  <ArrowRight
                    className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#303030] z-10"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section className="border-t border-[#303030]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-[#F5F5F5] mb-3">Built for Authenticity</h2>
            <p className="text-[#737373] text-sm max-w-lg mx-auto">
              Every design decision prioritises real data over appearance.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <div
                key={i}
                className="bg-[#171717] border border-[#303030] rounded-xl p-5
                  hover:border-[#3a3a3a] transition-colors"
              >
                <div className="w-9 h-9 bg-[#202020] border border-[#303030] rounded-lg
                  flex items-center justify-center text-[#A3A3A3] mb-4">
                  {f.icon}
                </div>
                <h3 className="text-sm font-semibold text-[#F5F5F5] mb-2">{f.title}</h3>
                <p className="text-xs text-[#737373] leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Important Notice ─────────────────────────────────── */}
      <section className="border-t border-[#303030] bg-[#111111]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="bg-[#171717] border border-[#303030] rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-5 h-5 text-[#4ade80]" />
              <h3 className="text-base font-semibold text-[#F5F5F5]">No Fake Data. Ever.</h3>
            </div>
            <p className="text-sm text-[#A3A3A3] leading-relaxed mb-4">
              AutoNear does not pre-populate the map with fictional drivers, sample locations, or
              simulated movement. If no registered drivers are currently online and sharing their
              location, the platform will honestly display "No available autos found nearby."
            </p>
            <p className="text-sm text-[#737373] leading-relaxed">
              Location sharing requires an active browser session, GPS permission, and an approved
              driver account. The app cannot guarantee continuous background tracking when the
              browser tab is minimised, the phone is locked, or the browser is closed.
            </p>
          </div>
        </div>
      </section>

      {/* ── Driver CTA ───────────────────────────────────────── */}
      <section className="border-t border-[#303030]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-2xl font-bold text-[#F5F5F5] mb-3">
            Are You an Auto Driver?
          </h2>
          <p className="text-[#737373] text-sm mb-8 max-w-lg mx-auto">
            Register your vehicle, wait for admin approval, then go online to let nearby
            passengers find you — using your real GPS location.
          </p>
          <Link
            to="/register-driver"
            className="inline-flex items-center gap-2 px-6 py-3.5
              bg-[#F5F5F5] text-[#090909] font-semibold text-sm rounded-xl
              hover:bg-white transition-colors"
          >
            <Car className="w-4 h-4" />
            Register as a Driver
          </Link>
        </div>
      </section>
    </div>
  )
}
