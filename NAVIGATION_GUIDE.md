# Navigation Integration Guide

## Add Menu Items to CompanyLayout Sidebar

To integrate the new pages into your navigation, add these items to the CompanyLayout component's sidebar menu.

### Update CompanyLayout Navigation

Add the following menu items to your sidebar navigation configuration:

```typescript
import {
  ShoppingCart,
  Package,
  DollarSign,
  AlertTriangle,
} from "lucide-react"

// Navigation items for company users
const companyMenuItems = [
  {
    label: "Shopping Cart",
    href: "/companies/cart",
    icon: ShoppingCart,
    description: "View and manage your shopping cart"
  },
  {
    label: "Orders",
    href: "/companies/orders",
    icon: Package,
    description: "View your order history and status"
  },
  {
    label: "Monthly Limits",
    href: "/companies/limits",
    icon: DollarSign,
    description: "View and manage monthly spending limits"
  },
  {
    label: "Escalations",
    href: "/companies/escalations",
    icon: AlertTriangle,
    description: "Manage order escalation requests"
  },
]
```

### Expected Sidebar Structure

```
Company Dashboard
├── Dashboard
├── Users
├── Branches
├── Products
├── ─────────────  [Divider]
├── Shopping Cart  (NEW)
├── Orders         (NEW)
├── Monthly Limits (NEW)
└── Escalations    (NEW)
```

---

## Navigation Flow

### For Regular Users
1. **Shopping Cart** - Browse products and add to cart
2. **Orders** - View order history
3. **Monthly Limits** - View their limit and spending
4. **Escalations** - Submit escalation requests if needed

### For Company Admins
1. **Shopping Cart** - Can add items to cart
2. **Orders** - View all company orders
3. **Monthly Limits** - Manage user limits, view own limit
4. **Escalations** - Approve/Reject user escalations

### For Super Admins
- Same access as Company Admins
- Can set limits for Company Admins
- Can approve Admin escalations

---

## Badge/Notification Indicators

Consider adding notification badges to show pending items:

```typescript
// Cart - Show item count
<NavLink href="/companies/cart">
  <ShoppingCart className="w-4 h-4" />
  <span>Shopping Cart</span>
  {cartItemCount > 0 && (
    <Badge variant="destructive" className="ml-auto">
      {cartItemCount}
    </Badge>
  )}
</NavLink>

// Escalations - Show pending count (for admins only)
{isAdmin && (
  <NavLink href="/companies/escalations">
    <AlertTriangle className="w-4 h-4" />
    <span>Escalations</span>
    {pendingEscalations > 0 && (
      <Badge variant="destructive" className="ml-auto">
        {pendingEscalations}
      </Badge>
    )}
  </NavLink>
)}
```

---

## Mobile Navigation

For mobile/responsive views, ensure:
- Icons are displayed for quick recognition
- Labels are clear and concise
- Badges are visible on mobile
- Touch targets are at least 44x44 pixels
- Submenu items fit without overflow

---

## Breadcrumb Integration

Add breadcrumbs for better navigation:

```
Company > Shopping Cart
Company > Orders > Order #123
Company > Monthly Limits
Company > Escalations > Escalation #456
```

---

## Search/Quick Navigation

Consider adding quick search that includes:
- "Go to Cart"
- "View Orders"
- "Check Limits"
- "Manage Escalations"

---

## User Preferences

If your app has user preferences, remember to save navigation preferences:
- Recently visited pages
- Favorite sections
- Custom menu order

---

## Permissions Check

Ensure proper permission checking:

```typescript
const canAccessLimits = userRole === "company-admin" || userRole === "super-admin";
const canManageEscalations = userRole === "company-admin" || userRole === "super-admin";
const canViewEscalations = userRole === "user" || canManageEscalations;

// Hide/Show menu items based on role
{canAccessLimits && (
  <NavLink href="/companies/limits">
    <DollarSign className="w-4 h-4" />
    Monthly Limits
  </NavLink>
)}
```

---

## Analytics Integration

Track user navigation:

```typescript
const trackNavigation = (pageName: string) => {
  // Log to analytics
  analytics.track("page_visited", {
    page: pageName,
    timestamp: new Date(),
    user_role: userRole,
  });
};

// Usage in NavLink
<NavLink 
  href="/companies/cart"
  onClick={() => trackNavigation("shopping_cart")}
>
  Shopping Cart
</NavLink>
```

---

## Sample CompanyLayout Update

Here's how to integrate into your existing CompanyLayout:

