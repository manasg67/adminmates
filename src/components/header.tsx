"use client"

import { useState } from "react"
import { Search, ShoppingCart, User, ChevronDown, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

const categories = [
  "Office Furniture",
  "Writing Instruments",
  "Paper Products",
  "Technology & Electronics",
  "Office Organization",
  "Breakroom Supplies",
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const cartCount = 3

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-primary shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-18 items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <button className="lg:hidden text-primary-foreground" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-primary-foreground">
                Pro<span className="text-accent">Supply</span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground"
                >
                  Categories <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {categories.map((category) => (
                  <DropdownMenuItem key={category} className="cursor-pointer">
                    {category}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="ghost"
              className="text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground"
            >
              Deals
            </Button>
            <Button
              variant="ghost"
              className="text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground"
            >
              Bulk Orders
            </Button>
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search office supplies..."
                className="w-full rounded-full pl-10 pr-4 bg-card border-border"
              />
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground relative"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-accent text-accent-foreground text-xs">
                  {cartCount}
                </Badge>
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground"
                >
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="cursor-pointer">Sign In</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">Register</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">My Orders</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">Favorites</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">Account Settings</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-3">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search office supplies..."
              className="w-full rounded-full pl-10 pr-4 bg-card border-border"
            />
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-primary">
          <nav className="mx-auto max-w-7xl px-4 py-4 space-y-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-between text-primary-foreground hover:bg-primary/80">
                  Categories <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                {categories.map((category) => (
                  <DropdownMenuItem key={category} className="cursor-pointer">
                    {category}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" className="w-full justify-start text-primary-foreground hover:bg-primary/80">
              Deals
            </Button>
            <Button variant="ghost" className="w-full justify-start text-primary-foreground hover:bg-primary/80">
              Bulk Orders
            </Button>
          </nav>
        </div>
      )}
    </header>
  )
}
