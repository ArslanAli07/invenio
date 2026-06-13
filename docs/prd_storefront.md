# Invenio — Public Storefront & Order Management PRD

**Version**: 1.1 — Final, Locked & Approved  
**Date**: 2026-06-12  
**Status**: Ready for Implementation — Phase 9 can begin

---

## 1. Project Overview

Invenio currently operates as a private inventory management dashboard for internal company staff. This PRD defines the expansion into a **public-facing storefront website** (customer-side) and a **Customer Orders management section** inside the existing dashboard (staff-side).

The two systems are deeply connected: when a customer places an order on the public website, it immediately writes to the stock ledger, updates product stock levels, and notifies the dashboard team — exactly the same way a manual stock movement does today.

### Goals
- Give customers a luxury, premium website experience to browse and order mobile phones
- Give admin/manager/staff a complete order management workflow inside the existing dashboard
- Keep all inventory data as the single source of truth — no duplicate stock tracking
- Give suppliers a read-only portal to track their own purchase orders
- Allow admins to manually correct stock discrepancies with a clean audit trail
- Provide revenue and sales reports for business decision-making

---

## 2. Architecture Overview

| Layer | Details |
|---|---|
| **Domain** | Same domain. `/` and `/store/*` are public. `/dashboard`, `/products`, `/orders` etc. are staff-only |
| **Framework** | Same Laravel + Inertia + React stack. Public pages use a new `PublicLayout.jsx` |
| **Auth** | Public website has zero authentication. Cart stored in browser `localStorage` |
| **Images** | Laravel local storage (`storage/public/products/`) |
| **Frontend libraries (new)** | Swiper.js (image carousels), react-hot-toast (cart/order feedback) |
| **Security** | Google reCAPTCHA v3 (invisible) + Honeypot field on checkout |
| **Currency** | PKR — Pakistani Rupees |

---

## 3. Database Schema Changes

### 3.1 Modified Tables

#### `products` — New Columns
| Column | Type | Purpose |
|---|---|---|
| `price` | DECIMAL(12,2), nullable | Base retail price in PKR |
| `show_on_store` | BOOLEAN, default: false | Toggle: should this product appear on public website? |
| `description` | TEXT, nullable | Full product description (shown on detail page) |
| `short_description` | STRING(500), nullable | One-liner shown on catalogue cards |

#### `stock_ledger` — New Column
| Column | Type | Purpose |
|---|---|---|
| `variant_id` | BIGINT, nullable, FK → `product_variants.id` | Links a ledger entry to a specific variant |

#### `purchase_order_items` — New Column
| Column | Type | Purpose |
|---|---|---|
| `variant_id` | BIGINT, nullable, FK → `product_variants.id` | Specifies which variant was ordered/received |

---

### 3.2 New Tables

#### `product_variants`
| Column | Type | Notes |
|---|---|---|
| `id` | BIGINT PK | |
| `product_id` | BIGINT FK → products.id | Parent product |
| `name` | STRING | e.g. "256GB — Midnight Black" |
| `sku` | STRING, unique | e.g. "IPH-17PM-256-BLK" |
| `price` | DECIMAL(12,2) | Override price for this variant (can differ from base) |
| `sort_order` | INTEGER, default: 0 | Display order |
| `created_at` / `updated_at` | TIMESTAMPS | |

> Stock for variants is tracked in `stock_ledger` using `variant_id`. Multiple locations supported.

---

#### `product_images`
| Column | Type | Notes |
|---|---|---|
| `id` | BIGINT PK | |
| `product_id` | BIGINT FK → products.id | |
| `variant_id` | BIGINT FK → product_variants.id, nullable | If null: general product image. If set: variant-specific image |
| `path` | STRING | Relative path in storage e.g. `products/iphone-17/front.jpg` |
| `is_primary` | BOOLEAN, default: false | Primary image shown as thumbnail |
| `sort_order` | INTEGER, default: 0 | |
| `created_at` / `updated_at` | TIMESTAMPS | |

---

#### `product_specs`
| Column | Type | Notes |
|---|---|---|
| `id` | BIGINT PK | |
| `product_id` | BIGINT FK → products.id | |
| `spec_key` | STRING | e.g. "RAM", "Battery", "Camera" |
| `spec_value` | STRING | e.g. "8GB", "4000mAh", "108MP" |
| `sort_order` | INTEGER, default: 0 | Controls display order in specs table |
| `created_at` / `updated_at` | TIMESTAMPS | |

---

