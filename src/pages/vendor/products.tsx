"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Package,
  Plus,
  Search,
  RefreshCw,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
} from "lucide-react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getProducts, type Product } from "@/lib/api"
import { cn } from "@/lib/utils"

export default function VendorProductsPage() {
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)

  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("active")
  const [approvalFilter, setApprovalFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [brandFilter, setBrandFilter] = useState("")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")

  const fetchProducts = async (pageNum: number = 1) => {
    try {
      setIsLoading(true)
      setError(null)

      const filters = {
        status: statusFilter || undefined,
        approvalStatus: approvalFilter !== "all" ? approvalFilter : undefined,
        category: categoryFilter || undefined,
        brand: brandFilter || undefined,
        minPrice: minPrice ? parseInt(minPrice) : undefined,
        maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
        search: searchQuery || undefined,
      }

      const response = await getProducts(filters, pageNum, 10)

      if (response.success) {
        setProducts(response.data)
        setTotalProducts(response.totalProducts)
        setTotalPages(response.totalPages)
        setPage(response.currentPage)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products")
      console.error("Error fetching products:", err)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchProducts(1)
  }, [statusFilter, approvalFilter, categoryFilter, brandFilter, minPrice, maxPrice])

  const handleSearch = () => {
    setPage(1)
    fetchProducts(1)
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchProducts(page)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 dark:text-amber-400"
      case "approved":
        return "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400"
      case "rejected":
        return "bg-red-500/10 text-red-600 hover:bg-red-500/20 dark:text-red-400"
      default:
        return "bg-slate-500/10 text-slate-600 hover:bg-slate-500/20 dark:text-slate-400"
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                  My Products
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                  Manage and view all your products
                </p>
              </div>
            </div>
            <Button
              onClick={() => navigate("/vendor/add-product")}
              className="gap-2 rounded-lg bg-linear-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25 hover:from-violet-600 hover:to-purple-700"
            >
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </div>

          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Products</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalProducts}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm text-slate-500 dark:text-slate-400">Pending Approval</p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {products.filter((p) => p.approvalStatus === "pending").length}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm text-slate-500 dark:text-slate-400">Approved</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {products.filter((p) => p.approvalStatus === "approved").length}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm text-slate-500 dark:text-slate-400">Rejected</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {products.filter((p) => p.approvalStatus === "rejected").length}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 font-semibold text-slate-900 dark:text-white">Filters</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Search */}
            <div className="space-y-2">
              <Label className="text-sm">Search</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  size="sm"
                  className="rounded-lg"
                >
                  Search
                </Button>
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label className="text-sm">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Approval Status Filter */}
            <div className="space-y-2">
              <Label className="text-sm">Approval Status</Label>
              <Select value={approvalFilter} onValueChange={setApprovalFilter}>
                <SelectTrigger className="rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <Label className="text-sm">Category</Label>
              <Input
                placeholder="e.g., notebooks"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-lg"
              />
            </div>

            {/* Brand Filter */}
            <div className="space-y-2">
              <Label className="text-sm">Brand</Label>
              <Input
                placeholder="e.g., Classmate"
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                className="rounded-lg"
              />
            </div>

            {/* Price Range */}
            <div className="space-y-2">
              <Label className="text-sm">Min Price</Label>
              <Input
                type="number"
                placeholder="Min price"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Max Price</Label>
              <Input
                type="number"
                placeholder="Max price"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="rounded-lg"
              />
            </div>

            {/* Refresh */}
            <div className="flex items-end">
              <Button
                onClick={handleRefresh}
                disabled={isRefreshing}
                variant="outline"
                className="w-full gap-2 rounded-lg"
              >
                <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Products List */}
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-slate-500 dark:text-slate-400">Loading products...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
              <p className="mb-4 text-red-600 dark:text-red-400">{error}</p>
              <Button onClick={handleRefresh} className="rounded-lg">
                Retry
              </Button>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Package className="mb-4 h-16 w-16 text-slate-300 dark:text-slate-700" />
            <p className="mb-4 text-slate-500 dark:text-slate-400">No products found</p>
            <Button
              onClick={() => navigate("/vendor/add-product")}
              className="gap-2 rounded-lg bg-linear-to-r from-violet-500 to-purple-600 text-white"
            >
              <Plus className="h-4 w-4" />
              Create Your First Product
            </Button>
          </div>
        ) : (
          <>
            {/* Products Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                >
                  {/* Product Image */}
                  <div className="relative h-48 overflow-hidden rounded-t-xl bg-slate-100 dark:bg-slate-800">
                    {product.images.length > 0 ? (
                      <img
                        src={product.images[0].url}
                        alt={product.productName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Package className="h-12 w-12 text-slate-300" />
                      </div>
                    )}
                    <div className="absolute right-3 top-3">
                      <Badge className={cn(getStatusColor(product.approvalStatus))}>
                        {product.approvalStatus.charAt(0).toUpperCase() +
                          product.approvalStatus.slice(1)}
                      </Badge>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4 space-y-3">
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{product.brand}</p>
                      <h3 className="line-clamp-2 font-semibold text-slate-900 dark:text-white">
                        {product.productName}
                      </h3>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">SKU</p>
                        <p className="font-medium text-slate-900 dark:text-white">{product.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Price</p>
                        <p className="text-xl font-bold text-violet-600 dark:text-violet-400">
                          ₹{product.price}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">Weight</p>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {product.weight.value} {product.weight.unit}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">UOM</p>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {product.uom}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 rounded-lg"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 rounded-lg">
                          <DropdownMenuItem className="gap-2 rounded-lg cursor-pointer">
                            <Eye className="h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 rounded-lg cursor-pointer">
                            <Edit className="h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 rounded-lg text-red-600 cursor-pointer focus:text-red-600 dark:text-red-400">
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button
                        size="sm"
                        className="flex-1 rounded-lg bg-linear-to-r from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700"
                      >
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-4">
                <Button
                  onClick={() => fetchProducts(page - 1)}
                  disabled={page === 1}
                  variant="outline"
                  size="sm"
                  className="rounded-lg"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Page {page} of {totalPages}
                  </span>
                </div>
                <Button
                  onClick={() => fetchProducts(page + 1)}
                  disabled={page === totalPages}
                  variant="outline"
                  size="sm"
                  className="rounded-lg"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
