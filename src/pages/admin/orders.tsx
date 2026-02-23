"use client"

import { useEffect, useState } from "react"
import { Package, Search, Loader2, Truck, MapPin, Phone, Star, X } from "lucide-react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
import { getAllOrders, type OrderData, getAllDeliveryPartners, assignDeliveryPartner, removeDeliveryPartner, type DeliveryPartner } from "@/lib/api"
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

const DELIVERY_STATUS_COLORS: Record<string, string> = {
  "not-assigned": "bg-gray-100 text-gray-800",
  assigned: "bg-blue-100 text-blue-800",
  "picked-up": "bg-yellow-100 text-yellow-800",
  "in-transit": "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
}

const PAGE_SIZE = 10

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderData[]>([])
  const [deliveryPartners, setDeliveryPartners] = useState<DeliveryPartner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedDeliveryStatus, setSelectedDeliveryStatus] = useState<string>("all")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalOrders, setTotalOrders] = useState(0)
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null)
  const [orderDetailsDialogOpen, setOrderDetailsDialogOpen] = useState(false)
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false)
  const [selectedPartner, setSelectedPartner] = useState<string>("")
  const [isAssigning, setIsAssigning] = useState(false)

  useEffect(() => {
    loadOrders()
    loadDeliveryPartners()
  }, [page, selectedStatus, selectedDeliveryStatus])

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

  const loadDeliveryPartners = async () => {
    try {
      const response = await getAllDeliveryPartners(1, 100, { isActive: true })
      if (response.success) {
        setDeliveryPartners(response.data)
      }
    } catch (err) {
      console.error("Failed to load delivery partners", err)
    }
  }

  const handleViewDetails = (order: OrderData) => {
    setSelectedOrder(order)
    setOrderDetailsDialogOpen(true)
  }

  const canAssignDeliveryPartner = (order: OrderData): boolean => {
    // Cannot assign if payment is pending
    return order.payment?.paymentStatus !== 'pending'
  }

  const getAssignmentDisabledReason = (order: OrderData): string => {
    if (order.payment?.paymentStatus === 'pending') {
      return "Cannot assign - payment is pending"
    }
    return ""
  }

  const handleAssignPartner = (order: OrderData) => {
    setSelectedOrder(order)
    setSelectedPartner(order.deliveryPartner?._id || "")
    setAssignmentDialogOpen(true)
  }

  const handleAssign = async () => {
    if (!selectedOrder || !selectedPartner) {
      alert("Please select a delivery partner")
      return
    }

    try {
      setIsAssigning(true)
      await assignDeliveryPartner(selectedOrder._id, selectedPartner)
      alert("Delivery partner assigned successfully!")
      setAssignmentDialogOpen(false)
      loadOrders()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to assign delivery partner")
    } finally {
      setIsAssigning(false)
    }
  }

  const handleRemovePartner = async (order: OrderData) => {
    if (!confirm("Are you sure you want to remove the delivery partner assignment?")) {
      return
    }

    try {
      await removeDeliveryPartner(order._id)
      alert("Delivery partner removed successfully!")
      loadOrders()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to remove delivery partner")
    }
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.orderedBy.name.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesDeliveryStatus = 
      selectedDeliveryStatus === "all" || 
      (order.deliveryStatus || "not-assigned") === selectedDeliveryStatus

    return matchesSearch && matchesDeliveryStatus
  })

  const selectedPartnerData = deliveryPartners.find(p => p._id === selectedPartner)

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Orders Management</h1>
            <p className="text-gray-600">Manage all orders and delivery assignments</p>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="p-4">
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by order number, company name, or customer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Order Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedDeliveryStatus} onValueChange={setSelectedDeliveryStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Delivery Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Delivery Status</SelectItem>
                <SelectItem value="not-assigned">Not Assigned</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="picked-up">Picked Up</SelectItem>
                <SelectItem value="in-transit">In Transit</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results count */}
          <div className="text-sm text-gray-600">
            Showing {filteredOrders.length} of {totalOrders} orders
          </div>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Orders List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <Card className="p-8 text-center">
            <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No orders found</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order._id} className="p-4 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-lg">{order.orderNumber}</h3>
                      <Badge className={cn("", STATUS_COLORS[order.status])}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                      <Badge className={cn("", DELIVERY_STATUS_COLORS[order.deliveryStatus || "not-assigned"])}>
                        {(order.deliveryStatus || "not-assigned").charAt(0).toUpperCase() + (order.deliveryStatus || "not-assigned").slice(1)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{order.company.name}</p>
                    <p className="text-sm text-gray-600">By: {order.orderedBy.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-blue-600">₹{order.totalAmount.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">{order.totalItems} items</p>
                  </div>
                </div>

                {/* Delivery Partner Info */}
                {order.deliveryPartner ? (
                  <div className="bg-blue-50 p-3 rounded mb-4 border border-blue-200">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-2">
                        <Truck className="w-5 h-5 text-blue-600 mt-1 shrink-0" />
                        <div>
                          <p className="font-semibold text-sm">{order.deliveryPartner.name}</p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-gray-600">
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {order.deliveryPartner.phone}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {order.deliveryPartner.vehicleType}
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
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAssignPartner(order)}
                          disabled={!canAssignDeliveryPartner(order)}
                          title={getAssignmentDisabledReason(order)}
                        >
                          Change
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemovePartner(order)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-3 rounded mb-4 border border-gray-200 flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">
                        {order.payment?.paymentStatus === 'pending' 
                          ? "Cannot assign - payment is pending" 
                          : "No delivery partner assigned"}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAssignPartner(order)}
                      disabled={!canAssignDeliveryPartner(order)}
                    >
                      <Truck className="w-4 h-4 mr-2" />
                      Assign Delivery Partner
                    </Button>
                  </div>
                )}

                {/* Order Details */}
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500">
                    Order date: {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(order)}
                  >
                    View Details
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <div className="flex items-center gap-2 px-4">
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
            </div>
            <Button
              variant="outline"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Order Details Dialog */}
      <Dialog open={orderDetailsDialogOpen} onOpenChange={setOrderDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              {selectedOrder?.orderNumber}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="grid grid-cols-2 gap-4 pb-4 border-b">
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <Badge className={cn("mt-1", STATUS_COLORS[selectedOrder.status])}>
                    {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Order Date</p>
                  <p className="font-semibold">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Company</p>
                  <p className="font-semibold">{selectedOrder.company.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ordered By</p>
                  <div>
                    <p className="font-semibold">{selectedOrder.orderedBy.name}</p>
                    <p className="text-sm text-gray-600">{selectedOrder.orderedBy.email}</p>
                  </div>
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
                    <Badge className={cn(
                      "capitalize",
                      selectedOrder.payment.paymentStatus === "completed" ? "bg-green-100 text-green-800" :
                      selectedOrder.payment.paymentStatus === "failed" ? "bg-red-100 text-red-800" :
                      "bg-yellow-100 text-yellow-800"
                    )}>
                      {selectedOrder.payment.paymentStatus}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setOrderDetailsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delivery Partner Assignment Dialog */}
      <Dialog open={assignmentDialogOpen} onOpenChange={setAssignmentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Delivery Partner</DialogTitle>
            <DialogDescription>
              Order: {selectedOrder?.orderNumber}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="partner-select">Select Delivery Partner</Label>
              <Select value={selectedPartner} onValueChange={setSelectedPartner}>
                <SelectTrigger id="partner-select">
                  <SelectValue placeholder="Choose a delivery partner" />
                </SelectTrigger>
                <SelectContent>
                  {deliveryPartners.map((partner) => (
                    <SelectItem key={partner._id} value={partner._id}>
                      <div className="flex items-center gap-2">
                        <span>{partner.name}</span>
                        <span className="text-xs text-gray-500">
                          ({partner.vehicleType}) • {partner.totalDeliveries} deliveries
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedPartnerData && (
              <div className="bg-blue-50 p-4 rounded border border-blue-200">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Name:</span>
                    <span className="font-semibold">{selectedPartnerData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Phone:</span>
                    <span className="font-semibold">{selectedPartnerData.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Vehicle:</span>
                    <span className="font-semibold">{selectedPartnerData.vehicleType} - {selectedPartnerData.vehicleNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Deliveries:</span>
                    <span className="font-semibold">{selectedPartnerData.totalDeliveries}</span>
                  </div>
                  {selectedPartnerData.rating && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Rating:</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{selectedPartnerData.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignmentDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssign} disabled={!selectedPartner || isAssigning}>
              {isAssigning ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Assign Partner
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
