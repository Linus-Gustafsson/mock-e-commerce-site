# Plan: Cart View & Management Feature

## Overview

Implement the full shopping cart experience end-to-end. Users can open a cart drawer from the existing header cart icon, view items and totals, update quantities, remove items, and clear their cart. A maximum of 5 units per product is enforced at the backend; the frontend respects this limit at the UI level and surfaces a friendly error when the backend rejects a request.

---

## Phase 1 — Backend: Service + Endpoints

### Step 1 — Add `Update` to `ICartService`

`src/backend/MockEcommerce.Api/Services/ICartService.cs`
Add: `CartItem Update(int productId, int quantity);`

### Step 2 — Implement `InMemoryCartService`

`src/backend/MockEcommerce.Api/Services/InMemoryCartService.cs`

- `GetAll` → return `_cart.ToList()` inside lock
- `GetByProductId` → find by `item.ProductId == productId` inside lock
- `Add` → if item exists increment quantity, else append; return item
- `Remove` → find and remove, return bool
- `Clear` → `_cart.Clear()`
- `Update` → find item, set `item.Quantity = quantity`, return item

### Step 3 — Implement `CartEndpoints` handlers + add PUT _(depends on Steps 1–2)_

`src/backend/MockEcommerce.Api/Endpoints/CartEndpoints.cs`

Existing handlers:

- `GetCart` → `TypedResults.Ok(cartService.GetAll())`
- `AddToCart` → lookup product (404 if missing); validate `request.Quantity >= 1`; check existing qty + new qty ≤ 5 (422 ValidationProblem if exceeded); return `Created` for new item or `Ok` for incremented item
- `RemoveFromCart` → `NoContent` or `NotFound`
- `ClearCart` → `NoContent`

New handler:

- `UpdateCartItem(int productId, UpdateCartRequest request, ICartService cartService)` → validate `1 ≤ request.Quantity ≤ 5` (422); return 404 if item not in cart; return `Ok(cartService.Update(productId, request.Quantity))`
- Register: `group.MapPut("/{productId:int}", UpdateCartItem).WithName("UpdateCartItem")...`
- New record: `public record UpdateCartRequest(int Quantity);`

---

## Phase 2 — Frontend: Types & API

### Step 4 — Extend types

`src/frontend/src/types/index.ts`
Add `CartItem` interface (`productId`, `productName`, `unitPrice`, `quantity`, `totalPrice`) and `UpdateCartItemRequest` (`quantity: number`).

### Step 5 — Add cart API functions

`src/frontend/src/api/index.ts`
Add: `fetchCart`, `removeFromCart(productId)`, `clearCart`, `updateCartItem(productId, request)`.

---

## Phase 3 — Frontend: Hook + Components + App _(Steps 4–5 must be complete)_

### Step 6 — Create `useCart` hook

`src/frontend/src/hooks/useCart.ts` _(new)_

- State: `cartItems: CartItem[]`, `loading`, `error`
- Derived: `cartItemCount` (sum of all quantities), `cartTotal` (sum of `totalPrice`)
- Methods: `addItem(product)`, `removeItem(productId)`, `updateItem(productId, qty)`, `clearCart()` — each calls the relevant API function then re-fetches cart state
- Loads on mount via `fetchCart`

### Step 7 — Create `CartDrawer` component

`src/frontend/src/components/CartDrawer/CartDrawer.tsx` _(new)_
`src/frontend/src/components/CartDrawer/index.ts` _(new)_

- Props: `isOpen`, `onClose`, `cartItems`, `cartTotal`, `onRemoveItem`, `onUpdateItem`, `onClearCart`
- Overlay + right-side panel, visible when `isOpen=true`
- Item rows: product name, unit price, `–`/`+` qty controls, line total
  - `–` at qty=1 removes the item; `+` disabled at qty=5
- Empty state: "Your cart is empty."
- Footer: grand total + "Clear Cart" button (only when items present)

### Step 8 — Update `Header`

`src/frontend/src/components/Header/Header.tsx`
Add `onCartOpen: () => void` to `HeaderProps`; wire to `onClick` of the existing cart button.

### Step 9 — Update `App.tsx`

`src/frontend/src/App.tsx`

