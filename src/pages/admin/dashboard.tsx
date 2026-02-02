"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { StatsCard } from "@/components/admin/status-card"
import { RequestTable } from "@/components/admin/request-table"
import {
  Users,
  Building2,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { getStats, getVendors, getCompanies, approveUser, rejectUser, formatRelativeTime, type VendorUser } from "@/lib/api"

interface Request {
  id: string
  name: string
  email: string
  type: "company" | "vendor"
  status: "pending" | "approved" | "rejected"
  date: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    vendors: { total: 0, pending: 0, approved: 0, rejected: 0 },
    companies: { total: 0, pending: 0, approved: 0, rejected: 0 },
    admins: { total: 0 },
  })
  const [recentRequests, setRecentRequests] = useState<Request[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set())

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch stats
        const statsResponse = await getStats()
        if (statsResponse.success) {
          // Handle both 'companies' and 'users' field names for backward compatibility
          const normalizedStats = {
            vendors: statsResponse.data.vendors || { total: 0, pending: 0, approved: 0, rejected: 0 },
            companies: statsResponse.data.companies || statsResponse.data.users || { total: 0, pending: 0, approved: 0, rejected: 0 },
            admins: statsResponse.data.admins || { total: 0 },
          }
          setStats(normalizedStats)
        }

        // Fetch pending vendors and companies
        const [vendorsResponse, companiesResponse] = await Promise.all([
          getVendors('pending', 1, 10),
          getCompanies('pending', 1, 10),
        ])

        // Combine and format requests
        const requests: Request[] = []

        // Add vendors
        if (vendorsResponse.success && vendorsResponse.data) {
          vendorsResponse.data.forEach((vendor: VendorUser) => {
            requests.push({
              id: vendor._id,
              name: vendor.name,
              email: vendor.email,
              type: "vendor",
              status: vendor.approvalStatus,
              date: formatRelativeTime(vendor.createdAt),
            })
          })
        }

        // Add companies
        if (companiesResponse.success && companiesResponse.data) {
          companiesResponse.data.forEach((company: VendorUser) => {
            requests.push({
              id: company._id,
              name: company.name,
              email: company.email,
              type: "company",
              status: company.approvalStatus,
              date: formatRelativeTime(company.createdAt),
            })
          })
        }

        // Sort by date (most recent first) - already sorted by API, but we can reverse if needed
        // The API returns most recent first, so we keep the order

        setRecentRequests(requests)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard data")
        console.error("Error fetching dashboard data:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const handleApprove = async (id: string) => {
    try {
      setProcessingIds((prev) => new Set(prev).add(id))
      
      await approveUser(id)
      
      // Remove from recent requests and refresh stats
      setRecentRequests((prev) => prev.filter((r) => r.id !== id))
      
      // Refresh stats
      const statsResponse = await getStats()
      if (statsResponse.success) {
        const normalizedStats = {
          vendors: statsResponse.data.vendors || { total: 0, pending: 0, approved: 0, rejected: 0 },
          companies: statsResponse.data.companies || statsResponse.data.users || { total: 0, pending: 0, approved: 0, rejected: 0 },
          admins: statsResponse.data.admins || { total: 0 },
        }
        setStats(normalizedStats)
      }
    } catch (err) {
      console.error("Error approving request:", err)
      alert(err instanceof Error ? err.message : "Failed to approve request")
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  const handleReject = async (id: string) => {
    try {
      setProcessingIds((prev) => new Set(prev).add(id))
      
      // You can prompt for a reason or use a default
      const reason = prompt("Please provide a reason for rejection (optional):") || undefined
      
      await rejectUser(id, reason)
      
      // Remove from recent requests and refresh stats
      setRecentRequests((prev) => prev.filter((r) => r.id !== id))
      
      // Refresh stats
      const statsResponse = await getStats()
      if (statsResponse.success) {
        const normalizedStats = {
          vendors: statsResponse.data.vendors || { total: 0, pending: 0, approved: 0, rejected: 0 },
          companies: statsResponse.data.companies || statsResponse.data.users || { total: 0, pending: 0, approved: 0, rejected: 0 },
          admins: statsResponse.data.admins || { total: 0 },
        }
        setStats(normalizedStats)
      }
    } catch (err) {
      console.error("Error rejecting request:", err)
      alert(err instanceof Error ? err.message : "Failed to reject request")
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-slate-500 dark:text-slate-400">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Dashboard
            </h1>
            <p className="mt-1 text-slate-500 dark:text-slate-400">
              Welcome back! Here is an overview of your platform.
            </p>
          </div>

        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Companies"
            value={stats.companies.total}
            description={`${stats.companies.approved} approved`}
            icon={Building2}
            variant="primary"
            trend={{ value: 12, isPositive: true }}
          />
          <StatsCard
            title="Total Vendors"
            value={stats.vendors.total}
            description={`${stats.vendors.approved} approved`}
            icon={Users}
            variant="accent"
            trend={{ value: 8, isPositive: true }}
          />
          <StatsCard
            title="Admins"
            value={stats.admins.total}
            description="Platform administrators"
            icon={Shield}
            variant="success"
          />
          <StatsCard
            title="Pending Requests"
            value={stats.companies.pending + stats.vendors.pending}
            description="Awaiting review"
            icon={Clock}
            variant="warning"
          />
        </div>

        {/* Status Breakdown */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Companies Status */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-500/10">
                <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Companies Status
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Registration breakdown
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg bg-amber-50 p-4 text-center dark:bg-amber-500/10">
                <Clock className="mx-auto h-5 w-5 text-amber-600 dark:text-amber-400" />
                <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                  {stats.companies.pending}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Pending</p>
              </div>
              <div className="rounded-lg bg-emerald-50 p-4 text-center dark:bg-emerald-500/10">
                <CheckCircle className="mx-auto h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                  {stats.companies.approved}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Approved</p>
              </div>
              <div className="rounded-lg bg-red-50 p-4 text-center dark:bg-red-500/10">
                <XCircle className="mx-auto h-5 w-5 text-red-600 dark:text-red-400" />
                <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                  {stats.companies.rejected}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Rejected</p>
              </div>
            </div>
          </div>

          {/* Vendors Status */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-50 dark:bg-cyan-500/10">
                <Users className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Vendors Status
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Registration breakdown
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg bg-amber-50 p-4 text-center dark:bg-amber-500/10">
                <Clock className="mx-auto h-5 w-5 text-amber-600 dark:text-amber-400" />
                <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                  {stats.vendors.pending}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Pending</p>
              </div>
              <div className="rounded-lg bg-emerald-50 p-4 text-center dark:bg-emerald-500/10">
                <CheckCircle className="mx-auto h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                  {stats.vendors.approved}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Approved</p>
              </div>
              <div className="rounded-lg bg-red-50 p-4 text-center dark:bg-red-500/10">
                <XCircle className="mx-auto h-5 w-5 text-red-600 dark:text-red-400" />
                <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                  {stats.vendors.rejected}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Rejected</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Requests Table */}
        <RequestTable
          title="Recent Registration Requests"
          requests={recentRequests}
          onApprove={handleApprove}
          onReject={handleReject}
          processingIds={processingIds}
        />
      </div>
    </AdminLayout>
  )
}
