# Spec: Cart View & Management

## User Stories

1. **View cart** — As a user, I can click the cart icon in the header to open a cart drawer showing all items I have added.
2. **See totals** — As a user, I can see a per-item total (unit price × quantity) and a grand total for my entire cart.
3. **Update quantity** — As a user, I can increase or decrease the quantity of any item in my cart using `+` / `–` controls.
4. **Remove item** — As a user, I can remove a single item from my cart by pressing `–` when its quantity is 1.
5. **Clear cart** — As a user, I can remove all items at once using a "Clear Cart" button.
6. **Max quantity** — As a user, I cannot add more than 5 units of any single product. The `+` button is disabled at qty=5 and the backend rejects any attempt that would exceed 5.
7. **Cart count** — As a user, I can see the total number of units in my cart on the header cart icon at all times.

---

## API Contract

### Existing endpoints (to be implemented)

| Method   | Path                    | Request body              | Success                                               | Error                                                                              |
| -------- | ----------------------- | ------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `GET`    | `/api/cart`             | —                         | `200 OK` `CartItem[]`                                 | —                                                                                  |
| `POST`   | `/api/cart`             | `{ productId, quantity }` | `201 Created` (new) / `200 OK` (increment) `CartItem` | `404` product not found · `422` qty is negative or zero · `422` qty would exceed 5 |
| `DELETE` | `/api/cart/{productId}` | —                         | `204 No Content`                                      | `404` not in cart                                                                  |
| `DELETE` | `/api/cart`             | —                         | `204 No Content`                                      | —                                                                                  |

### New endpoint

| Method | Path                    | Request body   | Success             | Error                                             |
| ------ | ----------------------- | -------------- | ------------------- | ------------------------------------------------- |
| `PUT`  | `/api/cart/{productId}` | `{ quantity }` | `200 OK` `CartItem` | `404` not in cart · `422` qty out of range [1, 5] |

### `CartItem` response shape

```json
{
  "productId": 1,
  "productName": "Wireless Headphones",
  "unitPrice": 79.99,
  "quantity": 2,
  "totalPrice": 159.98
}
```

---

## Validation Rules

| Rule                                                 | Enforced at         |
| ---------------------------------------------------- | ------------------- |
| `quantity` on POST must be ≥ 1                       | Backend (422)       |
| `quantity` on POST must not be negative or zero      | Backend (422)       |
| Cumulative quantity per product must not exceed 5    | Backend (422)       |
| `quantity` on PUT must be in range [1, 5]            | Backend (422)       |
| `+` button disabled when item qty = 5                | Frontend            |
| "Add to cart" button disabled when product stock = 0 | Frontend (existing) |

---

## UI Behaviour

### Header cart icon

- Displays a numeric badge showing the total number of units across all cart items.
- Clicking the icon opens the `CartDrawer`.

### Cart Drawer

- Slides in from the right as an overlay panel.
- Closed by clicking the `×` close button or clicking outside the panel.
- **Empty state**: shows "Your cart is empty."
- **Item row**: product name · unit price · `–` button · quantity · `+` button · line total
- **`–` behaviour**: decrements quantity; at qty=1, removes the item entirely.
- **`+` behaviour**: increments quantity; disabled when qty=5.
- **Footer** (visible when cart has items): grand total · "Clear Cart" button.

### Toast notifications (existing pattern in `App.tsx`)

- Success: `"<Product name>" added to cart!`
- Max qty exceeded: `"Maximum quantity of 5 reached."`
- Generic failure: `"Failed to add item to cart."`

---

## Out of Scope

- User authentication / per-user carts
- Persistent storage (cart is in-memory and resets on server restart)
- Checkout / payment flow
- Stock decrement on cart add
- Coupon / discount codes
