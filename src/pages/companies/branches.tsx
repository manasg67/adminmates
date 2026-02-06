"use client"

import { useEffect, useState } from "react"
import {
  Building2,
  Plus,
  RefreshCw,
  Search,
  MapPin,
  Shield,
  Loader2,
} from "lucide-react"
import { CompanyLayout } from "@/components/company/company-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { createBranch, getMyBranches, getCompanyUsers, type Branch, type CompanyUser } from "@/lib/api"

const PAGE_SIZE = 10

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [admins, setAdmins] = useState<CompanyUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalBranches, setTotalBranches] = useState(0)

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newBranch, setNewBranch] = useState({
    branchName: "",
    location: "",
    branchAdminId: "",
  })

  // Fetch company admins for dropdown
  const fetchAdmins = async () => {
    try {
      const response = await getCompanyUsers(1, 100, "", "company-admin")
      const users = Array.isArray(response.data) ? response.data : []
      setAdmins(users)
    } catch (err) {
      console.error("Failed to fetch admins:", err)
    }
  }

  // Fetch branches
  const fetchBranches = async (pageNum: number = 1) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await getMyBranches(pageNum, PAGE_SIZE)

      const branchesData = Array.isArray(response.data) ? response.data : []
      const pages = response.totalPages || response.pagination?.totalPages || 1
      const total = response.totalBranches || response.pagination?.totalRecords || branchesData.length

      setBranches(branchesData)
      setTotalPages(pages)
      setTotalBranches(total)
      setPage(pageNum)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load branches")
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchAdmins()
    fetchBranches(1)
  }, [])

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchBranches(page)
  }

  const filteredBranches = branches.filter((branch) => {
    const matchesSearch =
      branch.branchName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      branch.location.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const handleCreateBranch = async () => {
    try {
      setIsCreating(true)
      const response = await createBranch({
        branchName: newBranch.branchName,
        location: newBranch.location,
        branchAdminId: newBranch.branchAdminId,
      })

      if (response.success) {
        setCreateDialogOpen(false)
        setNewBranch({ branchName: "", location: "", branchAdminId: "" })
        fetchBranches(1)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create branch")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <CompanyLayout>
      <div className="space-y-8 p-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Company Branches</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">Create and manage company branches</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
              {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            </Button>
            <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Branch
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search branches..."
              className="pl-9"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Total branches: <span className="font-semibold text-slate-900 dark:text-white">{totalBranches}</span>
          </div>
        </div>

        {/* Content */}
        <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading branches...
            </div>
          ) : error ? (
            <div className="py-12 text-center text-sm text-red-500">{error}</div>
          ) : filteredBranches.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">No branches found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                <thead className="bg-slate-50 dark:bg-slate-950">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      Branch
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      Branch Admin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {filteredBranches.map((branch) => (
                    <tr key={branch._id || branch.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-600">
                            <Building2 className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{branch.branchName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <MapPin className="h-4 w-4" />
                          {branch.location}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 text-xs font-medium">
                            {branch.branchAdmin?.name?.charAt(0).toUpperCase() || "A"}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">
                              {branch.branchAdmin?.name || "N/A"}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{branch.branchAdmin?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          className={cn(
                            "border-0",
                            branch.isActive
                              ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300"
                              : "bg-slate-500/10 text-slate-600 dark:bg-slate-500/20 dark:text-slate-300"
                          )}
                        >
                          {branch.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" onClick={() => fetchBranches(page - 1)} disabled={page <= 1}>
            Previous
          </Button>
          <span className="text-sm text-slate-500">
            Page {page} of {totalPages}
          </span>
          <Button variant="outline" onClick={() => fetchBranches(page + 1)} disabled={page >= totalPages}>
            Next
          </Button>
        </div>
      </div>

      {/* Create Branch Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Branch</DialogTitle>
            <DialogDescription>Create a new branch for your company and assign a branch admin.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="branch-name">Branch Name</Label>
              <Input
                id="branch-name"
                value={newBranch.branchName}
                onChange={(event) => setNewBranch((prev) => ({ ...prev, branchName: event.target.value }))}
                placeholder="e.g., Mumbai Branch"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch-location">Location</Label>
              <Input
                id="branch-location"
                value={newBranch.location}
                onChange={(event) => setNewBranch((prev) => ({ ...prev, location: event.target.value }))}
                placeholder="e.g., Mumbai, Maharashtra"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch-admin">Branch Admin</Label>
              <Select value={newBranch.branchAdminId} onValueChange={(value) => setNewBranch((prev) => ({ ...prev, branchAdminId: value }))}>
                <SelectTrigger id="branch-admin">
                  <SelectValue placeholder="Select a branch admin" />
                </SelectTrigger>
                <SelectContent>
                  {admins.map((admin) => (
                    <SelectItem key={admin._id || admin.id} value={admin._id || admin.id || ""}>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        {admin.name} ({admin.email})
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateBranch}
              disabled={isCreating || !newBranch.branchName || !newBranch.location || !newBranch.branchAdminId}
            >
              {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Branch"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CompanyLayout>
  )
}
