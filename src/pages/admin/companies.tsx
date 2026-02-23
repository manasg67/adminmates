"use client"

import { useState, useEffect } from "react"
import {
  Search,
  Filter,
  RefreshCw,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  Loader2,
  Upload,
  X,
  FileText,
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
import { getCompanies, approveUser, rejectUser, bulkApprove, bulkReject, createUser } from "@/lib/api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Building2 as BuildingIcon } from "lucide-react"

export default function CompaniesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [companies, setCompanies] = useState<DataItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [, setTotalPages] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)

  // Add Company State
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newCompany, setNewCompany] = useState({
    name: "",
    email: "",
    gstNumber: "",
    panCard: "",
    companyLocation: "",
  })
  const [certificateFile, setCertificateFile] = useState<File | null>(null)
  const [certificatePreview, setCertificatePreview] = useState<string>("")

  // Calculate stats from companies data
  const stats = [
    {
      label: "Total Companies",
      value: totalUsers,
      icon: Building2,
      color: "from-blue-500 to-cyan-600",
      bgColor: "bg-blue-500/10",
      textColor: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Approved",
      value: companies.filter((c) => c.approvalStatus === "approved").length,
      icon: CheckCircle2,
      color: "from-emerald-500 to-green-600",
      bgColor: "bg-emerald-500/10",
      textColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Pending",
      value: companies.filter((c) => c.approvalStatus === "pending").length,
      icon: Clock,
      color: "from-amber-500 to-orange-600",
      bgColor: "bg-amber-500/10",
      textColor: "text-amber-600 dark:text-amber-400",
    },
    {
      label: "Rejected",
      value: companies.filter((c) => c.approvalStatus === "rejected").length,
      icon: XCircle,
      color: "from-red-500 to-rose-600",
      bgColor: "bg-red-500/10",
      textColor: "text-red-600 dark:text-red-400",
    },
  ]

  // Fetch companies/users
  const fetchCompanies = async (pageNum: number = 1, status?: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const statusParam = status && status !== "all" ? status : undefined
      const response = await getCompanies(statusParam as "pending" | "approved" | "rejected" | undefined, pageNum, 10)

      if (response.success) {
        setCompanies(response.data as DataItem[])
        setTotalUsers(response.totalCompanies)
        setTotalPages(response.totalPages)
        setPage(response.currentPage)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load companies")
      console.error("Error fetching companies:", err)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  // Initial load and when status filter changes
  useEffect(() => {
    fetchCompanies(1, statusFilter)
  }, [statusFilter])

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch =
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.email.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchCompanies(page, statusFilter)
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
      await fetchCompanies(page, statusFilter)
    } catch (err) {
      console.error("Error approving companies:", err)
      alert(err instanceof Error ? err.message : "Failed to approve companies")
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
      await fetchCompanies(page, statusFilter)
    } catch (err) {
      console.error("Error rejecting companies:", err)
      alert(err instanceof Error ? err.message : "Failed to reject companies")
    }
  }

  const handleCreateCompany = async () => {
    try {
      if (!certificateFile) {
        alert("Please upload a certificate")
        return
      }

      if (!newCompany.name.trim() || !newCompany.email.trim() || !newCompany.companyLocation.trim()) {
        alert("Please fill in all required fields")
        return
      }

      setIsCreating(true)
      
      // Use FormData for file upload
      const formData = new FormData()
      formData.append('name', newCompany.name)
      formData.append('email', newCompany.email)
      formData.append('gstNumber', newCompany.gstNumber)
      formData.append('panCard', newCompany.panCard)
      formData.append('companyLocation', newCompany.companyLocation)
      formData.append('seCertificate', certificateFile)

      const response = await createUser(formData)

      if (response.success) {
        // Refresh the list and close dialog
        setCreateDialogOpen(false)
        setNewCompany({ name: "", email: "", gstNumber: "", panCard: "", companyLocation: "" })
        setCertificateFile(null)
        setCertificatePreview("")
        await fetchCompanies(1, statusFilter)
      } else {
        alert(response.message || "Failed to create company")
      }
    } catch (error) {
      console.error("Failed to create company", error)
      alert(error instanceof Error ? error.message : "Failed to create company")
    } finally {
      setIsCreating(false)
    }
  }

  const handleCertificateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCertificateFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setCertificatePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeCertificate = () => {
    setCertificateFile(null)
    setCertificatePreview("")
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
          {/* Page Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Company Management
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Review and manage company registration requests
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => setCreateDialogOpen(true)}
                className="gap-2 rounded-lg bg-linear-to-r from-blue-500 to-cyan-600 text-white shadow-lg shadow-blue-500/25 hover:from-blue-600 hover:to-cyan-700"
              >
                <Plus className="h-4 w-4" />
                Add Company
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
                placeholder="Search companies by name or email..."
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
                <p className="text-slate-500 dark:text-slate-400">Loading companies...</p>
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
              data={filteredCompanies}
              type="company"
              onApprove={handleApprove}
              onReject={handleReject}
            />
          )}

          {/* Create Company Dialog */}
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogContent className="rounded-2xl border-slate-200 sm:max-w-lg dark:border-slate-700">
              <DialogHeader>
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-cyan-600 shadow-lg shadow-blue-500/30">
                  <BuildingIcon className="h-7 w-7 text-white" />
                </div>
                <DialogTitle className="text-center text-xl">
                  Create New Company
                </DialogTitle>
                <DialogDescription className="text-center">
                  Add a new company with their details.
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
                    value={newCompany.name}
                    onChange={(e) =>
                      setNewCompany((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="rounded-lg border-slate-200 focus:border-blue-300 focus:ring-blue-200 dark:border-slate-700"
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
                    value={newCompany.email}
                    onChange={(e) =>
                      setNewCompany((prev) => ({ ...prev, email: e.target.value }))
                    }
                    className="rounded-lg border-slate-200 focus:border-blue-300 focus:ring-blue-200 dark:border-slate-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gstNumber" className="text-sm font-medium">
                    GST Number
                  </Label>
                  <Input
                    id="gstNumber"
                    placeholder="Enter GST number"
                    value={newCompany.gstNumber}
                    onChange={(e) =>
                      setNewCompany((prev) => ({ ...prev, gstNumber: e.target.value }))
                    }
                    className="rounded-lg border-slate-200 focus:border-blue-300 focus:ring-blue-200 dark:border-slate-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="panCard" className="text-sm font-medium">
                    PAN Card Number
                  </Label>
                  <Input
                    id="panCard"
                    placeholder="Enter PAN Card number"
                    value={newCompany.panCard}
                    onChange={(e) =>
                      setNewCompany((prev) => ({ ...prev, panCard: e.target.value }))
                    }
                    className="rounded-lg border-slate-200 focus:border-blue-300 focus:ring-blue-200 dark:border-slate-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyLocation" className="text-sm font-medium">
                    Company Location
                  </Label>
                  <Input
                    id="companyLocation"
                    placeholder="Enter company location"
                    value={newCompany.companyLocation}
                    onChange={(e) =>
                      setNewCompany((prev) => ({ ...prev, companyLocation: e.target.value }))
                    }
                    className="rounded-lg border-slate-200 focus:border-blue-300 focus:ring-blue-200 dark:border-slate-700"
                  />
                </div>

                {/* Certificate Upload */}
                <div className="space-y-2">
                  <Label htmlFor="certificate" className="text-sm font-medium">
                    Business Certificate / Registration Document
                  </Label>
                  <div className="relative">
                    <input
                      id="certificate"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={handleCertificateUpload}
                      className="hidden"
                    />
                    {!certificateFile ? (
                      <label
                        htmlFor="certificate"
                        className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-6 transition-colors hover:border-blue-400 hover:bg-blue-50 dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700"
                      >
                        <Upload className="h-5 w-5 text-slate-400" />
                        <div className="text-center">
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                            Click to upload certificate
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            PDF, JPG, PNG, DOC up to 10MB
                          </p>
                        </div>
                      </label>
                    ) : (
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {certificateFile.type.startsWith("image/") ? (
                              <div className="relative">
                                <img
                                  src={certificatePreview}
                                  alt="Certificate"
                                  className="h-12 w-12 rounded object-cover"
                                />
                              </div>
                            ) : (
                              <FileText className="h-8 w-8 text-blue-600" />
                            )}
                            <div>
                              <p className="text-sm font-medium text-slate-900 dark:text-white">
                                {certificateFile.name}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {(certificateFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={removeCertificate}
                            className="rounded-lg p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Upload business registration, GST certificate, or other official documents
                  </p>
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
                  onClick={handleCreateCompany}
                  disabled={
                    !newCompany.name.trim() ||
                    !newCompany.email.trim() ||
                    !newCompany.gstNumber.trim() ||
                    !newCompany.panCard.trim() ||
                    !newCompany.companyLocation.trim() ||
                    !certificateFile ||
                    isCreating
                  }
                  className="gap-2 rounded-lg bg-linear-to-r from-blue-500 to-cyan-600 text-white hover:from-blue-600 hover:to-cyan-700"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <BuildingIcon className="h-4 w-4" />
                      Create Company
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