#### `customer_orders`
| Column | Type | Notes |
|---|---|---|
| `id` | BIGINT PK | |
| `order_number` | STRING, unique | Auto-generated e.g. "INV-20260612-0001" |
| `customer_name` | STRING | |
| `customer_phone` | STRING | |
| `customer_city` | STRING | As typed by customer |
| `customer_address` | TEXT | Full delivery address |
| `status` | ENUM | `pending`, `confirmed`, `processing`, `shipped`, `delivered`, `cancelled` |
| `subtotal` | DECIMAL(12,2) | Before shipping |
| `shipping_fee` | DECIMAL(12,2), default: 350.00 | Fixed PKR 350 |
| `total` | DECIMAL(12,2) | subtotal + shipping_fee |
| `fulfilling_location_id` | BIGINT FK → locations.id, nullable | Assigned warehouse/store |
| `notes` | TEXT, nullable | Internal staff notes |
| `cancelled_by` | BIGINT FK → users.id, nullable | Staff who cancelled (if applicable) |
| `cancelled_at` | TIMESTAMP, nullable | |
| `cancellation_reason` | STRING, nullable | |
| `created_at` / `updated_at` | TIMESTAMPS | |

---

#### `customer_order_items`
| Column | Type | Notes |
|---|---|---|
| `id` | BIGINT PK | |
| `customer_order_id` | BIGINT FK → customer_orders.id | |
| `product_id` | BIGINT FK → products.id | |
| `variant_id` | BIGINT FK → product_variants.id, nullable | Which variant was ordered |
| `quantity` | INTEGER | |
| `unit_price` | DECIMAL(12,2) | Price at time of order (snapshot — prices may change later) |
| `created_at` / `updated_at` | TIMESTAMPS | |

---

## 4. Public Website — Pages

### 4.1 Public Layout (`PublicLayout.jsx`)
All public pages share this layout:
- **Navbar**: Logo (Invenio), nav links (Home, Store, About, Contact), Cart icon with item count badge, dark mode toggle
- **Footer**: Company name, links (Store, About, Contact), WhatsApp button, social media placeholder, copyright
- Responsive: desktop nav + mobile hamburger menu
- Dark mode: fully supported, follows system + toggle

---

### 4.2 Home Page `/`

| Section | Details |
|---|---|
| **Hero** | Full-screen, animated headline, subheading, two CTAs ("Browse Phones", "View Deals"). Background: premium dark gradient or subtle animated particles via CSS |
| **Featured Products** | Swiper carousel of products where `show_on_store = true` and marked as featured. Cards show image, name, price, stock badge |
| **Shop by Category** | Grid of category cards pulled from `categories` table (only categories that have at least one `show_on_store` product). Clicking navigates to `/store/{category-slug}` |
| **Why Choose Us** | 4 trust badges: Genuine Products, Cash on Delivery, Fast Shipping, Warranty Support |
| **Brands** | Static logo strip: Samsung, Apple, Xiaomi, Oppo, Vivo, Realme, OnePlus — Swiper auto-scroll |
| **Footer** | Full footer as described in layout |

---

### 4.3 Catalogue Page `/store`

- Grid of all products where `show_on_store = true`
- **Filters sidebar / top bar**:
  - Search input (by product name or model — live filter)
  - Category dropdown (from `categories` table)
  - Sort by: Newest, Price Low–High, Price High–Low
- **Product card**: Primary image, name, short description, price (PKR), stock status badge:
  - `In Stock` (green) → stock > 10
  - `Only X Left` (orange) → stock between 1–10
  - `Out of Stock` (red/grey) → stock = 0 (card greyed, button disabled)
- Clicking card → navigates to product detail page
- **Pagination**: 24 products per page

---

### 4.4 Category Page `/store/{category-slug}`

- Same as catalogue but pre-filtered to the selected category
- Category name shown as page heading
- All same filters available (search within category, sort)

---

### 4.5 Product Detail Page `/store/{category-slug}/{product-slug}`

| Section | Details |
|---|---|
| **Image Gallery** | Swiper gallery (main large image + thumbnail strip). Images tied to selected variant update when variant changes |
| **Product Name & Price** | Name, selected variant price in PKR |
| **Variant Selector** | If product has variants: buttons/pills for each variant (e.g. "128GB Black", "256GB Gold"). Selecting a variant updates price, stock badge, and image |
| **Stock Badge** | Real-time: "In Stock", "Only 3 Left", "Out of Stock" — based on global stock of selected variant |
| **Add to Cart** | Button disabled if out of stock. On click: adds to localStorage cart, react-hot-toast confirms "Added to cart!" |
| **Specs Table** | Clean key-value table from `product_specs`. e.g. RAM: 8GB / Battery: 4000mAh |
| **Description** | Full product description below specs |
| **Related Products** | 4 products from same category (Swiper on mobile) |

