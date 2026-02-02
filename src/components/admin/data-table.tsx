"use client"

import { useState } from "react"
import {
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  Eye,
  Trash2,
  Mail,
  FileText,
  AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
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
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export interface DataItem {
  _id: string
  name: string
  email: string
  role: string
  gstNumber?: string
  panCard?: string
  companyLocation?: string
  vendorLocation?: string
  aadharNumber?: string
  isApproved: boolean
  approvalStatus: "pending" | "approved" | "rejected"
  isActive: boolean
  createdAt: string
  updatedAt: string
  approvedAt?: string
  approvedBy?: {
    _id: string
    name: string
    email: string
  }
  rejectionReason?: string
}

interface DataTableProps {
  data: DataItem[]
  type: "vendor" | "company"
  onApprove?: (ids: string[]) => void
  onReject?: (ids: string[], reason: string) => void
}

export function DataTable({ data, type, onApprove, onReject }: DataTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")

  const allSelected = data.length > 0 && selectedIds.length === data.length
  const someSelected = selectedIds.length > 0 && selectedIds.length < data.length

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([])
    } else {
      setSelectedIds(data.map((item) => item._id))
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const handleApprove = () => {
    if (onApprove && selectedIds.length > 0) {
      onApprove(selectedIds)
      setSelectedIds([])
    }
  }

  const handleReject = () => {
    if (onReject && selectedIds.length > 0) {
      onReject(selectedIds, rejectionReason)
      setSelectedIds([])
      setRejectDialogOpen(false)
      setRejectionReason("")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="border-0 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="border-0 bg-red-500/10 text-red-600 hover:bg-red-500/20 dark:bg-red-500/20 dark:text-red-400">
            <XCircle className="mr-1 h-3 w-3" />
            Rejected
          </Badge>
        )
      default:
        return (
          <Badge className="border-0 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400">
            <AlertCircle className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        )
    }
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
    <div className="space-y-4">
      {/* Bulk Actions Bar */}
      <div
        className={cn(
          "flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 dark:border-slate-800 dark:bg-slate-900",
          selectedIds.length > 0 &&
            "border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/30"
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
                  ? "border-blue-500 bg-blue-500 text-white"
                  : "border-slate-300 dark:border-slate-600"
              )}
            />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {selectedIds.length > 0
                ? `${selectedIds.length} selected`
                : `${data.length} ${type === "vendor" ? "vendors" : "companies"}`}
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
            onClick={handleApprove}
            disabled={selectedIds.length === 0}
            className="gap-2 bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-600"
          >
            <CheckCircle2 className="h-4 w-4" />
            Approve Selected
          </Button>
          <Button
            onClick={() => setRejectDialogOpen(true)}
            disabled={selectedIds.length === 0}
            variant="outline"
            className="gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
          >
            <XCircle className="h-4 w-4" />
            Reject Selected
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
                  {type === "vendor" ? "Vendor" : "Company"}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Contact
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  GST Number
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  PAN Number
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Location
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Registered
                </th>
                <th className="w-12 px-4 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.map((item) => {
                const isSelected = selectedIds.includes(item._id)
                return (
                  <tr
                    key={item._id}
                    className={cn(
                      "group transition-all duration-200",
                      isSelected
                        ? "bg-blue-50/70 dark:bg-blue-950/30"
                        : "hover:bg-slate-50/70 dark:hover:bg-slate-800/50"
                    )}
                  >
                    <td className="px-4 py-4">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleSelect(item._id)}
                        className={cn(
                          "h-5 w-5 rounded-md border-2 transition-all",
                          isSelected
                            ? "border-blue-500 bg-blue-500 text-white"
                            : "border-slate-300 group-hover:border-slate-400 dark:border-slate-600"
                        )}
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-slate-100 shadow-sm dark:border-slate-700">
                          <AvatarFallback
                            className={cn(
                              "text-sm font-semibold",
                              type === "vendor"
                                ? "bg-linear-to-br from-violet-500 to-purple-600 text-white"
                                : "bg-linear-to-br from-blue-500 to-cyan-500 text-white"
                            )}
                          >
                            {getInitials(item.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {item.name}
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            ID: {item._id.slice(-8)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <Mail className="h-4 w-4 text-slate-400" />
                        {item.email}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <code className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {item.gstNumber || "N/A"}
                      </code>
                    </td>
                    <td className="px-4 py-4">
                      <code className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {item.panCard || "N/A"}
                      </code>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {type === "vendor" 
                          ? (item.vendorLocation || "N/A")
                          : (item.companyLocation || "N/A")
                        }
                      </span>
                    </td>
                    <td className="px-4 py-4">{getStatusBadge(item.approvalStatus)}</td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {formatDate(item.createdAt)}
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
                            <FileText className="h-4 w-4" />
                            View Documents
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {item.approvalStatus === "pending" && (
                            <>
                              <DropdownMenuItem className="gap-2 rounded-lg text-emerald-600 focus:bg-emerald-50 focus:text-emerald-700 dark:text-emerald-400">
                                <CheckCircle2 className="h-4 w-4" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2 rounded-lg text-red-600 focus:bg-red-50 focus:text-red-700 dark:text-red-400">
                                <XCircle className="h-4 w-4" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="gap-2 rounded-lg text-red-600 focus:bg-red-50 focus:text-red-700 dark:text-red-400">
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {data.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 rounded-full bg-slate-100 p-4 dark:bg-slate-800">
              <AlertCircle className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              No {type === "vendor" ? "vendors" : "companies"} found
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              New registrations will appear here for your review.
            </p>
          </div>
        )}
      </div>

      {/* Rejection Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="rounded-2xl border-slate-200 sm:max-w-md dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-xl">Reject {selectedIds.length > 1 ? "Multiple" : ""} {type === "vendor" ? "Vendor" : "Company"}{selectedIds.length > 1 ? "s" : ""}</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting {selectedIds.length > 1 ? "these" : "this"} {type === "vendor" ? "vendor" : "company"} application{selectedIds.length > 1 ? "s" : ""}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="min-h-[120px] resize-none rounded-xl border-slate-200 focus:border-red-300 focus:ring-red-200 dark:border-slate-700"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
              className="rounded-lg"
            >
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              disabled={!rejectionReason.trim()}
              className="gap-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
            >
              <XCircle className="h-4 w-4" />
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
