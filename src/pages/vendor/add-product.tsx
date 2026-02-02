"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Package,
  Upload,
  X,
  Loader2,
  ArrowLeft,
  ImagePlus,
} from "lucide-react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createProduct } from "@/lib/api"
import { cn } from "@/lib/utils"

export default function AddProductPage() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  const [formData, setFormData] = useState({
    sku: "",
    brand: "",
    productName: "",
    description: "",
    price: "",
    weightValue: "",
    weightUnit: "g",
    length: "",
    width: "",
    height: "",
    dimensionUnit: "cm",
    color: "",
    material: "",
    packSize: "",
    uom: "piece",
    gstSlab: "12",
    categories: "",
  })

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Add new files to existing ones
    const newImages = [...selectedImages, ...files]
    setSelectedImages(newImages)

    // Create previews for new images
    const newPreviews = files.map((file) => URL.createObjectURL(file))
    setImagePreviews((prev) => [...prev, ...newPreviews])
  }

  const removeImage = (index: number) => {
    // Revoke the object URL to free memory
    URL.revokeObjectURL(imagePreviews[index])

    setSelectedImages((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (selectedImages.length === 0) {
      alert("Please upload at least one product image")
      return
    }

    setIsSubmitting(true)

    try {
      const productData = {
        sku: formData.sku,
        brand: formData.brand,
        productName: formData.productName,
        description: formData.description,
        price: parseFloat(formData.price),
        weight: {
          value: parseFloat(formData.weightValue),
          unit: formData.weightUnit,
        },
        dimensions: {
          length: parseFloat(formData.length),
          width: parseFloat(formData.width),
          height: parseFloat(formData.height),
          unit: formData.dimensionUnit,
        },
        color: formData.color,
        material: formData.material,
        packSize: formData.packSize,
        uom: formData.uom,
        gstSlab: parseInt(formData.gstSlab),
        categories: formData.categories,
        images: selectedImages,
      }

      const response = await createProduct(productData)

      if (response.success) {
        alert("Product created successfully!")
        navigate("/vendor/dashboard")
      }
    } catch (error) {
      console.error("Error creating product:", error)
      alert(error instanceof Error ? error.message : "Failed to create product")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header />
      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/vendor/dashboard")}
            className="mb-4 gap-2 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Add New Product
              </h1>
              <p className="text-slate-500 dark:text-slate-400">
                Fill in the details to add a new product to your inventory
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
              Basic Information
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  name="sku"
                  placeholder="e.g., STAT-NB-001"
                  value={formData.sku}
                  onChange={handleInputChange}
                  required
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand">Brand *</Label>
                <Input
                  id="brand"
                  name="brand"
                  placeholder="e.g., Classmate"
                  value={formData.brand}
                  onChange={handleInputChange}
                  required
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="productName">Product Name *</Label>
                <Input
                  id="productName"
                  name="productName"
                  placeholder="e.g., Classmate Notebook Single Line 172 Pages"
                  value={formData.productName}
                  onChange={handleInputChange}
                  required
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Enter detailed product description..."
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="rounded-lg resize-none"
                />
              </div>
            </div>
          </div>

          {/* Pricing & Tax */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
              Pricing & Tax
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="price">Price (₹) *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 45"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gstSlab">GST Slab (%) *</Label>
                <Select
                  value={formData.gstSlab}
                  onValueChange={(value) => handleSelectChange("gstSlab", value)}
                >
                  <SelectTrigger className="rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0%</SelectItem>
                    <SelectItem value="5">5%</SelectItem>
                    <SelectItem value="12">12%</SelectItem>
                    <SelectItem value="18">18%</SelectItem>
                    <SelectItem value="28">28%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="uom">Unit of Measurement *</Label>
                <Select
                  value={formData.uom}
                  onValueChange={(value) => handleSelectChange("uom", value)}
                >
                  <SelectTrigger className="rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="piece">Piece</SelectItem>
                    <SelectItem value="kg">Kilogram</SelectItem>
                    <SelectItem value="liter">Liter</SelectItem>
                    <SelectItem value="meter">Meter</SelectItem>
                    <SelectItem value="box">Box</SelectItem>
                    <SelectItem value="pack">Pack</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Physical Specifications */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
              Physical Specifications
            </h2>
            <div className="space-y-4">
              {/* Weight */}
              <div>
                <Label className="mb-2 block">Weight *</Label>
                <div className="grid gap-4 sm:grid-cols-4">
                  <div className="sm:col-span-3">
                    <Input
                      name="weightValue"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 250"
                      value={formData.weightValue}
                      onChange={handleInputChange}
                      required
                      className="rounded-lg"
                    />
                  </div>
                  <Select
                    value={formData.weightUnit}
                    onValueChange={(value) => handleSelectChange("weightUnit", value)}
                  >
                    <SelectTrigger className="rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="g">Grams (g)</SelectItem>
                      <SelectItem value="kg">Kilograms (kg)</SelectItem>
                      <SelectItem value="mg">Milligrams (mg)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Dimensions */}
              <div>
                <Label className="mb-2 block">Dimensions *</Label>
                <div className="grid gap-4 sm:grid-cols-4">
                  <Input
                    name="length"
                    type="number"
                    step="0.01"
                    placeholder="Length"
                    value={formData.length}
                    onChange={handleInputChange}
                    required
                    className="rounded-lg"
                  />
                  <Input
                    name="width"
                    type="number"
                    step="0.01"
                    placeholder="Width"
                    value={formData.width}
                    onChange={handleInputChange}
                    required
                    className="rounded-lg"
                  />
                  <Input
                    name="height"
                    type="number"
                    step="0.01"
                    placeholder="Height"
                    value={formData.height}
                    onChange={handleInputChange}
                    required
                    className="rounded-lg"
                  />
                  <Select
                    value={formData.dimensionUnit}
                    onValueChange={(value) => handleSelectChange("dimensionUnit", value)}
                  >
                    <SelectTrigger className="rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cm">Centimeters</SelectItem>
                      <SelectItem value="m">Meters</SelectItem>
                      <SelectItem value="mm">Millimeters</SelectItem>
                      <SelectItem value="inch">Inches</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
              Product Details
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="color">Color *</Label>
                <Input
                  id="color"
                  name="color"
                  placeholder="e.g., Blue"
                  value={formData.color}
                  onChange={handleInputChange}
                  required
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="material">Material *</Label>
                <Input
                  id="material"
                  name="material"
                  placeholder="e.g., Paper"
                  value={formData.material}
                  onChange={handleInputChange}
                  required
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="packSize">Pack Size *</Label>
                <Input
                  id="packSize"
                  name="packSize"
                  placeholder="e.g., 1 Notebook"
                  value={formData.packSize}
                  onChange={handleInputChange}
                  required
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categories">Categories *</Label>
                <Input
                  id="categories"
                  name="categories"
                  placeholder="e.g., notebooks"
                  value={formData.categories}
                  onChange={handleInputChange}
                  required
                  className="rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Product Images */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
              Product Images *
            </h2>
            
            <div className="space-y-4">
              {/* Image Upload Area */}
              <div className="relative">
                <input
                  type="file"
                  id="images"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label
                  htmlFor="images"
                  className={cn(
                    "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-8 transition-colors hover:border-violet-500 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-violet-500 dark:hover:bg-slate-800/50"
                  )}
                >
                  <ImagePlus className="mb-2 h-10 w-10 text-slate-400" />
                  <p className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                    Click to upload images
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    PNG, JPG, WEBP up to 10MB
                  </p>
                </label>
              </div>

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {imagePreviews.map((preview, index) => (
                    <div
                      key={index}
                      className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700"
                    >
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/vendor/dashboard")}
              disabled={isSubmitting}
              className="rounded-lg"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="gap-2 rounded-lg bg-linear-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25 hover:from-violet-600 hover:to-purple-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Product...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Create Product
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
