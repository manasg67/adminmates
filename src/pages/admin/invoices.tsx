import { useState, useEffect } from 'react'
import {
  FileText,
  Plus,
  Eye,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Truck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import {
  getInvoices,
  getInvoiceById,
  deleteInvoice,
  createInvoice,
  getDeliveryChallans,
  type DeliveryChallanData,
} from '@/lib/api'
import type { InvoiceData } from '@/lib/api'
import { AdminLayout } from '@/components/admin/admin-layout'

const PAGE_SIZE = 10

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceData[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  
  // Create invoice from challan states
  const [deliveryChallans, setDeliveryChallans] = useState<DeliveryChallanData[]>([])
  const [selectedChallanId, setSelectedChallanId] = useState('')
  const [selectedChallan, setSelectedChallan] = useState<DeliveryChallanData | null>(null)
  const [notes, setNotes] = useState('')
  const [creating, setCreating] = useState(false)
  const [loadingChallans, setLoadingChallans] = useState(false)
  
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadInvoices = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await getInvoices(
        {
          status: statusFilter === 'all' ? undefined : statusFilter,
        },
        page,
        PAGE_SIZE
      )
      setInvoices(response.data)
      setTotalPages(response.totalPages)
    } catch (err: any) {
      setError(err.message || 'Failed to load invoices')
    } finally {
      setLoading(false)
    }
  }

  const loadDeliveryChallans = async () => {
    try {
      setLoadingChallans(true)
      const response = await getDeliveryChallans(1, 100)
      setDeliveryChallans(response.data)
    } catch (err: any) {
      setError(err.message || 'Failed to load delivery challans')
    } finally {
      setLoadingChallans(false)
    }
  }

  useEffect(() => {
    loadInvoices()
  }, [page, statusFilter])

  useEffect(() => {
    if (showCreateModal) {
      loadDeliveryChallans()
    }
  }, [showCreateModal])

  // Handle challan selection
  const handleChallanSelect = (challanId: string) => {
    setSelectedChallanId(challanId)
    const challan = deliveryChallans.find(c => c._id === challanId) || deliveryChallans.find(c => c.id === challanId)
    setSelectedChallan(challan || null)
  }

  const handleCreateInvoice = async () => {
    if (!selectedChallanId.trim()) {
      setError('Please select a delivery challan')
      return
    }

    if (!selectedChallan?.orderId) {
      setError('Delivery challan does not have an order ID')
      return
    }

    try {
      setCreating(true)
      setError('')
      await createInvoice({
        orderId: selectedChallan.orderId,
        notes: notes || undefined,
      })
      setSuccess('Invoice created successfully')
      setSelectedChallanId('')
      setSelectedChallan(null)
      setNotes('')
      setShowCreateModal(false)
      setTimeout(() => {
        loadInvoices()
        setSuccess('')
      }, 1500)
    } catch (err: any) {
      setError(err.message || 'Failed to create invoice')
    } finally {
      setCreating(false)
    }
  }

  const handleViewDetails = async (invoice: InvoiceData) => {
    try {
      const invoiceId = invoice._id || invoice.id
      if (!invoiceId) {
        setError('Invoice ID not found')
        return
      }
      const response = await getInvoiceById(invoiceId)
      setSelectedInvoice(response.data)
      setShowDetails(true)
    } catch (err: any) {
      setError(err.message || 'Failed to load invoice details')
    }
  }

  const handleDeleteInvoice = async (invoiceId: string) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return

    try {
      setError('')
      await deleteInvoice(invoiceId)
      setSuccess('Invoice deleted successfully')
      setTimeout(() => {
        loadInvoices()
        setSuccess('')
      }, 1500)
    } catch (err: any) {
      setError(err.message || 'Failed to delete invoice')
    }
  }

  const filteredInvoices = invoices.filter((inv) =>
    inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (inv._id || inv.id || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status?: string) => {
    const statusMap: Record<string, { bg: string; text: string; icon: any }> = {
      issued: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Clock },
      paid: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle2 },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
      draft: { bg: 'bg-gray-100', text: 'text-gray-700', icon: Clock },
    }

    const normalizedStatus = status?.toLowerCase() || 'draft'
    const config = statusMap[normalizedStatus] || statusMap.draft
    const Icon = config.icon
    const displayText = normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1)

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full ${config.bg} ${config.text} text-sm font-medium`}>
        <Icon className="h-3 w-3" />
        {displayText}
      </span>
    )
  }

  const getPaymentStatusBadge = (paymentStatus?: string) => {
    const statusMap: Record<string, { bg: string; text: string }> = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
      completed: { bg: 'bg-green-100', text: 'text-green-700' },
      failed: { bg: 'bg-red-100', text: 'text-red-700' },
    }

    const normalizedStatus = paymentStatus?.toLowerCase() || 'pending'
    const config = statusMap[normalizedStatus] || statusMap.pending
    const displayText = normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1)

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${config.bg} ${config.text}`}>
        {displayText}
      </span>
    )
  }

  return (
        <AdminLayout>
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-slate-900">Invoices</h1>
                <p className="text-slate-600 text-sm">Create invoices from delivery challans</p>
              </div>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Invoice
            </Button>
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
                placeholder="Search by invoice number or ID..."
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
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="issued">Issued</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin">
                <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
              </div>
              <p className="mt-4 text-slate-600">Loading invoices...</p>
            </div>
          ) : filteredInvoices.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900">Invoice Number</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900">Payment</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900">Company</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900">Created</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-slate-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredInvoices.map((invoice) => (
                      <tr key={invoice._id || invoice.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-medium text-slate-900">{invoice.invoiceNumber}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-slate-900 font-semibold">
                            ₹{(invoice.grandTotal || 0).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(invoice.status || 'issued')}</td>
                        <td className="px-6 py-4">
                          {getPaymentStatusBadge(invoice.paymentStatus || 'pending')}
                        </td>
                        <td className="px-6 py-4 text-slate-700">{invoice.company?.name || 'N/A'}</td>
                        <td className="px-6 py-4 text-slate-600">
                          {new Date(invoice.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetails(invoice)}
                              className="border-slate-300 text-slate-700 hover:bg-slate-50"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {invoice.paymentStatus !== 'completed' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteInvoice(invoice.id)}
                                className="border-red-300 text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
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
              <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">No invoices found</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Invoice Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-blue-600" />
              Create Invoice from Delivery Challan
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {error && (
              <Alert className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            {/* Challan Selection Dropdown */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Select Delivery Challan *
              </label>
              {loadingChallans ? (
                <div className="p-3 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-600">
                  Loading delivery challans...
                </div>
              ) : deliveryChallans.length > 0 ? (
                <Select value={selectedChallanId} onValueChange={handleChallanSelect}>
                  <SelectTrigger className="border-slate-300">
                    <SelectValue placeholder="Choose a challan..." />
                  </SelectTrigger>
                  <SelectContent>
                    {deliveryChallans.map((challan) => (
                      <SelectItem key={challan._id || challan.id} value={challan._id || challan.id || ''}>
                        {challan.challanNumber} - {challan.company?.name || 'Unknown Company'} ({challan.totalItems} items)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg text-sm text-amber-800">
                  No delivery challans available
                </div>
              )}
            </div>

            {/* Challan Summary */}
            {selectedChallan && (
              <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="h-5 w-5 text-blue-600" />
                  <p className="text-sm font-semibold text-slate-900">Delivery Challan Details</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-600 font-medium">Challan #</p>
                    <p className="text-sm font-medium text-slate-900">{selectedChallan.challanNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 font-medium">Order #</p>
                    <p className="text-sm font-medium text-slate-900">{selectedChallan.orderId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 font-medium">Company</p>
                    <p className="text-sm font-medium text-slate-900">{selectedChallan.company?.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 font-medium">Vendor</p>
                    <p className="text-sm font-medium text-slate-900">{selectedChallan.vendor?.name || 'N/A'}</p>
                  </div>
                </div>

                <div className="border-t border-blue-200 pt-3">
                  <p className="text-xs text-slate-600 font-medium mb-2">Items ({selectedChallan.totalItems})</p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {selectedChallan.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-slate-700">{item.productName} × {item.quantity}</span>
                        <span className="font-medium text-slate-900">₹{item.totalPrice.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Notes (Optional)
              </label>
              <textarea
                placeholder="Add any notes for this invoice..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={creating}
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateModal(false)}
              disabled={creating}
              className="border-slate-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateInvoice}
              disabled={creating || !selectedChallanId}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {creating ? 'Creating...' : 'Create Invoice'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invoice Details Modal */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedInvoice && (
            <>
              <DialogHeader>
                <DialogTitle>Invoice {selectedInvoice.invoiceNumber}</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {/* Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-600 font-medium mb-1">Status</p>
                    <div>{getStatusBadge(selectedInvoice.status || 'issued')}</div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 font-medium mb-1">Payment Status</p>
                    <div>{getPaymentStatusBadge(selectedInvoice.paymentStatus || 'pending')}</div>
                  </div>
                </div>

                {/* Company & Order Info */}
                <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-600 font-medium">Company</p>
                      <p className="text-sm text-slate-900 font-medium">{selectedInvoice.company?.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 font-medium">Vendor</p>
                      <p className="text-sm text-slate-900 font-medium">{selectedInvoice.vendor?.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 font-medium">Order ID</p>
                      <p className="text-sm text-slate-900 font-medium">{selectedInvoice.orderId || selectedInvoice.order?._id || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 font-medium">Branch</p>
                      <p className="text-sm text-slate-900 font-medium">{selectedInvoice.branch?.branchName || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Amounts */}
                <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-700">Subtotal:</span>
                    <span className="font-medium text-slate-900">₹{selectedInvoice.subtotal?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-700">Total GST:</span>
                    <span className="font-medium text-slate-900">₹{(selectedInvoice.totalGST || selectedInvoice.totalGst)?.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-blue-200 pt-2 flex justify-between items-center">
                    <span className="font-semibold text-slate-900">Grand Total:</span>
                    <span className="text-lg font-black text-blue-600">₹{selectedInvoice.grandTotal?.toLocaleString()}</span>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <p className="text-sm font-semibold text-slate-900 mb-3">Items</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedInvoice.items?.map((item: any, idx: number) => {
                      const itemName = item.productName || 'Product'
                      const pricePerUnit = item.pricePerUnit ?? item.unitPrice ?? 0
                      const gstRate = item.gstRate ?? 18
                      const gstAmount = item.gstAmount ?? 0
                      const totalPrice = item.totalPrice ?? 0
                      return (
                        <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded border border-slate-200">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-900">{itemName}</p>
                            <p className="text-xs text-slate-600">SKU: {item.sku} | Qty: {item.quantity}</p>
                            <p className="text-xs text-slate-600">₹{pricePerUnit} × {item.quantity} + GST {gstRate}%</p>
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-sm font-medium text-slate-900">₹{totalPrice.toLocaleString()}</p>
                            <p className="text-xs text-slate-600">GST: ₹{gstAmount.toLocaleString()}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Payment Info */}
                {selectedInvoice.payment && (
                  <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                    <p className="text-sm font-semibold text-slate-900 mb-2">Payment Details</p>
                    {selectedInvoice.payment.razorpayOrderId && (
                      <div>
                        <p className="text-xs text-slate-600">Razorpay Order ID</p>
                        <p className="text-xs font-mono text-slate-900">{selectedInvoice.payment.razorpayOrderId}</p>
                      </div>
                    )}
                    {selectedInvoice.payment.razorpayPaymentId && (
                      <div>
                        <p className="text-xs text-slate-600">Payment ID</p>
                        <p className="text-xs font-mono text-slate-900">{selectedInvoice.payment.razorpayPaymentId}</p>
                      </div>
                    )}
                    {selectedInvoice.payment.paidAt && (
                      <div>
                        <p className="text-xs text-slate-600">Paid At</p>
                        <p className="text-xs text-slate-900">
                          {new Date(selectedInvoice.payment.paidAt).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Notes */}
                {selectedInvoice.notes && (
                  <div className="bg-amber-50 rounded-lg p-4">
                    <p className="text-sm font-semibold text-slate-900 mb-2">Notes</p>
                    <p className="text-sm text-slate-700">{selectedInvoice.notes}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
        </AdminLayout>
  )
}
