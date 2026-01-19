"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Bell, Search, Moon, Sun, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { getProfile, removeAuthToken, removeUserData, getUserData } from "@/lib/api"

interface AdminHeaderProps {
  sidebarExpanded: boolean
}

export function AdminHeader({ sidebarExpanded }: AdminHeaderProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [userProfile, setUserProfile] = useState<{
    name: string
    email: string
    role: string
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Get current page name from pathname
  const getPageName = () => {
    const path = location.pathname
    if (path.includes('/dashboard')) return 'Dashboard'
    if (path.includes('/companies')) return 'Companies'
    if (path.includes('/vendors')) return 'Vendors'
    if (path.includes('/settings')) return 'Settings'
    if (path.includes('/help')) return 'Help Center'
    return 'Dashboard'
  }

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true)
        const response = await getProfile()
        if (response.success && response.data.user) {
          setUserProfile({
            name: response.data.user.name,
            email: response.data.user.email,
            role: response.data.user.role,
          })
        }
      } catch (err) {
        console.error("Error fetching profile:", err)
        // If profile fetch fails, try to get from localStorage
        const storedUser = getUserData()
        if (storedUser) {
          setUserProfile({
            name: storedUser.name,
            email: storedUser.email,
            role: storedUser.role,
          })
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [])

  // Handle logout
  const handleLogout = () => {
    removeAuthToken()
    removeUserData()
    navigate("/")
  }

  // Get user initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const displayName = userProfile?.name || 'Admin User'
  const displayEmail = userProfile?.email || 'admin@prosupply.com'
  const displayRole = userProfile?.role || 'Super Admin'
  return (
    <header
      className={cn(
        "fixed right-0 top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur-xl transition-all duration-300 dark:border-slate-800 dark:bg-slate-900/80",
        sidebarExpanded ? "left-64" : "left-[68px]"
      )}
    >
      {/* Left Section - Breadcrumb & Search */}
      <div className="flex items-center gap-6">
        {/* Page Context */}
        <div className="hidden md:block">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400">Admin</span>
            <ChevronDown className="h-3 w-3 -rotate-90 text-slate-400" />
            <span className="font-medium text-slate-700 dark:text-slate-200">
              {getPageName()}
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="search"
            placeholder="Search..."
            className="h-10 w-64 rounded-lg border-slate-200 bg-slate-50 pl-10 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:bg-slate-800 lg:w-80"
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 select-none rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-400 dark:border-slate-700 dark:bg-slate-800 lg:inline-block">
            /
          </kbd>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-10 w-10 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
              </span>
              <span className="sr-only">Notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-80 rounded-xl border-slate-200 bg-white p-0 shadow-xl dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-slate-800">
              <span className="font-semibold text-slate-900 dark:text-white">
                Notifications
              </span>
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                3 new
              </span>
            </div>
            <div className="max-h-80 overflow-y-auto">
              <div className="border-b border-slate-50 p-4 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50">
                <div className="mb-1 flex items-start justify-between">
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    New Company Request
                  </span>
                  <span className="text-xs text-slate-400">2m ago</span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  TechCorp Inc. submitted a registration request
                </p>
              </div>
              <div className="border-b border-slate-50 p-4 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50">
                <div className="mb-1 flex items-start justify-between">
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    Vendor Approved
                  </span>
                  <span className="text-xs text-slate-400">1h ago</span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  SupplyPro has been successfully approved
                </p>
              </div>
              <div className="p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <div className="mb-1 flex items-start justify-between">
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    System Update
                  </span>
                  <span className="text-xs text-slate-400">3h ago</span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Platform updated to version 2.1.0
                </p>
              </div>
            </div>
            <div className="border-t border-slate-100 p-2 dark:border-slate-800">
              <Button
                variant="ghost"
                className="w-full justify-center text-sm font-medium text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
              >
                View all notifications
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Divider */}
        <div className="mx-2 h-8 w-px bg-slate-200 dark:bg-slate-700" />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 rounded-lg p-1.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800">
              <Avatar className="h-9 w-9 border-2 border-slate-200 dark:border-slate-700">
                <AvatarImage src="/placeholder.svg" alt={displayName} />
                <AvatarFallback className="bg-linear-to-br from-blue-500 to-cyan-500 text-sm font-semibold text-white">
                  {isLoading ? '...' : getInitials(displayName)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left lg:block">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {isLoading ? 'Loading...' : displayName}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isLoading ? '...' : displayRole.charAt(0).toUpperCase() + displayRole.slice(1)}
                </p>
              </div>
              <ChevronDown className="hidden h-4 w-4 text-slate-400 lg:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 rounded-xl border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900"
          >
            <DropdownMenuLabel className="py-3">
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-slate-900 dark:text-white">
                  {isLoading ? 'Loading...' : displayName}
                </span>
                <span className="text-xs font-normal text-slate-500">
                  {isLoading ? '...' : displayEmail}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
            <DropdownMenuItem className="cursor-pointer py-2.5 text-slate-700 focus:bg-slate-100 focus:text-slate-900 dark:text-slate-300 dark:focus:bg-slate-800 dark:focus:text-white">
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer py-2.5 text-slate-700 focus:bg-slate-100 focus:text-slate-900 dark:text-slate-300 dark:focus:bg-slate-800 dark:focus:text-white">
              Activity Log
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer py-2.5 text-slate-700 focus:bg-slate-100 focus:text-slate-900 dark:text-slate-300 dark:focus:bg-slate-800 dark:focus:text-white">
              Help & Support
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
            <DropdownMenuItem 
              onClick={handleLogout}
              className="cursor-pointer py-2.5 text-red-600 focus:bg-red-50 focus:text-red-700 dark:text-red-400 dark:focus:bg-red-500/10 dark:focus:text-red-300"
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
