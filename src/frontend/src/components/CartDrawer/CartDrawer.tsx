import type { CartItem } from "../../types";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  cartTotal: number;
  loading: boolean;
  onRemoveItem: (productId: number) => void;
  onUpdateItem: (productId: number, quantity: number) => void;
  onClearCart: () => void;
}

export function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  cartTotal,
  loading,
  onRemoveItem,
  onUpdateItem,
  onClearCart,
}: CartDrawerProps) {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="cart-drawer__overlay"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className="cart-drawer" aria-label="Shopping cart">
        <div className="cart-drawer__header">
          <h2 className="cart-drawer__title">Your Cart</h2>
          <button
            className="cart-drawer__close"
            onClick={onClose}
            aria-label="Close cart"
          >
            ×
          </button>
        </div>

        <div className="cart-drawer__body">
          {loading ? (
            <p className="cart-drawer__loading">Loading…</p>
          ) : cartItems.length === 0 ? (
            <p className="cart-drawer__empty">Your cart is empty.</p>
          ) : (
            <ul className="cart-drawer__list" aria-label="Cart items">
              {cartItems.map((item) => (
                <li key={item.productId} className="cart-drawer__item">
                  <div className="cart-drawer__item-info">
                    <span className="cart-drawer__item-name">
                      {item.productName}
                    </span>
                    <span className="cart-drawer__item-price">
                      ${item.unitPrice.toFixed(2)} each
                    </span>
                  </div>
                  <div className="cart-drawer__item-controls">
                    <button
                      className="cart-drawer__qty-btn"
                      onClick={() =>
                        item.quantity === 1
                          ? onRemoveItem(item.productId)
                          : onUpdateItem(item.productId, item.quantity - 1)
                      }
                      aria-label={`Decrease quantity of ${item.productName}`}
                    >
                      –
                    </button>
                    <span
                      className="cart-drawer__qty"
                      aria-label={`Quantity: ${item.quantity}`}
                    >
                      {item.quantity}
                    </span>
                    <button
                      className="cart-drawer__qty-btn"
                      onClick={() =>
                        onUpdateItem(item.productId, item.quantity + 1)
                      }
                      disabled={item.quantity >= 5}
                      aria-label={`Increase quantity of ${item.productName}`}
                    >
                      +
                    </button>
                  </div>
                  <span className="cart-drawer__item-total">
                    ${item.totalPrice.toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {!loading && cartItems.length > 0 && (
          <div className="cart-drawer__footer">
            <div className="cart-drawer__total">
              <span>Total</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <button className="cart-drawer__clear" onClick={onClearCart}>
              Clear Cart
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
