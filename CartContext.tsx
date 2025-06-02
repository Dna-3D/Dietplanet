import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { CartItemWithProduct, Product } from "@shared/schema";
import { useAuth } from "./AuthContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CartContextType {
  cartItems: CartItemWithProduct[];
  loading: boolean;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (cartItemId: number) => Promise<void>;
  updateQuantity: (cartItemId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  // Load cart from localStorage for guest users
  const loadGuestCart = (): CartItemWithProduct[] => {
    try {
      const savedCart = localStorage.getItem('guest_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error("Error loading guest cart:", error);
      return [];
    }
  };

  // Save cart to localStorage for guest users
  const saveGuestCart = (items: CartItemWithProduct[]) => {
    try {
      localStorage.setItem('guest_cart', JSON.stringify(items));
    } catch (error) {
      console.error("Error saving guest cart:", error);
    }
  };

  const fetchCartItems = async () => {
    if (!currentUser) {
      // Load guest cart from localStorage
      const guestItems = loadGuestCart();
      setCartItems(guestItems);
      return;
    }

    try {
      setLoading(true);
      const response = await apiRequest("GET", `/api/cart/${currentUser.uid}`);
      const items = await response.json();
      setCartItems(items);
    } catch (error) {
      console.error("Error fetching cart items:", error);
      toast({
        title: "Error",
        description: "Failed to load cart items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product: Product, quantity = 1) => {
    if (!currentUser) {
      // Handle guest cart with localStorage
      const guestCart = loadGuestCart();
      const existingItem = guestCart.find(item => item.product.id === product.id);
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        const newCartItem: CartItemWithProduct = {
          id: Date.now(), // Temporary ID for guest items
          userId: null,
          productId: product.id,
          quantity,
          createdAt: new Date(),
          product
        };
        guestCart.push(newCartItem);
      }
      
      saveGuestCart(guestCart);
      setCartItems(guestCart);
      
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart`,
      });
      return;
    }

    try {
      await apiRequest("POST", "/api/cart", {
        productId: product.id,
        quantity,
      });

      await fetchCartItems();
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });

      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart`,
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    }
  };

  const removeFromCart = async (cartItemId: number) => {
    if (!currentUser) {
      // Handle guest cart removal
      const guestCart = loadGuestCart();
      const updatedCart = guestCart.filter(item => item.id !== cartItemId);
      saveGuestCart(updatedCart);
      setCartItems(updatedCart);
      
      toast({
        title: "Removed from cart",
        description: "Item has been removed from your cart",
      });
      return;
    }

    try {
      await apiRequest("DELETE", `/api/cart/${cartItemId}`, {});
      await fetchCartItems();
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });

      toast({
        title: "Removed from cart",
        description: "Item has been removed from your cart",
      });
    } catch (error) {
      console.error("Error removing from cart:", error);
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive",
      });
    }
  };

  const updateQuantity = async (cartItemId: number, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(cartItemId);
      return;
    }

    if (!currentUser) {
      // Handle guest cart quantity update
      const guestCart = loadGuestCart();
      const updatedCart = guestCart.map(item => 
        item.id === cartItemId ? { ...item, quantity } : item
      );
      saveGuestCart(updatedCart);
      setCartItems(updatedCart);
      return;
    }

    try {
      await apiRequest("PUT", `/api/cart/${cartItemId}`, { quantity });
      await fetchCartItems();
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast({
        title: "Error",
        description: "Failed to update item quantity",
        variant: "destructive",
      });
    }
  };

  const clearCart = async () => {
    if (!currentUser) {
      // Clear guest cart
      localStorage.removeItem('guest_cart');
      setCartItems([]);
      return;
    }

    try {
      await apiRequest("DELETE", `/api/cart/clear/${currentUser.uid}`, {});
      setCartItems([]);
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    } catch (error) {
      console.error("Error clearing cart:", error);
      toast({
        title: "Error",
        description: "Failed to clear cart",
        variant: "destructive",
      });
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      return total + parseFloat(item.product.price) * item.quantity;
    }, 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  useEffect(() => {
    fetchCartItems();
  }, [currentUser]);

  const value: CartContextType = {
    cartItems,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
