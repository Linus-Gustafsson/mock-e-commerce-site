# Mock E-Commerce Site - Copilot Instructions

## Purpose

- This repository is a learning/demo full-stack mock e-commerce app.
- Keep changes simple, explicit, and testable.
- Prefer incremental edits over broad refactors.

## Tech Stack

- Frontend: React 19 + TypeScript + Vite (`src/frontend`).
- Frontend testing: Vitest + Testing Library (`test/frontend`).
- Backend: ASP.NET Core Minimal API on .NET 10 (`src/backend/MockEcommerce.Api`).
- Backend testing: xUnit + `WebApplicationFactory` (`test/backend/MockEcommerce.Api.Tests`).
- Workspace/package tooling: npm workspaces at repository root.

## Key File Locations

- Root JS test config: `vitest.config.ts`.
- Root npm scripts: `package.json`.
- Frontend app entry: `src/frontend/src/main.tsx`.
- Frontend app shell: `src/frontend/src/App.tsx`.
- Frontend API client: `src/frontend/src/api/index.ts`.
- Frontend products hook: `src/frontend/src/hooks/useProducts.ts`.
- Frontend component folder: `src/frontend/src/components`.
- Backend startup/DI: `src/backend/MockEcommerce.Api/Program.cs`.
- Product endpoints: `src/backend/MockEcommerce.Api/Endpoints/ProductEndpoints.cs`.
- Cart endpoints: `src/backend/MockEcommerce.Api/Endpoints/CartEndpoints.cs`.
- Product mock data: `src/backend/MockEcommerce.Api/Services/MockProductService.cs`.
- Cart service implementation: `src/backend/MockEcommerce.Api/Services/InMemoryCartService.cs`.
- Backend solution file: `src/backend/MockEcommerce.slnx`.

## Runtime and API Notes

- Frontend dev server runs on Vite default `http://localhost:5173`.
- Vite proxies `/api` to backend `http://localhost:5063` (see `src/frontend/vite.config.ts`).
- Backend CORS in `Program.cs` allows `http://localhost:5173`.

## Implementation State (Current)

- Implemented:
- Product catalog read flow end-to-end.
- `GET /api/products` and `GET /api/products/{id}`.
- Frontend product fetch and rendering (`useProducts`, `ProductList`, `ProductCard`).
- Header cart count UI state in frontend (`App.tsx`).

- Not implemented yet (stubbed with `NotImplementedException`):
- Cart endpoint handlers in `CartEndpoints.cs`:
- `GetCart`, `AddToCart`, `RemoveFromCart`, `ClearCart`.
- In-memory cart service methods in `InMemoryCartService.cs`:
- `GetAll`, `GetByProductId`, `Add`, `Remove`, `Clear`.

- Important consequence:
- Frontend `addToCart()` currently calls `/api/cart` and will fail until cart backend methods are implemented.

## Mock Product Data

- Source of truth: `src/backend/MockEcommerce.Api/Services/MockProductService.cs`.
- In-memory static list with 5 products:
- `Wireless Headphones` (Electronics, 79.99, stock 25)
- `Running Shoes` (Footwear, 59.99, stock 40)
- `Stainless Steel Water Bottle` (Accessories, 24.99, stock 100)
- `Mechanical Keyboard` (Electronics, 109.99, stock 15)
- `Yoga Mat` (Sports, 34.99, stock 60)
- Product model fields: `id`, `name`, `description`, `price`, `category`, `stock`, `imageUrl`.

## Test Commands

- Install JS dependencies from repo root:
- `npm install`

- Run frontend tests from repo root (configured in root `vitest.config.ts`):
- `npm test`
- or
- `npm run test:frontend`

- Run backend tests from repo root:
- `dotnet test src/backend/MockEcommerce.slnx`

## Implementation Guidance for Future Changes

- Keep API contracts aligned between backend DTO/model casing and frontend types in `src/frontend/src/types`.
- When implementing cart, preserve current API base path usage in frontend (`/api/...`) so Vite proxy keeps working.
- Add/extend tests in both `test/backend` and `test/frontend` for behavior changes.
- Avoid introducing persistent storage unless explicitly requested; current architecture is intentionally in-memory.
