"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { AdminSidebar } from "./admin-sidebar"
import { AdminHeader } from "./admin-header"
import { cn } from "@/lib/utils"

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isLocked, setIsLocked] = useState(false)

  const isExpanded = isHovered || isLocked

  const handleHoverChange = useCallback((hovered: boolean) => {
    setIsHovered(hovered)
  }, [])

  const handleLockToggle = useCallback(() => {
    setIsLocked((prev) => !prev)
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <AdminSidebar
        isExpanded={isExpanded}
        isLocked={isLocked}
        onHoverChange={handleHoverChange}
        onLockToggle={handleLockToggle}
      />
      <AdminHeader sidebarExpanded={isExpanded} />
      <main
        className={cn(
          "min-h-screen pt-16 transition-all duration-300",
          isExpanded ? "pl-64" : "pl-[68px]"
        )}
      >
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
