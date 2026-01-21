"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  UserCog,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  MoreHorizontal,
  Eye,
  Trash2,
  Mail,
  Shield,
  AlertCircle,
  UserPlus,
  Loader2,
} from "lucide-react"
import { AdminLayout } from "@/components/admin/admin-layout"
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
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Suspense } from "react"
import { getSubAdmins, toggleSubAdminStatus, createSubAdmin, type SubAdmin, getUserData } from "@/lib/api"

export default function SubAdminsPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [subAdmins, setSubAdmins] = useState<SubAdmin[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalRecords: 0
  })

  // Check access control
  useEffect(() => {
    const user = getUserData()
    if (user && user.role !== 'admin') {
      navigate('/admin/dashboard', { replace: true })
    }
  }, [navigate])
  
  const [stats, setStats] = useState([
    {
      label: "Total Sub-Admins",
      value: 0,
      icon: UserCog,
      color: "from-indigo-500 to-blue-600",
      bgColor: "bg-indigo-500/10",
      textColor: "text-indigo-600 dark:text-indigo-400",
    },
    {
      label: "Active",
      value: 0,
      icon: CheckCircle2,
      color: "from-emerald-500 to-green-600",
      bgColor: "bg-emerald-500/10",
      textColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Inactive",
      value: 0,
      icon: XCircle,
      color: "from-slate-500 to-gray-600",
      bgColor: "bg-slate-500/10",
      textColor: "text-slate-600 dark:text-slate-400",
    },
    {
      label: "Pending Approval",
      value: 0,
      icon: Clock,
      color: "from-amber-500 to-orange-600",
      bgColor: "bg-amber-500/10",
      textColor: "text-amber-600 dark:text-amber-400",
    },
  ])

  const fetchSubAdmins = async () => {
    try {
      setIsLoading(true)
      const response = await getSubAdmins(pagination.page, pagination.limit, searchQuery)
      if (response.success) {
        setSubAdmins(response.data.subAdmins)
        setPagination(prev => ({
          ...prev,
          totalPages: response.data.pagination.totalPages,
          totalRecords: response.data.pagination.totalSubAdmins
        }))
        
        // Update total count stats
        setStats(prev => prev.map(stat => 
          stat.label === "Total Sub-Admins" 
            ? { ...stat, value: response.data.pagination.totalSubAdmins }
            : stat
        ))
      }
    } catch (error) {
      console.error("Failed to fetch sub-admins", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSubAdmins()
  }, [pagination.page, pagination.limit])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (pagination.page === 1) {
        fetchSubAdmins()
      } else {
        setPagination(prev => ({ ...prev, page: 1 }))
      }
    }, 500)
    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const [newSubAdmin, setNewSubAdmin] = useState({
    name: "",
    email: "",
    password: "",
  })

  const filteredSubAdmins = subAdmins.filter((admin) => {
    // Search is now handled server-side
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && admin.isActive) ||
      (statusFilter === "inactive" && !admin.isActive) ||
      (statusFilter === "pending" && admin.approvalStatus === "pending")
    return matchesStatus
  })

  const allSelected =
    filteredSubAdmins.length > 0 && selectedIds.length === filteredSubAdmins.length
  const someSelected =
    selectedIds.length > 0 && selectedIds.length < filteredSubAdmins.length

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredSubAdmins.map((item) => item._id))
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const toggleActiveStatus = async (id: string) => {
    try {
      const response = await toggleSubAdminStatus(id)
      if (response.success) {
        setSubAdmins((prev) =>
          prev.map((admin) =>
            admin._id === id ? { ...admin, isActive: !admin.isActive } : admin
          )
        )
      }
    } catch (error) {
      console.error("Failed to toggle status", error)
    }
  }

  const handleCreateSubAdmin = async () => {
    try {
      setIsCreating(true)
      const response = await createSubAdmin({
        name: newSubAdmin.name,
        email: newSubAdmin.email,
      })

      if (response.success) {
        // Refresh the list and close dialog
        setCreateDialogOpen(false)
        setNewSubAdmin({ name: "", email: "", password: "" })
        window.location.reload()
      }
    } catch (error) {
      console.error("Failed to create sub-admin", error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleBulkActivate = () => {
    setSubAdmins((prev) =>
      prev.map((admin) =>
        selectedIds.includes(admin._id) ? { ...admin, isActive: true } : admin
      )
    )
    setSelectedIds([])
  }

  const handleBulkDeactivate = () => {
    setSubAdmins((prev) =>
      prev.map((admin) =>
        selectedIds.includes(admin._id) ? { ...admin, isActive: false } : admin
      )
    )
    setSelectedIds([])
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <AdminLayout>
      <Suspense>
        <div className="space-y-8">
          {/* Page Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Sub-Admin Management
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Manage sub-administrators and their access permissions
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
                className="gap-2 rounded-lg bg-linear-to-r from-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-600 hover:to-blue-700"
              >
                <Plus className="h-4 w-4" />
                Add Sub-Admin
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
                placeholder="Search sub-admins by name or email..."
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 shrink-0 rounded-lg border-slate-200 dark:border-slate-700 bg-transparent"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Bulk Actions Bar */}
          <div
            className={cn(
              "flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 dark:border-slate-800 dark:bg-slate-900",
              selectedIds.length > 0 &&
                "border-indigo-200 bg-indigo-50/50 dark:border-indigo-900 dark:bg-indigo-950/30"
            )}
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleSelectAll}
                  className={cn(
                    "h-5 w-5 rounded-md border-2 transition-all",
                    allSelected || someSelected
                      ? "border-indigo-500 bg-indigo-500 text-white"
                      : "border-slate-300 dark:border-slate-600"
                  )}
                />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {selectedIds.length > 0
                    ? `${selectedIds.length} selected`
                    : `${filteredSubAdmins.length} sub-admins`}
                </span>
              </div>
            </div>

            <div
              className={cn(
                "flex items-center gap-2 transition-all duration-300",
                selectedIds.length === 0 && "pointer-events-none opacity-0"
              )}
            >
              <Button
                onClick={handleBulkActivate}
                disabled={selectedIds.length === 0}
                className="gap-2 bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-600"
              >
                <CheckCircle2 className="h-4 w-4" />
                Activate Selected
              </Button>
              <Button
                onClick={handleBulkDeactivate}
                disabled={selectedIds.length === 0}
                variant="outline"
                className="gap-2 border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800 bg-transparent"
              >
                <XCircle className="h-4 w-4" />
                Deactivate Selected
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50">
                    <th className="w-12 px-4 py-3">
                      <span className="sr-only">Select</span>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Sub-Admin
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Approved By
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Status
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Active
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Created
                    </th>
                    <th className="w-12 px-4 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {isLoading ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center">
                        <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-500" />
                      </td>
                    </tr>
                  ) : filteredSubAdmins.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500">
                        No sub-admins found
                      </td>
                    </tr>
                  ) : (
                    filteredSubAdmins.map((admin) => {
                    const isSelected = selectedIds.includes(admin._id)
                    return (
                      <tr
                        key={admin._id}
                        className={cn(
                          "group transition-all duration-200",
                          isSelected
                            ? "bg-indigo-50/70 dark:bg-indigo-950/30"
                            : "hover:bg-slate-50/70 dark:hover:bg-slate-800/50"
                        )}
                      >
                        <td className="px-4 py-4">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleSelect(admin._id)}
                            className={cn(
                              "h-5 w-5 rounded-md border-2 transition-all",
                              isSelected
                                ? "border-indigo-500 bg-indigo-500 text-white"
                                : "border-slate-300 group-hover:border-slate-400 dark:border-slate-600"
                            )}
                          />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border-2 border-slate-100 shadow-sm dark:border-slate-700">
                              <AvatarFallback className="bg-linear-to-br from-indigo-500 to-blue-600 text-sm font-semibold text-white">
                                {getInitials(admin.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white">
                                {admin.name}
                              </p>
                              <div className="flex items-center gap-1 text-xs text-slate-500">
                                <Shield className="h-3 w-3" />
                                <span className="capitalize">{admin.role}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                            <Mail className="h-4 w-4 text-slate-400"
 />
                            {admin.email}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          {admin.approvedBy ? (
                            <div className="text-sm">
                              <p className="font-medium text-slate-700 dark:text-slate-300">
                                {admin.approvedBy.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                {admin.approvedAt && formatDate(admin.approvedAt)}
                              </p>
                            </div>
                          ) : (
                            <span className="text-sm text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          {admin.approvalStatus === "approved" ? (
                            <Badge className="border-0 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400">
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              Approved
                            </Badge>
                          ) : admin.approvalStatus === "pending" ? (
                            <Badge className="border-0 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400">
                              <Clock className="mr-1 h-3 w-3" />
                              Pending
                            </Badge>
                          ) : (
                            <Badge className="border-0 bg-red-500/10 text-red-600 hover:bg-red-500/20 dark:bg-red-500/20 dark:text-red-400">
                              <XCircle className="mr-1 h-3 w-3" />
                              Rejected
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex justify-center">
                            <Switch
                              checked={admin.isActive}
                              onCheckedChange={() => toggleActiveStatus(admin._id)}
                              className="data-[state=checked]:bg-emerald-500"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            {formatDate(admin.createdAt)}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="w-48 rounded-xl border-slate-200 shadow-xl dark:border-slate-700"
                            >
                              <DropdownMenuItem className="gap-2 rounded-lg">
                                <Eye className="h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2 rounded-lg">
                                <Shield className="h-4 w-4" />
                                Edit Permissions
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="gap-2 rounded-lg text-red-600 focus:bg-red-50 focus:text-red-700 dark:text-red-400">
                                <Trash2 className="h-4 w-4" />
                                Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    )
                  })
                  )}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {filteredSubAdmins.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 rounded-full bg-slate-100 p-4 dark:bg-slate-800">
                  <AlertCircle className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  No sub-admins found
                </h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Create a new sub-admin to get started.
                </p>
              </div>
            )}
          </div>

          {/* Create Sub-Admin Dialog */}
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogContent className="rounded-2xl border-slate-200 sm:max-w-lg dark:border-slate-700">
              <DialogHeader>
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-blue-600 shadow-lg shadow-indigo-500/30">
                  <UserPlus className="h-7 w-7 text-white" />
                </div>
                <DialogTitle className="text-center text-xl">
                  Create New Sub-Admin
                </DialogTitle>
                <DialogDescription className="text-center">
                  Add a new sub-administrator with management access.
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
                    value={newSubAdmin.name}
                    onChange={(e) =>
                      setNewSubAdmin((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="rounded-lg border-slate-200 focus:border-indigo-300 focus:ring-indigo-200 dark:border-slate-700"
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
                    value={newSubAdmin.email}
                    onChange={(e) =>
                      setNewSubAdmin((prev) => ({ ...prev, email: e.target.value }))
                    }
                    className="rounded-lg border-slate-200 focus:border-indigo-300 focus:ring-indigo-200 dark:border-slate-700"
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
                  onClick={handleCreateSubAdmin}
                  disabled={
                    !newSubAdmin.name.trim() ||
                    !newSubAdmin.email.trim() ||
                    isCreating
                  }
                  className="gap-2 rounded-lg bg-linear-to-r from-indigo-500 to-blue-600 text-white hover:from-indigo-600 hover:to-blue-700"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      Create Sub-Admin
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </Suspense>
    </AdminLayout>
  )
}
