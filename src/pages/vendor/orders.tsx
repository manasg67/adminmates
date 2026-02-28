import { useState, useEffect } from 'react'
import {
  Package,
  Eye,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader,
  Truck,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { getAllOrders, approveVendorOrder, rejectVendorOrder, createDeliveryChallan } from '@/lib/api'
import type { OrderData } from '@/lib/api'
import { VendorLayout } from '@/components/vendor/vendor-layout'

const PAGE_SIZE = 10

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState<OrderData[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('pending')
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [approving, setApproving] = useState(false)
  
  // For rejection
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [rejecting, setRejecting] = useState(false)
  
  // For challan creation
  const [showChallanModal, setShowChallanModal] = useState(false)
  const [creatingChallan, setCreatingChallan] = useState(false)

  const loadOrders = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await getAllOrders(
        {
          status: statusFilter === 'all' ? undefined : statusFilter,
        },
        page,
        PAGE_SIZE
      )
      setOrders(response.data)
      setTotalPages(response.totalPages)
    } catch (err: any) {
      setError(err.message || 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [page, statusFilter])

  const handleViewDetails = (order: OrderData) => {
    setSelectedOrder(order)
    setShowDetails(true)
  }

  const handleApproveOrder = async () => {
    if (!selectedOrder) return

    try {
      setApproving(true)
      setError('')
      
      // Call the vendor approve order API
      await approveVendorOrder(selectedOrder._id)

      setSuccess('Order approved successfully! Now create delivery challan.')
      setShowDetails(false)
      
      // Show challan creation modal
      setShowChallanModal(true)
      
      // Reload orders
      setTimeout(() => {
        loadOrders()
      }, 500)
    } catch (err: any) {
      setError(err.message || 'Failed to approve order')
    } finally {
      setApproving(false)
    }
  }

  const handleRejectOrder = async () => {
    if (!selectedOrder || !rejectionReason.trim()) {
      setError('Please provide a rejection reason')
      return
    }

    try {
      setRejecting(true)
      setError('')
      
      // Call the vendor reject order API
      await rejectVendorOrder(selectedOrder._id, rejectionReason)

      setSuccess('Order rejected successfully!')
      setShowDetails(false)
      setShowRejectModal(false)
      setRejectionReason('')
      
      // Reload orders
      setTimeout(() => {
        loadOrders()
      }, 500)
    } catch (err: any) {
      setError(err.message || 'Failed to reject order')
    } finally {
      setRejecting(false)
    }
  }

  const handleCreateChallan = async () => {
    if (!selectedOrder) return

    try {
      setCreatingChallan(true)
      setError('')
      
      // Call the create delivery challan API
      await createDeliveryChallan(selectedOrder._id)

      setSuccess('Delivery challan created successfully! Admin will now create invoice.')
      setShowChallanModal(false)
    } catch (err: any) {
      setError(err.message || 'Failed to create delivery challan')
    } finally {
      setCreatingChallan(false)
    }
  }

  const filteredOrders = orders.filter((order) =>
    order._id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string; icon: any }> = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
      approved: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle2 },
      processing: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Package },
      completed: { bg: 'bg-slate-100', text: 'text-slate-700', icon: CheckCircle2 },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', icon: AlertCircle },
    }

    const config = statusMap[status] || statusMap.pending
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full ${config.bg} ${config.text} text-sm font-medium`}>
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  return (
        <VendorLayout>
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Package className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900">Orders for Approval</h1>
              <p className="text-slate-600 text-sm">Review and approve customer orders</p>
            </div>
          </div>

          {/* Alerts */}
          {error && (
            <Alert className="mb-4 bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-slate-300"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 border-slate-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending (Needs Approval)</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="all">All Orders</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin">
                <div className="h-8 w-8 border-4 border-orange-600 border-t-transparent rounded-full" />
              </div>
              <p className="mt-4 text-slate-600">Loading orders...</p>
            </div>
          ) : filteredOrders.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900">Company</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900">Items</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900">Created</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-slate-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredOrders.map((order) => (
                      <tr key={order._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-medium text-slate-900 font-mono text-sm">
                            {order._id.substring(0, 8)}...
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-700">
                          {order.company?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-slate-700">
                          {order.items?.length || 0} item(s)
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                        <td className="px-6 py-4 text-slate-600">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(order)}
                            className="border-slate-300 text-slate-700 hover:bg-slate-50"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                <span className="text-sm text-slate-600">
                  Page {page} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="border-slate-300"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="border-slate-300"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 text-center">
              <Package className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">No orders found</p>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle>Order {selectedOrder._id.substring(0, 8)}...</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {/* Status */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-900">Status</span>
                  <div>{getStatusBadge(selectedOrder.status)}</div>
                </div>

                {/* Company & Order Info */}
                <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-600 font-medium">Company</p>
                      <p className="text-sm text-slate-900 font-medium">{selectedOrder.company?.name}</p>
                      <p className="text-xs text-slate-600">{selectedOrder.company?.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 font-medium">Branch</p>
                      <p className="text-sm text-slate-900 font-medium">{selectedOrder.branch?.name || selectedOrder.branch?.branchName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 font-medium">Order ID</p>
                      <p className="text-xs font-mono text-slate-900">{selectedOrder._id}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 font-medium">Created</p>
                      <p className="text-sm text-slate-900 font-medium">
                        {new Date(selectedOrder.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <p className="text-sm font-semibold text-slate-900 mb-3">Order Items</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedOrder.items?.map((item, idx) => {
                      let productName = 'Product'
                      if (typeof item.product === 'object' && item.product) {
                        productName = (item.product as any)?.name || item.productName || item.name || 'Product'
                      } else if (item.productName) {
                        productName = item.productName
                      } else if (item.name) {
                        productName = item.name
                      }
                      return (
                      <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded border border-slate-200">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900">{productName}</p>
                          <p className="text-xs text-slate-600">
                            Qty: {item.quantity} × ₹{item.unitPrice || item.price || 0}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-slate-900">
                            ₹{(item.totalPrice / 100).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      )
                    })}
                  </div>
                </div>

                {/* Notes */}
                {selectedOrder.notes && (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <p className="text-sm font-semibold text-blue-900 mb-2">Order Notes</p>
                    <p className="text-sm text-blue-800">{selectedOrder.notes}</p>
                  </div>
                )}

                {/* Status Info */}
                {selectedOrder.status === 'pending' && (
                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    <p className="text-sm font-semibold text-yellow-900 mb-2">⏳ Awaiting Approval</p>
                    <p className="text-sm text-yellow-800 mb-4">
                      This order is pending your approval. Once approved, create a delivery challan and the company can proceed.
                    </p>
                    <div className="flex gap-3">
                      <Button
                        onClick={handleApproveOrder}
                        disabled={approving}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      >
                        {approving ? (
                          <>
                            <Loader className="h-4 w-4 mr-2 animate-spin" />
                            Approving...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Approve Order
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => setShowRejectModal(true)}
                        variant="outline"
                        className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject Order
                      </Button>
                    </div>
                  </div>
                )}

                {selectedOrder.status === 'approved' && (
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <p className="text-sm font-semibold text-green-900 mb-2">✅ Order Approved</p>
                    <p className="text-sm text-green-800">
                      You have approved this order. The delivery challan has been created and sent to admin for invoice creation.
                    </p>
                  </div>
                )}

                {selectedOrder.status === 'rejected' && (
                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <p className="text-sm font-semibold text-red-900 mb-2">❌ Order Rejected</p>
                    <p className="text-sm text-red-800">{selectedOrder.notes}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Rejection Modal */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Order</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <p className="text-sm text-red-800">
                ⚠️ The company will be notified about the rejection with your reason.
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-900 mb-2 block">
                Reason for Rejection
              </label>
              <Textarea
                placeholder="Enter your reason for rejecting this order..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="border-slate-300 resize-none"
                rows={4}
              />
            </div>

            {error && (
              <Alert className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter className="flex gap-2 sm:justify-between">
            <Button
              variant="outline"
              onClick={() => setShowRejectModal(false)}
              className="border-slate-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRejectOrder}
              disabled={rejecting || !rejectionReason.trim()}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {rejecting ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Rejecting...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Confirm Rejection
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delivery Challan Creation Modal */}
      <Dialog open={showChallanModal} onOpenChange={setShowChallanModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Delivery Challan</DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-sm font-semibold text-blue-900 mb-2">✅ Order Approved</p>
                <p className="text-sm text-blue-800">
                  Now create a delivery challan for this order. This will be sent to the admin to create the invoice.
                </p>
              </div>

              <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-xs text-slate-600 font-medium">Order ID</p>
                  <p className="text-sm font-mono text-slate-900">{selectedOrder._id}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 font-medium">Company</p>
                  <p className="text-sm text-slate-900 font-medium">{selectedOrder.company?.name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 font-medium">Items</p>
                  <p className="text-sm text-slate-900 font-medium">{selectedOrder.items?.length || 0} item(s)</p>
                </div>
              </div>

              {error && (
                <Alert className="bg-red-50 border-red-200">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <DialogFooter className="flex gap-2 sm:justify-between">
            <Button
              variant="outline"
              onClick={() => setShowChallanModal(false)}
              className="border-slate-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateChallan}
              disabled={creatingChallan}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {creatingChallan ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Truck className="h-4 w-4 mr-2" />
                  Create Delivery Challan
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
        </VendorLayout>
  )
}