- Replace manual `cartItemCount` state with `useCart` hook
- Add `cartOpen` boolean state
- Pass `onCartOpen={() => setCartOpen(true)}` to `Header`
- Render `<CartDrawer>` with state and handlers from `useCart`
- On 422 response from `addItem`, show "Maximum quantity of 5 reached." toast

---

## Phase 4 — Tests _(can run in parallel with Phase 3)_

### Step 10 — `CartEndpointTests.cs` _(new)_

`test/backend/MockEcommerce.Api.Tests/Endpoints/CartEndpointTests.cs`
Same `WebApplicationFactory<Program>` pattern as `ProductEndpointTests`. Covers:
GET empty list · POST new (201) · POST increment (200) · POST exceed-5 (422) · POST unknown product (404) · DELETE item (204) · DELETE not-found (404) · DELETE clear (204) · PUT update (200) · PUT qty out of range (422) · PUT item not in cart (404)

### Step 11 — `CartDrawer.test.tsx` _(new)_

`test/frontend/components/CartDrawer/CartDrawer.test.tsx`
Covers: closed state · open with items · empty state · `–`/`+` callbacks · `+` disabled at qty=5 · grand total · clear/close callbacks

### Step 12 — Update `Header.test.tsx`

`test/frontend/components/Header/Header.test.tsx`
Pass `onCartOpen={vi.fn()}` in all renders; add test: cart button click calls `onCartOpen`.

### Step 13 — Update `App.test.tsx`

`test/frontend/App.test.tsx`
Mock `useCart` alongside `useProducts`; add test: cart drawer opens when cart button is clicked.

### Step 14 — `useCart.test.ts` _(new)_

`test/frontend/hooks/useCart.test.ts`
Covers: mount calls `fetchCart` · each mutation calls correct API and refreshes · `cartItemCount` and `cartTotal` derived correctly.

---

## Phase 5 — Documentation

### Step 15 — Create `SPEC.md` at repo root

### Step 16 — Create `PLAN.md` at repo root

---

## Files Modified

| File                                                            | Change                                  |
| --------------------------------------------------------------- | --------------------------------------- |
| `src/backend/MockEcommerce.Api/Services/ICartService.cs`        | Add `Update` method                     |
| `src/backend/MockEcommerce.Api/Services/InMemoryCartService.cs` | Implement all methods                   |
| `src/backend/MockEcommerce.Api/Endpoints/CartEndpoints.cs`      | Implement handlers + add PUT            |
| `src/frontend/src/types/index.ts`                               | Add `CartItem`, `UpdateCartItemRequest` |
| `src/frontend/src/api/index.ts`                                 | Add cart API functions                  |
| `src/frontend/src/components/Header/Header.tsx`                 | Add `onCartOpen` prop                   |
| `src/frontend/src/App.tsx`                                      | Use `useCart`, wire `CartDrawer`        |
| `test/frontend/components/Header/Header.test.tsx`               | Pass `onCartOpen`, add click test       |
| `test/frontend/App.test.tsx`                                    | Mock `useCart`, add drawer test         |

## New Files

- `src/frontend/src/hooks/useCart.ts`
- `src/frontend/src/components/CartDrawer/CartDrawer.tsx`
- `src/frontend/src/components/CartDrawer/index.ts`
- `test/backend/MockEcommerce.Api.Tests/Endpoints/CartEndpointTests.cs`
- `test/frontend/components/CartDrawer/CartDrawer.test.tsx`
- `test/frontend/hooks/useCart.test.ts`
- `SPEC.md`
- `PLAN.md`

---

## Decisions

- `cartItemCount` = total units (sum of all item quantities), not unique product count
- `–` at qty=1 removes the item rather than setting qty=0
- 422 `ValidationProblem` for max-qty violations on both POST and PUT
- Cart is a shared in-memory singleton — consistent with existing `InMemoryCartService` design
- `useCart` re-fetches full cart from server after every mutation (no optimistic updates)

## Verification

1. `dotnet test src/backend/MockEcommerce.slnx` — all backend tests pass including new `CartEndpointTests`
2. `npm test` — all frontend tests pass including new `CartDrawer` and `useCart` tests
3. Manual: add items → open drawer from header icon → adjust qty → remove item → clear cart
4. Manual: add same product 6 times → 6th attempt shows "Maximum quantity of 5 reached." toast
5. Manual: verify cart total and header count update correctly after each operation
