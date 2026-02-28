import { useState, useEffect } from 'react'
import {
  Truck,
  Eye,
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader,
  Plus,
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
import { Textarea } from '@/components/ui/textarea'
import { getDeliveryChallans, createInvoice } from '@/lib/api'
import type { DeliveryChallanData } from '@/lib/api'
import { AdminLayout } from '@/components/admin/admin-layout'

const PAGE_SIZE = 10

export default function AdminChallansPage() {
  const [challans, setChallans] = useState<DeliveryChallanData[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('pending')
  const [selectedChallan, setSelectedChallan] = useState<DeliveryChallanData | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // For invoice creation
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [invoiceNotes, setInvoiceNotes] = useState('')
  const [creatingInvoice, setCreatingInvoice] = useState(false)

  const loadChallans = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await getDeliveryChallans(page, PAGE_SIZE)
      
      // Filter by status on client side if needed
      let filteredData = response.data
      if (statusFilter !== 'all') {
        filteredData = response.data.filter(c => c.status === statusFilter)
      }
      
      setChallans(filteredData)
      setTotalPages(response.totalPages)
    } catch (err: any) {
      setError(err.message || 'Failed to load challans')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadChallans()
  }, [page, statusFilter])

  const handleViewDetails = (challan: DeliveryChallanData) => {
    setSelectedChallan(challan)
    setShowDetails(true)
  }

  const handleCreateInvoice = async () => {
    if (!selectedChallan || !selectedChallan.order?._id) {
      setError('Order ID not found')
      return
    }

    try {
      setCreatingInvoice(true)
      setError('')
      
      await createInvoice({
        orderId: selectedChallan.order._id,
        notes: invoiceNotes || undefined,
      })

      setSuccess('Invoice created successfully!')
      setShowInvoiceModal(false)
      setInvoiceNotes('')
      setShowDetails(false)
      
      // Reload challans
      setTimeout(() => {
        loadChallans()
      }, 500)
    } catch (err: any) {
      setError(err.message || 'Failed to create invoice')
    } finally {
      setCreatingInvoice(false)
    }
  }

  const filteredChallans = challans.filter((challan) =>
    challan.challanNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    challan.order?._id?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string; icon: any }> = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
      processing: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Truck },
      completed: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle2 },
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
        <AdminLayout>

    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Truck className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900">Delivery Challans</h1>
              <p className="text-slate-600 text-sm">Review delivery challans and create invoices</p>
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
                placeholder="Search by challan number or order ID..."
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="all">All Challans</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Challans Table */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin">
                <div className="h-8 w-8 border-4 border-orange-600 border-t-transparent rounded-full" />
              </div>
              <p className="mt-4 text-slate-600">Loading challans...</p>
            </div>
          ) : filteredChallans.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900">Challan Number</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900">Vendor</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900">Company</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900">Items</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900">Created</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-slate-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredChallans.map((challan) => (
                      <tr key={challan._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-semibold text-slate-900">{challan.challanNumber}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-slate-900 font-mono text-sm">
                            {challan.order?._id?.substring(0, 8)}...
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-700">
                          {challan.vendor?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-slate-700">
                          {challan.company?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-slate-700">
                          {challan.items?.length || 0} item(s)
                        </td>
                        <td className="px-6 py-4 text-slate-900 font-semibold">
                          ₹{challan.subtotal?.toLocaleString() || 0}
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(challan.status || 'pending')}</td>
                        <td className="px-6 py-4 text-slate-600">
                          {new Date(challan.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(challan)}
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
              <Truck className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">No delivery challans found</p>
            </div>
          )}
        </div>
      </div>

      {/* Challan Details Modal */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedChallan && (
            <>
              <DialogHeader>
                <DialogTitle>Delivery Challan {selectedChallan.challanNumber}</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {/* Status */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-900">Status</span>
                  <div>{getStatusBadge(selectedChallan.status || 'pending')}</div>
                </div>

                {/* Order & Company Info */}
                <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-600 font-medium">Company</p>
                      <p className="text-sm text-slate-900 font-medium">{selectedChallan.company?.name}</p>
                      <p className="text-xs text-slate-600">{selectedChallan.company?.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 font-medium">Vendor</p>
                      <p className="text-sm text-slate-900 font-medium">{selectedChallan.vendor?.name}</p>
                      <p className="text-xs text-slate-600">{selectedChallan.vendor?.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 font-medium">Challan Number</p>
                      <p className="text-xs font-mono text-slate-900 font-semibold">{selectedChallan.challanNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 font-medium">Order Number</p>
                      <p className="text-xs font-mono text-slate-900">{selectedChallan.order?.orderNumber}</p>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <p className="text-sm font-semibold text-slate-900 mb-3">Challan Items</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedChallan.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-start p-3 bg-slate-50 rounded border border-slate-200">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900">{item.productName}</p>
                          <p className="text-xs text-slate-600">
                            SKU: {item.sku} | Qty: {item.quantity}
                          </p>
                          <p className="text-xs text-slate-600">
                            ₹{item.pricePerUnit || item.unitPrice} × {item.quantity} = ₹{item.totalPrice}
                          </p>
                          {typeof item.product === 'object' && item.product?.images?.[0]?.url && (
                            <img
                              src={item.product.images[0].url}
                              alt={item.productName}
                              className="mt-2 h-16 w-16 rounded object-cover"
                            />
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-sm font-semibold text-slate-900">
                            ₹{item.totalPrice}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-orange-600 font-medium">Subtotal</p>
                      <p className="text-lg font-bold text-orange-900">₹{selectedChallan.subtotal?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-orange-600 font-medium">Total Items</p>
                      <p className="text-lg font-bold text-orange-900">{selectedChallan.items?.length || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Status Info */}
                {selectedChallan.status === 'pending' && (
                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    <p className="text-sm font-semibold text-yellow-900 mb-2">⏳ Pending Approval</p>
                    <p className="text-sm text-yellow-800 mb-4">
                      Create an invoice from this delivery challan to proceed with the order.
                    </p>
                    <Button
                      onClick={() => setShowInvoiceModal(true)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Invoice
                    </Button>
                  </div>
                )}

                {selectedChallan.status === 'processing' && (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <p className="text-sm font-semibold text-blue-900 mb-2">🔄 Processing</p>
                    <p className="text-sm text-blue-800">
                      Invoice has been created and is awaiting payment from the company.
                    </p>
                  </div>
                )}

                {selectedChallan.status === 'completed' && (
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <p className="text-sm font-semibold text-green-900 mb-2">✅ Completed</p>
                    <p className="text-sm text-green-800">
                      Invoice has been created and delivered.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Invoice Modal */}
      <Dialog open={showInvoiceModal} onOpenChange={setShowInvoiceModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Invoice</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {selectedChallan && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-sm font-semibold text-blue-900 mb-2">📋 Challan Details</p>
                <div className="text-sm text-blue-800 space-y-1">
                  <p><strong>Challan:</strong> {selectedChallan.challanNumber}</p>
                  <p><strong>Company:</strong> {selectedChallan.company?.name}</p>
                  <p><strong>Amount:</strong> ₹{selectedChallan.subtotal?.toLocaleString()}</p>
                  <p><strong>Items:</strong> {selectedChallan.items?.length || 0}</p>
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-slate-900 mb-2 block">
                Invoice Notes (Optional)
              </label>
              <Textarea
                placeholder="Add any notes for the invoice..."
                value={invoiceNotes}
                onChange={(e) => setInvoiceNotes(e.target.value)}
                className="border-slate-300 resize-none"
                rows={3}
              />
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

          <DialogFooter className="flex gap-2 sm:justify-between">
            <Button
              variant="outline"
              onClick={() => setShowInvoiceModal(false)}
              className="border-slate-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateInvoice}
              disabled={creatingInvoice}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {creatingInvoice ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Invoice
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
        </AdminLayout>
  )
}
