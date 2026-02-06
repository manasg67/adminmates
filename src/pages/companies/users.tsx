"use client"

import { useEffect, useState } from "react"
import {
  Users,
  Plus,
  RefreshCw,
  Search,
  Mail,
  UserCheck,
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
import { createBranchUser, getMyBranches, getUsersByBranch, type CompanyUser, type Branch } from "@/lib/api"

const PAGE_SIZE = 10

export default function CompanyUsersPage() {
  const [users, setUsers] = useState<CompanyUser[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedBranchId, setSelectedBranchId] = useState<string>("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    branchId: "",
  })

  // Fetch branches
  const fetchBranches = async () => {
    try {
      const response = await getMyBranches(1, 100)
      const branchesData = Array.isArray(response.data) ? response.data : []
      setBranches(branchesData)
      if (branchesData.length > 0 && !selectedBranchId) {
        setSelectedBranchId(branchesData[0]._id || branchesData[0].id || "")
      }
    } catch (err) {
      console.error("Failed to fetch branches:", err)
    }
  }

  // Fetch users for selected branch
  const fetchUsers = async (pageNum: number = 1, branchId?: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const branch = branchId || selectedBranchId
      if (!branch) {
        setUsers([])
        return
      }

      const response = await getUsersByBranch(branch, pageNum, PAGE_SIZE)

      const usersData = Array.isArray(response.data) ? response.data : []
      const pages = response.totalPages || response.pagination?.totalPages || 1
      const total = response.totalUsers || response.pagination?.totalRecords || usersData.length

      setUsers(usersData)
      setTotalPages(pages)
      setTotalUsers(total)
      setPage(pageNum)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users")
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchBranches()
  }, [])

  useEffect(() => {
    if (selectedBranchId) {
      fetchUsers(1, selectedBranchId)
    }
  }, [selectedBranchId])

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchUsers(page)
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const handleCreateUser = async () => {
    try {
      setIsCreating(true)
      const response = await createBranchUser({
        name: newUser.name,
        email: newUser.email,
        branchId: newUser.branchId || selectedBranchId,
      })

      if (response.success) {
        setCreateDialogOpen(false)
        setNewUser({ name: "", email: "", branchId: "" })
        fetchUsers(1)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user")
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
                <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Branch Users</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Create and manage users for your branch
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
              Create User
            </Button>
          </div>
        </div>

        {/* Branch Selector & Filters */}
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="branch-select">Select Branch</Label>
              <Select value={selectedBranchId} onValueChange={(value) => setSelectedBranchId(value)}>
                <SelectTrigger id="branch-select">
                  <SelectValue placeholder="Select a branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch._id || branch.id} value={branch._id || branch.id || ""}>
                      {branch.branchName} - {branch.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="search">Search Users</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="search"
                  placeholder="Search by name or email..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Total users: <span className="font-semibold text-slate-900 dark:text-white">{totalUsers}</span>
          </div>
        </div>

        {/* Content */}
        <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading users...
            </div>
          ) : error ? (
            <div className="py-12 text-center text-sm text-red-500">{error}</div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">
              {users.length === 0 ? "No users in this branch" : "No users found"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                <thead className="bg-slate-50 dark:bg-slate-950">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      Branch
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {filteredUsers.map((user) => (
                    <tr key={user._id || user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-600">
                            {user.name?.charAt(0).toUpperCase() || "U"}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{user.name}</p>
                            <div className="flex items-center gap-1 text-xs text-slate-500">
                              <Mail className="h-3.5 w-3.5" />
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {user.branch?.branchName || "N/A"}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {user.branch?.location}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 dark:bg-blue-500/20 dark:text-blue-300">
                          <UserCheck className="mr-1 h-3.5 w-3.5" />
                          {user.role || "company-user"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          className={cn(
                            "border-0",
                            user.isActive
                              ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300"
                              : "bg-slate-500/10 text-slate-600 dark:bg-slate-500/20 dark:text-slate-300"
                          )}
                        >
                          {user.isActive ? "Active" : "Inactive"}
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
          <Button variant="outline" onClick={() => fetchUsers(page - 1)} disabled={page <= 1}>
            Previous
          </Button>
          <span className="text-sm text-slate-500">
            Page {page} of {totalPages}
          </span>
          <Button variant="outline" onClick={() => fetchUsers(page + 1)} disabled={page >= totalPages}>
            Next
          </Button>
        </div>
      </div>

      {/* Create User Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Branch User</DialogTitle>
            <DialogDescription>
              Create a new user for the selected branch. The user will receive login access.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user-branch">Branch</Label>
              <Select value={newUser.branchId || selectedBranchId} onValueChange={(value) => setNewUser((prev) => ({ ...prev, branchId: value }))}>
                <SelectTrigger id="user-branch">
                  <SelectValue placeholder="Select a branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch._id || branch.id} value={branch._id || branch.id || ""}>
                      {branch.branchName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-name">Name</Label>
              <Input
                id="user-name"
                value={newUser.name}
                onChange={(event) => setNewUser((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="User name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-email">Email</Label>
              <Input
                id="user-email"
                type="email"
                value={newUser.email}
                onChange={(event) => setNewUser((prev) => ({ ...prev, email: event.target.value }))}
                placeholder="user@company.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateUser}
              disabled={isCreating || !newUser.name || !newUser.email || (!newUser.branchId && !selectedBranchId)}
            >
              {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CompanyLayout>
  )
}
