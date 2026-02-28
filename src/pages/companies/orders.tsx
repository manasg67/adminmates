"use client"

import { useEffect, useState } from "react"
import { Package, Search, Filter, Loader2, Eye, AlertCircle, CreditCard, Truck, Phone, MapPin, Star } from "lucide-react"
import { CompanyLayout } from "@/components/company/company-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { getAllOrders, getOrderById, placeOrder, verifyPayment, type OrderData } from "@/lib/api"
import { cn } from "@/lib/utils"

declare global {
  interface Window {
    Razorpay: any;
  }
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-gray-100 text-gray-800",
}

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-50 border-yellow-200 text-yellow-800",
  completed: "bg-green-50 border-green-200 text-green-800",
  failed: "bg-red-50 border-red-200 text-red-800",
}

const DELIVERY_STATUS_COLORS: Record<string, string> = {
  "not-assigned": "bg-gray-50 border-gray-200 text-gray-800",
  assigned: "bg-blue-50 border-blue-200 text-blue-800",
  "picked-up": "bg-yellow-50 border-yellow-200 text-yellow-800",
  "in-transit": "bg-purple-50 border-purple-200 text-purple-800",
  delivered: "bg-green-50 border-green-200 text-green-800",
  cancelled: "bg-red-50 border-red-200 text-red-800",
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
  const [placeOrderDialogOpen, setPlaceOrderDialogOpen] = useState(false)
  const [orderNotes, setOrderNotes] = useState("")
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [paymentOrder, setPaymentOrder] = useState<any>(null)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)

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

  const handlePlaceOrder = async () => {
    try {
      setIsPlacingOrder(true)
      const response = await placeOrder(orderNotes || undefined)
      if (response.success) {
        // Show payment dialog with Razorpay order
        setPaymentOrder(response.data)
        setPlaceOrderDialogOpen(false)
        setPaymentDialogOpen(true)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place order")
    } finally {
      setIsPlacingOrder(false)
    }
  }

  const handlePaymentClick = async () => {
    if (!paymentOrder?.payment?.razorpayOrderId) return

    try {
      setIsProcessingPayment(true)

      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        const script = document.createElement('script')
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.async = true
        document.body.appendChild(script)
        script.onload = () => initializePayment()
      } else {
        initializePayment()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to initiate payment")
      setIsProcessingPayment(false)
    }
  }

  const initializePayment = () => {
    if (!paymentOrder) return

    const options = {
      key: paymentOrder.razorpayOrder?.keyId || 'rzp_test_SBCyp5lcne8wWp',
      amount: paymentOrder.payment?.amount,
      currency: 'INR',
      name: 'E-Commerce Platform',
      description: `Payment for Order ${paymentOrder.orderNumber}`,
      order_id: paymentOrder.payment?.razorpayOrderId,
      handler: async (response: any) => {
        try {
          setIsProcessingPayment(true)
          // Verify payment on backend
          const verifyResponse = await verifyPayment(
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature,
            paymentOrder._id
          )

          if (verifyResponse.success) {
            setError(null)
            alert('Payment successful! Order confirmed.')
            setPaymentDialogOpen(false)
            setPaymentOrder(null)
            setOrderNotes("")
            loadOrders() // Reload orders to show updated status
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : "Payment verification failed")
        } finally {
          setIsProcessingPayment(false)
        }
      },
      prefill: {
        name: localStorage.getItem('userName') || '',
        email: localStorage.getItem('userEmail') || '',
      },
      theme: {
        color: '#3b82f6',
      },
      modal: {
        ondismiss: () => {
          setIsProcessingPayment(false)
        },
      },
    }

    const razorpay = new window.Razorpay(options)
    razorpay.open()
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
    <div className="min-h-screen bg-slate-50 p-6 space-y-6">
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

          <Button onClick={() => setPlaceOrderDialogOpen(true)} className="bg-primary hover:bg-primary/90">
            <Package className="w-4 h-4 mr-2" />
            Place New Order
          </Button>
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

                  {/* Delivery Partner Info */}
                  {order.deliveryPartner ? (
                    <div className="bg-blue-50 p-3 rounded mb-4 border border-blue-200">
                      <div className="flex items-start gap-2">
                        <Truck className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-blue-900">Delivery Partner</p>
                          <p className="text-sm font-medium">{order.deliveryPartner.name}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-blue-700">
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {order.deliveryPartner.phone}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {order.deliveryPartner.vehicleType} • {order.deliveryPartner.vehicleNumber}
                            </div>
                            {order.deliveryPartner.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                {order.deliveryPartner.rating.toFixed(1)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      {order.deliveryStatus && (
                        <div className="mt-2 pt-2 border-t border-blue-200">
                          <Badge className={cn("text-xs", DELIVERY_STATUS_COLORS[order.deliveryStatus] || "")}>
                            {order.deliveryStatus.charAt(0).toUpperCase() + order.deliveryStatus.slice(1)}
                          </Badge>
                        </div>
                      )}
                    </div>
                  ) : null}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {order.wasEscalated && (
                        <Badge variant="outline" className="border-orange-200 text-orange-700 bg-orange-50">
                          Escalated
                        </Badge>
                      )}
                      {order.payment?.paymentStatus && (
                        <Badge className={cn("border", PAYMENT_STATUS_COLORS[order.payment.paymentStatus] || "")}>
                          <CreditCard className="w-3 h-3 mr-1" />
                          Payment: {order.payment.paymentStatus.charAt(0).toUpperCase() + order.payment.paymentStatus.slice(1)}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(order._id)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
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
                {selectedOrder.payment && (
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-gray-600">Payment Status:</span>
                    <Badge className={cn("", PAYMENT_STATUS_COLORS[selectedOrder.payment.paymentStatus] || "")}>
                      {selectedOrder.payment.paymentStatus.charAt(0).toUpperCase() + selectedOrder.payment.paymentStatus.slice(1)}
                    </Badge>
                  </div>
                )}
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

      {/* Place Order Dialog */}
      <Dialog open={placeOrderDialogOpen} onOpenChange={setPlaceOrderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Place New Order</DialogTitle>
            <DialogDescription>
              Review your cart and place an order
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="notes">Order Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any special instructions or notes for this order..."
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                className="mt-2"
                rows={4}
              />
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You will be asked to complete payment after placing the order
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPlaceOrderDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePlaceOrder} disabled={isPlacingOrder}>
              {isPlacingOrder && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Place Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Payment</DialogTitle>
            <DialogDescription>
              {paymentOrder?.orderNumber || 'Order'} - Payment Required
            </DialogDescription>
          </DialogHeader>

          {paymentOrder && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Amount:</span>
                  <span className="font-semibold">₹{paymentOrder.totalAmount?.toLocaleString() || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Status:</span>
                  <Badge className={cn("", PAYMENT_STATUS_COLORS[paymentOrder.payment?.paymentStatus] || "")}>
                    {paymentOrder.payment?.paymentStatus?.charAt(0).toUpperCase() + paymentOrder.payment?.paymentStatus?.slice(1) || 'N/A'}
                  </Badge>
                </div>
                <div className="flex justify-between pt-2 border-t text-lg">
                  <span className="font-bold">Amount to Pay:</span>
                  <span className="font-bold text-blue-600">₹{paymentOrder.payment?.amount ? (paymentOrder.payment.amount / 100).toLocaleString() : 'N/A'}</span>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Click the button below to proceed to Razorpay payment gateway
                </AlertDescription>
              </Alert>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handlePaymentClick}
              disabled={isProcessingPayment}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isProcessingPayment && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <CreditCard className="w-4 h-4 mr-2" />
              Pay with Razorpay
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CompanyLayout>
  )
}