---

### 4.6 Cart Page `/cart`

- Cart items stored in `localStorage`
- Table: Product image, name, variant, unit price, quantity (±), subtotal, remove button
- Summary card: Subtotal, Shipping PKR 350, **Total**
- "Proceed to Checkout" button → `/checkout`
- "Continue Shopping" link → `/store`
- Empty cart state with illustration and CTA

---

### 4.7 Checkout Page `/checkout`

**Customer Form Fields:**
| Field | Type | Validation |
|---|---|---|
| Full Name | Text | Required |
| Phone Number | Text | Required, Pakistani format hint |
| City | Text | Required |
| Full Address | Textarea | Required |

**Order Summary (right column / below on mobile):**
- Items list (from cart)
- Subtotal
- Shipping Fee: PKR 350
- **Total**

**Security:**
- `honeypot` hidden input field (if filled → silent reject, fake success shown)
- Google reCAPTCHA v3 (invisible, runs on form submit, score < 0.5 → reject)

**COD Confirmation:**
- Checkbox: "I confirm this is a Cash on Delivery order and I agree to pay PKR [Total] upon delivery"
- "Place Order" button

---

### 4.8 Order Confirmation Page `/order/confirmation/{order-number}`

- Large success icon
- "Thank you, [Customer Name]!"
- Order number prominently displayed: **INV-20260612-0001**
- Summary of what was ordered
- Delivery info: "Our team will contact you on [phone] to confirm delivery details"
- WhatsApp button: "Contact us on WhatsApp" (pre-filled message with order number)
- "Continue Shopping" button

---

### 4.9 About Page `/about`

- Page structure created
- Placeholder text and layout ready
- Content to be filled in later by the business owner

---

### 4.10 Contact Page `/contact`

| Section | Details |
|---|---|
| **Contact Form** | Name, Email, Message, Submit button |
| **WhatsApp Button** | Prominent green button, pre-filled greeting |
| **Phone Number** | Click-to-call link |
| **Google Maps Embed** | Embedded map showing store location(s) |
| **Store Hours** | Placeholder text |

---

## 5. Order Flow — Complete

```
CUSTOMER SIDE
─────────────
1. Customer browses /store or /store/{category}
2. Opens product detail → selects variant
3. Clicks "Add to Cart" → localStorage updated → toast notification
4. Visits /cart → reviews items
5. Clicks "Proceed to Checkout"
6. Fills checkout form (Name, Phone, City, Address)
7. Reads order summary (subtotal + PKR 350 shipping = total)
8. Checks COD confirmation checkbox
9. Submits form (honeypot + reCAPTCHA validate silently)

SYSTEM SIDE (on successful submit)
──────────────────────────────────
10. Location assignment logic runs:
    a. Check if customer's city (typed) contains any location's name or city field
    b. If match found → use that location
    c. If no match → use location with highest available stock for the product
11. For each order item:
    a. Write stock_ledger 'out' entry (product_id + variant_id + location_id + quantity)
    b. Reference: reference_type = CustomerOrderItem, reference_id = item.id
    c. Note: "Customer order #INV-XXXX — [Customer Name]"
12. customer_orders record created (status: 'pending')
13. customer_order_items records created
14. Dashboard notification created: "New order #INV-XXXX — [Customer Name] — PKR [Total]"

CUSTOMER REDIRECT
─────────────────
15. Customer redirected to /order/confirmation/{order-number}

DASHBOARD SIDE
──────────────
16. Admin/Manager/Staff sees notification badge on Orders menu
17. Visits /orders → sees new pending order at top
18. Reviews order details, customer info, items, fulfilling location
19. Confirms order → status: 'confirmed'
20. Updates status as it progresses: processing → shipped → delivered
21. If customer calls to update address/phone → admin edits details from dashboard
22. If customer calls to cancel → admin clicks "Cancel Order"

ON CANCELLATION
───────────────
23. For each order item:
    a. Write stock_ledger 'in' entry (reversing the original deduction)
    b. Reference: same CustomerOrderItem
    c. Note: "Order #INV-XXXX cancelled — stock restored"
24. customer_orders.status = 'cancelled'
25. Record: cancelled_by, cancelled_at, cancellation_reason
26. Dashboard notification: "Order #INV-XXXX cancelled — stock restored"
```

