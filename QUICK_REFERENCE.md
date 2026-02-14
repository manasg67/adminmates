# Quick Reference - Monthly Limits & Order System

## API Function Quick Reference

### Import All Functions
```typescript
import {
  // Limits
  getMyLimit,
  getUserLimit,
  setUserLimit,
  
  // Cart
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  
  // Orders
  placeOrder,
  getAllOrders,
  getOrderById,
  
  // Escalations
  createEscalation,
  getReceivedEscalations,
  getSentEscalations,
  approveEscalation,
  rejectEscalation,
} from "@/lib/api"
```

---

## Usage Examples

### Get My Monthly Limit
```typescript
try {
  const response = await getMyLimit();
  if (response.success) {
    console.log(`Limit: ₹${response.data.monthlyLimit}`);
    console.log(`Spent: ₹${response.data.monthlySpent}`);
    console.log(`Remaining: ₹${response.data.remainingLimit}`);
  }
} catch (error) {
  console.error("Failed to fetch limit:", error);
}
```

### Add Product to Cart
```typescript
try {
  const response = await addToCart("productId123", 2); // quantity optional
  if (response.success) {
    console.log(`Cart total: ₹${response.data.totalAmount}`);
  }
} catch (error) {
  console.error("Failed to add to cart:", error);
}
```

### Update Cart Item Quantity
```typescript
// Increment quantity
await updateCartItem("productId123", "increment");

// Decrement quantity
await updateCartItem("productId123", "decrement");

// Set specific quantity
await updateCartItem("productId123", "set", 5);
```

### Place Order
```typescript
try {
  const response = await placeOrder("Please deliver by Friday");
  if (response.success) {
    console.log("Order placed:", response.data.orderNumber);
    // Show limitInfo for user reference
    if (response.limitInfo) {
      console.log(`Remaining limit: ₹${response.limitInfo.remainingLimit}`);
    }
  }
} catch (error) {
  // If error mentions limit exceed, user needs to escalate
  if (error.message.includes("exceeds")) {
    // Show escalation option
  }
}
```

### Get All Orders with Filters
```typescript
// Get pending orders
const response = await getAllOrders(
  { status: "pending" },  // filters
  1,                      // page
  10,                     // limit
  "createdAt",           // sortBy
  "desc"                 // sortOrder
);

// Possible status values:
// pending, approved, rejected, processing, shipped, delivered, cancelled
```

### Create Escalation
```typescript
try {
  const response = await createEscalation(
    "Need equipment urgently for project deadline"
  );
  if (response.success) {
    console.log("Escalation created:", response.data.escalationNumber);
  }
} catch (error) {
  if (error.message.includes("within your limit")) {
    // No need to escalate, order is within limit
  }
}
```

### Get Received Escalations (Admin)
```typescript
const response = await getReceivedEscalations(
  { status: "pending" },  // filters
  1,                      // page
  10                      // limit
);

// Show pending escalations to admin for approval/rejection
escalations.forEach(esc => {
  if (esc.status === "pending") {
    // Show approve/reject buttons
  }
});
```

### Approve Escalation (Admin)
```typescript
try {
  const response = await approveEscalation(
    "escalationId123",
    "Approved - critical for operations"
  );
  
  if (response.success) {
    console.log("Escalation approved, order placed:", response.data.order.orderNumber);
    // Update limit info for admin
    if (response.limitInfo) {
      console.log(`Your remaining limit: ₹${response.limitInfo.remainingLimit}`);
    }
  }
} catch (error) {
  // Handle case where admin also exceeds limit
  if (error.message.includes("exceeds your")) {
    // Admin needs to escalate to super-admin
  }
}
```

### Reject Escalation (Admin)
```typescript
try {
  const response = await rejectEscalation(
    "escalationId123",
    "Budget exhausted for this month. Retry next month."
  );
  
  if (response.success) {
    console.log("Escalation rejected");
  }
} catch (error) {
  console.error("Failed to reject:", error);
}
```

---

## Type Definitions for Reference

### Cart Types
```typescript
interface CartProduct {
  _id: string;
  productName: string;
  sku: string;
  brand: string;
  price: number;
  images: { url: string; publicId: string }[];
  category: { _id: string; name: string };
  subCategory: { _id: string; name: string };
  status: string;
  approvalStatus: string;
}

interface CartItem {
  product: CartProduct;
  quantity: number;
  price: number;
  addedAt: string;
  _id: string;
}

interface CartData {
  _id: string;
  user: string;
  company: string;
  items: CartItem[];
  totalAmount: number;
  totalItems: number;
  createdAt: string;
  updatedAt: string;
}
```

