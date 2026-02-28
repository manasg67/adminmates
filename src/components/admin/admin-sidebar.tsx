"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  Users,
  Building2,
  Shield,
  LogOut,
  Clock,
  Package,
  Truck,
  ShoppingCart,
  FileText,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { getVendors, getCompanies, removeAuthToken, removeUserData, getUserData } from "@/lib/api"

interface AdminSidebarProps {
  isExpanded: boolean
  isLocked: boolean
  onHoverChange: (hovered: boolean) => void
  onLockToggle: () => void
}


export function AdminSidebar({
  isExpanded,
  isLocked: _isLocked,
  onHoverChange,
  onLockToggle,
}: AdminSidebarProps) {
  const location = useLocation()
  const pathname = location.pathname
  const navigate = useNavigate()
  const [pendingCompaniesCount, setPendingCompaniesCount] = useState(0)
  const [pendingVendorsCount, setPendingVendorsCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const user = getUserData()
  const isAdmin = user?.role === 'admin'
  const isSubAdmin = user?.role === 'sub-admin'

  // Handle logout
  const handleLogout = (e: React.MouseEvent) => {
    e.stopPropagation()
    // Clear authentication data from localStorage
    removeAuthToken()
    removeUserData()
    // Redirect to login page
    navigate("/")
  }

  // Fetch pending counts
  useEffect(() => {
    const fetchPendingCounts = async () => {
      try {
        setIsLoading(true)
        const [vendorsResponse, companiesResponse] = await Promise.all([
          getVendors('pending', 1, 1), // Only need count, so limit=1
          getCompanies('pending', 1, 1), // Only need count, so limit=1
        ])

        if (vendorsResponse.success) {
          setPendingVendorsCount(vendorsResponse.pagination?.totalRecords || vendorsResponse.count || 0)
        }

        if (companiesResponse.success) {
          setPendingCompaniesCount(companiesResponse.pagination?.totalRecords || companiesResponse.count || 0)
        }
      } catch (err) {
        console.error("Error fetching pending counts:", err)
        // Set to 0 on error to avoid showing incorrect data
        setPendingVendorsCount(0)
        setPendingCompaniesCount(0)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPendingCounts()

    // Refresh counts every 30 seconds
    const interval = setInterval(fetchPendingCounts, 30000)
    return () => clearInterval(interval)
  }, [pathname]) // Refresh when navigating between pages

  // Dynamic nav items with badges
  const navItems = [
      ...(isAdmin ? [
    {
      title: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
        ] : []),

    ...(isAdmin || isSubAdmin ? [
      {
        title: "Companies",
        href: "/admin/companies",
        icon: Building2,
        badge: pendingCompaniesCount > 0 ? pendingCompaniesCount.toString() : undefined,
      },
      {
        title: "Vendors",
        href: "/admin/vendors",
        icon: Users,
        badge: pendingVendorsCount > 0 ? pendingVendorsCount.toString() : undefined,
      },
      {
        title: "Product Approval",
        href: "/admin/product-approval",
        icon: Package,
      },
            {
        title: "Orders",
        href: "/admin/orders",
        icon: ShoppingCart,
      },
      {
        title: "Delivery Challans",
        href: "/admin/challans",
        icon: Truck,
      },
      {
        title: "Invoices",
        href: "/admin/invoices",
        icon: FileText,
      },
      {
        title: "Delivery Partners",
        href: "/admin/delivery-partners",
        icon: Truck,
      },
    ] : []),
    ...(isAdmin ? [
      {
        title: "Add Sub-Admin",
        href: "/admin/sub-admins",
        icon: Users,
      },
    ] : []),
  ]

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        onMouseEnter={() => onHoverChange(true)}
        onMouseLeave={() => onHoverChange(false)}
        onClick={onLockToggle}
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen flex-col bg-slate-900 transition-all duration-300 ease-out",
          isExpanded ? "w-64" : "w-[68px]"
        )}
      >
        {/* Logo Section */}
        <div className="flex h-16 items-center gap-3 border-b border-slate-800 px-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-blue-500 to-cyan-400">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div
            className={cn(
              "flex flex-col overflow-hidden transition-all duration-300",
              isExpanded ? "w-auto opacity-100" : "w-0 opacity-0"
            )}
          >
            <span className="whitespace-nowrap text-base font-semibold text-white">
              ProSupply
            </span>
            <span className="whitespace-nowrap text-xs text-slate-400">
              Admin Console
            </span>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4">
          <div className="space-y-1 px-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              const linkContent = (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={(e) => e.stopPropagation()}
                  className={cn(
                    "group relative flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-all duration-200",
                    isActive
                            ? "bg-linear-to-r from-blue-600/90 to-cyan-600/90 text-white shadow-lg shadow-blue-500/20"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 shrink-0 transition-colors",
                      isActive ? "text-white" : "text-slate-400 group-hover:text-white"
                    )}
                  />
                  <span
                    className={cn(
                      "whitespace-nowrap transition-all duration-300",
                      isExpanded ? "opacity-100" : "w-0 overflow-hidden opacity-0"
                    )}
                  >
                    {item.title}
                  </span>
                  {item.badge && (
                    <span
                      className={cn(
                        "flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-slate-900 transition-all duration-300",
                        isExpanded
                          ? "ml-auto"
                          : "absolute -right-1 -top-1 h-4 min-w-4 text-[9px]"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              )

              if (!isExpanded) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                    <TooltipContent
                      side="right"
                      sideOffset={12}
                      className="flex items-center gap-2 border-slate-700 bg-slate-800 text-white"
                    >
                      {item.title}
                      {item.badge && (
                        <span className="rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-slate-900">
                          {item.badge}
                        </span>
                      )}
                    </TooltipContent>
                  </Tooltip>
                )
              }

              return linkContent
            })}
          </div>

          {/* Quick Stats - Only visible when expanded */}
          <div
            className={cn(
              "mx-3 mt-6 overflow-hidden rounded-lg bg-slate-800/50 transition-all duration-300",
              isExpanded ? "max-h-40 p-4 opacity-100" : "max-h-0 p-0 opacity-0"
            )}
          >
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <Clock className="h-3.5 w-3.5" />
              Pending Review
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Companies</span>
                {isLoading ? (
                  <span className="h-5 w-5 animate-pulse rounded-md bg-slate-700" />
                ) : (
                  <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-400">
                    {pendingCompaniesCount}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Vendors</span>
                {isLoading ? (
                  <span className="h-5 w-5 animate-pulse rounded-md bg-slate-700" />
                ) : (
                  <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-400">
                    {pendingVendorsCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Bottom Navigation */}
        <div className="border-t border-slate-800 py-4">
          <div className="space-y-1 px-3">


            {/* Logout */}
            {!isExpanded ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleLogout}
                    className="flex h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-red-400 transition-all duration-200 hover:bg-red-500/10 hover:text-red-300"
                  >
                    <LogOut className="h-5 w-5 shrink-0" />
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  sideOffset={12}
                  className="border-slate-700 bg-slate-800 text-red-400"
                >
                  Logout
                </TooltipContent>
              </Tooltip>
            ) : (
              <button
                onClick={handleLogout}
                className="flex h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-red-400 transition-all duration-200 hover:bg-red-500/10 hover:text-red-300"
              >
                <LogOut className="h-5 w-5 shrink-0" />
                <span
                  className={cn(
                    "whitespace-nowrap transition-all duration-300",
                    isExpanded ? "opacity-100" : "w-0 overflow-hidden opacity-0"
                  )}
                >
                  Logout
                </span>
              </button>
            )}
          </div>
        </div>
      </aside>
    </TooltipProvider>
  )
}
