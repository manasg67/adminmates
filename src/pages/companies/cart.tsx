"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ShoppingCart, Trash2, Plus, Minus, Loader2, AlertCircle, CreditCard } from "lucide-react"
import { CompanyLayout } from "@/components/company/company-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
import { getCart, removeFromCart, updateCartItem, placeOrder, verifyPayment, getMyLimit, type CartData } from "@/lib/api"
import { cn } from "@/lib/utils"

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CartPage() {
  const navigate = useNavigate()
  const [cart, setCart] = useState<CartData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [placingOrder, setPlacingOrder] = useState(false)
  const [orderNotes, setOrderNotes] = useState("")
  const [placeOrderDialogOpen, setPlaceOrderDialogOpen] = useState(false)
  const [monthlyLimit, setMonthlyLimit] = useState<{ limit: number | null; spent: number; remaining: number | null; hasUnlimitedAccess: boolean } | null>(null)
  const [orderError, setOrderError] = useState<string | null>(null)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [paymentOrder, setPaymentOrder] = useState<any>(null)
  const [razorpayOrderData, setRazorpayOrderData] = useState<any>(null)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)

  useEffect(() => {
    loadCart()
    loadMonthlyLimit()
  }, [])

  const loadCart = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await getCart()
      if (response.success) {
        setCart(response.data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load cart")
    } finally {
      setIsLoading(false)
    }
  }

  const loadMonthlyLimit = async () => {
    try {
      const response = await getMyLimit()
      if (response.success) {
        setMonthlyLimit({
          limit: response.data.monthlyLimit || null,
          spent: response.data.monthlySpent,
          remaining: response.data.remainingLimit || null,
          hasUnlimitedAccess: response.data.hasUnlimitedAccess || false,
        })
      }
    } catch (err) {
      console.error("Failed to load monthly limit:", err)
    }
  }

  const handleRemoveItem = async (productId: string) => {
    try {
      setIsUpdating(true)
      const response = await removeFromCart(productId)
      if (response.success) {
        setCart(response.data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove item")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleUpdateQuantity = async (productId: string, action: 'increment' | 'decrement') => {
    try {
      setIsUpdating(true)
      const response = await updateCartItem(productId, action)
      if (response.success) {
        setCart(response.data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update cart")
    } finally {
      setIsUpdating(false)
    }
  }

  const handlePlaceOrder = async () => {
    try {
      setPlacingOrder(true)
      setOrderError(null)
      const response = await placeOrder(orderNotes)
      
      if (response.success) {
        // Show order confirmation (invoice will be created later)
        setPaymentOrder(response.data.order)
        setPlaceOrderDialogOpen(false)
        // Navigate to orders page - vendor will create invoice after approval
        setTimeout(() => {
          navigate('/companies/orders')
        }, 1000)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to place order"
      setOrderError(errorMessage)
    } finally {
      setPlacingOrder(false)
    }
  }

  const handlePaymentClick = async () => {
    if (!paymentOrder?.payment?.razorpayOrderId) return

    try {
      setIsProcessingPayment(true)

      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        const script = document.createElement('script')
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.async = true
        document.body.appendChild(script)
        script.onload = () => initializePayment()
      } else {
        initializePayment()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to initiate payment")
      setIsProcessingPayment(false)
    }
  }

  const initializePayment = () => {
    if (!paymentOrder) return

    const options = {
      key: razorpayOrderData?.keyId || 'rzp_test_SBCyp5lcne8wWp',
      amount: razorpayOrderData?.amount || paymentOrder.payment?.amount * 100,
      currency: 'INR',
      name: 'E-Commerce Platform',
      description: `Payment for Order ${paymentOrder.orderNumber}`,
      order_id: razorpayOrderData?.id || paymentOrder.payment?.razorpayOrderId,
      handler: async (response: any) => {
        try {
          setIsProcessingPayment(true)
          // Verify payment on backend
          const verifyResponse = await verifyPayment(
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature,
            paymentOrder._id
          )

          if (verifyResponse.success) {
            setError(null)
            alert('Payment successful! Order confirmed.')
            setPaymentDialogOpen(false)
            setPaymentOrder(null)
            setRazorpayOrderData(null)
            setOrderNotes("")
            // Clear cart
            setCart({ ...cart!, items: [], totalAmount: 0, totalItems: 0 } as CartData)
            loadMonthlyLimit()
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : "Payment verification failed")
        } finally {
          setIsProcessingPayment(false)
        }
      },
      prefill: {
        name: localStorage.getItem('userName') || '',
        email: localStorage.getItem('userEmail') || '',
      },
      theme: {
        color: '#3b82f6',
      },
      modal: {
        ondismiss: () => {
          setIsProcessingPayment(false)
        },
      },
    }

    const razorpay = new window.Razorpay(options)
    razorpay.open()
  }

  if (isLoading) {
    return (
      <CompanyLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
            <p>Loading cart...</p>
          </div>
        </div>
      </CompanyLayout>
    )
  }

  const isEmpty = !cart || cart.items.length === 0

  return (
    <CompanyLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <ShoppingCart className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Shopping Cart</h1>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Monthly Limit Info */}
        {monthlyLimit && (
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Monthly Limit</p>
                <p className="text-lg font-semibold">
                  {monthlyLimit.hasUnlimitedAccess ? "Unlimited" : `₹${monthlyLimit.limit?.toLocaleString() || "0"}`}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Spent</p>
                <p className="text-lg font-semibold text-orange-600">₹{monthlyLimit.spent.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Remaining</p>
                <p className={cn("text-lg font-semibold", monthlyLimit.hasUnlimitedAccess ? "text-green-600" : monthlyLimit.remaining && monthlyLimit.remaining >= 0 ? "text-green-600" : "text-red-600")}>
                  {monthlyLimit.hasUnlimitedAccess ? "Unlimited" : `₹${monthlyLimit.remaining?.toLocaleString() || "0"}`}
                </p>
              </div>
            </div>
          </Card>
        )}

        {isEmpty ? (
          <Card className="p-12 text-center">
            <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add products to get started</p>
            <Button asChild>
              <a href="/companies/products">Browse Products</a>
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="col-span-2 space-y-4">
              {cart!.items.map((item) => (
                <Card key={item._id} className="p-4">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    {item.product.images.length > 0 && (
                      <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                        <img
                          src={item.product.images[0].url}
                          alt={item.product.productName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{item.product.productName}</h3>
                          <p className="text-sm text-gray-600">SKU: {item.product.sku}</p>
                          <p className="text-sm text-gray-600">{item.product.brand}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.product._id)}
                          disabled={isUpdating}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Category and Price */}
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary">{item.product.category.name}</Badge>
                        <Badge variant="outline">{item.product.subCategory.name}</Badge>
                      </div>

                      {/* Quantity Control */}
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateQuantity(item.product._id, 'decrement')}
                          disabled={isUpdating || item.quantity <= 1}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateQuantity(item.product._id, 'increment')}
                          disabled={isUpdating}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                        <span className="ml-auto text-lg font-semibold">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="col-span-1">
              <Card className="p-6 sticky top-20">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-6 pb-6 border-b">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items</span>
                    <span className="font-semibold">{cart!.totalItems}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">₹{cart!.totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-6">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-2xl font-bold text-blue-600">₹{cart!.totalAmount.toLocaleString()}</span>
                </div>

                {monthlyLimit && monthlyLimit.remaining !== null && cart!.totalAmount > monthlyLimit.remaining && !monthlyLimit.hasUnlimitedAccess && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Order exceeds your remaining limit by ₹{(cart!.totalAmount - monthlyLimit.remaining).toLocaleString()}
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => setPlaceOrderDialogOpen(true)}
                  disabled={isEmpty || (monthlyLimit && !monthlyLimit.hasUnlimitedAccess && monthlyLimit.remaining !== null && cart!.totalAmount > monthlyLimit.remaining) || false}
                >
                  Place Order
                </Button>

                <Button
                  variant="outline"
                  className="w-full mt-2"
                  asChild
                >
                  <a href="/companies/products">Continue Shopping</a>
                </Button>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Place Order Dialog */}
      <Dialog open={placeOrderDialogOpen} onOpenChange={setPlaceOrderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Place Order</DialogTitle>
            <DialogDescription>
              Review your order and add any special instructions
            </DialogDescription>
          </DialogHeader>

          {orderError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{orderError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold mb-2">Order Amount: ₹{cart?.totalAmount.toLocaleString()}</p>
              {monthlyLimit && !monthlyLimit.hasUnlimitedAccess && (
                <>
                  <p className="text-sm text-gray-600">Available Limit: ₹{monthlyLimit.remaining?.toLocaleString() || "0"}</p>
                  {monthlyLimit.remaining !== null && cart!.totalAmount > monthlyLimit.remaining && (
                    <p className="text-sm text-red-600 mt-1">
                      This order will need admin approval as it exceeds your limit
                    </p>
                  )}
                </>
              )}
              {monthlyLimit?.hasUnlimitedAccess && (
                <p className="text-sm text-green-600">You have unlimited access</p>
              )}
            </div>

            <div>
              <Label htmlFor="notes">Order Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any special instructions or requirements..."
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                className="mt-2"
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPlaceOrderDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePlaceOrder} disabled={placingOrder}>
              {placingOrder && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Place Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Payment</DialogTitle>
            <DialogDescription>
              {paymentOrder?.orderNumber || 'Order'} - Payment Required
            </DialogDescription>
          </DialogHeader>

          {paymentOrder && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Amount:</span>
                  <span className="font-semibold">₹{paymentOrder.totalAmount?.toLocaleString() || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Status:</span>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    {paymentOrder.payment?.paymentStatus?.charAt(0).toUpperCase() + paymentOrder.payment?.paymentStatus?.slice(1) || 'N/A'}
                  </Badge>
                </div>
                <div className="flex justify-between pt-2 border-t text-lg">
                  <span className="font-bold">Amount to Pay:</span>
                  <span className="font-bold text-blue-600">₹{paymentOrder.payment?.amount?.toLocaleString() || 'N/A'}</span>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Click the button below to proceed to Razorpay payment gateway
                </AlertDescription>
              </Alert>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handlePaymentClick}
              disabled={isProcessingPayment}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isProcessingPayment && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <CreditCard className="w-4 h-4 mr-2" />
              Pay with Razorpay
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CompanyLayout>
  )
}
