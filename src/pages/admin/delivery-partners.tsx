"use client"

import { useEffect, useState } from "react"
import { Truck, Plus, Edit2, Trash2, Loader2, AlertCircle, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  getAllDeliveryPartners,
  createDeliveryPartner,
  updateDeliveryPartner,
  deleteDeliveryPartner,
  type DeliveryPartner,
  type CreateDeliveryPartnerRequest,
} from "@/lib/api"
import { cn } from "@/lib/utils"
import { AdminLayout } from "@/components/admin/admin-layout"

const PAGE_SIZE = 10

export default function DeliveryPartnersPage() {
  const [partners, setPartners] = useState<DeliveryPartner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalPartners, setTotalPartners] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterActive, setFilterActive] = useState<string>("all")
  const [filterVehicleType, setFilterVehicleType] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedPartner, setSelectedPartner] = useState<DeliveryPartner | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<CreateDeliveryPartnerRequest>({
    name: "",
    email: "",
    phone: "",
    alternatePhone: "",
    vehicleType: "bike",
    vehicleNumber: "",
    drivingLicense: "",
    address: "",
  })

  useEffect(() => {
    loadPartners()
  }, [page, filterActive, filterVehicleType])

  const loadPartners = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const filters: any = {}
      if (filterActive !== "all") {
        filters.isActive = filterActive === "active"
      }
      if (filterVehicleType !== "all") {
        filters.vehicleType = filterVehicleType
      }

      const response = await getAllDeliveryPartners(page, PAGE_SIZE, filters)
      if (response.success) {
        setPartners(response.data)
        setTotalPages(response.totalPages)
        setTotalPartners(response.totalPartners)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load delivery partners")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenDialog = (partner?: DeliveryPartner) => {
    if (partner) {
      setSelectedPartner(partner)
      setFormData({
        name: partner.name,
        email: partner.email,
        phone: partner.phone,
        alternatePhone: partner.alternatePhone,
        vehicleType: partner.vehicleType,
        vehicleNumber: partner.vehicleNumber,
        drivingLicense: partner.drivingLicense,
        address: partner.address,
      })
    } else {
      setSelectedPartner(null)
      setFormData({
        name: "",
        email: "",
        phone: "",
        alternatePhone: "",
        vehicleType: "bike",
        vehicleNumber: "",
        drivingLicense: "",
        address: "",
      })
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = async () => {
    try {
      if (!formData.name || !formData.email || !formData.phone || !formData.vehicleNumber || !formData.drivingLicense || !formData.address) {
        setError("Please fill in all required fields")
        return
      }

      setIsSubmitting(true)
      setError(null)

      if (selectedPartner) {
        // Update
        await updateDeliveryPartner(selectedPartner._id, formData)
      } else {
        // Create
        await createDeliveryPartner(formData)
      }

      setIsDialogOpen(false)
      loadPartners()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save delivery partner")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (partnerId: string) => {
    if (!window.confirm("Are you sure you want to delete this delivery partner?")) return

    try {
      setError(null)
      await deleteDeliveryPartner(partnerId)
      loadPartners()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete delivery partner")
    }
  }

  const filteredPartners = partners.filter((partner) =>
    partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    partner.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    partner.phone.includes(searchQuery)
  )

  return (
        <AdminLayout>
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Truck className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Delivery Partners</h1>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Add Delivery Partner
        </Button>
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
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Select value={filterActive} onValueChange={setFilterActive}>
          <SelectTrigger className="w-40">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterVehicleType} onValueChange={setFilterVehicleType}>
          <SelectTrigger className="w-40">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by vehicle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Vehicles</SelectItem>
            <SelectItem value="bike">Bike</SelectItem>
            <SelectItem value="car">Car</SelectItem>
            <SelectItem value="van">Van</SelectItem>
            <SelectItem value="truck">Truck</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
            <p>Loading delivery partners...</p>
          </div>
        </div>
      ) : filteredPartners.length === 0 ? (
        <Card className="p-12 text-center">
          <Truck className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-semibold mb-2">No delivery partners found</h2>
          <p className="text-gray-600">
            {totalPartners === 0 ? "Create your first delivery partner" : "Try adjusting your filters"}
          </p>
        </Card>
      ) : (
        <>
          <div className="grid gap-4">
            {filteredPartners.map((partner) => (
              <Card key={partner._id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{partner.name}</h3>
                      <Badge className={cn(partner.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800")}>
                        {partner.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Badge variant="outline">{partner.vehicleType.charAt(0).toUpperCase() + partner.vehicleType.slice(1)}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <p className="text-gray-600">Email</p>
                        <p className="font-medium">{partner.email}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Phone</p>
                        <p className="font-medium">{partner.phone}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Vehicle Number</p>
                        <p className="font-medium">{partner.vehicleNumber}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Total Deliveries</p>
                        <p className="font-medium">{partner.totalDeliveries}</p>
                      </div>
                    </div>
                    <div className="text-sm">
                      <p className="text-gray-600">Address</p>
                      <p className="font-medium">{partner.address}</p>
                    </div>
                    {partner.rating && (
                      <div className="mt-2">
                        <p className="text-sm">
                          <span className="text-gray-600">Rating: </span>
                          <span className="font-medium">{partner.rating.toFixed(1)} ⭐</span>
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDialog(partner)}
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(partner._id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
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
                Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, totalPartners)} of {totalPartners} partners
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

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedPartner ? "Edit Delivery Partner" : "Add Delivery Partner"}</DialogTitle>
            <DialogDescription>
              {selectedPartner ? "Update delivery partner information" : "Create a new delivery partner"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter full name"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Enter phone number"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="alternatePhone">Alternate Phone</Label>
              <Input
                id="alternatePhone"
                value={formData.alternatePhone || ""}
                onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })}
                placeholder="Enter alternate phone number"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="vehicleType">Vehicle Type *</Label>
              <Select value={formData.vehicleType} onValueChange={(value: any) => setFormData({ ...formData, vehicleType: value })}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bike">Bike</SelectItem>
                  <SelectItem value="car">Car</SelectItem>
                  <SelectItem value="van">Van</SelectItem>
                  <SelectItem value="truck">Truck</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="vehicleNumber">Vehicle Number *</Label>
              <Input
                id="vehicleNumber"
                value={formData.vehicleNumber}
                onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                placeholder="e.g., MH12AB1234"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="drivingLicense">Driving License *</Label>
              <Input
                id="drivingLicense"
                value={formData.drivingLicense}
                onChange={(e) => setFormData({ ...formData, drivingLicense: e.target.value })}
                placeholder="Enter driving license number"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter address"
                className="mt-2"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {selectedPartner ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
        </AdminLayout>
  )
}