---

## 6. Dashboard Changes — Orders Section

### New Page: `/orders`

**Order List Table:**
| Column | Details |
|---|---|
| Order # | INV-20260612-0001 (clickable) |
| Customer | Name + phone |
| City | As typed |
| Items | Count of items |
| Total | PKR formatted |
| Status | Colour-coded badge |
| Fulfilling Location | Which warehouse |
| Date | |
| Actions | View, Edit, Cancel |

**Filters:**
- Search by order number or customer name/phone
- Filter by status
- Filter by location
- Date range

**Order Detail View:**
- All customer info
- All items (product name, variant, quantity, unit price, line total)
- Order total breakdown (subtotal + shipping + total)
- Status history timeline
- Staff notes section
- Action buttons based on status and role

**Roles & Permissions:**

| Action | Admin | Manager | Staff |
|---|---|---|---|
| View orders list | ✅ | ✅ | ✅ |
| View order detail | ✅ | ✅ | ✅ |
| Update order status | ✅ | ✅ | ✅ |
| Edit customer details | ✅ | ✅ | ❌ |
| Cancel order | ✅ | ✅ | ❌ |
| Add staff notes | ✅ | ✅ | ✅ |

---

### Dashboard Notification System

A lightweight **notification badge** on the sidebar:
- Orders menu item shows count of `pending` orders
- When visiting `/orders`, a highlighted row draws attention to newest orders
- Flash toast appears when admin arrives on Orders page if there are new pending orders since last visit
- Dashboard home page stats card updates to show pending order count

---

### Dashboard Products Page Updates

**Product List:**
- Small thumbnail image next to product name (primary image)
- Price column (PKR)
- `Show on Store` toggle visible inline

**Product Create/Edit Sheet:**
- New fields: Price, Short Description, Description, Show on Store toggle
- New tab or section: **Images** (upload multiple, drag to reorder, set primary, delete)
- New tab or section: **Variants** (add/edit/delete variants with name, SKU, price)
- New tab or section: **Specs** (add/edit/delete key-value spec rows)

---

## 7. New Routes

### Public Routes (no auth)
```
GET  /                          → Home page
GET  /about                     → About page
GET  /contact                   → Contact page
GET  /store                     → Catalogue (all products)
GET  /store/{category}          → Category filtered catalogue
GET  /store/{category}/{product}→ Product detail page
GET  /cart                      → Cart page
GET  /checkout                  → Checkout page
POST /checkout                  → Submit order
GET  /order/confirmation/{num}  → Order confirmation page
```

### Dashboard Routes (auth required)
```
GET  /orders                    → Orders list
GET  /orders/{order}            → Order detail
PATCH /orders/{order}/status    → Update status
PATCH /orders/{order}/details   → Update customer details
POST  /orders/{order}/cancel    → Cancel order (with stock reversal)
```

### Dashboard Product Enhancement Routes
```
POST   /products/{product}/images          → Upload images
DELETE /products/{product}/images/{image} → Delete image
PATCH  /products/{product}/images/{image} → Update (set primary, reorder)

POST   /products/{product}/variants        → Add variant
PUT    /products/{product}/variants/{var}  → Update variant
DELETE /products/{product}/variants/{var}  → Delete variant

POST   /products/{product}/specs           → Add spec
PUT    /products/{product}/specs/{spec}    → Update spec
DELETE /products/{product}/specs/{spec}    → Delete spec
```

---

## 8. Build Phases

### Phase 9 — Database Foundation
- Migrations: all new tables + modified tables
- Updated models (Product, StockLedger, new models)
- Image storage configuration (`storage/public/products`)

### Phase 10 — Dashboard: Product Enhancements
- Add price, show_on_store, description, short_description to create/edit forms
- Image upload system (multiple images, set primary, delete, reorder)
- Thumbnail shown in product list table
- Variants management (add/edit/delete within product sheet or separate section)
- Specs management (key-value pairs within product sheet)
- Update PO items to support variant selection
- **Manual Stock Adjustment**: Simple form (Product, Variant, Location, Type: Add/Remove, Quantity, Reason). Writes to stock_ledger with type `adjustment`. Visible in stock history. Admin + Manager only.
- **Supplier Role (Option A)**: Supplier login shows read-only view of their own POs only. Restricted layout — no dashboard stats, no other pages. Existing role system handles access control.

### Phase 11 — Dashboard: Customer Orders
- New `/orders` page with full table, filters, pagination
- Order detail view
- Status update workflow
- Customer details editing
- Cancel order with stock ledger reversal
- Notification badge on sidebar
- Pending order count on dashboard stats

