// ============================================================
// AutoNear — Admin Dashboard Page
// ============================================================

import React, { useEffect, useState } from 'react'
import {
  Shield, Users, CheckCircle, XCircle, Pause, Search,
  Clock, RefreshCw
} from 'lucide-react'
import { subscribeToAllDrivers, updateDriverApprovalStatus } from '../services/driverService'
import { DriverApprovalStatus, DriverProfile } from '../types'
import { formatRelativeTime } from '../utils/geo'
import { useAuth } from '../features/auth/AuthContext'
import { Alert, Badge, Button, Card, Spinner } from '../components/ui'
import { ProtectedRoute } from '../components/ProtectedRoute'

type Tab = 'pending' | 'approved' | 'all'

function AdminContent() {
  const { user } = useAuth()
  const [drivers, setDrivers] = useState<DriverProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('pending')
  const [search, setSearch] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [reasonModal, setReasonModal] = useState<{
    uid: string
    name: string
    action: 'rejected' | 'suspended'
  } | null>(null)
  const [reason, setReason] = useState('')

  useEffect(() => {
    setLoading(true)
    const unsub = subscribeToAllDrivers((all) => {
      setDrivers(all)
      setLoading(false)
    })
    return unsub
  }, [])

  const handleApprove = async (uid: string) => {
    setActionLoading(uid)
    setActionError(null)
    try {
      await updateDriverApprovalStatus(uid, 'approved', user?.uid)
    } catch {
      setActionError('Failed to approve driver. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleRejectOrSuspend = async () => {
    if (!reasonModal) return
    setActionLoading(reasonModal.uid)
    setActionError(null)
    try {
      await updateDriverApprovalStatus(
        reasonModal.uid,
        reasonModal.action,
        user?.uid,
        reason.trim() || undefined
      )
      setReasonModal(null)
      setReason('')
    } catch {
      setActionError('Action failed. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  const filtered = drivers
    .filter((d) => {
      if (tab === 'pending') return d.approvalStatus === 'pending'
      if (tab === 'approved') return d.approvalStatus === 'approved'
      return true
    })
    .filter((d) => {
      if (!search) return true
      const q = search.toLowerCase()
      return (
        d.fullName.toLowerCase().includes(q) ||
        d.email.toLowerCase().includes(q) ||
        d.vehicleRegNumber.toLowerCase().includes(q)
      )
    })

  const counts = {
    pending: drivers.filter((d) => d.approvalStatus === 'pending').length,
    approved: drivers.filter((d) => d.approvalStatus === 'approved').length,
    all: drivers.length,
  }

  const tabClass = (t: Tab) =>
    `px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
      tab === t
        ? 'bg-[#202020] text-[#F5F5F5] border border-[#303030]'
        : 'text-[#737373] hover:text-[#A3A3A3]'
    }`

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-[#202020] border border-[#303030] rounded-xl
          flex items-center justify-center">
          <Shield className="w-5 h-5 text-[#A3A3A3]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#F5F5F5]">Admin Dashboard</h1>
          <p className="text-sm text-[#737373]">Manage driver registrations and approvals</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Drivers', value: counts.all, icon: <Users className="w-4 h-4" /> },
          { label: 'Pending', value: counts.pending, icon: <Clock className="w-4 h-4" />, highlight: counts.pending > 0 },
          { label: 'Approved', value: counts.approved, icon: <CheckCircle className="w-4 h-4" /> },
          {
            label: 'Rejected / Suspended',
            value: drivers.filter((d) => d.approvalStatus === 'rejected' || d.approvalStatus === 'suspended').length,
            icon: <XCircle className="w-4 h-4" />,
          },
        ].map((stat) => (
          <Card key={stat.label} className={stat.highlight ? 'border-[#fbbf24]/30' : ''}>
            <div className="flex items-center gap-2 mb-2 text-[#737373]">{stat.icon}</div>
            <p className="text-2xl font-bold text-[#F5F5F5]">{stat.value}</p>
            <p className="text-xs text-[#737373] mt-0.5">{stat.label}</p>
          </Card>
        ))}
      </div>

      {actionError && (
        <Alert variant="error" className="mb-4">{actionError}</Alert>
      )}

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-5">
        <div className="flex gap-2">
          <button onClick={() => setTab('pending')} className={tabClass('pending')}>
            Pending {counts.pending > 0 && `(${counts.pending})`}
          </button>
          <button onClick={() => setTab('approved')} className={tabClass('approved')}>
            Approved
          </button>
          <button onClick={() => setTab('all')} className={tabClass('all')}>
            All
          </button>
        </div>
        <div className="relative ml-auto w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#737373]" />
          <input
            type="text"
            placeholder="Search drivers…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#111111] border border-[#303030] rounded-lg pl-9 pr-3 py-2
              text-sm text-[#F5F5F5] placeholder-[#737373] focus:outline-none focus:border-[#F5F5F5]"
          />
        </div>
      </div>

      {/* Driver List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner className="w-8 h-8" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-10 h-10 text-[#303030] mx-auto mb-3" />
          <p className="text-[#737373] text-sm">
            {tab === 'pending' ? 'No pending applications.' : 'No drivers found.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((driver) => (
            <div
              key={driver.uid}
              className="bg-[#111111] border border-[#303030] rounded-xl p-4 hover:border-[#3a3a3a] transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-semibold text-[#F5F5F5] text-sm">{driver.fullName}</span>
                    <Badge
                      variant={driver.approvalStatus as DriverApprovalStatus}
                      dot
                    >
                      {driver.approvalStatus}
                    </Badge>
                  </div>
                  <p className="text-xs text-[#737373] mb-2">{driver.email} · {driver.phone}</p>
                  <p className="text-xs text-[#A3A3A3]">
                    🚗 {driver.vehicleRegNumber}
                  </p>
                  <p className="text-xs text-[#737373] mt-1">
                    Registered {formatRelativeTime(driver.createdAt)}
                  </p>
                  {driver.rejectionReason && (
                    <p className="text-xs text-[#f87171] mt-1">
                      Rejection reason: {driver.rejectionReason}
                    </p>
                  )}
                  {driver.suspensionReason && (
                    <p className="text-xs text-[#fdba74] mt-1">
                      Suspension reason: {driver.suspensionReason}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  {driver.approvalStatus === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleApprove(driver.uid)}
                        loading={actionLoading === driver.uid}
                        leftIcon={<CheckCircle className="w-3.5 h-3.5" />}
                        id={`approve-${driver.uid}`}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() =>
                          setReasonModal({ uid: driver.uid, name: driver.fullName, action: 'rejected' })
                        }
                        leftIcon={<XCircle className="w-3.5 h-3.5" />}
                        id={`reject-${driver.uid}`}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  {driver.approvalStatus === 'approved' && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        setReasonModal({ uid: driver.uid, name: driver.fullName, action: 'suspended' })
                      }
                      leftIcon={<Pause className="w-3.5 h-3.5" />}
                    >
                      Suspend
                    </Button>
                  )}
                  {(driver.approvalStatus === 'rejected' || driver.approvalStatus === 'suspended') && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleApprove(driver.uid)}
                      loading={actionLoading === driver.uid}
                      leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                    >
                      Re-approve
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reason Modal */}
      {reasonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#111111] border border-[#303030] rounded-2xl p-6 max-w-md w-full mx-4 animate-slide-up">
            <h3 className="text-base font-semibold text-[#F5F5F5] mb-2">
              {reasonModal.action === 'rejected' ? 'Reject' : 'Suspend'} Driver
            </h3>
            <p className="text-sm text-[#737373] mb-4">
              {reasonModal.name} — optionally provide a reason:
            </p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason (optional)"
              rows={3}
              className="w-full bg-[#171717] border border-[#303030] rounded-lg px-3 py-2
                text-sm text-[#F5F5F5] placeholder-[#737373] focus:outline-none focus:border-[#F5F5F5]
                resize-none mb-4"
            />
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => { setReasonModal(null); setReason('') }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={handleRejectOrSuspend}
                loading={actionLoading === reasonModal.uid}
              >
                Confirm {reasonModal.action === 'rejected' ? 'Rejection' : 'Suspension'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminContent />
    </ProtectedRoute>
  )
}
