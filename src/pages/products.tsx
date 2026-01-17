import { Header } from "@/components/header"
import { FiltersSidebar } from "@/components/filtersidebar"
import { ProductCard } from "@/components/product-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const products = [
  {
    id: "1",
    name: "Executive Leather Office Chair",
    description: "Ergonomic design with lumbar support, adjustable height and armrests",
    price: 299.99,
    originalPrice: 399.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.5,
    reviewCount: 128,
    badge: "best-seller" as const,
  },
  {
    id: "2",
    name: "Premium Ballpoint Pen Set",
    description: "Professional writing instruments with smooth ink flow, pack of 12",
    price: 24.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.8,
    reviewCount: 89,
    badge: "new" as const,
  },
  {
    id: "3",
    name: "A4 Copy Paper - 5 Ream Box",
    description: "Bright white, 20lb weight paper suitable for all printers",
    price: 42.99,
    originalPrice: 54.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.3,
    reviewCount: 234,
    badge: "sale" as const,
  },
  {
    id: "4",
    name: "Wireless Ergonomic Mouse",
    description: "Comfortable grip design with precision tracking and long battery life",
    price: 34.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.6,
    reviewCount: 67,
  },
  {
    id: "5",
    name: "Desk Organizer Set",
    description: "Modern mesh design with multiple compartments for supplies",
    price: 29.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.4,
    reviewCount: 156,
    badge: "best-seller" as const,
  },
  {
    id: "6",
    name: "Standing Desk Converter",
    description: "Adjustable height workstation for healthier working posture",
    price: 189.99,
    originalPrice: 249.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.7,
    reviewCount: 92,
    badge: "sale" as const,
  },
  {
    id: "7",
    name: "Sticky Notes Value Pack",
    description: "Assorted colors and sizes, 24 pads included",
    price: 16.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.5,
    reviewCount: 178,
  },
  {
    id: "8",
    name: "LED Desk Lamp",
    description: "Adjustable brightness and color temperature, USB charging port",
    price: 44.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.6,
    reviewCount: 145,
    badge: "new" as const,
  },
]

export default function ProductListingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 text-balance">Office Supplies & Equipment</h1>
          <p className="text-muted-foreground text-pretty">Premium quality products for your business needs</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <FiltersSidebar />
          </div>

          {/* Products Section */}
          <div className="flex-1">
            {/* Sort and Results Count */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-semibold text-foreground">534</span> products
              </p>
              <Select defaultValue="featured">
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="best-sellers">Best Sellers</SelectItem>
                  <SelectItem value="newest">Newest Arrivals</SelectItem>
                  <SelectItem value="rating">Customer Rating</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>

            {/* Pagination Info */}
            <div className="mt-8 text-center text-sm text-muted-foreground">Showing 8 of 534 products</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-3">Customer Service</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Contact Us</li>
                <li>Shipping Info</li>
                <li>Returns</li>
                <li>FAQ</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">About Us</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Our Story</li>
                <li>Careers</li>
                <li>Press</li>
                <li>Sustainability</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Business Solutions</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Bulk Orders</li>
                <li>Business Accounts</li>
                <li>Credit Terms</li>
                <li>Contract Pricing</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Trust & Security</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Secure Checkout</li>
                <li>Money-back Guarantee</li>
                <li>Free Shipping Over $50</li>
                <li>Privacy Policy</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            © 2026 ProSupply. Professional office supplies for your business needs.
          </div>
        </div>
      </footer>
    </div>
  )
}