### Order Types
```typescript
interface OrderItem {
  product: string | CartProduct;
  productName: string;
  sku: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

interface OrderData {
  _id: string;
  orderNumber: string;
  company: { _id: string; name: string; email?: string };
  orderedBy: { _id: string; name: string; email: string; role: string };
  orderPlacedBy?: { _id: string; name: string; email: string; role: string };
  items: OrderItem[];
  totalAmount: number;
  totalItems: number;
  status: "pending" | "approved" | "rejected" | "processing" | "shipped" | "delivered" | "cancelled";
  wasEscalated: boolean;
  escalationDetails?: {
    escalatedFrom: string;
    escalatedTo: string;
    escalationLevel: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Escalation Types
```typescript
interface EscalationData {
  _id: string;
  escalationNumber: string;
  company: string;
  requestedBy: { _id: string; name: string; email: string; role: string };
  escalationType: "user-to-admin" | "admin-to-superadmin";
  items: EscalationItem[];
  totalAmount: number;
  totalItems: number;
  status: "pending" | "approved" | "rejected" | "cancelled";
  requestReason: string;
  requesterLimit: {
    monthlyLimit: number;
    monthlySpent: number;
    remainingLimit: number;
  };
  responseMessage?: string;
  respondedBy?: { _id: string; name: string; role: string };
  respondedAt?: string;
  createdAt: string;
}
```

---

## Page Routes

Add these to your router configuration:

```typescript
// In your routing configuration
{
  path: "/companies/cart",
  element: <CartPage />
},
{
  path: "/companies/orders",
  element: <OrdersPage />
},
{
  path: "/companies/limits",
  element: <LimitsPage />
},
{
  path: "/companies/escalations",
  element: <EscalationsPage />
}
```

---

## Common Error Handling Patterns

### Handle Limit Exceeded
```typescript
try {
  await placeOrder();
} catch (error) {
  if (error.message.includes("exceeds")) {
    // Show escalation dialog
    showEscalationDialog = true;
  }
}
```

### Handle Approval Failure (Admin Exceeds Limit)
```typescript
try {
  await approveEscalation(id, message);
} catch (error) {
  if (error.message.includes("exceeds your")) {
    // Admin needs to escalate
    showAdminEscalationDialog = true;
  }
}
```

### Handle Missing Limit Setup
```typescript
try {
  await placeOrder();
} catch (error) {
  if (error.message.includes("no limit set")) {
    // Contact admin message
    showLimitNotSetError = true;
  }
}
```

---

## State Management Pattern

```typescript
const [cart, setCart] = useState<CartData | null>(null);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  loadCart();
}, []);

const loadCart = async () => {
  try {
    setIsLoading(true);
    setError(null);
    const response = await getCart();
    if (response.success) {
      setCart(response.data);
    }
  } catch (err) {
    setError(err instanceof Error ? err.message : "Failed to load");
  } finally {
    setIsLoading(false);
  }
};
```

---

## Styling Guidelines

### Status Colors
```typescript
const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-gray-100 text-gray-800",
};

// Usage:
<Badge className={STATUS_COLORS[status]}>
  {status.charAt(0).toUpperCase() + status.slice(1)}
</Badge>
```

---

## Debugging Tips

1. **Check Token**: Ensure authentication token is set correctly
2. **API Response**: Log the full response to see server messages
3. **Limit Info**: Always show `limitInfo` in responses for transparency
4. **Pagination**: Check `totalPages` and `currentPage` values
5. **Escalation Chain**: Verify escalation type matches user role

---

## Performance Optimization

- **Cart**: Debounce update requests to avoid rapid API calls
- **Orders**: Lazy load order details only when modal opens
- **Limits**: Cache limit data and refresh on specific events
- **Escalations**: Pagination prevents loading all escalations at once

---

## Accessibility Notes

- Use semantic HTML in all components
- Include proper `aria-labels` for icons
- Ensure color is not the only indicator (use text + color)
- Make buttons keyboard accessible
- Use proper heading hierarchy

---

## Security Considerations

- All API calls use Bearer token authentication
- Role-based access is enforced server-side
- User can only see their own data (enforced by backend)
- Admin approval is required for escalations
- Input validation happens on both client and server

---

For more detailed information, see `IMPLEMENTATION_SUMMARY.md`
