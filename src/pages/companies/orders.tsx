"use client"

import { useEffect, useState } from "react"
import { Package, Search, Filter, Loader2, Eye, AlertCircle } from "lucide-react"
import { CompanyLayout } from "@/components/company/company-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getAllOrders, getOrderById, type OrderData } from "@/lib/api"
import { cn } from "@/lib/utils"

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-gray-100 text-gray-800",
}

const PAGE_SIZE = 10

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalOrders, setTotalOrders] = useState(0)
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null)
  const [orderDetailsDialogOpen, setOrderDetailsDialogOpen] = useState(false)
  const [loadingDetails, setLoadingDetails] = useState(false)

  useEffect(() => {
    loadOrders()
  }, [page, selectedStatus])

  const loadOrders = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await getAllOrders(
        selectedStatus !== "all" ? { status: selectedStatus } : undefined,
        page,
        PAGE_SIZE
      )
      if (response.success) {
        setOrders(response.data)
        setTotalPages(response.totalPages)
        setTotalOrders(response.totalOrders)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders")
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewDetails = async (orderId: string) => {
    try {
      setLoadingDetails(true)
      const response = await getOrderById(orderId)
      if (response.success) {
        setSelectedOrder(response.data)
        setOrderDetailsDialogOpen(true)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load order details")
    } finally {
      setLoadingDetails(false)
    }
  }

  const filteredOrders = orders.filter((order) =>
    order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <CompanyLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Package className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Orders</h1>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by order number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
              <p>Loading orders...</p>
            </div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <Card className="p-12 text-center">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h2 className="text-xl font-semibold mb-2">No orders found</h2>
            <p className="text-gray-600">
              {totalOrders === 0 ? "You haven't placed any orders yet" : "Try adjusting your filters"}
            </p>
          </Card>
        ) : (
          <>
            {/* Orders List */}
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <Card key={order._id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{order.orderNumber}</h3>
                      <p className="text-sm text-gray-600">
                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className={cn("", STATUS_COLORS[order.status] || "bg-gray-100 text-gray-800")}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b">
                    <div>
                      <p className="text-sm text-gray-600">Order By</p>
                      <p className="font-semibold">{order.orderedBy.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Items</p>
                      <p className="font-semibold">{order.totalItems}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="font-semibold text-blue-600">₹{order.totalAmount.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {order.wasEscalated && (
                      <Badge variant="outline" className="border-orange-200 text-orange-700 bg-orange-50">
                        Escalated
                      </Badge>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(order._id)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, totalOrders)} of {totalOrders} orders
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <Button
                        key={p}
                        variant={page === p ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Order Details Dialog */}
      <Dialog open={orderDetailsDialogOpen} onOpenChange={setOrderDetailsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedOrder?.orderNumber}</DialogTitle>
            <DialogDescription>
              Order details and status information
            </DialogDescription>
          </DialogHeader>

          {loadingDetails ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : selectedOrder ? (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="grid grid-cols-2 gap-4 pb-4 border-b">
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <Badge className={cn("mt-1", STATUS_COLORS[selectedOrder.status] || "bg-gray-100 text-gray-800")}>
                    {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Order Date</p>
                  <p className="font-semibold">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ordered By</p>
                  <div>
                    <p className="font-semibold">{selectedOrder.orderedBy.name}</p>
                    <p className="text-sm text-gray-600">{selectedOrder.orderedBy.email}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Company</p>
                  <p className="font-semibold">{selectedOrder.company.name}</p>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="font-semibold mb-3">Order Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <p className="font-semibold">{item.productName}</p>
                        <p className="text-sm text-gray-600">SKU: {item.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">Qty: {item.quantity}</p>
                        <p className="font-semibold">₹{item.totalPrice.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="pt-4 border-t space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Items:</span>
                  <span className="font-semibold">{selectedOrder.totalItems}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="font-bold">Total Amount:</span>
                  <span className="font-bold text-blue-600">₹{selectedOrder.totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Order Notes</p>
                  <p className="p-2 bg-gray-50 rounded text-sm">{selectedOrder.notes}</p>
                </div>
              )}

              {/* Escalation Info */}
              {selectedOrder.wasEscalated && selectedOrder.escalationDetails && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded">
                  <p className="font-semibold text-orange-900 mb-2">Escalation Details</p>
                  <p className="text-sm text-orange-800">
                    This order was escalated for approval ({selectedOrder.escalationDetails.escalationLevel})
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </CompanyLayout>
  )
}
