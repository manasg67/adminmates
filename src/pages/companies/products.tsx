"use client"

import { useEffect, useState } from "react"
import {
  Package,
  Search,
  RefreshCw,
  Loader2,
  ShoppingCart,
  MapPin,
} from "lucide-react"
import { CompanyLayout } from "@/components/company/company-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { getProducts, addToCart, type Product } from "@/lib/api"

const PAGE_SIZE = 10

export default function CompanyProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  const [addingToCart, setAddingToCart] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const fetchProducts = async (pageNum: number = 1) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await getProducts(
        {
          search: searchQuery || undefined,
          approvalStatus: 'approved', // Only show approved products to companies
        },
        pageNum,
        PAGE_SIZE
      )

      setProducts(response.data || [])
      setTotalPages(response.totalPages || 1)
      setTotalProducts(response.totalProducts || 0)
      setPage(pageNum)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products")
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchProducts(1)
  }, [searchQuery])

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchProducts(page)
  }

  const handleAddToCart = async (productId: string, productName: string) => {
    try {
      setAddingToCart(productId)
      await addToCart(productId, 1)
      setSuccessMessage(`${productName} added to cart!`)
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add to cart")
    } finally {
      setAddingToCart(null)
    }
  }

  // Remove client-side filtering since server now handles it
  const displayProducts = products

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300">
            Active
          </Badge>
        )
      case "inactive":
        return (
          <Badge className="bg-slate-500/10 text-slate-600 dark:bg-slate-500/20 dark:text-slate-300">
            Inactive
          </Badge>
        )
      default:
        return (
          <Badge className="bg-slate-500/10 text-slate-600 dark:bg-slate-500/20 dark:text-slate-300">
            {status}
          </Badge>
        )
    }
  }

  const getApprovalBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300">
            Approved
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300">
            Pending
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-300">
            Rejected
          </Badge>
        )
      default:
        return (
          <Badge className="bg-slate-500/10 text-slate-600 dark:bg-slate-500/20 dark:text-slate-300">
            {status}
          </Badge>
        )
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
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Products</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">Browse all available products</p>
              </div>
            </div>
          </div>
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="rounded-lg bg-green-500/10 p-3 text-sm text-green-600 dark:bg-green-500/20 dark:text-green-300">
            ✓ {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-600 dark:bg-red-500/20 dark:text-red-300">
            ✕ {error}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search products..."
              className="pl-9"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Total products: <span className="font-semibold text-slate-900 dark:text-white">{totalProducts}</span>
          </div>
        </div>

        {/* Products Grid */}
        <div>
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading products...
            </div>
          ) : error ? (
            <div className="py-12 text-center text-sm text-red-500">{error}</div>
          ) : displayProducts.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">
              {searchQuery ? "No products found matching your search" : "No products available"}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {displayProducts.map((product) => (
                <div
                  key={product._id}
                  className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
                >
                  {/* Product Image */}
                  <div className="relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0].url}
                        alt={product.productName}
                        className="h-48 w-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-48 items-center justify-center">
                        <Package className="h-8 w-8 text-slate-400" />
                      </div>
                    )}
                    <div className="absolute right-2 top-2">
                      {getStatusBadge(product.status)}
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="space-y-3 p-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {product.brand} • {product.sku}
                      </p>
                      <h3 className="line-clamp-2 text-sm font-semibold text-slate-900 dark:text-white">
                        {product.productName}
                      </h3>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Price</span>
                      <span className="text-xl font-bold text-slate-900 dark:text-white">₹{product.price}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">per {product.uom}</span>
                    </div>

                    {/* Details */}
                    <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                      {product.color && (
                        <p>
                          <span className="font-semibold">Color:</span> {product.color}
                        </p>
                      )}
                      {product.packSize && (
                        <p>
                          <span className="font-semibold">Pack:</span> {product.packSize}
                        </p>
                      )}
                      {product.gstSlab && (
                        <p>
                          <span className="font-semibold">GST:</span> {product.gstSlab}%
                        </p>
                      )}
                    </div>

                    {/* Vendor Info */}
                    <div className="border-t border-slate-200 pt-3 dark:border-slate-700">
                      <div className="flex items-start gap-2">
                        <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-slate-900 dark:text-white">
                            {product.vendor.name}
                          </p>
                          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                            {product.vendor.vendorLocation}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Approval Status & Add to Cart */}
                    <div className="space-y-2">
                      <div>{getApprovalBadge(product.approvalStatus)}</div>
                      <Button
                        className="w-full gap-2"
                        size="sm"
                        onClick={() => handleAddToCart(product._id, product.productName)}
                        disabled={addingToCart === product._id}
                      >
                        {addingToCart === product._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ShoppingCart className="h-4 w-4" />
                        )}
                        {addingToCart === product._id ? "Adding..." : "Add to Cart"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" onClick={() => fetchProducts(page - 1)} disabled={page <= 1}>
              Previous
            </Button>
            <span className="text-sm text-slate-500">
              Page {page} of {totalPages}
            </span>
            <Button variant="outline" onClick={() => fetchProducts(page + 1)} disabled={page >= totalPages}>
              Next
            </Button>
          </div>
        )}
      </div>
    </CompanyLayout>
  )
}
