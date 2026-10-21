// ============================================================
// AutoNear — 404 Not Found Page
// ============================================================

import React from 'react'
import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="flex-1 flex items-center justify-center px-4 py-20">
      <div className="text-center animate-slide-up">
        <div className="text-6xl mb-6">🗺️</div>
        <h1 className="text-2xl font-bold text-[#F5F5F5] mb-2">Page Not Found</h1>
        <p className="text-[#737373] text-sm mb-8 max-w-sm mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F5F5F5] text-[#090909]
            font-medium text-sm rounded-xl hover:bg-white transition-colors"
        >
          <MapPin className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    </div>
  )
}