```typescript
// components/company/company-layout.tsx

import { 
  ShoppingCart, 
  Package, 
  DollarSign, 
  AlertTriangle,
  LayoutDashboard,
  Users,
  Building2,
  Package as ProductIcon,
} from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

const navigationItems = [
  // Existing items
  {
    label: "Dashboard",
    href: "/companies/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Users",
    href: "/companies/users",
    icon: Users,
  },
  {
    label: "Branches",
    href: "/companies/branches",
    icon: Building2,
  },
  {
    label: "Products",
    href: "/companies/products",
    icon: ProductIcon,
  },
  // New items
  {
    label: "Shopping Cart",
    href: "/companies/cart",
    icon: ShoppingCart,
  },
  {
    label: "Orders",
    href: "/companies/orders",
    icon: Package,
  },
  {
    label: "Monthly Limits",
    href: "/companies/limits",
    icon: DollarSign,
    adminOnly: true,
  },
  {
    label: "Escalations",
    href: "/companies/escalations",
    icon: AlertTriangle,
    adminOnly: true,
  },
]

export function CompanyLayout({ children }: { children: React.ReactNode }) {
  const [cartCount, setCartCount] = useState(0)
  const [pendingEscalations, setPendingEscalations] = useState(0)
  const userRole = useUserRole() // Get from your auth context
  
  // Load notification counts
  useEffect(() => {
    loadCartCount()
    if (userRole === "company-admin") {
      loadPendingEscalations()
    }
  }, [])
  
  const loadCartCount = async () => {
    try {
      const response = await getCart()
      if (response.success) {
        setCartCount(response.data.totalItems)
      }
    } catch (error) {
      console.error("Failed to load cart count:", error)
    }
  }
  
  const loadPendingEscalations = async () => {
    try {
      const response = await getReceivedEscalations(
        { status: "pending" },
        1,
        1
      )
      if (response.success) {
        setPendingEscalations(response.count)
      }
    } catch (error) {
      console.error("Failed to load escalations:", error)
    }
  }
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r shadow-sm">
        {/* Logo/Brand */}
        <div className="p-4 border-b">
          <h1 className="font-bold text-lg">E-Commerce</h1>
          <p className="text-xs text-gray-600">Company Portal</p>
        </div>
        
        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navigationItems
            .filter(item => !item.adminOnly || userRole === "company-admin")
            .map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <item.icon className="w-5 h-5 text-gray-600" />
                <span className="flex-1 text-sm">{item.label}</span>
                
                {/* Notification Badge */}
                {item.href === "/companies/cart" && cartCount > 0 && (
                  <Badge variant="destructive">{cartCount}</Badge>
                )}
                {item.href === "/companies/escalations" && pendingEscalations > 0 && (
                  <Badge variant="destructive">{pendingEscalations}</Badge>
                )}
              </Link>
            ))}
        </nav>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
```

---

## Keyboard Navigation

Ensure all navigation items are keyboard accessible:

```typescript
// Support keyboard shortcuts
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Ctrl+K for quick navigation
    if (e.ctrlKey && e.key === 'k') {
      e.preventDefault()
      showCommandPalette()
    }
    
    // Ctrl+Shift+C for Cart
    if (e.ctrlKey && e.shiftKey && e.key === 'C') {
      router.push('/companies/cart')
    }
    
    // Ctrl+Shift+O for Orders
    if (e.ctrlKey && e.shiftKey && e.key === 'O') {
      router.push('/companies/orders')
    }
  }
  
  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
}, [])
```

---

## Mobile Drawer Navigation

For mobile, use a collapsible drawer:

```typescript
const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

return (
  <>
    {/* Mobile Header */}
    <div className="md:hidden flex items-center justify-between p-4 bg-white border-b">
      <h1 className="font-bold">E-Commerce</h1>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        <Menu className="w-5 h-5" />
      </Button>
    </div>
    
    {/* Mobile Drawer */}
    {mobileMenuOpen && (
      <div className="md:hidden bg-white border-b p-4 space-y-2">
        {navigationItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-2 p-2 rounded hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(false)}
          >
            <item.icon className="w-4 h-4" />
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    )}
  </>
)
```

---

## URL Redirects (Optional)

Create shortcuts for common actions:

```typescript
// Shortcut URLs
const shortcuts: Record<string, string> = {
  '/cart': '/companies/cart',
  '/orders': '/companies/orders',
  '/limits': '/companies/limits',
  '/escalations': '/companies/escalations',
}
```

---

For more information on implementing these features, refer to the page implementations in:
- `/src/pages/companies/cart.tsx`
- `/src/pages/companies/orders.tsx`
- `/src/pages/companies/limits.tsx`
- `/src/pages/companies/escalations.tsx`
