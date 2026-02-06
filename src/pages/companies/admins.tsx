"use client"

import { useEffect, useState } from "react"
import {
  Users,
  Plus,
  RefreshCw,
  Search,
  Mail,
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
import { cn } from "@/lib/utils"
import { createCompanyAdmin, getCompanyUsers, type CompanyUser } from "@/lib/api"

const PAGE_SIZE = 10

export default function CompanyAdminsPage() {
  const [admins, setAdmins] = useState<CompanyUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newAdmin, setNewAdmin] = useState({ name: "", email: "" })

  const fetchAdmins = async (pageNum: number = 1, search?: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await getCompanyUsers(pageNum, PAGE_SIZE, search, "company-admin")

      const users = Array.isArray(response.data) ? response.data : []
      const pages = response.totalPages || response.pagination?.totalPages || 1
      const total = response.totalUsers || response.pagination?.totalRecords || users.length

      setAdmins(users)
      setTotalPages(pages)
      setTotalUsers(total)
      setPage(pageNum)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load company admins")
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchAdmins(1)
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchAdmins(1, searchQuery)
    }, 400)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchAdmins(page, searchQuery)
  }

  const handleCreateAdmin = async () => {
    try {
      setIsCreating(true)
      const response = await createCompanyAdmin({
        name: newAdmin.name,
        email: newAdmin.email,
      })

      if (response.success) {
        setCreateDialogOpen(false)
        setNewAdmin({ name: "", email: "" })
        fetchAdmins(1, searchQuery)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create admin")
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
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Company Admins</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Create and manage branch admins for your company
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
              {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            </Button>
            <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Admin
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search by name or email..."
              className="pl-9"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Total admins: <span className="font-semibold text-slate-900 dark:text-white">{totalUsers}</span>
          </div>
        </div>

        {/* Content */}
        <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading company admins...
            </div>
          ) : error ? (
            <div className="py-12 text-center text-sm text-red-500">{error}</div>
          ) : admins.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">No admins found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                <thead className="bg-slate-50 dark:bg-slate-950">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      Admin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      Active Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {admins.map((admin) => (
                    <tr key={admin._id || admin.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-600">
                            {admin.name?.charAt(0).toUpperCase() || "A"}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{admin.name}</p>
                            <div className="flex items-center gap-1 text-xs text-slate-500">
                              <Mail className="h-3.5 w-3.5" />
                              {admin.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 dark:bg-blue-500/20 dark:text-blue-300">
                          <Shield className="mr-1 h-3.5 w-3.5" />
                          {admin.role || "company-admin"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          className={cn(
                            "border-0",
                            (admin as any).isActive
                              ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300"
                              : "bg-slate-500/10 text-slate-600 dark:bg-slate-500/20 dark:text-slate-300"
                          )}
                        >
                          {(admin as any).isActive ? "Active" : "Inactive"}
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
          <Button variant="outline" onClick={() => fetchAdmins(page - 1, searchQuery)} disabled={page <= 1}>
            Previous
          </Button>
          <span className="text-sm text-slate-500">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => fetchAdmins(page + 1, searchQuery)}
            disabled={page >= totalPages}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Create Admin Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Company Admin</DialogTitle>
            <DialogDescription>
              Create a new branch admin for your company. The admin will receive login access.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-name">Name</Label>
              <Input
                id="admin-name"
                value={newAdmin.name}
                onChange={(event) => setNewAdmin((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Admin name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email</Label>
              <Input
                id="admin-email"
                type="email"
                value={newAdmin.email}
                onChange={(event) => setNewAdmin((prev) => ({ ...prev, email: event.target.value }))}
                placeholder="admin@company.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateAdmin} disabled={isCreating || !newAdmin.name || !newAdmin.email}>
              {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Admin"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CompanyLayout>
  )
}