### Phase 12 — Public Website: Layout & Static Pages
- `PublicLayout.jsx` (navbar, footer, dark mode)
- Home page (all sections: Hero, Featured, Categories, Why Choose Us, Brands, Footer)
- About page (placeholder content, full layout)
- Contact page (form, WhatsApp, Google Maps, phone)

### Phase 13 — Public Website: Catalogue & Product Pages
- Catalogue page `/store` (grid, search, category filter, sort, pagination, stock badges)
- Category page `/store/{category}`
- Product detail page (image gallery with Swiper, variant selector, specs table, description, related products)

### Phase 14 — Public Website: Cart, Checkout & Orders
- Cart page (localStorage-based, quantity management)
- Checkout page (form, order summary, COD confirmation)
- Honeypot + Google reCAPTCHA v3 integration
- Order submission: location assignment logic, stock deduction, order creation
- Order confirmation page
- react-hot-toast notifications throughout

### Phase 15 — Testing, Polish, SEO & Reports
- Feature tests for order flow, stock deduction, cancellation reversal
- Feature tests for manual stock adjustment and supplier portal
- SEO meta tags on all public pages (title, description, OG tags)
- Mobile responsiveness audit
- Dark mode audit (public + dashboard)
- Performance: image optimization, lazy loading
- **Order Revenue Reports** (dashboard): Total revenue by day/month/custom range, top-selling products, orders by status, revenue by location — clean charts
- README final update covering all features
- Final git commit & push

---

## 9. Out of Scope (for Now)

- Online payments (Stripe, JazzCash, EasyPaisa) — COD only
- Customer accounts / login
- Customer self-cancellation from website — must call/WhatsApp the shop
- Order tracking page for customer — contact company directly
- Email or SMS notifications to customer
- Discount codes / promotions
- Product reviews / ratings
- Multi-language support
- Cloud image storage (S3/Cloudinary) — local storage only
- Real-time WebSocket notifications — polling/badge count instead
- Brand management from dashboard — static brand logos hardcoded
- Customer returns / RMA flow
- Docker / containerisation — added when deploying to production

---

## 10. Key Design Principles

1. **Luxury Mobile Brand Feel** — think premium dark backgrounds, clean typography, generous whitespace. Inspired by high-end tech retailers, not generic shops.
2. **Single Source of Truth** — stock_ledger is always the source of stock data. No static counters.
3. **Configurable by Admin** — categories, locations, products, visibility toggles all controlled from dashboard and reflected live on website.
4. **No Breaking Changes** — all existing dashboard features (POs, Transfers, Movements, Users) remain unchanged.
5. **Mobile Responsive** — public website must work perfectly on mobile (most Pakistani customers browse on phones).
6. **Clean Audit Trail** — every stock change (order, adjustment, transfer, PO) is recorded in stock_ledger with a reason, reference, and timestamp. Nothing is deleted, only corrected.
7. **Role-Based Access Everywhere** — public website has zero auth. Dashboard enforces roles strictly: Admin > Manager > Staff > Supplier.

---

## 11. Decisions Log

| Decision | Choice | Date |
|---|---|---|
| Product variants | Option B — one product, selectable variants | 2026-06-12 |
| Payment method | COD only | 2026-06-12 |
| Checkout auth | Guest checkout, no account needed | 2026-06-12 |
| Stock deduction timing | Immediate on order placement | 2026-06-12 |
| Customer cancellation | Via phone/WhatsApp only — admin cancels from dashboard | 2026-06-12 |
| Shipping fee | Fixed PKR 350 | 2026-06-12 |
| Location routing | Match customer city → nearest warehouse → highest stock fallback | 2026-06-12 |
| Spam prevention | Honeypot + Google reCAPTCHA v3 | 2026-06-12 |
| Image storage | Laravel local storage | 2026-06-12 |
| Frontend libraries | Swiper.js + react-hot-toast only | 2026-06-12 |
| Supplier role | Option A — read-only PO portal | 2026-06-12 |
| Manual stock adjustment | Simple form + ledger entry, Admin + Manager only | 2026-06-12 |
| Revenue reports | Phase 15 — charts in dashboard | 2026-06-12 |
| Docker | Not now — add when deploying to production | 2026-06-12 |
| Brand logos | Static hardcoded list | 2026-06-12 |
| URL format | SEO friendly `/store/{category}/{product-slug}` | 2026-06-12 |
