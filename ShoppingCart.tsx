import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "./sheet";
import { Button } from "./button";
import { Separator } from "./separator";
import { Badge } from "./badge";
import { Plus, Minus, Trash2 } from "lucide-react";
import { useCart } from "./CartContext";
import { useAuth } from "./AuthContext";
import { apiRequest } from "./queryClient";
import { useToast } from "./use-toast";
import { LoginModal } from "./LoginModal";

interface ShoppingCartProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShoppingCart({ open, onOpenChange }: ShoppingCartProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const { cartItems, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart();
  const { currentUser, userProfile } = useAuth();
  const { toast } = useToast();

  const handleCheckout = async () => {
    if (!currentUser || !userProfile) {
      setShowLoginModal(true);
      return;
    }

    if (cartItems.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add some items to your cart before checking out",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const orderData = {
        customerName: userProfile.displayName || currentUser.email?.split('@')[0] || 'Customer',
        customerPhone: customerPhone,
        customerAddress: deliveryAddress,
        totalAmount: getTotalPrice(),
        paymentMethod: "pay_on_delivery",
        items: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price,
        })),
      };

      const response = await apiRequest("POST", "/api/orders", orderData) as any;
      
      // Automatically open WhatsApp with order details
      if (response.whatsappUrl) {
        window.open(response.whatsappUrl, '_blank');
      }
      
      await clearCart();
      onOpenChange(false);

      toast({
        title: "Order placed successfully!",
        description: "WhatsApp notification sent to DietPlanet. You will be contacted shortly.",
      });
    } catch (error) {
      console.error("Error placing order:", error);
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full max-w-md">
          <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>Shopping Cart</span>
            <Badge variant="secondary">{cartItems.length} items</Badge>
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto py-6">
            {cartItems.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Your cart is empty</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => onOpenChange(false)}
                >
                  Continue Shopping
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center space-x-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg"
                  >
                    <img
                      src={item.product.imageUrl || "/api/placeholder/80/80"}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{item.product.name}</h4>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        ₦{Number(item.product.price).toLocaleString()}
                      </p>
                      <div className="flex items-center mt-2 space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        ₦{(Number(item.product.price) * item.quantity).toLocaleString()}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="border-t pt-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-2xl font-bold text-primary">
                  ₦{getTotalPrice().toLocaleString()}
                </span>
              </div>
              <div className="space-y-3">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="e.g., 08123456789"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Delivery Address</label>
                    <textarea
                      placeholder="Enter your full delivery address..."
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary focus:border-primary"
                      rows={3}
                      required
                    />
                  </div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                    Payment Method: Pay on Delivery (Cash/POS)
                  </p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-300 mt-1">
                    You can pay when your order arrives
                  </p>
                </div>
                <Button
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={handleCheckout}
                  disabled={isProcessing || !customerPhone.trim() || !deliveryAddress.trim()}
                >
                  {isProcessing ? "Processing..." : "Place Order - Pay on Delivery"}
                </Button>
              </div>
            </div>
          )}
        </div>
        </SheetContent>
      </Sheet>
    </>
  );
}