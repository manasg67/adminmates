"use client"

import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  Package,
  Save,
  X,
  Loader2,
  ArrowLeft,
  ImagePlus,
  AlertCircle,
  Plus,
} from "lucide-react"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { VendorLayout } from "@/components/vendor/vendor-layout"
import type { Category, SubCategory, ProductImage } from "@/lib/api"
import {
  createCategory,
  createSubCategory,
  getCategories,
  getProductById,
  getSubCategories,
  updateProduct,
} from "@/lib/api"
import { cn } from "@/lib/utils"


export default function EditProductPage() {
  const navigate = useNavigate()
  const { productId } = useParams<{ productId: string }>()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [existingImages, setExistingImages] = useState<ProductImage[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [subCategories, setSubCategories] = useState<SubCategory[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)
  const [isLoadingSubCategories, setIsLoadingSubCategories] = useState(false)
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [isSubCategoryDialogOpen, setIsSubCategoryDialogOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newSubCategoryName, setNewSubCategoryName] = useState("")
  const [isCreatingCategory, setIsCreatingCategory] = useState(false)
  const [isCreatingSubCategory, setIsCreatingSubCategory] = useState(false)

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
    hsnCode: "",
    categoryId: "",
    subCategoryId: "",
  })

  useEffect(() => {
    const loadCategories = async () => {
      setIsLoadingCategories(true)
      try {
        const response = await getCategories(1, 100)
        setCategories(response.data || [])
      } catch (error) {
        console.error("Error fetching categories:", error)
      } finally {
        setIsLoadingCategories(false)
      }
    }

    loadCategories()
  }, [])

  useEffect(() => {
    const loadSubCategories = async () => {
      if (!formData.categoryId) {
        setSubCategories([])
        return
      }

      setIsLoadingSubCategories(true)
      try {
        const response = await getSubCategories(formData.categoryId, 1, 100)
        setSubCategories(response.data || [])
      } catch (error) {
        console.error("Error fetching subcategories:", error)
      } finally {
        setIsLoadingSubCategories(false)
      }
    }

    loadSubCategories()
  }, [formData.categoryId])

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        setError("Product ID not found")
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const response = await getProductById(productId)

        if (response.success && response.data) {
          const product = response.data
          setFormData({
            sku: product.sku || "",
            brand: product.brand || "",
            productName: product.productName || "",
            description: product.description || "",
            price: product.price?.toString() || "",
            weightValue: product.weight?.value?.toString() || "",
            weightUnit: product.weight?.unit || "g",
            length: product.dimensions?.length?.toString() || "",
            width: product.dimensions?.width?.toString() || "",
            height: product.dimensions?.height?.toString() || "",
            dimensionUnit: product.dimensions?.unit || "cm",
            color: product.color || "",
            material: product.material || "",
            packSize: product.packSize || "",
            uom: product.uom || "piece",
            gstSlab: product.gstSlab?.toString() || "12",
            hsnCode: product.hsnCode || "",
            categoryId: product.category?._id || "",
            subCategoryId: product.subCategory?._id || "",
          })
          setExistingImages(product.images || [])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load product")
        console.error("Error fetching product:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProduct()
  }, [productId])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, categoryId: value, subCategoryId: "" }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const newImages = [...selectedImages, ...files]
    setSelectedImages(newImages)

    const newPreviews = files.map((file) => URL.createObjectURL(file))
    setImagePreviews((prev) => [...prev, ...newPreviews])
  }

  const removeNewImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index])
    setSelectedImages((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!productId) {
      alert("Product ID not found")
      return
    }

    setIsSubmitting(true)

    try {
      const updateData = {
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
        hsnCode: formData.hsnCode,
        categoryId: formData.categoryId,
        subCategoryId: formData.subCategoryId,
        images: selectedImages,
      }

      const response = await updateProduct(productId, updateData)

      if (response.success) {
        alert("Product updated successfully!")
        navigate("/vendor/products")
      }
    } catch (error) {
      console.error("Error updating product:", error)
      alert(error instanceof Error ? error.message : "Failed to update product")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <VendorLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
            <p className="text-slate-500 dark:text-slate-400">Loading product...</p>
          </div>
        </div>
      </VendorLayout>
    )
  }

  if (error) {
    return (
      <VendorLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <p className="mb-4 text-red-600 dark:text-red-400">{error}</p>
            <Button onClick={() => navigate("/vendor/products")} className="rounded-lg">
              Back to Products
            </Button>
          </div>
        </div>
      </VendorLayout>
    )
  }

  return (
    <VendorLayout>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/vendor/products")}
            className="mb-4 gap-2 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Edit Product
              </h1>
              <p className="text-slate-500 dark:text-slate-400">
                Update product details and information
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
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  name="sku"
                  placeholder="e.g., STAT-NB-001"
                  value={formData.sku}
                  onChange={handleInputChange}
                  required
                  disabled
                  className="rounded-lg"
                />
                <p className="text-xs text-slate-500">SKU cannot be changed</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
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
                <Label htmlFor="productName">Product Name</Label>
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
                <Label htmlFor="description">Description</Label>
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
                <Label htmlFor="price">Price (₹)</Label>
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
                <Label htmlFor="gstSlab">GST Slab (%)</Label>
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
                <Label htmlFor="uom">Unit of Measurement</Label>
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
                <Label className="mb-2 block">Weight</Label>
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
                <Label className="mb-2 block">Dimensions</Label>
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
                <Label htmlFor="color">Color</Label>
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
                <Label htmlFor="material">Material</Label>
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
                <Label htmlFor="packSize">Pack Size</Label>
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
                <Label htmlFor="hsnCode">HSN Code</Label>
                <Input
                  id="hsnCode"
                  name="hsnCode"
                  placeholder="e.g., 9876857647"
                  value={formData.hsnCode}
                  onChange={handleInputChange}
                  required
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="categoryId">Category</Label>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="h-8 w-8 rounded-lg"
                    onClick={() => setIsCategoryDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <Select
                  value={formData.categoryId}
                  onValueChange={handleCategoryChange}
                  key={`category-${formData.categoryId}`}
                >
                  <SelectTrigger className="rounded-lg">
                    <SelectValue placeholder={isLoadingCategories ? "Loading categories..." : "Select category"} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="subCategoryId">Sub Category</Label>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="h-8 w-8 rounded-lg"
                    onClick={() => {
                      if (!formData.categoryId) {
                        alert("Please select a category first")
                        return
                      }
                      setIsSubCategoryDialogOpen(true)
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <Select
                  value={formData.subCategoryId}
                  onValueChange={(value) => handleSelectChange("subCategoryId", value)}
                  disabled={!formData.categoryId}
                  key={`subcategory-${formData.subCategoryId}`}
                >
                  <SelectTrigger className="rounded-lg">
                    <SelectValue placeholder={isLoadingSubCategories ? "Loading subcategories..." : "Select sub category"} />
                  </SelectTrigger>
                  <SelectContent>
                    {subCategories.map((subCategory) => (
                      <SelectItem key={subCategory._id} value={subCategory._id}>
                        {subCategory.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Product Images */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
              Product Images
            </h2>

            <div className="space-y-4">
              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-medium text-slate-900 dark:text-white">
                    Current Images
                  </p>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                    {existingImages.map((image, index) => (
                      <div
                        key={index}
                        className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700"
                      >
                        <img
                          src={image.url}
                          alt={`Product ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                    Click to upload new images
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    PNG, JPG, WEBP up to 10MB
                  </p>
                </label>
              </div>

              {/* New Image Previews */}
              {imagePreviews.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-medium text-slate-900 dark:text-white">
                    New Images to Upload
                  </p>
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
                          onClick={() => removeNewImage(index)}
                          className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/vendor/products")}
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
                  Updating Product...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Update Product
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Create Category</DialogTitle>
            <DialogDescription>Add a new category for products.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="newCategoryName">Category Name</Label>
            <Input
              id="newCategoryName"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="e.g., Stationary"
              className="rounded-lg"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCategoryDialogOpen(false)}
              className="rounded-lg"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isCreatingCategory || !newCategoryName.trim()}
              onClick={async () => {
                setIsCreatingCategory(true)
                try {
                  const response = await createCategory(newCategoryName.trim())
                  if (response.success) {
                    const updated = await getCategories(1, 100)
                    setCategories(updated.data || [])
                    if (response.data?._id) {
                      setFormData((prev) => ({
                        ...prev,
                        categoryId: response.data?._id || prev.categoryId,
                        subCategoryId: "",
                      }))
                    }
                    setNewCategoryName("")
                    setIsCategoryDialogOpen(false)
                  }
                } catch (error) {
                  console.error("Error creating category:", error)
                  alert(error instanceof Error ? error.message : "Failed to create category")
                } finally {
                  setIsCreatingCategory(false)
                }
              }}
              className="rounded-lg"
            >
              {isCreatingCategory ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isSubCategoryDialogOpen} onOpenChange={setIsSubCategoryDialogOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Create Sub Category</DialogTitle>
            <DialogDescription>Add a new sub category for the selected category.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="newSubCategoryName">Sub Category Name</Label>
            <Input
              id="newSubCategoryName"
              value={newSubCategoryName}
              onChange={(e) => setNewSubCategoryName(e.target.value)}
              placeholder="e.g., Pencil"
              className="rounded-lg"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsSubCategoryDialogOpen(false)}
              className="rounded-lg"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isCreatingSubCategory || !newSubCategoryName.trim() || !formData.categoryId}
              onClick={async () => {
                if (!formData.categoryId) return
                setIsCreatingSubCategory(true)
                try {
                  const response = await createSubCategory(
                    newSubCategoryName.trim(),
                    formData.categoryId
                  )
                  if (response.success) {
                    const updated = await getSubCategories(formData.categoryId, 1, 100)
                    setSubCategories(updated.data || [])
                    if (response.data?._id) {
                      setFormData((prev) => ({
                        ...prev,
                        subCategoryId: response.data?._id || prev.subCategoryId,
                      }))
                    }
                    setNewSubCategoryName("")
                    setIsSubCategoryDialogOpen(false)
                  }
                } catch (error) {
                  console.error("Error creating subcategory:", error)
                  alert(error instanceof Error ? error.message : "Failed to create subcategory")
                } finally {
                  setIsCreatingSubCategory(false)
                }
              }}
              className="rounded-lg"
            >
              {isCreatingSubCategory ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </VendorLayout>
  )
}
