// ============================================================
// AutoNear — Navbar Component
// ============================================================

import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { MapPin, LogOut, Menu, X, Shield, Car, User } from 'lucide-react'
import { useAuth } from '../features/auth/AuthContext'
import { signOut } from '../services/authService'

export default function Navbar() {
  const { user, userProfile, adminStatus, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/')
    } catch (err) {
      console.error('Sign out failed:', err)
    }
  }

  const isActive = (path: string) => location.pathname === path

  const navLinkClass = (path: string) =>
    `text-sm font-medium transition-colors duration-200 ${
      isActive(path)
        ? 'text-[#F5F5F5]'
        : 'text-[#A3A3A3] hover:text-[#F5F5F5]'
    }`

  return (
    <nav className="sticky top-0 z-50 border-b border-[#303030] bg-[#090909]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group"
            aria-label="AutoNear Home"
          >
            <div className="w-8 h-8 bg-[#F5F5F5] rounded-lg flex items-center justify-center group-hover:bg-white transition-colors">
              <MapPin className="w-4 h-4 text-[#090909]" />
            </div>
            <span className="text-[#F5F5F5] font-bold text-lg tracking-tight">
              AutoNear
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {!loading && (
              <>
                {!user ? (
                  <>
                    <Link to="/find" className={navLinkClass('/find')}>
                      Find Autos
                    </Link>
                    <Link to="/register-driver" className={navLinkClass('/register-driver')}>
                      Drive with Us
                    </Link>
                    <Link
                      to="/login"
                      className="text-sm font-medium text-[#A3A3A3] hover:text-[#F5F5F5] transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      className="px-4 py-2 text-sm font-medium bg-[#F5F5F5] text-[#090909] rounded-lg hover:bg-white transition-colors"
                    >
                      Sign Up
                    </Link>
                  </>
                ) : (
                  <>
                    {adminStatus && (
                      <Link
                        to="/admin"
                        className={`flex items-center gap-1.5 ${navLinkClass('/admin')}`}
                      >
                        <Shield className="w-3.5 h-3.5" />
                        Admin
                      </Link>
                    )}
                    {userProfile?.role === 'driver' && (
                      <Link
                        to="/driver-dashboard"
                        className={`flex items-center gap-1.5 ${navLinkClass('/driver-dashboard')}`}
                      >
                        <Car className="w-3.5 h-3.5" />
                        Dashboard
                      </Link>
                    )}
                    {(userProfile?.role === 'passenger' || adminStatus) && (
                      <Link
                        to="/find"
                        className={navLinkClass('/find')}
                      >
                        Find Autos
                      </Link>
                    )}
                    <div className="flex items-center gap-3 pl-2 border-l border-[#303030]">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-[#202020] border border-[#303030] rounded-full flex items-center justify-center">
                          <User className="w-3.5 h-3.5 text-[#A3A3A3]" />
                        </div>
                        <span className="text-xs text-[#A3A3A3] max-w-[120px] truncate">
                          {user.email}
                        </span>
                      </div>
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-1.5 text-sm text-[#737373] hover:text-[#F5F5F5] transition-colors"
                        aria-label="Sign out"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Out
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-[#A3A3A3] hover:text-[#F5F5F5] transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-[#303030] bg-[#090909] animate-fade-in">
          <div className="px-4 py-4 space-y-3">
            {!user ? (
              <>
                <Link
                  to="/find"
                  className="block text-sm text-[#A3A3A3] hover:text-[#F5F5F5] py-2"
                  onClick={() => setMenuOpen(false)}
                >
                  Find Autos
                </Link>
                <Link
                  to="/register-driver"
                  className="block text-sm text-[#A3A3A3] hover:text-[#F5F5F5] py-2"
                  onClick={() => setMenuOpen(false)}
                >
                  Drive with Us
                </Link>
                <Link
                  to="/login"
                  className="block text-sm text-[#A3A3A3] hover:text-[#F5F5F5] py-2"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="block text-center py-2.5 text-sm font-medium bg-[#F5F5F5] text-[#090909] rounded-lg"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                {adminStatus && (
                  <Link
                    to="/admin"
                    className="block text-sm text-[#A3A3A3] hover:text-[#F5F5F5] py-2"
                    onClick={() => setMenuOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                )}
                {userProfile?.role === 'driver' && (
                  <Link
                    to="/driver-dashboard"
                    className="block text-sm text-[#A3A3A3] hover:text-[#F5F5F5] py-2"
                    onClick={() => setMenuOpen(false)}
                  >
                    Driver Dashboard
                  </Link>
                )}
                <Link
                  to="/find"
                  className="block text-sm text-[#A3A3A3] hover:text-[#F5F5F5] py-2"
                  onClick={() => setMenuOpen(false)}
                >
                  Find Autos
                </Link>
                <div className="pt-2 border-t border-[#303030]">
                  <p className="text-xs text-[#737373] mb-2">{user.email}</p>
                  <button
                    onClick={() => { handleSignOut(); setMenuOpen(false) }}
                    className="flex items-center gap-2 text-sm text-[#A3A3A3] hover:text-[#F5F5F5]"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
