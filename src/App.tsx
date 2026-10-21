// ============================================================
// AutoNear — App Root (Router + Auth Provider)
// ============================================================

import React, { Component, ReactNode } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './features/auth/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { ConfigWarning } from './components/ui'
import { isFirebaseConfigured } from './config/firebase'

// Pages
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DriverRegisterPage from './pages/DriverRegisterPage'
import DriverDashboardPage from './pages/DriverDashboardPage'
import FindNearbyPage from './pages/FindNearbyPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import NotFoundPage from './pages/NotFoundPage'

// ── Error Boundary ────────────────────────────────────────────

interface ErrorBoundaryState { hasError: boolean; message: string }

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, message: '' }

  static getDerivedStateFromError(err: Error) {
    return { hasError: true, message: err.message }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#090909] flex items-center justify-center p-8">
          <div className="max-w-lg text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h1 className="text-xl font-bold text-[#F5F5F5] mb-3">Application Error</h1>
            <p className="text-sm text-[#A3A3A3] mb-4 leading-relaxed">
              {this.state.message.includes('placeholder') || this.state.message.includes('Firebase')
                ? 'Firebase is not configured. Please fill in your .env file with real Firebase credentials and restart the dev server.'
                : this.state.message}
            </p>
            <div className="bg-[#111111] border border-[#303030] rounded-xl p-4 text-left mb-6">
              <p className="text-xs text-[#737373] font-mono">
                Fill in <span className="text-[#F5F5F5]">.env</span> with your Firebase values,
                then run <span className="text-[#F5F5F5]">npm run dev</span> again.
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 bg-[#F5F5F5] text-[#090909] font-medium text-sm rounded-xl hover:bg-white"
            >
              Reload
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// ── Pages where footer is hidden (full-height map) ───────────

const NO_FOOTER_PATHS = ['/find']

function AppLayout() {
  const location = useLocation()
  const showFooter = !NO_FOOTER_PATHS.includes(location.pathname)

  return (
    <div className="flex flex-col min-h-screen bg-[#090909]">
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/register-driver" element={<DriverRegisterPage />} />
        <Route path="/driver-dashboard" element={<DriverDashboardPage />} />
        <Route path="/find" element={<FindNearbyPage />} />
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      {showFooter && <Footer />}
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ErrorBoundary>
          <AuthProvider>
            {!isFirebaseConfigured && <ConfigWarning />}
            <AppLayout />
          </AuthProvider>
        </ErrorBoundary>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
