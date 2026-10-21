// ============================================================
// AutoNear — Footer Component
// ============================================================

import React from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Github } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-[#303030] bg-[#090909] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-7 h-7 bg-[#F5F5F5] rounded-lg flex items-center justify-center">
                <MapPin className="w-3.5 h-3.5 text-[#090909]" />
              </div>
              <span className="text-[#F5F5F5] font-bold text-base">AutoNear</span>
            </div>
            <p className="text-[#737373] text-sm leading-relaxed">
              Your Ride. Just Around the Corner.
            </p>
            <p className="text-[#737373] text-xs mt-2 leading-relaxed">
              A college mini-project demonstrating real GPS-based auto-rickshaw
              tracking using Firebase and OpenStreetMap.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-[#F5F5F5] text-sm font-semibold mb-3">Platform</h4>
            <ul className="space-y-2">
              {[
                { to: '/find', label: 'Find Nearby Autos' },
                { to: '/register-driver', label: 'Register as Driver' },
                { to: '/login', label: 'Sign In' },
                { to: '/register', label: 'Passenger Sign Up' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-[#737373] hover:text-[#A3A3A3] text-sm transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Project Info */}
          <div>
            <h4 className="text-[#F5F5F5] text-sm font-semibold mb-3">Project Info</h4>
            <ul className="space-y-2 text-sm text-[#737373]">
              <li>CSE / IT Mini Project</li>
              <li>React + TypeScript + Vite</li>
              <li>Firebase Realtime Database</li>
              <li>Leaflet + OpenStreetMap</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#303030] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[#737373] text-xs">
            © {new Date().getFullYear()} AutoNear. College mini project. Not a commercial service.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-[#737373] text-xs">
              Map data © <a
                href="https://www.openstreetmap.org/copyright"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#A3A3A3] transition-colors"
              >OpenStreetMap</a> contributors
            </span>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#737373] hover:text-[#A3A3A3] transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
