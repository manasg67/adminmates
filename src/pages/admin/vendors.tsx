"use client"

import { useState, useEffect } from "react"
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  Loader2,
} from "lucide-react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { DataTable, type DataItem } from "@/components/admin/data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { getVendors, approveUser, rejectUser, bulkApprove, bulkReject, createVendor } from "@/lib/api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { UserPlus } from "lucide-react"

export default function VendorsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [vendors, setVendors] = useState<DataItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [, setTotalPages] = useState(1)
  const [totalVendors, setTotalVendors] = useState(0)
  
  // Add Vendor State
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newVendor, setNewVendor] = useState({
    name: "",
    email: "",
    gstNumber: "",
    panCard: "",
  })

  // Calculate stats from vendors data
  const stats = [
    {
      label: "Total Vendors",
      value: totalVendors,
      icon: Users,
      color: "from-violet-500 to-purple-600",
      bgColor: "bg-violet-500/10",
      textColor: "text-violet-600 dark:text-violet-400",
    },
    {
      label: "Approved",
      value: vendors.filter((v) => v.approvalStatus === "approved").length,
      icon: CheckCircle2,
      color: "from-emerald-500 to-green-600",
      bgColor: "bg-emerald-500/10",
      textColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Pending",
      value: vendors.filter((v) => v.approvalStatus === "pending").length,
      icon: Clock,
      color: "from-amber-500 to-orange-600",
      bgColor: "bg-amber-500/10",
      textColor: "text-amber-600 dark:text-amber-400",
    },
    {
      label: "Rejected",
      value: vendors.filter((v) => v.approvalStatus === "rejected").length,
      icon: XCircle,
      color: "from-red-500 to-rose-600",
      bgColor: "bg-red-500/10",
      textColor: "text-red-600 dark:text-red-400",
    },
  ]

  // Fetch vendors
  const fetchVendors = async (pageNum: number = 1, status?: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const statusParam = status && status !== "all" ? status : undefined
      const response = await getVendors(statusParam as "pending" | "approved" | "rejected" | undefined, pageNum, 10)

      if (response.success) {
        setVendors(response.data as DataItem[])
        setTotalVendors(response.totalVendors)
        setTotalPages(response.totalPages)
        setPage(response.currentPage)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load vendors")
      console.error("Error fetching vendors:", err)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  // Initial load and when status filter changes
  useEffect(() => {
    fetchVendors(1, statusFilter)
  }, [statusFilter])

  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch =
      vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.email.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchVendors(page, statusFilter)
  }

  const handleApprove = async (ids: string[]) => {
    try {
      if (ids.length === 1) {
        // Single approve
        await approveUser(ids[0])
      } else {
        // Bulk approve
        await bulkApprove(ids)
      }
      // Refresh data
      await fetchVendors(page, statusFilter)
    } catch (err) {
      console.error("Error approving vendors:", err)
      alert(err instanceof Error ? err.message : "Failed to approve vendors")
    }
  }

  const handleReject = async (ids: string[], reason: string) => {
    try {
      if (ids.length === 1) {
        // Single reject
        await rejectUser(ids[0], reason)
      } else {
        // Bulk reject
        await bulkReject(ids, reason)
      }
      // Refresh data
      await fetchVendors(page, statusFilter)
    } catch (err) {
      console.error("Error rejecting vendors:", err)
      alert(err instanceof Error ? err.message : "Failed to reject vendors")
    }
  }

  const handleCreateVendor = async () => {
    try {
      setIsCreating(true)
      const response = await createVendor({
        name: newVendor.name,
        email: newVendor.email,
        gstNumber: newVendor.gstNumber,
        panCard: newVendor.panCard,
      })

      if (response.success) {
        // Refresh the list and close dialog
        setCreateDialogOpen(false)
        setNewVendor({ name: "", email: "", gstNumber: "", panCard: "" })
        window.location.reload()
      }
    } catch (error) {
      console.error("Failed to create vendor", error)
      alert(error instanceof Error ? error.message : "Failed to create vendor")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Vendor Management
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Review and manage vendor registration requests
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 rounded-lg border-slate-200 dark:border-slate-700 bg-transparent"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button
              size="sm"
              onClick={() => setCreateDialogOpen(true)}
              className="gap-2 rounded-lg bg-linear-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25 hover:from-violet-600 hover:to-purple-700"
            >
              <Plus className="h-4 w-4" />
              Add Vendor
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      {stat.label}
                    </p>
                    <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110",
                      stat.bgColor
                    )}
                  >
                    <Icon className={cn("h-6 w-6", stat.textColor)} />
                  </div>
                </div>
                <div
                  className={cn(
                    "absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-linear-to-br opacity-10 blur-2xl transition-opacity duration-300 group-hover:opacity-20",
                    stat.color
                  )}
                />
              </div>
            )
          })}
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search vendors by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 rounded-lg border-slate-200 bg-white pl-10 dark:border-slate-700 dark:bg-slate-900"
            />
          </div>
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px] rounded-lg border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
                <Filter className="mr-2 h-4 w-4 text-slate-400" />
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-10 w-10 shrink-0 rounded-lg border-slate-200 dark:border-slate-700 bg-transparent"
            >
              <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            </Button>
          </div>
        </div>

        {/* Data Table */}
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-slate-500 dark:text-slate-400">Loading vendors...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <Button onClick={handleRefresh}>Retry</Button>
            </div>
          </div>
        ) : (
          <DataTable
            data={filteredVendors}
            type="vendor"
            onApprove={handleApprove}
            onReject={handleReject}
          />
        )}

        {/* Create Vendor Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="rounded-2xl border-slate-200 sm:max-w-lg dark:border-slate-700">
            <DialogHeader>
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30">
                <UserPlus className="h-7 w-7 text-white" />
              </div>
              <DialogTitle className="text-center text-xl">
                Create New Vendor
              </DialogTitle>
              <DialogDescription className="text-center">
                Add a new vendor with their details.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Full Name
                </Label>
                <Input
                  id="name"
                  placeholder="Enter full name"
                  value={newVendor.name}
                  onChange={(e) =>
                    setNewVendor((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="rounded-lg border-slate-200 focus:border-violet-300 focus:ring-violet-200 dark:border-slate-700"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  value={newVendor.email}
                  onChange={(e) =>
                    setNewVendor((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="rounded-lg border-slate-200 focus:border-violet-300 focus:ring-violet-200 dark:border-slate-700"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gstNumber" className="text-sm font-medium">
                  GST Number
                </Label>
                <Input
                  id="gstNumber"
                  placeholder="Enter GST number"
                  value={newVendor.gstNumber}
                  onChange={(e) =>
                    setNewVendor((prev) => ({ ...prev, gstNumber: e.target.value }))
                  }
                  className="rounded-lg border-slate-200 focus:border-violet-300 focus:ring-violet-200 dark:border-slate-700"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="panCard" className="text-sm font-medium">
                  PAN Card Number
                </Label>
                <Input
                  id="panCard"
                  placeholder="Enter PAN Card number"
                  value={newVendor.panCard}
                  onChange={(e) =>
                    setNewVendor((prev) => ({ ...prev, panCard: e.target.value }))
                  }
                  className="rounded-lg border-slate-200 focus:border-violet-300 focus:ring-violet-200 dark:border-slate-700"
                />
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
                className="rounded-lg bg-transparent"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateVendor}
                disabled={
                  !newVendor.name.trim() ||
                  !newVendor.email.trim() ||
                  !newVendor.gstNumber.trim() ||
                  !newVendor.panCard.trim() ||
                  isCreating
                }
                className="gap-2 rounded-lg bg-linear-to-r from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    Create Vendor
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}
