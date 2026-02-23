"use client"

import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  History,
  Heart,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Building2,
  Users,
  DollarSign,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { getUserData, removeAuthToken, removeUserData } from "@/lib/api"

interface CompanyLayoutProps {
  children: React.ReactNode
}

export function CompanyLayout({ children }: CompanyLayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const userData = getUserData()

  const role = userData?.role?.toLowerCase() || "user"
  const hasCompany = Boolean((userData as { company?: { id?: string } } | null)?.company?.id)
  const isCompanySuperAdmin = role === "super-admin"
  const isCompanyAdmin = role === "company-admin" || role === "branch-admin" || (role === "admin" && hasCompany)
  const isCompanyUser = role === "company-user" || role === "user"

  const companyMenuItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/companies/dashboard",
      description: "Overview and statistics",
    },
    {
      label: "Browse Products",
      icon: Package,
      href: "/companies/products",
      description: "Explore marketplace",
    },
    ...(isCompanySuperAdmin
      ? [
          {
            label: "Branches",
            icon: Building2,
            href: "/companies/branches",
            description: "Manage company branches",
          },
          {
            label: "Company Admins",
            icon: Users,
            href: "/companies/admins",
            description: "Manage branch admins",
          },
          {
            label: "Company Users",
            icon: Users,
            href: "/companies/users",
            description: "Manage company users",
          },
          {
            label: "Shopping Cart",
            icon: ShoppingCart,
            href: "/companies/cart",
            description: "Place orders for company",
          },
          {
            label: "Orders",
            icon: History,
            href: "/companies/orders",
            description: "Track company orders",
          },
          {
            label: "Monthly Limits",
            icon: DollarSign,
            href: "/companies/limits",
            description: "Manage limits",
          },
          {
            label: "Escalations",
            icon: AlertTriangle,
            href: "/companies/escalations",
            description: "Review escalations",
          },
        ]
      : []),
    ...(isCompanyAdmin
      ? [
          {
            label: "Company Users",
            icon: Users,
            href: "/companies/users",
            description: "Manage company users",
          },
          {
            label: "Shopping Cart",
            icon: ShoppingCart,
            href: "/companies/cart",
            description: "Place orders for company",
          },
          {
            label: "Orders",
            icon: History,
            href: "/companies/orders",
            description: "Track company orders",
          },
          {
            label: "Monthly Limits",
            icon: DollarSign,
            href: "/companies/limits",
            description: "Manage user limits",
          },
          {
            label: "Escalations",
            icon: AlertTriangle,
            href: "/companies/escalations",
            description: "Review escalations",
          },
        ]
      : []),
    ...(isCompanyUser
      ? [
          {
            label: "Shopping Cart",
            icon: ShoppingCart,
            href: "/companies/cart",
            description: "View your cart",
          },
          {
            label: "My Orders",
            icon: History,
            href: "/companies/orders",
            description: "Track your orders",
          },
          {
            label: "Monthly Limits",
            icon: DollarSign,
            href: "/companies/limits",
            description: "View your limit",
          },
          {
            label: "Escalations",
            icon: AlertTriangle,
            href: "/companies/escalations",
            description: "Manage escalations",
          },
          {
            label: "Wishlist",
            icon: Heart,
            href: "/companies/wishlist",
            description: "Saved items",
          },
        ]
      : []),
  ]

  const handleLogout = () => {
    removeAuthToken()
    removeUserData()
    navigate("/")
  }

  const isActive = (href: string) => location.pathname === href

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 transition-all duration-300",
          sidebarOpen ? "w-64" : "w-20"
        )}
      >
        {/* Logo Section */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4 dark:border-slate-800">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-slate-900 dark:text-white">Company</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="h-8 w-8"
          >
            {sidebarOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 space-y-2 overflow-y-auto px-3 py-4">
          {companyMenuItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <button
                key={item.href}
                onClick={() => navigate(item.href)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                  active
                    ? "bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg shadow-blue-500/30"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                )}
                title={!sidebarOpen ? item.label : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {sidebarOpen && (
                  <div className="flex-1 text-left">
                    <p className="font-medium">{item.label}</p>
                    <p className="text-xs opacity-75">{item.description}</p>
                  </div>
                )}
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className={cn("flex-1 flex flex-col transition-all duration-300", sidebarOpen ? "ml-64" : "ml-20")}>
        {/* Top Bar */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 dark:border-slate-800 dark:bg-slate-900">
          <div>
            <h1 className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              Company Portal
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="gap-2 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 text-white flex-shrink-0">
                    <span className="text-xs font-semibold">
                      {userData?.name?.charAt(0).toUpperCase() || "C"}
                    </span>
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {userData?.name || "Company"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {userData?.email || "company@email.com"}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {/* <DropdownMenuItem className="gap-2 cursor-pointer">
                  <User className="h-4 w-4" />
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer">
                  <Settings className="h-4 w-4" />
                  Settings
                </DropdownMenuItem> */}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="gap-2 cursor-pointer text-red-600 focus:text-red-600 dark:text-red-400"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">{children}</div>
      </main>
    </div>
  )
}
