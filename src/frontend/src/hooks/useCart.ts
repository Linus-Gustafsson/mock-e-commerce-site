import { useState, useEffect, useCallback } from "react";
import type { CartItem, Product } from "../types";
import {
  fetchCart,
  addToCart,
  removeFromCart,
  clearCart as clearCartApi,
  updateCartItem,
} from "../api";

interface UseCartReturn {
  cartItems: CartItem[];
  cartItemCount: number;
  cartTotal: number;
  loading: boolean;
  error: string | null;
  addItem: (product: Product) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  updateItem: (productId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

export function useCart(): UseCartReturn {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);

  const loadCart = useCallback(async () => {
    try {
      const items = await fetchCart();
      setCartItems(items);
      setError(null);
    } catch {
      setError("Failed to load cart.");
    }
  }, []);

  useEffect(() => {
    loadCart().finally(() => setLoading(false));
  }, [loadCart]);

  const addItem = useCallback(
    async (product: Product) => {
      await addToCart({ productId: product.id, quantity: 1 });
      await loadCart();
    },
    [loadCart],
  );

  const removeItem = useCallback(
    async (productId: number) => {
      await removeFromCart(productId);
      await loadCart();
    },
    [loadCart],
  );

  const updateItem = useCallback(
    async (productId: number, quantity: number) => {
      await updateCartItem(productId, { quantity });
      await loadCart();
    },
    [loadCart],
  );

  const clearCart = useCallback(async () => {
    await clearCartApi();
    await loadCart();
  }, [loadCart]);

  return {
    cartItems,
    cartItemCount,
    cartTotal,
    loading,
    error,
    addItem,
    removeItem,
    updateItem,
    clearCart,
  };
}
