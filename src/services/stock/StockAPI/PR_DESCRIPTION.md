# Stock API — Server-generated `ProductId` + new `CategoryId`

**Branch:** `feat/stock-server-generated-product-id`

## What

`POST /api/stock/` no longer accepts `productId`. The server generates it. The caller must now send `categoryId`, which is also returned in every stock response.

## Why

- Clients shouldn't pick `ProductId` — it caused collisions and let callers forge IDs.
- The old "does this productId already exist?" check became redundant once the server owns the value (the unique index already covers it).
- `CategoryId` belongs on the stock row so the service can list/filter by category without calling Catalog.

## Changes

| File | Change |
|------|--------|
| `DTOs/CreateStockRequest.cs` | Removed `ProductId`, added required `CategoryId`. |
| `DTOs/StockItemResponse.cs` | Added `CategoryId` to the response. |
| `Models/StockItem.cs` | Added `CategoryId`; `Create(...)` now generates `ProductId` internally and validates `CategoryId`. |
| `Data/StockDbContext.cs` | `CategoryId` required + non-unique index. |
| `Services/StockService.cs` | Reads `CategoryId` from request, drops redundant pre-check, includes `CategoryId` in projections and logs. |
| `Migrations/*` (initial + Designer + Snapshot) | Added `CategoryId uuid NOT NULL` column and index on `stock_items`. |

## API impact

Only `POST /api/stock/` changes. New body:

```json
{
  "categoryId": "…",
  "name": "…",
  "quantity": 20,
  "color": "…", "model": "…", "size": "…",
  "costPrice": 39.90, "salePrice": 89.90
}
```

All other routes are unchanged.
