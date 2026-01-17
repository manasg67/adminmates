"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

const categories = [
  { name: "Office Furniture", count: 124 },
  { name: "Writing Instruments", count: 89 },
  { name: "Paper Products", count: 156 },
  { name: "Technology", count: 67 },
  { name: "Organization", count: 98 },
]

const brands = [
  { name: "ProBrand", count: 45 },
  { name: "OfficeMax", count: 78 },
  { name: "PaperPro", count: 34 },
  { name: "TechSupply", count: 23 },
]

export function FiltersSidebar() {
  const [priceRange, setPriceRange] = useState([0, 500])
  const [categoryOpen, setCategoryOpen] = useState(true)
  const [brandOpen, setBrandOpen] = useState(true)

  return (
    <aside className="w-full lg:w-72 space-y-6">
      <div className="bg-card border border-border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>

        {/* Price Range */}
        <div className="mb-6">
          <Label className="mb-3 block font-semibold">Price Range</Label>
          <Slider value={priceRange} onValueChange={setPriceRange} max={500} step={10} className="mb-2" />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
        </div>

        {/* Categories */}
        <Collapsible open={categoryOpen} onOpenChange={setCategoryOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full mb-3">
            <Label className="font-semibold cursor-pointer">Category</Label>
            {categoryOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 mb-6">
            {categories.map((category) => (
              <div key={category.name} className="flex items-center space-x-2">
                <Checkbox id={category.name} />
                <label htmlFor={category.name} className="text-sm cursor-pointer flex-1 flex justify-between">
                  <span>{category.name}</span>
                  <span className="text-muted-foreground">({category.count})</span>
                </label>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Brands */}
        <Collapsible open={brandOpen} onOpenChange={setBrandOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full mb-3">
            <Label className="font-semibold cursor-pointer">Brand</Label>
            {brandOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 mb-6">
            {brands.map((brand) => (
              <div key={brand.name} className="flex items-center space-x-2">
                <Checkbox id={brand.name} />
                <label htmlFor={brand.name} className="text-sm cursor-pointer flex-1 flex justify-between">
                  <span>{brand.name}</span>
                  <span className="text-muted-foreground">({brand.count})</span>
                </label>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Rating */}
        <div className="mb-6">
          <Label className="mb-3 block font-semibold">Rating</Label>
          <div className="space-y-2">
            {[4, 3, 2, 1].map((stars) => (
              <div key={stars} className="flex items-center space-x-2">
                <Checkbox id={`${stars}-stars`} />
                <label htmlFor={`${stars}-stars`} className="text-sm cursor-pointer">
                  {stars}+ Stars
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Availability */}
        <div>
          <Label className="mb-3 block font-semibold">Availability</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox id="in-stock" />
              <label htmlFor="in-stock" className="text-sm cursor-pointer">
                In Stock
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="ships-24h" />
              <label htmlFor="ships-24h" className="text-sm cursor-pointer">
                Ships in 24 hours
              </label>
            </div>
          </div>
        </div>

        <Button variant="outline" className="w-full mt-6 bg-transparent">
          Clear Filters
        </Button>
      </div>
    </aside>
  )
}
