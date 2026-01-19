"use client"

import {
  Building2,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  MoreHorizontal,
  Eye,
  Mail,
  Inbox,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface Request {
  id: string
  name: string
  email: string
  type: "company" | "vendor"
  status: "pending" | "approved" | "rejected"
  date: string
}

interface RequestTableProps {
  title: string
  requests: Request[]
  onApprove?: (id: string) => void
  onReject?: (id: string) => void
  processingIds?: Set<string>
}

const statusConfig = {
  pending: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    icon: Clock,
  },
  approved: {
    label: "Approved",
    className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
    icon: CheckCircle,
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
    icon: XCircle,
  },
}

export function RequestTable({
  title,
  requests,
  onApprove,
  onReject,
  processingIds = new Set(),
}: RequestTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            {title}
          </h3>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            {requests.length}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-sm font-medium text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
        >
          View All
        </Button>
      </div>

      {/* Table */}
      {requests.length > 0 ? (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {requests.map((request) => {
            const status = statusConfig[request.status]
            const StatusIcon = status.icon

            return (
              <div
                key={request.id}
                className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10 border border-slate-200 dark:border-slate-700">
                    <AvatarFallback
                      className={cn(
                        "text-sm font-semibold",
                        request.type === "company"
                          ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                          : "bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400"
                      )}
                    >
                      {request.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-900 dark:text-white">
                        {request.name}
                      </p>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium",
                          request.type === "company"
                            ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                            : "bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400"
                        )}
                      >
                        {request.type === "company" ? (
                          <Building2 className="h-3 w-3" />
                        ) : (
                          <Users className="h-3 w-3" />
                        )}
                        {request.type}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {request.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
                        status.className
                      )}
                    >
                      <StatusIcon className="h-3 w-3" />
                      {status.label}
                    </span>
                    <p className="mt-1 text-xs text-slate-400">{request.date}</p>
                  </div>

                  {request.status === "pending" && (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => onApprove?.(request.id)}
                        disabled={processingIds.has(request.id)}
                        className="h-8 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CheckCircle className="mr-1 h-3.5 w-3.5" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onReject?.(request.id)}
                        disabled={processingIds.has(request.id)}
                        className="h-8 rounded-lg border-red-200 bg-transparent text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <XCircle className="mr-1 h-3.5 w-3.5" />
                        Reject
                      </Button>
                    </div>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-48 rounded-xl border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900"
                    >
                      <DropdownMenuItem className="cursor-pointer py-2.5 text-slate-700 focus:bg-slate-100 dark:text-slate-300 dark:focus:bg-slate-800">
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer py-2.5 text-slate-700 focus:bg-slate-100 dark:text-slate-300 dark:focus:bg-slate-800">
                        <Mail className="mr-2 h-4 w-4" />
                        Send Email
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                      <DropdownMenuItem className="cursor-pointer py-2.5 text-red-600 focus:bg-red-50 focus:text-red-700 dark:text-red-400 dark:focus:bg-red-500/10 dark:focus:text-red-300">
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <Inbox className="h-7 w-7 text-slate-400" />
          </div>
          <h4 className="mt-4 font-semibold text-slate-900 dark:text-white">
            All caught up!
          </h4>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            No pending requests at the moment
          </p>
        </div>
      )}
    </div>
  )
}
