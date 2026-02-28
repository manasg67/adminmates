"use client"

import { useEffect, useState } from "react"
import { DollarSign, Edit2, Save, X, Loader2, AlertCircle } from "lucide-react"
import { CompanyLayout } from "@/components/company/company-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getCompanyUsers, getMyLimit, getUserLimit, setUserLimit, type CompanyUser } from "@/lib/api"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 10

export default function MonthlyLimitsPage() {
  const [users, setUsers] = useState<CompanyUser[]>([])
  const [myLimit, setMyLimit] = useState<{ limit: number; spent: number; remaining: number; role: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedUser, setSelectedUser] = useState<CompanyUser | null>(null)
  const [userLimitData, setUserLimitData] = useState<{ limit: number; spent: number; remaining: number } | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [newLimit, setNewLimit] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [selectedRole, setSelectedRole] = useState<string>("company-admin")

  useEffect(() => {
    loadMyLimit()
    loadUsers(1)
  }, [selectedRole])

  useEffect(() => {
    loadUsers(page)
  }, [page])

  const loadMyLimit = async () => {
    try {
      const response = await getMyLimit()
      if (response.success) {
        setMyLimit({
          limit: response.data.monthlyLimit || 0,
          spent: response.data.monthlySpent,
          remaining: response.data.remainingLimit || 0,
          role: response.data.role,
        })
      }
    } catch (err) {
      console.error("Failed to load my limit:", err)
    }
  }

  const loadUsers = async (pageNum: number = 1) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await getCompanyUsers(pageNum, PAGE_SIZE, undefined, selectedRole)
      if (response.success) {
        setUsers(response.data)
        setTotalPages(response.totalPages || 1)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditLimit = async (user: CompanyUser) => {
    try {
      const response = await getUserLimit(user.id || user._id || "")
      if (response.success) {
        setSelectedUser(user)
        setUserLimitData({
          limit: response.data.monthlyLimit || 0,
          spent: response.data.monthlySpent,
          remaining: response.data.remainingLimit || 0,
        })
        setNewLimit((response.data.monthlyLimit || 0).toString())
        setEditDialogOpen(true)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load user limit")
    }
  }

  const handleSaveLimit = async () => {
    if (!selectedUser || !newLimit) {
      setSaveError("Please enter a valid limit")
      return
    }

    try {
      setIsSaving(true)
      setSaveError(null)
      const limitValue = parseInt(newLimit)
      
      if (isNaN(limitValue) || limitValue < 0) {
        setSaveError("Please enter a valid positive number")
        return
      }

      const response = await setUserLimit(selectedUser.id || selectedUser._id || "", limitValue)
      if (response.success) {
        setEditDialogOpen(false)
        loadUsers()
        alert("Monthly limit updated successfully!")
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save limit")
    } finally {
      setIsSaving(false)
    }
  }

  const getLimitStatusColor = (spent: number, limit: number) => {
    if (limit === 0) return "text-gray-600"
    const percentage = (spent / limit) * 100
    if (percentage >= 100) return "text-red-600"
    if (percentage >= 80) return "text-orange-600"
    return "text-green-600"
  }

  return (
    <CompanyLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <DollarSign className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Monthly Limits</h1>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* My Limit Card */}
        {myLimit && (
          <Card className="p-6 bg-blue-50 border-blue-200">
            <h2 className="text-lg font-bold mb-4">Your Monthly Limit</h2>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Monthly Limit</p>
                {myLimit.limit === 0 ? (
                  <Badge variant="secondary" className="text-base">Unlimited</Badge>
                ) : (
                  <p className="text-2xl font-bold text-blue-600">₹{myLimit.limit.toLocaleString()}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Amount Spent</p>
                <p className={cn("text-2xl font-bold", getLimitStatusColor(myLimit.spent, myLimit.limit))}>
                  ₹{myLimit.spent.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Remaining</p>
                <p className={cn("text-2xl font-bold", getLimitStatusColor(myLimit.spent, myLimit.limit))}>
                  {myLimit.limit === 0 ? "Unlimited" : `₹${myLimit.remaining.toLocaleString()}`}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Usage</p>
                {myLimit.limit === 0 ? (
                  <p className="text-lg">-</p>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <p className="text-2xl font-bold">{((myLimit.spent / myLimit.limit) * 100).toFixed(0)}%</p>
                    <p className="text-sm text-gray-600">used</p>
                  </div>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            {myLimit.limit > 0 && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={cn(
                      "h-2 rounded-full transition-all",
                      myLimit.spent >= myLimit.limit
                        ? "bg-red-500"
                        : myLimit.spent >= myLimit.limit * 0.8
                          ? "bg-orange-500"
                          : "bg-green-500"
                    )}
                    style={{
                      width: `${Math.min((myLimit.spent / myLimit.limit) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Users Limits Section */}
        {myLimit?.role === "company-admin" || myLimit?.role === "super-admin" ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">User Monthly Limits</h2>
              <div className="w-48">
                <Label htmlFor="role-filter" className="text-sm mb-2 block">Filter by Role</Label>
                <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value)}>
                  <SelectTrigger id="role-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="company-admin">Company Admin</SelectItem>
                    <SelectItem value="company-user">Company User</SelectItem>
                    <SelectItem value="super-admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex items-center justify-center min-h-96">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                  <p>Loading users...</p>
                </div>
              </div>
            ) : users.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-gray-600">No users found</p>
              </Card>
            ) : (
              <>
                <div className="space-y-3">
                  {users.map((user) => (
                    <Card key={user._id || user.id} className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{user.name}</h3>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">{user.role}</Badge>
                            {user.branch && (
                              <Badge variant="secondary">{user.branch.branchName}</Badge>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-sm text-gray-600">Monthly Limit</p>
                          {user.monthlyLimit === 0 ? (
                            <Badge variant="secondary">Unlimited</Badge>
                          ) : (
                            <p className="text-lg font-semibold text-blue-600">
                              ₹{user.monthlyLimit?.toLocaleString() || "N/A"}
                            </p>
                          )}
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditLimit(user)}
                        >
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-gray-600">
                      Page {page} of {totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                        disabled={page === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <Alert>
            <AlertDescription>
              Only company admins can manage user monthly limits. Contact your administrator to set or update your limit.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Edit Limit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Monthly Limit</DialogTitle>
            <DialogDescription>
              Set monthly spending limit for {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>

          {saveError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{saveError}</AlertDescription>
            </Alert>
          )}

          {userLimitData && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50 rounded">
                <div>
                  <p className="text-xs text-gray-600">Currently Spent</p>
                  <p className="font-semibold">₹{userLimitData.spent.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Current Limit</p>
                  <p className="font-semibold">₹{userLimitData.limit.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Remaining</p>
                  <p className="font-semibold">₹{userLimitData.remaining.toLocaleString()}</p>
                </div>
              </div>

              <div>
                <Label htmlFor="new-limit">New Monthly Limit (₹)</Label>
                <Input
                  id="new-limit"
                  type="number"
                  min="0"
                  step="1000"
                  value={newLimit}
                  onChange={(e) => setNewLimit(e.target.value)}
                  placeholder="Enter new monthly limit"
                  className="mt-2"
                />
                <p className="text-xs text-gray-600 mt-2">
                  Enter 0 for unlimited access
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSaveLimit} disabled={isSaving}>
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Save className="w-4 h-4 mr-2" />
              Save Limit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CompanyLayout>
  )
}
