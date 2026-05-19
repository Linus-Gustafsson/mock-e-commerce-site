import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "../../src/frontend/src/App";
import type { Product } from "../../src/frontend/src/types";

const mockProducts: Product[] = [
  {
    id: 1,
    name: "Test Headphones",
    description: "Great sound quality.",
    price: 79.99,
    category: "Electronics",
    stock: 10,
    imageUrl: "https://example.com/headphones.jpg",
  },
];

vi.mock("../../src/frontend/src/hooks/useProducts");
vi.mock("../../src/frontend/src/hooks/useCart");

import { useProducts } from "../../src/frontend/src/hooks/useProducts";
import { useCart } from "../../src/frontend/src/hooks/useCart";

const mockedUseProducts = vi.mocked(useProducts);
const mockedUseCart = vi.mocked(useCart);

const defaultCart = {
  cartItems: [],
  cartItemCount: 0,
  cartTotal: 0,
  loading: false,
  error: null,
  addItem: vi.fn().mockResolvedValue(undefined),
  removeItem: vi.fn().mockResolvedValue(undefined),
  updateItem: vi.fn().mockResolvedValue(undefined),
  clearCart: vi.fn().mockResolvedValue(undefined),
};

describe("App", () => {
  beforeEach(() => {
    mockedUseCart.mockReturnValue({ ...defaultCart });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the header with shop name", () => {
    mockedUseProducts.mockReturnValue({
      products: [],
      loading: false,
      error: null,
    });

    render(<App />);

    expect(screen.getByText("Mock Shop")).toBeInTheDocument();
  });

  it("renders the hero banner", () => {
    mockedUseProducts.mockReturnValue({
      products: [],
      loading: false,
      error: null,
    });

    render(<App />);

    expect(screen.getByText(/discover quality products/i)).toBeInTheDocument();
  });

  it("renders the products section heading", () => {
    mockedUseProducts.mockReturnValue({
      products: [],
      loading: false,
      error: null,
    });

    render(<App />);

    expect(
      screen.getByRole("heading", { name: /our products/i }),
    ).toBeInTheDocument();
  });

  it("shows loading state", () => {
    mockedUseProducts.mockReturnValue({
      products: [],
      loading: true,
      error: null,
    });

    render(<App />);

    expect(screen.getByText(/loading products/i)).toBeInTheDocument();
  });

  it("shows error state", () => {
    mockedUseProducts.mockReturnValue({
      products: [],
      loading: false,
      error: "Network error",
    });

    render(<App />);

    expect(screen.getByText(/error: network error/i)).toBeInTheDocument();
  });

  it("renders product list when loaded", () => {
    mockedUseProducts.mockReturnValue({
      products: mockProducts,
      loading: false,
      error: null,
    });

    render(<App />);

    expect(screen.getByText("Test Headphones")).toBeInTheDocument();
  });

  it("shows notification after adding to cart", async () => {
    mockedUseProducts.mockReturnValue({
      products: mockProducts,
      loading: false,
      error: null,
    });

    render(<App />);
    await userEvent.click(
      screen.getByRole("button", { name: /add test headphones to cart/i }),
    );

    expect(await screen.findByRole("status")).toHaveTextContent(
      '"Test Headphones" added to cart!',
    );
  });

  it("shows error notification when add to cart fails", async () => {
    mockedUseProducts.mockReturnValue({
      products: mockProducts,
      loading: false,
      error: null,
    });
    mockedUseCart.mockReturnValue({
      ...defaultCart,
      addItem: vi.fn().mockRejectedValue(new Error("Server error")),
    });

    render(<App />);
    await userEvent.click(
      screen.getByRole("button", { name: /add test headphones to cart/i }),
    );

    expect(await screen.findByRole("status")).toHaveTextContent(
      "Failed to add item to cart.",
    );
  });

  it("shows max quantity notification when backend rejects with 400", async () => {
    mockedUseProducts.mockReturnValue({
      products: mockProducts,
      loading: false,
      error: null,
    });
    mockedUseCart.mockReturnValue({
      ...defaultCart,
      addItem: vi
        .fn()
        .mockRejectedValue(new Error("Failed to add item to cart: 400")),
    });

    render(<App />);
    await userEvent.click(
      screen.getByRole("button", { name: /add test headphones to cart/i }),
    );

    expect(await screen.findByRole("status")).toHaveTextContent(
      "Maximum quantity of 5 reached.",
    );
  });

  it("opens cart drawer when cart button is clicked", async () => {
    mockedUseProducts.mockReturnValue({
      products: [],
      loading: false,
      error: null,
    });

    render(<App />);
    await userEvent.click(
      screen.getByRole("button", { name: /shopping cart with 0 items/i }),
    );

    expect(
      screen.getByRole("complementary", { name: /shopping cart/i }),
    ).toBeInTheDocument();
  });
});
