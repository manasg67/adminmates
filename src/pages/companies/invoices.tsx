import { useState, useEffect } from 'react'
import {
  FileText,
  CreditCard,
  Eye,
  AlertCircle,
  CheckCircle2,
  Clock,
} from 'lucide-react'

declare global {
  interface Window {
    Razorpay: any;
  }
}
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
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  getInvoices,
  getInvoiceById,
  verifyInvoicePayment,
} from '@/lib/api'
import type { InvoiceData } from '@/lib/api'
import { CompanyLayout } from '@/components/company/company-layout';

const PAGE_SIZE = 10

export default function CompanyInvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceData[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [, setVerifying] = useState(false)
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

  useEffect(() => {
    loadInvoices()
  }, [page, statusFilter])

  const handleViewDetails = async (invoice: InvoiceData) => {
    try {
      const response = await getInvoiceById(invoice.id)
      setSelectedInvoice(response.data)
      setShowDetails(true)
    } catch (err: any) {
      setError(err.message || 'Failed to load invoice details')
    }
  }

  const handlePayNow = (invoice: InvoiceData) => {
    if (!invoice.payment?.razorpayOrderId) {
      setError('No Razorpay order ID found for this invoice')
      return
    }

    const initializePayment = () => {
      const options = {
        key: 'rzp_test_SL6Su7oRe4s7mM',
        amount: invoice.payment?.amount || Math.round((invoice.grandTotal || 0) * 100),
        currency: 'INR',
        name: 'E-Commerce Platform',
        description: `Payment for Invoice ${invoice.invoiceNumber}`,
        order_id: invoice.payment?.razorpayOrderId,
        handler: async (response: any) => {
          try {
            setVerifying(true)
            setError('')
            await verifyInvoicePayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              invoiceId: invoice.id || (invoice as any)._id,
            })
            setSuccess('Payment verified successfully!')
            setTimeout(() => {
              loadInvoices()
              setSuccess('')
            }, 2000)
          } catch (err: any) {
            setError(err.message || 'Failed to verify payment')
          } finally {
            setVerifying(false)
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
            // User closed the Razorpay modal
          },
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    }

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
  }

  const filteredInvoices = invoices.filter((inv) =>
    inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status?: string) => {
    const statusMap: Record<string, { bg: string; text: string; icon: any }> = {
      issued: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Clock },
      paid: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle2 },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', icon: AlertCircle },
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
        <CompanyLayout>
    
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900">My Invoices</h1>
              <p className="text-slate-600 text-sm">View and pay your invoices</p>
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
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900">Payment Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900">Vendor</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900">Created</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-slate-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredInvoices.map((invoice) => (
                      <tr key={invoice.id || (invoice as any)._id} className="hover:bg-slate-50 transition-colors">
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
                          {getPaymentStatusBadge(invoice.paymentStatus)}
                        </td>
                        <td className="px-6 py-4 text-slate-700">{invoice.vendor?.name || 'N/A'}</td>
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
                            {invoice.paymentStatus === 'pending' && invoice.status !== 'cancelled' && (
                              <Button
                                size="sm"
                                onClick={() => handlePayNow(invoice)}
                                className="bg-green-600 hover:bg-green-700 text-white gap-2"
                              >
                                <CreditCard className="h-4 w-4" />
                                Pay Now
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
                    <div>{getPaymentStatusBadge(selectedInvoice.paymentStatus)}</div>
                  </div>
                </div>

                {/* Order & Vendor Info */}
                <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-600 font-medium">Vendor</p>
                      <p className="text-sm text-slate-900 font-medium">{selectedInvoice.vendor?.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 font-medium">Order ID</p>
                      <p className="text-sm text-slate-900 font-medium">{selectedInvoice.orderId}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 font-medium">Branch</p>
                      <p className="text-sm text-slate-900 font-medium">{selectedInvoice.branch?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 font-medium">Created</p>
                      <p className="text-sm text-slate-900 font-medium">
                        {new Date(selectedInvoice.createdAt).toLocaleDateString()}
                      </p>
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
                    <span className="font-medium text-slate-900">₹{selectedInvoice.totalGST?.toLocaleString()}</span>
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
                    {selectedInvoice.items?.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center p-2 bg-slate-50 rounded">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{item.productName || (typeof item.product === 'string' ? item.product : item.product?.name)}</p>
                          <p className="text-xs text-slate-600">Qty: {item.quantity} × ₹{item.pricePerUnit ?? item.unitPrice ?? 0}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-slate-900">₹{(item.totalPrice ?? item.amount ?? 0).toLocaleString()}</p>
                          <p className="text-xs text-slate-600">GST: ₹{(item.gstAmount ?? item.gst ?? 0).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Info */}
                {selectedInvoice.payment?.paidAt && (
                  <div className="bg-green-50 rounded-lg p-4 space-y-2">
                    <p className="text-sm font-semibold text-green-900 mb-2">Payment Completed</p>
                    <p className="text-xs text-green-700">
                      Paid on {new Date(selectedInvoice.payment.paidAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Modal */}
      {/* Razorpay checkout is now handled directly via Razorpay SDK */}
    </div>
          </CompanyLayout>
  )
}
