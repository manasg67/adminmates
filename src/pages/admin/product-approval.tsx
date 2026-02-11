"use client"

import { useState, useEffect } from "react"
import {
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Loader2,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { AdminLayout } from "@/components/admin/admin-layout"
import {
  approveProduct,
  rejectProduct,
  getProducts,
  type Product,
} from "@/lib/api"

export default function ProductApprovalPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [approvalFilter, setApprovalFilter] = useState("pending")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [isRejectSubmitting, setIsRejectSubmitting] = useState(false)
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false)
  const [adminCut, setAdminCut] = useState<string>("")
  const [isApprovalSubmitting, setIsApprovalSubmitting] = useState(false)
  const [actionFeedback, setActionFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null)

  useEffect(() => {
    fetchProducts()
  }, [page, approvalFilter, searchTerm])

  const fetchProducts = async () => {
    setIsLoading(true)
    try {
      const response = await getProducts(
        {
          approvalStatus: approvalFilter !== 'all' ? approvalFilter : undefined,
          search: searchTerm || undefined,
        },
        page,
        10,
        'admin'
      )

      setProducts(response.data || [])
      setTotalPages(response.totalPages || 1)
    } catch (error) {
      console.error("Error fetching products:", error)
      setActionFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to fetch products',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproveClick = (product: Product) => {
    setSelectedProduct(product)
    setAdminCut("")
    setIsApprovalDialogOpen(true)
  }

  const handleApprove = async () => {
    if (!selectedProduct) return

    const adminCutValue = adminCut.trim() ? parseFloat(adminCut) : undefined
    
    if (adminCutValue !== undefined && (isNaN(adminCutValue) || adminCutValue < 0)) {
      setActionFeedback({
        type: 'error',
        message: 'Please enter a valid admin margin amount',
      })
      return
    }

    setIsApprovalSubmitting(true)
    try {
      const response = await approveProduct(selectedProduct._id, adminCutValue)
      if (response.success) {
        setActionFeedback({
          type: 'success',
          message: 'Product approved successfully!',
        })
        setIsApprovalDialogOpen(false)
        setSelectedProduct(null)
        setAdminCut("")
        fetchProducts()
      }
    } catch (error) {
      setActionFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to approve product',
      })
    } finally {
      setIsApprovalSubmitting(false)
    }
  }

  const handleReject = async () => {
    if (!selectedProduct || !rejectReason.trim()) {
      setActionFeedback({
        type: 'error',
        message: 'Please provide a rejection reason',
      })
      return
    }

    setIsRejectSubmitting(true)
    try {
      const response = await rejectProduct(selectedProduct._id, rejectReason.trim())
      if (response.success) {
        setActionFeedback({
          type: 'success',
          message: 'Product rejected successfully!',
        })
        setIsRejectDialogOpen(false)
        setRejectReason("")
        setSelectedProduct(null)
        fetchProducts()
      }
    } catch (error) {
      setActionFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to reject product',
      })
    } finally {
      setIsRejectSubmitting(false)
    }
  }

  return (
    <AdminLayout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-cyan-600 shadow-lg shadow-blue-500/30">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Product Approval
              </h1>
              <p className="text-slate-500 dark:text-slate-400">
                Review and approve/reject products submitted by vendors
              </p>
            </div>
          </div>

          {/* Feedback Message */}
          {actionFeedback && (
            <div
              className={`mb-6 rounded-lg p-4 ${
                actionFeedback.type === 'success'
                  ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400'
              }`}
            >
              {actionFeedback.message}
            </div>
          )}

          {/* Filters */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3 mb-4">
              <Filter className="h-5 w-5 text-slate-600" />
              <h2 className="font-semibold text-slate-900 dark:text-white">Filters</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="search">Search Product</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="search"
                    type="text"
                    placeholder="Search by name, brand..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value)
                      setPage(1)
                    }}
                    className="rounded-lg pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="approval-status">Approval Status</Label>
                <Select
                  value={approvalFilter}
                  onValueChange={(value) => {
                    setApprovalFilter(value)
                    setPage(1)
                  }}
                >
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
            </div>
          </div>
        </div>

        {/* Products Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-slate-500 dark:text-slate-400">Loading products...</p>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-slate-400" />
            <p className="text-slate-600 dark:text-slate-400">
              No products found
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product) => (
              <div
                key={product._id}
                className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden"
              >
                <div className="p-6">
                  <div className="grid gap-6 md:grid-cols-4">
                    {/* Product Image */}
                    <div className="md:col-span-1">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0].url}
                          alt={product.productName}
                          className="h-40 w-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="h-40 w-full bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-slate-400" />
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="md:col-span-2 space-y-3">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                          {product.productName}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          SKU: {product.sku}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-slate-600 dark:text-slate-400">Brand</p>
                          <p className="font-medium text-slate-900 dark:text-white">
                            {product.brand}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-600 dark:text-slate-400">Selling Price</p>
                          <p className="font-medium text-slate-900 dark:text-white">
                            ₹{product.price}
                          </p>
                        </div>
                        {product.vendorPrice !== undefined && (
                          <div>
                            <p className="text-slate-600 dark:text-slate-400">Vendor Price</p>
                            <p className="font-medium text-slate-900 dark:text-white">
                              ₹{product.vendorPrice}
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-slate-600 dark:text-slate-400">Vendor</p>
                          <p className="font-medium text-slate-900 dark:text-white">
                            {product.vendor.name}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-600 dark:text-slate-400">Category</p>
                          <p className="font-medium text-slate-900 dark:text-white">
                            {product.category?.name || 'N/A'}
                          </p>
                        </div>
                      </div>

                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                        {product.description}
                      </p>
                    </div>

                    {/* Status & Actions */}
                    <div className="md:col-span-1 flex flex-col items-end justify-between">
                      <div className="mb-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            product.approvalStatus === 'pending'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : product.approvalStatus === 'approved'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}
                        >
                          {product.approvalStatus.charAt(0).toUpperCase() +
                            product.approvalStatus.slice(1)}
                        </span>
                      </div>

                      {product.approvalStatus === 'pending' && (
                        <div className="flex gap-2 w-full">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 rounded-lg text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-900/20"
                            onClick={() => {
                              setSelectedProduct(product)
                              setIsRejectDialogOpen(true)
                            }}
                            disabled={isRejectSubmitting}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 rounded-lg text-green-600 border-green-200 hover:bg-green-50 dark:border-green-900 dark:hover:bg-green-900/20"
                            onClick={() => handleApproveClick(product)}
                            disabled={isRejectSubmitting}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-4">
            <Button
              variant="outline"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1 || isLoading}
              className="rounded-lg"
            >
              Previous
            </Button>
            <span className="text-slate-600 dark:text-slate-400">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages || isLoading}
              className="rounded-lg"
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Approve with Admin Cut Dialog */}
      <Dialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Approve Product</DialogTitle>
            <DialogDescription>
              {selectedProduct?.productName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 border border-blue-200 dark:border-blue-900">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Set the admin margin (commission) for this product
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-cut">Admin Margin/Commission (Optional)</Label>
              <div className="flex items-center gap-2">
                <span className="text-slate-600 dark:text-slate-400">₹</span>
                <Input
                  id="admin-cut"
                  type="number"
                  placeholder="Enter amount (e.g., 50, 100)"
                  value={adminCut}
                  onChange={(e) => setAdminCut(e.target.value)}
                  min="0"
                  step="0.01"
                  className="rounded-lg flex-1"
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                The platform will earn this amount from each sale of this product
              </p>
            </div>

            <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3">
              <p className="text-sm font-medium text-slate-900 dark:text-white mb-2">Summary:</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Product:</span>
                  <span className="font-medium text-slate-900 dark:text-white">{selectedProduct?.productName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Selling Price:</span>
                  <span className="font-medium text-slate-900 dark:text-white">₹{selectedProduct?.price}</span>
                </div>
                {selectedProduct?.vendorPrice !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Vendor Price:</span>
                    <span className="font-medium text-slate-900 dark:text-white">₹{selectedProduct.vendorPrice}</span>
                  </div>
                )}
                {adminCut && (
                  <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-1 mt-1">
                    <span className="text-slate-600 dark:text-slate-400">Admin Margin:</span>
                    <span className="font-medium text-green-600 dark:text-green-400">₹{adminCut}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsApprovalDialogOpen(false)
                setAdminCut("")
                setSelectedProduct(null)
              }}
              className="rounded-lg"
              disabled={isApprovalSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleApprove}
              disabled={isApprovalSubmitting}
              className="rounded-lg bg-green-600 text-white hover:bg-green-700"
            >
              {isApprovalSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve Product
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Reject Product</DialogTitle>
            <DialogDescription>
              {selectedProduct?.productName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reject-reason">Rejection Reason *</Label>
              <Textarea
                id="reject-reason"
                placeholder="Provide a detailed reason for rejecting this product..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                className="rounded-lg resize-none"
              />
              <p className="text-xs text-slate-500">
                The vendor will see this reason
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsRejectDialogOpen(false)
                setRejectReason("")
                setSelectedProduct(null)
              }}
              className="rounded-lg"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleReject}
              disabled={isRejectSubmitting || !rejectReason.trim()}
              className="rounded-lg"
            >
              {isRejectSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Rejecting...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Product
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
