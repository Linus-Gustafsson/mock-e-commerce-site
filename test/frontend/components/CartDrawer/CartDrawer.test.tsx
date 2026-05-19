import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CartDrawer } from "../../../../src/frontend/src/components/CartDrawer";
import type { CartItem } from "../../../../src/frontend/src/types";

const mockCartItems: CartItem[] = [
  {
    productId: 1,
    productName: "Wireless Headphones",
    unitPrice: 79.99,
    quantity: 2,
    totalPrice: 159.98,
  },
  {
    productId: 2,
    productName: "Running Shoes",
    unitPrice: 59.99,
    quantity: 1,
    totalPrice: 59.99,
  },
];

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  cartItems: mockCartItems,
  cartTotal: 219.97,
  loading: false,
  onRemoveItem: vi.fn(),
  onUpdateItem: vi.fn(),
  onClearCart: vi.fn(),
};

describe("CartDrawer", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders nothing when closed", () => {
    render(<CartDrawer {...defaultProps} isOpen={false} />);

    expect(
      screen.queryByRole("complementary", { name: /shopping cart/i }),
    ).not.toBeInTheDocument();
  });

  it("renders the drawer when open", () => {
    render(<CartDrawer {...defaultProps} />);

    expect(
      screen.getByRole("complementary", { name: /shopping cart/i }),
    ).toBeInTheDocument();
  });

  it("shows loading indicator while loading", () => {
    render(<CartDrawer {...defaultProps} cartItems={[]} loading={true} />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("shows empty message when cart has no items", () => {
    render(<CartDrawer {...defaultProps} cartItems={[]} cartTotal={0} />);

    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
  });

  it("does not show footer when cart is empty", () => {
    render(<CartDrawer {...defaultProps} cartItems={[]} cartTotal={0} />);

    expect(
      screen.queryByRole("button", { name: /clear cart/i }),
    ).not.toBeInTheDocument();
  });

  it("renders all cart item names", () => {
    render(<CartDrawer {...defaultProps} />);

    expect(screen.getByText("Wireless Headphones")).toBeInTheDocument();
    expect(screen.getByText("Running Shoes")).toBeInTheDocument();
  });

  it("renders the grand total", () => {
    render(<CartDrawer {...defaultProps} />);

    expect(screen.getByText("$219.97")).toBeInTheDocument();
  });

  it("calls onUpdateItem with decremented quantity when – clicked above qty 1", async () => {
    const onUpdateItem = vi.fn();
    render(<CartDrawer {...defaultProps} onUpdateItem={onUpdateItem} />);

    // Wireless Headphones has qty=2 — clicking – should request qty=1
    await userEvent.click(
      screen.getByRole("button", {
        name: /decrease quantity of wireless headphones/i,
      }),
    );

    expect(onUpdateItem).toHaveBeenCalledWith(1, 1);
  });

  it("calls onRemoveItem when – clicked at qty 1", async () => {
    const onRemoveItem = vi.fn();
    render(<CartDrawer {...defaultProps} onRemoveItem={onRemoveItem} />);

    // Running Shoes has qty=1 — clicking – should remove the item
    await userEvent.click(
      screen.getByRole("button", {
        name: /decrease quantity of running shoes/i,
      }),
    );

    expect(onRemoveItem).toHaveBeenCalledWith(2);
  });

  it("calls onUpdateItem with incremented quantity when + clicked", async () => {
    const onUpdateItem = vi.fn();
    render(<CartDrawer {...defaultProps} onUpdateItem={onUpdateItem} />);

    // Wireless Headphones has qty=2 — clicking + should request qty=3
    await userEvent.click(
      screen.getByRole("button", {
        name: /increase quantity of wireless headphones/i,
      }),
    );

    expect(onUpdateItem).toHaveBeenCalledWith(1, 3);
  });

  it("disables the + button when quantity is 5", () => {
    const itemAtMax: CartItem[] = [
      { ...mockCartItems[0], quantity: 5, totalPrice: 399.95 },
    ];
    render(<CartDrawer {...defaultProps} cartItems={itemAtMax} />);

    expect(
      screen.getByRole("button", {
        name: /increase quantity of wireless headphones/i,
      }),
    ).toBeDisabled();
  });

  it("calls onClearCart when Clear Cart is clicked", async () => {
    const onClearCart = vi.fn();
    render(<CartDrawer {...defaultProps} onClearCart={onClearCart} />);

    await userEvent.click(screen.getByRole("button", { name: /clear cart/i }));

    expect(onClearCart).toHaveBeenCalled();
  });

  it("calls onClose when the close button is clicked", async () => {
    const onClose = vi.fn();
    render(<CartDrawer {...defaultProps} onClose={onClose} />);

    await userEvent.click(screen.getByRole("button", { name: /close cart/i }));

    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when the overlay is clicked", async () => {
    const onClose = vi.fn();
    const { container } = render(
      <CartDrawer {...defaultProps} onClose={onClose} />,
    );

    const overlay = container.querySelector(
      ".cart-drawer__overlay",
    ) as HTMLElement;
    await userEvent.click(overlay);

    expect(onClose).toHaveBeenCalled();
  });
});
