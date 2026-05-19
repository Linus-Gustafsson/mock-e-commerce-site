import { renderHook, waitFor, act } from "@testing-library/react";
import { useCart } from "../../../src/frontend/src/hooks/useCart";
import type { CartItem, Product } from "../../../src/frontend/src/types";

vi.mock("../../../src/frontend/src/api", () => ({
  fetchCart: vi.fn(),
  addToCart: vi.fn(),
  removeFromCart: vi.fn(),
  clearCart: vi.fn(),
  updateCartItem: vi.fn(),
}));

import {
  fetchCart,
  addToCart,
  removeFromCart,
  clearCart,
  updateCartItem,
} from "../../../src/frontend/src/api";

const mockedFetchCart = vi.mocked(fetchCart);
const mockedAddToCart = vi.mocked(addToCart);
const mockedRemoveFromCart = vi.mocked(removeFromCart);
const mockedClearCart = vi.mocked(clearCart);
const mockedUpdateCartItem = vi.mocked(updateCartItem);

const mockProduct: Product = {
  id: 1,
  name: "Wireless Headphones",
  description: "Great sound.",
  price: 79.99,
  category: "Electronics",
  stock: 25,
  imageUrl: "",
};

const mockCartItems: CartItem[] = [
  {
    productId: 1,
    productName: "Wireless Headphones",
    unitPrice: 79.99,
    quantity: 2,
    totalPrice: 159.98,
  },
];

describe("useCart", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches cart on mount", async () => {
    mockedFetchCart.mockResolvedValue([]);

    renderHook(() => useCart());

    await waitFor(() => {
      expect(mockedFetchCart).toHaveBeenCalledTimes(1);
    });
  });

  it("returns loading true initially", () => {
    mockedFetchCart.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useCart());

    expect(result.current.loading).toBe(true);
    expect(result.current.cartItems).toEqual([]);
  });

  it("returns cart items after successful fetch", async () => {
    mockedFetchCart.mockResolvedValue(mockCartItems);

    const { result } = renderHook(() => useCart());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.cartItems).toEqual(mockCartItems);
  });

  it("derives cartItemCount as sum of all quantities", async () => {
    const items: CartItem[] = [
      { ...mockCartItems[0], quantity: 3, totalPrice: 239.97 },
      {
        productId: 2,
        productName: "Running Shoes",
        unitPrice: 59.99,
        quantity: 2,
        totalPrice: 119.98,
      },
    ];
    mockedFetchCart.mockResolvedValue(items);

    const { result } = renderHook(() => useCart());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.cartItemCount).toBe(5);
  });

  it("derives cartTotal as sum of all item totalPrices", async () => {
    mockedFetchCart.mockResolvedValue(mockCartItems);

    const { result } = renderHook(() => useCart());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.cartTotal).toBeCloseTo(159.98);
  });

  it("sets error when fetch fails", async () => {
    mockedFetchCart.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useCart());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Failed to load cart.");
  });

  it("addItem calls addToCart with productId and quantity 1, then refreshes", async () => {
    mockedFetchCart.mockResolvedValue([]);
    mockedAddToCart.mockResolvedValue(mockCartItems[0]);

    const { result } = renderHook(() => useCart());
    await waitFor(() => expect(result.current.loading).toBe(false));

    mockedFetchCart.mockResolvedValue(mockCartItems);
    await act(async () => {
      await result.current.addItem(mockProduct);
    });

    expect(mockedAddToCart).toHaveBeenCalledWith({ productId: 1, quantity: 1 });
    expect(mockedFetchCart).toHaveBeenCalledTimes(2);
    expect(result.current.cartItems).toEqual(mockCartItems);
  });

  it("removeItem calls removeFromCart with productId, then refreshes", async () => {
    mockedFetchCart.mockResolvedValue(mockCartItems);
    mockedRemoveFromCart.mockResolvedValue(undefined);

    const { result } = renderHook(() => useCart());
    await waitFor(() => expect(result.current.loading).toBe(false));

    mockedFetchCart.mockResolvedValue([]);
    await act(async () => {
      await result.current.removeItem(1);
    });

    expect(mockedRemoveFromCart).toHaveBeenCalledWith(1);
    expect(result.current.cartItems).toEqual([]);
  });

  it("updateItem calls updateCartItem with productId and quantity, then refreshes", async () => {
    mockedFetchCart.mockResolvedValue(mockCartItems);
    const updated: CartItem = {
      ...mockCartItems[0],
      quantity: 3,
      totalPrice: 239.97,
    };
    mockedUpdateCartItem.mockResolvedValue(updated);

    const { result } = renderHook(() => useCart());
    await waitFor(() => expect(result.current.loading).toBe(false));

    mockedFetchCart.mockResolvedValue([updated]);
    await act(async () => {
      await result.current.updateItem(1, 3);
    });

    expect(mockedUpdateCartItem).toHaveBeenCalledWith(1, { quantity: 3 });
    expect(result.current.cartItems[0].quantity).toBe(3);
  });

  it("clearCart calls clearCart API, then refreshes", async () => {
    mockedFetchCart.mockResolvedValue(mockCartItems);
    mockedClearCart.mockResolvedValue(undefined);

    const { result } = renderHook(() => useCart());
    await waitFor(() => expect(result.current.loading).toBe(false));

    mockedFetchCart.mockResolvedValue([]);
    await act(async () => {
      await result.current.clearCart();
    });

    expect(mockedClearCart).toHaveBeenCalled();
    expect(result.current.cartItems).toEqual([]);
  });
});
