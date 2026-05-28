# Currency display audit (pre-fix)

## Bugs found (literal `$` from JSX `${expression}`)

| File | Line | Issue |
|------|------|--------|
| `src/pages/student/OrderHistory.jsx` | 193 | `${Number(order.total_amount).toFixed(2)}` shows `$` + amount |
| `src/pages/cafeteria/Orders.jsx` | 296 | Same pattern |
| `src/pages/student/CartCheckout.jsx` | 247 | `Rs. ${cartTotal.toFixed(2)}` shows `Rs. $` + amount |
| `src/pages/student/MenuBrowsing.jsx` | 205, 257, 304, 353 | `Rs. ${...}` mixed `$` prefix |
| `src/pages/cafeteria/Deals.jsx` | 185, 243, 279 | `Rs. ${...}` |
| `src/pages/cafeteria/Menu.jsx` | 395 | `Rs. ${Number(item.price)...}` |
| `src/pages/cafeteria/Dashboard.jsx` | 344 | `Rs. ${cartTotal...}` |

## Inconsistent `Rs.` / manual formatting (fixed via `formatPrice`)

- `src/pages/student/OrderTracking.jsx`
- `src/pages/admin/Orders.jsx`
- `src/pages/admin/Dashboard.jsx`
- `src/pages/cafeteria/History.jsx`
- `src/pages/cafeteria/Dashboard.jsx` (StatCard values)
- `src/components/BrowseMenuSection.jsx` (local formatter removed)

## Form labels / placeholders

| File | Line | Before |
|------|------|--------|
| `src/pages/cafeteria/Menu.jsx` | 454 | `Price (USD) *` |

## Backend

No currency formatting in API responses (numeric values only).

## Not currency (ignored)

- Template literals: `` `${BASE}/api/...` ``, `` `${token}` ``, CSS `` `${progress}%` ``
- `toLocaleDateString('en-US')` for dates only
- `package-lock.json` integrity hashes
