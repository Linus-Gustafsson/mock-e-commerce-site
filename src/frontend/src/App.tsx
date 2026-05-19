import { useState, useRef, useEffect } from "react";
import type { Product } from "./types";
import { Header } from "./components/Header";
import { HeroBanner } from "./components/HeroBanner";
import { ProductList } from "./components/ProductList";
import { CartDrawer } from "./components/CartDrawer";
import { useProducts } from "./hooks/useProducts";
import { useCart } from "./hooks/useCart";
import "./App.css";

export function App() {
  const { products, loading, error } = useProducts();
  const {
    cartItems,
    cartItemCount,
    cartTotal,
    loading: cartLoading,
    addItem,
    removeItem,
    updateItem,
    clearCart,
  } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [cartMessage, setCartMessage] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  async function handleAddToCart(product: Product) {
    try {
      await addItem(product);
      setCartMessage(`"${product.name}" added to cart!`);
    } catch (err) {
      const isMaxQty = err instanceof Error && err.message.includes(": 400");
      setCartMessage(
        isMaxQty
          ? "Maximum quantity of 5 reached."
          : "Failed to add item to cart.",
      );
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCartMessage(null), 3000);
  }

  return (
    <div className="app">
      <Header
        cartItemCount={cartItemCount}
        onCartOpen={() => setCartOpen(true)}
      />
      <HeroBanner />

      <main className="app__main">
        <h1 className="app__section-heading">Our products</h1>

        {cartMessage && (
          <div className="app__notification" role="status">
            {cartMessage}
          </div>
        )}

        {loading && <p className="app__loading">Loading products…</p>}
        {error && <p className="app__error">Error: {error}</p>}
        {!loading && !error && (
          <ProductList products={products} onAddToCart={handleAddToCart} />
        )}
      </main>

      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cartItems}
        cartTotal={cartTotal}
        loading={cartLoading}
        onRemoveItem={removeItem}
        onUpdateItem={updateItem}
        onClearCart={clearCart}
      />
    </div>
  );
}
