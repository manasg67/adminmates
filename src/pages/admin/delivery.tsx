import { useState, useEffect } from 'react'
import {
  Truck,
  Eye,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Phone,
  Mail,  Filter,} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getInvoices } from '@/lib/api'
import type { InvoiceData } from '@/lib/api'

const PAGE_SIZE = 10

// Mock delivery partners data - in a real app this would come from the API
const mockDeliveryPartners = [
  {
    id: 'dp-1',
    name: 'FastDeliver Co',
    email: 'contact@fastdeliver.com',
    phone: '+91-9876543210',
    location: 'Mumbai',
    rating: 4.8,
    availableSlots: 5,
  },
  {
    id: 'dp-2',
    name: 'Quick Transport',
    email: 'support@quicktransport.com',
    phone: '+91-9876543211',
    location: 'Mumbai',
    rating: 4.6,
    availableSlots: 3,
  },
  {
    id: 'dp-3',
    name: 'Logistics Express',
    email: 'info@logisticsexpress.com',
    phone: '+91-9876543212',
    location: 'Mumbai',
    rating: 4.9,
    availableSlots: 8,
  },
  {
    id: 'dp-4',
    name: 'City Delivery Hub',
    email: 'contact@citydelivery.com',
    phone: '+91-9876543213',
    location: 'Mumbai',
    rating: 4.5,
    availableSlots: 2,
  },
]

export default function AdminDeliveryPage() {
  const [invoices, setInvoices] = useState<InvoiceData[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showAssign, setShowAssign] = useState(false)
  const [selectedPartner, setSelectedPartner] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadInvoices = async () => {
    try {
      setLoading(true)
      setError('')
      // Filter for paid invoices that need delivery partner assignment
      const response = await getInvoices(
        {
          status: 'paid', // Only paid invoices
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
  }, [page])

  const handleViewDetails = (invoice: InvoiceData) => {
    setSelectedInvoice(invoice)
    setShowDetails(true)
  }

  const handleAssignPartner = (invoice: InvoiceData) => {
    setSelectedInvoice(invoice)
    setSelectedPartner('')
    setShowAssign(true)
  }

  const handleConfirmAssignment = () => {
    if (!selectedPartner) {
      setError('Please select a delivery partner')
      return
    }
    
    const partner = mockDeliveryPartners.find((p) => p.id === selectedPartner)
    setSuccess(`Delivery assigned to ${partner?.name}`)
    setShowAssign(false)
    setTimeout(() => {
      setSuccess('')
      loadInvoices()
    }, 2000)
  }

  const filteredInvoices = invoices.filter((invoice) =>
    invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Truck className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900">Delivery Management</h1>
              <p className="text-slate-600 text-sm">Assign delivery partners to paid invoices</p>
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
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-4 w-4 text-slate-600" />
            <p className="text-sm font-semibold text-slate-900">Filters</p>
          </div>
          <Input
            placeholder="Search by invoice number or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-slate-300"
          />
        </div>

        {/* Invoices Table */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin">
                <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
              </div>
              <p className="mt-4 text-slate-600">Loading paid invoices...</p>
            </div>
          ) : filteredInvoices.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900">Invoice Number</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900">Company</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900">Payment Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900">Created</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-slate-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredInvoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-medium text-slate-900">{invoice.invoiceNumber}</span>
                        </td>
                        <td className="px-6 py-4 text-slate-700">
                          {invoice.company?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-slate-900 font-semibold">
                          ₹{invoice.grandTotal?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">{invoice.status || 'Unknown'}</td>
                        <td className="px-6 py-4 text-slate-600 text-sm">
                          {new Date(invoice.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(invoice)}
                            className="border-slate-300 text-slate-700 hover:bg-slate-50"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleAssignPartner(invoice)}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Truck className="h-4 w-4 mr-2" />
                            Assign
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
              <p className="text-slate-600">No paid invoices awaiting delivery assignment</p>
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
                <DialogTitle>{selectedInvoice.invoiceNumber}</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {/* Company Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Company Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-600 font-medium">Company</p>
                        <p className="text-sm text-slate-900 font-medium">
                          {selectedInvoice.company?.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 font-medium">Email</p>
                        <p className="text-sm text-slate-900 font-medium">
                          {selectedInvoice.company?.email}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Order Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Order Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-600 font-medium">Vendor</p>
                        <p className="text-sm text-slate-900 font-medium">
                          {selectedInvoice.vendor?.name || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 font-medium">Items</p>
                        <p className="text-sm text-slate-900 font-medium">
                          {selectedInvoice.items?.length || 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Amount Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Amount Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Subtotal</span>
                      <span className="text-slate-900 font-medium">₹{(selectedInvoice.subtotal).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">GST</span>
                      <span className="text-slate-900 font-medium">₹{(selectedInvoice.totalGST || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                      <span className="text-slate-900 font-semibold">Total Amount</span>
                      <span className="text-lg font-bold text-blue-600">
                        ₹{selectedInvoice.grandTotal?.toLocaleString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Status */}
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <p className="text-sm font-semibold text-green-900 mb-2">✅ Payment Verified</p>
                  <p className="text-sm text-green-800">
                    Payment has been verified and confirmed. You can now assign a delivery partner.
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Delivery Partner Modal */}
      <Dialog open={showAssign} onOpenChange={setShowAssign}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assign Delivery Partner</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Invoice Summary */}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <p className="text-xs text-slate-600 font-medium mb-2">Invoice</p>
              <p className="text-sm font-semibold text-slate-900">
                {selectedInvoice?.invoiceNumber} • ₹{selectedInvoice?.grandTotal?.toLocaleString()}
              </p>
            </div>

            {/* Delivery Partners */}
            <div>
              <p className="text-sm font-semibold text-slate-900 mb-3">Select Delivery Partner</p>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {mockDeliveryPartners.map((partner) => (
                  <div
                    key={partner.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      selectedPartner === partner.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                    onClick={() => setSelectedPartner(partner.id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-slate-900">{partner.name}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                            ⭐ {partner.rating}
                          </span>
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            {partner.availableSlots} slots available
                          </span>
                        </div>
                      </div>
                      <div className="w-5 h-5 border-2 border-slate-300 rounded-full flex items-center justify-center">
                        {selectedPartner === partner.id && (
                          <div className="w-3 h-3 bg-blue-600 rounded-full" />
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mt-3 pt-3 border-t border-slate-200">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {partner.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {partner.phone}
                      </div>
                      <div className="flex items-center gap-1 col-span-2">
                        <Mail className="h-3 w-3" />
                        {partner.email}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <Button
                variant="outline"
                onClick={() => setShowAssign(false)}
                className="flex-1 border-slate-300"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmAssignment}
                disabled={!selectedPartner}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Truck className="h-4 w-4 mr-2" />
                Assign Partner
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
