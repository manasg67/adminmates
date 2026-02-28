import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FileText,
  ArrowLeft,
  Package,
  Building,
  User,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Loader,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { getAllOrders, createInvoice } from '@/lib/api'
import type { OrderData } from '@/lib/api'

export default function CreateInvoicePage() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<OrderData[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [selectedOrderId, setSelectedOrderId] = useState('')
  const [notes, setNotes] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null)

  useEffect(() => {
    loadApprovedOrders()
  }, [])

  useEffect(() => {
    if (selectedOrderId) {
      const order = orders.find(o => o.id === selectedOrderId)
      setSelectedOrder(order || null)
    } else {
      setSelectedOrder(null)
    }
  }, [selectedOrderId, orders])

  const loadApprovedOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getAllOrders(
        { status: 'approved' },
        1,
        100
      )
      setOrders(response.data)
    } catch (err: any) {
      setError(err.message || 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedOrderId.trim()) {
      setError('Please select an order')
      return
    }

    try {
      setCreating(true)
      setError(null)

      const response = await createInvoice({
        orderId: selectedOrderId,
        notes: notes || undefined,
      })

      setSuccess(`Invoice ${response.data.invoiceNumber} created successfully!`)
      
      setTimeout(() => {
        navigate(`/admin/invoices`)
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to create invoice')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/invoices')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Invoices
          </Button>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600 dark:text-blue-300" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">
              Create Invoice
            </h1>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800 mb-6">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Success Alert */}
        {success && (
          <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800 mb-6">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {/* Form */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8">
          <form onSubmit={handleCreateInvoice} className="space-y-6">
            {/* Order Selection */}
            <div>
              <label className="text-sm font-semibold text-slate-900 dark:text-white mb-3 block">
                Select Approved Order *
              </label>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : orders.length === 0 ? (
                <Alert className="bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                    No approved orders found. Please ensure vendors have approved their orders first.
                  </AlertDescription>
                </Alert>
              ) : (
                <Select value={selectedOrderId} onValueChange={setSelectedOrderId}>
                  <SelectTrigger className="border-slate-300 dark:border-slate-600">
                    <SelectValue placeholder="Select an order" />
                  </SelectTrigger>
                  <SelectContent>
                    {orders.map((order) => (
                      <SelectItem key={order._id} value={order._id}>
                        {order._id.substring(0, 8)}... - {order.company?.name} - ₹{order.totalAmount ? (order.totalAmount / 100).toFixed(2) : '0.00'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Order Details Preview */}
            {selectedOrder && (
              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-6 space-y-4">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Order Summary</h3>

                {/* Company & Vendor Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Building className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Company</label>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {selectedOrder.company?.name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Vendor</label>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {selectedOrder.vendor?.name || 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Package className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Items</label>
                  </div>
                  <div className="space-y-2">
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
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-slate-700 dark:text-slate-300">
                          {productName} × {item.quantity}
                        </span>
                        <span className="text-slate-900 dark:text-white font-medium">
                          ₹{item.totalPrice ? (item.totalPrice / 100).toFixed(2) : '0.00'}
                        </span>
                      </div>
                      )
                    })}
                  </div>
                </div>

                {/* Total */}
                <div className="border-t border-slate-300 dark:border-slate-600 pt-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                      <label className="text-sm font-semibold text-slate-900 dark:text-white">Total Amount</label>
                    </div>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      ₹{selectedOrder.totalAmount ? (selectedOrder.totalAmount / 100).toFixed(2) : '0.00'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="text-sm font-semibold text-slate-900 dark:text-white mb-3 block">
                Invoice Notes (Optional)
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes for this invoice..."
                rows={4}
                className="border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              />
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                These notes will be included in the invoice
              </p>
            </div>

            {/* Info Box */}
            <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 dark:text-blue-200">
                Creating an invoice will:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Generate a unique invoice number</li>
                  <li>Calculate GST based on product rates</li>
                  <li>Create a Razorpay order for payment</li>
                  <li>Make it available for the company to pay</li>
                </ul>
              </AlertDescription>
            </Alert>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/invoices')}
                disabled={creating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={creating || !selectedOrderId || loading}
                className="flex-1 bg-linear-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
              >
                {creating ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Creating Invoice...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Create Invoice
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
