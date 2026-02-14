"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, Loader2, AlertCircle, Check, X, MessageSquare } from "lucide-react"
import { CompanyLayout } from "@/components/company/company-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  getReceivedEscalations,
  getSentEscalations,
  approveEscalation,
  rejectEscalation,
  type EscalationData,
} from "@/lib/api"
import { cn } from "@/lib/utils"

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-800",
}

const PAGE_SIZE = 10

export default function EscalationsPage() {
  const [receivedEscalations, setReceivedEscalations] = useState<EscalationData[]>([])
  const [sentEscalations, setSentEscalations] = useState<EscalationData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("received")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedEscalation, setSelectedEscalation] = useState<EscalationData | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [actionDialogOpen, setActionDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null)
  const [responseMessage, setResponseMessage] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    loadEscalations()
  }, [activeTab, page])

  const loadEscalations = async () => {
    try {
      setIsLoading(true)
      setError(null)

      if (activeTab === "received") {
        const response = await getReceivedEscalations(undefined, page, PAGE_SIZE)
        if (response.success) {
          setReceivedEscalations(response.data)
          setTotalPages(response.totalPages)
        }
      } else {
        const response = await getSentEscalations(undefined, page, PAGE_SIZE)
        if (response.success) {
          setSentEscalations(response.data)
          setTotalPages(response.totalPages)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load escalations")
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewDetails = (escalation: EscalationData) => {
    setSelectedEscalation(escalation)
    setDetailsDialogOpen(true)
  }

  const handleAction = (escalation: EscalationData, type: "approve" | "reject") => {
    setSelectedEscalation(escalation)
    setActionType(type)
    setResponseMessage("")
    setActionError(null)
    setActionDialogOpen(true)
  }

  const handleConfirmAction = async () => {
    if (!selectedEscalation || !actionType) return

    if (actionType === "reject" && !responseMessage.trim()) {
      setActionError("Please provide a reason for rejection")
      return
    }

    try {
      setIsProcessing(true)
      setActionError(null)

      if (actionType === "approve") {
        await approveEscalation(selectedEscalation._id, responseMessage || undefined)
      } else {
        await rejectEscalation(selectedEscalation._id, responseMessage)
      }

      setActionDialogOpen(false)
      loadEscalations()
      alert(`Escalation ${actionType}d successfully!`)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : `Failed to ${actionType} escalation`)
    } finally {
      setIsProcessing(false)
    }
  }

  const escalations = activeTab === "received" ? receivedEscalations : sentEscalations

  return (
    <CompanyLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Order Escalations</h1>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="received">
              Received Requests
              {receivedEscalations.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {receivedEscalations.filter(e => e.status === 'pending').length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sent">
              My Escalations
              {sentEscalations.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {sentEscalations.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Received Escalations */}
          <TabsContent value="received" className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center min-h-96">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                  <p>Loading escalations...</p>
                </div>
              </div>
            ) : escalations.length === 0 ? (
              <Card className="p-12 text-center">
                <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h2 className="text-xl font-semibold mb-2">No escalations</h2>
                <p className="text-gray-600">You don't have any pending escalation requests</p>
              </Card>
            ) : (
              <>
                <div className="space-y-4">
                  {escalations.map((escalation) => (
                    <Card key={escalation._id} className="p-4">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{escalation.escalationNumber}</h3>
                          <p className="text-sm text-gray-600">
                            Requested by {escalation.requestedBy.name} ({escalation.requestedBy.email})
                          </p>
                          <p className="text-sm text-gray-600">
                            Requested on {new Date(escalation.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className={cn("", STATUS_COLORS[escalation.status] || "bg-gray-100 text-gray-800")}>
                          {escalation.status.charAt(0).toUpperCase() + escalation.status.slice(1)}
                        </Badge>
                      </div>

                      {/* Request Details */}
                      <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b">
                        <div>
                          <p className="text-sm text-gray-600">Order Amount</p>
                          <p className="font-semibold text-blue-600">₹{escalation.totalAmount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Items</p>
                          <p className="font-semibold">{escalation.totalItems}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Requester's Remaining</p>
                          <p className="font-semibold">₹{escalation.requesterLimit.remainingLimit.toLocaleString()}</p>
                        </div>
                      </div>

                      {/* Reason */}
                      <div className="mb-4 p-3 bg-yellow-50 rounded">
                        <p className="text-sm text-gray-600 mb-1">Reason for Escalation</p>
                        <p className="text-sm">{escalation.requestReason}</p>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(escalation)}
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                        {escalation.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 border-green-600 hover:bg-green-50"
                              onClick={() => handleAction(escalation, "approve")}
                            >
                              <Check className="w-4 h-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-600 hover:bg-red-50"
                              onClick={() => handleAction(escalation, "reject")}
                            >
                              <X className="w-4 h-4 mr-2" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">Page {page} of {totalPages}</p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                      >
                        Previous
                      </Button>
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
          </TabsContent>

          {/* Sent Escalations */}
          <TabsContent value="sent" className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center min-h-96">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                  <p>Loading escalations...</p>
                </div>
              </div>
            ) : escalations.length === 0 ? (
              <Card className="p-12 text-center">
                <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h2 className="text-xl font-semibold mb-2">No escalations sent</h2>
                <p className="text-gray-600">You haven't escalated any orders yet</p>
              </Card>
            ) : (
              <>
                <div className="space-y-4">
                  {escalations.map((escalation) => (
                    <Card key={escalation._id} className="p-4">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{escalation.escalationNumber}</h3>
                          <p className="text-sm text-gray-600">
                            Escalation Level: {escalation.escalationType.replace(/-/g, " → ")}
                          </p>
                          <p className="text-sm text-gray-600">
                            Sent on {new Date(escalation.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className={cn("", STATUS_COLORS[escalation.status] || "bg-gray-100 text-gray-800")}>
                          {escalation.status.charAt(0).toUpperCase() + escalation.status.slice(1)}
                        </Badge>
                      </div>

                      {/* Request Details */}
                      <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b">
                        <div>
                          <p className="text-sm text-gray-600">Order Amount</p>
                          <p className="font-semibold text-blue-600">₹{escalation.totalAmount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Items</p>
                          <p className="font-semibold">{escalation.totalItems}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Your Remaining Limit</p>
                          <p className="font-semibold">₹{escalation.requesterLimit.remainingLimit.toLocaleString()}</p>
                        </div>
                      </div>

                      {/* Reason */}
                      <div className="mb-4 p-3 bg-yellow-50 rounded">
                        <p className="text-sm text-gray-600 mb-1">Your Reason</p>
                        <p className="text-sm">{escalation.requestReason}</p>
                      </div>

                      {/* Response (if processed) */}
                      {escalation.responseMessage && escalation.respondedAt && (
                        <div className="mb-4 p-3 bg-blue-50 rounded">
                          <p className="text-sm text-gray-600 mb-1">
                            Response from {escalation.respondedBy?.name || "Admin"} on {new Date(escalation.respondedAt).toLocaleDateString()}
                          </p>
                          <p className="text-sm">{escalation.responseMessage}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(escalation)}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">Page {page} of {totalPages}</p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                      >
                        Previous
                      </Button>
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
          </TabsContent>
        </Tabs>
      </div>

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedEscalation?.escalationNumber}</DialogTitle>
            <DialogDescription>
              Escalation details and items
            </DialogDescription>
          </DialogHeader>

          {selectedEscalation && (
            <div className="space-y-6">
              {/* Status */}
              <div className="flex justify-between items-start pb-4 border-b">
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <Badge className={cn("mt-2", STATUS_COLORS[selectedEscalation.status] || "bg-gray-100 text-gray-800")}>
                    {selectedEscalation.status.charAt(0).toUpperCase() + selectedEscalation.status.slice(1)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  <p className="font-semibold text-sm">{selectedEscalation.escalationType.replace(/-/g, " → ")}</p>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="font-semibold mb-3">Order Items</h3>
                <div className="space-y-2">
                  {selectedEscalation.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <p className="font-semibold text-sm">{item.productName}</p>
                        <p className="text-xs text-gray-600">SKU: {item.sku}</p>
                      </div>
                      <div className="text-right text-sm">
                        <p>Qty: {item.quantity}</p>
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
                  <span className="font-semibold">{selectedEscalation.totalItems}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="font-bold">Total Amount:</span>
                  <span className="font-bold text-blue-600">₹{selectedEscalation.totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Reason */}
              <div>
                <p className="text-sm text-gray-600 mb-2">Reason for Escalation</p>
                <p className="p-2 bg-yellow-50 rounded text-sm">{selectedEscalation.requestReason}</p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" ? "Approve" : "Reject"} Escalation
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve"
                ? "Approve this escalation and place the order"
                : "Reject this escalation with a reason"}
            </DialogDescription>
          </DialogHeader>

          {actionError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{actionError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            {selectedEscalation && (
              <>
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-sm font-semibold mb-2">Order Details</p>
                  <p className="text-sm">Amount: ₹{selectedEscalation.totalAmount.toLocaleString()}</p>
                  <p className="text-sm">Items: {selectedEscalation.totalItems}</p>
                </div>

                {actionType === "reject" && (
                  <div>
                    <Label htmlFor="rejection-reason">Reason for Rejection</Label>
                    <Textarea
                      id="rejection-reason"
                      placeholder="Provide a reason for rejection..."
                      value={responseMessage}
                      onChange={(e) => setResponseMessage(e.target.value)}
                      className="mt-2"
                      rows={4}
                    />
                  </div>
                )}

                {actionType === "approve" && (
                  <div>
                    <Label htmlFor="approval-message">Message (Optional)</Label>
                    <Textarea
                      id="approval-message"
                      placeholder="Add any notes for the requester..."
                      value={responseMessage}
                      onChange={(e) => setResponseMessage(e.target.value)}
                      className="mt-2"
                      rows={3}
                    />
                  </div>
                )}
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmAction}
              disabled={isProcessing}
              className={actionType === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
            >
              {isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {actionType === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CompanyLayout>
  )
}
