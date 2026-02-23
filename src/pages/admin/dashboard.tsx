"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { StatsCard } from "@/components/admin/status-card"
import { RequestTable } from "@/components/admin/request-table"
import {
  Users,
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  MapPin,
  Truck,
  DollarSign,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { getStats, getVendors, getCompanies, approveUser, rejectUser, getAllBranches, approveBranch, rejectBranch, formatRelativeTime, getAdminDashboard, type VendorUser, type Branch, type AdminDashboard } from "@/lib/api"

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
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null)
  const [recentRequests, setRecentRequests] = useState<Request[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set())
  const [pendingBranches, setPendingBranches] = useState<Branch[]>([])
  const [branchesProcessingIds, setBranchesProcessingIds] = useState<Set<string>>(new Set())

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

        // Fetch comprehensive dashboard
        try {
          const dashboardResponse = await getAdminDashboard()
          if (dashboardResponse.success) {
            setDashboard(dashboardResponse.data)
          }
        } catch (dashErr) {
          console.warn("Could not load comprehensive dashboard:", dashErr)
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

        setRecentRequests(requests)

        // Fetch pending branches
        const branchesResponse = await getAllBranches('pending', 1, 5)
        if (branchesResponse.success && branchesResponse.data) {
          setPendingBranches(branchesResponse.data)
        }
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

  const handleApproveBranch = async (id: string) => {
    try {
      setBranchesProcessingIds((prev) => new Set(prev).add(id))
      
      await approveBranch(id)
      
      // Remove from pending branches
      setPendingBranches((prev) => prev.filter((b) => (b._id || b.id) !== id))
    } catch (err) {
      console.error("Error approving branch:", err)
      alert(err instanceof Error ? err.message : "Failed to approve branch")
    } finally {
      setBranchesProcessingIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  const handleRejectBranch = async (id: string) => {
    try {
      setBranchesProcessingIds((prev) => new Set(prev).add(id))
      
      const reason = prompt("Please provide a reason for rejection (optional):") || undefined
      
      await rejectBranch(id, reason)
      
      // Remove from pending branches
      setPendingBranches((prev) => prev.filter((b) => (b._id || b.id) !== id))
    } catch (err) {
      console.error("Error rejecting branch:", err)
      alert(err instanceof Error ? err.message : "Failed to reject branch")
    } finally {
      setBranchesProcessingIds((prev) => {
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
            value={dashboard?.overview.totalCompanies || stats.companies.total}
            description={`${stats.companies.approved} approved`}
            icon={Building2}
            variant="primary"
            trend={{ value: 12, isPositive: true }}
          />
          <StatsCard
            title="Total Vendors"
            value={dashboard?.overview.totalVendors || stats.vendors.total}
            description={`${stats.vendors.approved} approved`}
            icon={Users}
            variant="accent"
            trend={{ value: 8, isPositive: true }}
          />
          <StatsCard
            title="Delivery Partners"
            value={dashboard?.overview.totalDeliveryPartners || 0}
            description={`${dashboard?.deliveryPartners.active || 0} active`}
            icon={Truck}
            variant="success"
            trend={{ value: 5, isPositive: true }}
          />
          <StatsCard
            title="Total Revenue"
            value={dashboard ? `₹${(dashboard.overview.totalRevenue / 100000).toFixed(0)}L` : "₹0"}
            description={`${dashboard?.overview.totalOrders || 0} orders`}
            icon={DollarSign}
            variant="warning"
          />
        </div>

        {/* Comprehensive Dashboard Stats - if available */}
        {dashboard && (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-6">
              <h3 className="font-bold mb-4">Financial Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">Today's Revenue</span>
                  <span className="font-bold">₹{dashboard.financial.revenueByPeriod.today.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">This Week</span>
                  <span className="font-bold">₹{dashboard.financial.revenueByPeriod.thisWeek.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">This Month</span>
                  <span className="font-bold">₹{dashboard.financial.revenueByPeriod.thisMonth.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Average Order Value</span>
                  <span className="font-bold">₹{dashboard.financial.averageOrderValue.toLocaleString()}</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold mb-4">Order Status Distribution</h3>
              <div className="space-y-2">
                {Object.entries(dashboard.orders.byStatus).slice(0, 5).map(([status, count]) => (
                  <div key={status} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize text-xs">{status}</Badge>
                      <span className="text-sm text-gray-600">{count}</span>
                    </div>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(count / dashboard.orders.total) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

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

        {/* Pending Branches */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-500/10">
                <Building2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Pending Branch Approvals
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {pendingBranches.length} branch{pendingBranches.length !== 1 ? "es" : ""} awaiting approval
                </p>
              </div>
            </div>
          </div>

          {pendingBranches.length === 0 ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
              No pending branches to review
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                <thead className="bg-slate-50 dark:bg-slate-950">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      Branch Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      Branch Admin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {pendingBranches.map((branch) => (
                    <tr key={branch._id || branch.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {branch.branchName}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <MapPin className="h-4 w-4" />
                          {branch.location}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {branch.branchAdmin?.name || "N/A"}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {branch.branchAdmin?.email}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="bg-slate-100 dark:bg-slate-800">
                          {branch.company?.name || "Unknown"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-500/10"
                            onClick={() => handleApproveBranch(branch._id || branch.id || "")}
                            disabled={branchesProcessingIds.has(branch._id || branch.id || "")}
                          >
                            {branchesProcessingIds.has(branch._id || branch.id || "") ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                            onClick={() => handleRejectBranch(branch._id || branch.id || "")}
                            disabled={branchesProcessingIds.has(branch._id || branch.id || "")}
                          >
                            {branchesProcessingIds.has(branch._id || branch.id || "") ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <XCircle className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
