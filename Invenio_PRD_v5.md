# Invenio — Product Requirements Document

> **Version:** 5.0 · **Status:** Approved for Development · **Date:** May 2025
> **Database:** MySQL 8.0+ · **Environment:** Local / Dev · **UI:** Tailwind CSS + shadcn/ui
> **Testing:** PHPUnit · **Auth:** Session-based (Laravel Breeze) · **Language:** English only
> **Stretch Features:** Export Stock CSV · Activity Log Screen · Webhook on Low Stock

> 🚫 **SCOPE NOTE:** The REST API (`/api/v1`) is intentionally excluded from this version.
> The entire system is built as a web app via Inertia.js. The API will be added in a
> future phase once the core product is complete and stable.

---

## Table of Contents

1. [Purpose & Scope](#1-purpose--scope)
2. [Technology Stack](#2-technology-stack)
3. [UI / UX Design System](#3-ui--ux-design-system)
4. [Development Phases](#4-development-phases)
5. [Database Schema & Queries](#5-database-schema--queries)
6. [Business Rules](#6-business-rules)
7. [Emails & Queue System](#7-emails--queue-system)
8. [Webhook System](#8-webhook-system)
9. [Screen-by-Screen Specification](#9-screen-by-screen-specification)
10. [Stretch Features](#10-stretch-features)
11. [Database Seeders](#11-database-seeders)
12. [Testing Requirements](#12-testing-requirements)
13. [Documentation Requirements](#13-documentation-requirements)
14. [Non-Functional Requirements](#14-non-functional-requirements)
15. [Final Deliverables Checklist](#15-final-deliverables-checklist)

---

## 1. Purpose & Scope

**Invenio** is an internal web application that gives companies a single source of truth for product inventory across multiple warehouses or store locations. It replaces manual spreadsheets, prevents phantom stock, and creates a fully auditable ledger of every stock movement.

This PRD defines the complete requirements — functional, technical, data, UI/UX, and non-functional — for the core web application. The goal is a production-quality codebase that a new developer can clone, run, and extend without hand-holding.

> 📌 **NORTH STAR:** Every stock number shown in the UI must be derived from the `stock_ledger` table — never stored as a raw editable integer. Stock is a computed value, not a column.

### What This Version Does

- Track products and stock levels across multiple warehouses or store locations
- Record every stock change as an immutable ledger entry (`in` / `out` / `adjust`)
- Manage supplier relationships and purchase orders end-to-end
- Send automated emails for purchase orders and low-stock alerts
- Fire outbound HTTP webhooks when stock drops below reorder level (stretch)
- Provide a full audit trail via an activity log screen (stretch)
- Export stock reports to CSV (stretch)

### What This Version Does NOT Do

- Expose a REST API — that is a future phase added after the web app is complete
- Handle financial accounting or invoicing
- Manage customer orders or sales
- Support multi-tenancy (single company deployment)

### Future Phase (Do Not Build Now)

The REST API (`/api/v1`) with Sanctum token authentication will be added after this version ships. Building it now adds complexity, doubles the test surface, and slows down delivery of the core product. The database schema and business logic in this PRD are designed to make the API addition straightforward later — no rewrites needed.

---

## 2. Technology Stack

| Layer | Technology | Notes |
|---|---|---|
| Backend | Laravel 13 / PHP 8.3+ | Eloquent ORM, Policies, Events, Jobs |
| Frontend | Inertia.js + React 19 | Full-stack web app — no separate SPA |
| UI Components | Tailwind CSS + shadcn/ui | shadcn primitives extended with Tailwind utilities |
| Auth | Laravel Breeze | Session-based only — no API tokens in this version |
| Database | MySQL 8.0+ | Migrations, indexes, ledger aggregation queries |
| Queue | Database driver | Upgradable to Redis; handles all email + webhook dispatch |
| Mail | Mailpit (dev) | SMTP configurable via `.env` for production |
| Webhooks | Outbound HTTP POST | Dispatched via queued jobs with retry logic |
| Code Quality | Laravel Pint + Larastan | ESLint + Prettier on frontend |
| Testing | PHPUnit (Laravel default) | Feature + Unit; Vitest for frontend components |

> ⚠️ **CONSTRAINT:** The entire web layer runs through Inertia.js with React. There are no separate API routes, no Bearer tokens, and no JSON-only controllers in this version. Every controller renders an Inertia page or redirects. All form submissions go through standard Inertia form helpers.

---

## 3. UI / UX Design System

The application must feel premium and purposeful — not a generic admin panel. Every screen must follow these design tokens and component rules exactly. Treat them as hard requirements, not suggestions.

### 3.1 Color Palette

| Token | Hex | Usage |
|---|---|---|
| Primary Blue | `#1B4FD8` | Buttons, active nav, headings, links |
| Sky Accent | `#0EA5E9` | Badges, highlights, secondary actions |
| Surface | `#F8FAFC` | Page background |
| Card | `#FFFFFF` | Card / panel background with shadow |
| Border | `#E2E8F0` | Input borders, dividers, table lines |
| Text Primary | `#0F172A` | All main body text |
| Text Muted | `#64748B` | Labels, placeholders, timestamps |
| Success | `#16A34A` | Stock-in, received PO, success toasts |
| Warning | `#D97706` | Low stock badge, draft / pending state |
| Danger | `#DC2626` | Stock-out, negative stock guard, errors |

### 3.2 Typography

- **Font:** Inter (Google Fonts CDN) — weights 400, 500, 600, 700
- **Base size:** 14px · line-height 1.6
- **Headings:** 600 weight · H1: 24px · H2: 20px · H3: 16px
- **Monospace** (SKU, PO numbers, webhook URLs): `font-mono` Tailwind class

### 3.3 Component Standards

Use **shadcn/ui** as the base component library. All rules below apply on top of shadcn defaults.

**Cards**
```
className="rounded-2xl border border-slate-100 bg-white shadow-sm p-6"
```
Never render content flat on the page background. Always wrap sections in a card.

**Tables**
- Sticky `<thead>` with `bg-slate-50 text-xs uppercase tracking-wider text-slate-500`
- Row hover: `hover:bg-slate-50/70 transition-colors`
- Status values: always a colored pill badge — never plain text
- Empty state inside the table wrapper: centered SVG icon (outline) + headline + CTA button

**Status Badge Color Map**

```
draft                → bg-slate-100   text-slate-600
sent                 → bg-blue-100    text-blue-700
partially_received   → bg-amber-100   text-amber-700
received             → bg-green-100   text-green-700
cancelled            → bg-red-100     text-red-600
low stock            → bg-red-50      text-red-600   + pulsing dot animation
in stock             → bg-green-50    text-green-700
stock in (type)      → bg-green-100   text-green-700
stock out (type)     → bg-red-100     text-red-600
stock adjust (type)  → bg-amber-100   text-amber-700
webhook pending      → bg-violet-100  text-violet-700
webhook delivered    → bg-green-100   text-green-700
webhook failed       → bg-red-100     text-red-600
```

**Forms**
- Label-above-input pattern (never floating labels — they break with browser autofill)
- Inline validation errors below each field on blur and on submit
- Error text: `"SKU is required"` — never generic `"This field is required"`
- Submit button: shows spinner + disabled while request is in flight
- Use shadcn `<Form>`, `<Input>`, `<Select>`, `<Textarea>`, `<Button>` primitives throughout

**Buttons**
```jsx
Primary     → <Button variant="default">       // solid Primary Blue
Secondary   → <Button variant="outline">       // outlined
Destructive → <Button variant="destructive">   // solid Danger red
Ghost       → <Button variant="ghost">         // icon-only or subtle actions
```

**Slide-over Panels**
Use for all create/edit forms instead of navigating to a new page. Slides in from the right, overlays the current page, closes on save or cancel. Use shadcn `<Sheet>` component.

**Navigation**
- Left sidebar: 240px on desktop, collapses to icon-only (64px) on tablet
- Active nav item: 4px solid Primary Blue left border + `bg-blue-50 text-blue-700`
- Top header: fixed 64px · logo left · breadcrumb center · user avatar + logout right
- Mobile: bottom tab bar with 4 primary nav items

**Toasts**
- All CRUD feedback via top-right slide-in toasts
- Success: green left border + ✓ · auto-dismiss 4s
- Error: red left border + ✕ · stays until dismissed

**Loading States**
- Tables: 3–5 animated skeleton rows while fetching
- Buttons: inline spinner replaces label while submitting
- Page transitions: Inertia progress bar in Primary Blue

**Empty States**
Every list page must have a designed empty state. Never show a blank table. Minimum: centered SVG icon (outline) + headline + description + CTA button.

### 3.4 Page Layout Template

```
┌──────────────────────────────────────────────────────┐
│  HEADER (fixed, 64px)   Logo │ Breadcrumb │ User     │
├───────────┬──────────────────────────────────────────┤
│           │                                          │
│  SIDEBAR  │  MAIN CONTENT                            │
│  (240px)  │  max-w-7xl mx-auto px-6 py-8             │
│           │                                          │
│  Nav      │  Page Title + Description   [Action Btn] │
│  Items    │  ──────────────────────────────────────  │
│           │  Content (cards / tables / forms)        │
│           │                                          │
└───────────┴──────────────────────────────────────────┘
```

### 3.5 Responsive Breakpoints

| Breakpoint | Sidebar | Tables | Layout |
|---|---|---|---|
| Mobile `< 768px` | Hidden (bottom tab bar) | Horizontal scroll | Full width |
| Tablet `768–1024px` | Icon-only (64px) | Horizontal scroll | Full width |
| Desktop `> 1024px` | Full (240px) | Full display | `max-w-7xl` centered |

---

## 4. Development Phases

Work ships via GitHub Pull Requests. Each phase must meet its exit criteria before the next begins. Tag each merged PR with its milestone number.

| # | Phase | Key Deliverables | Exit Criteria |
|---|---|---|---|
| 1 | **Foundation & Auth** | Laravel + Inertia + React scaffold, MySQL migrations, Login / Forgot Password / Reset Password, role middleware | All migrations run; login/logout works; Larastan + Pint pass |
| 2 | **Core CRUD** | Products, Categories, Locations, Suppliers — web screens with search, filter, pagination, slide-over forms | Full CRUD with Policies enforced; form validation shows inline errors; soft-disable works |
| 3 | **Stock Ledger** | Stock-in / out / adjust movements, ledger aggregation, current stock display, negative-stock guard | PHPUnit ledger totals test passes; all business rules enforced server-side |
| 4 | **Purchase Orders** | PO create / edit / send / receive (partial), PO email queued, stock-in auto-created on receive | PO lifecycle PHPUnit test passes; partial receive updates `qty_received` + ledger correctly |
| 5 | **Emails & Queues** | Low-stock alert job, weekly digest scheduler, all mails queued, Mailpit confirmed | Queue worker processes all jobs; every email visible in Mailpit with correct HTML content |
| 6 | **Dashboard & UX Polish** | Stat cards, dashboard tables, empty states, skeleton loaders, responsive layout | Non-technical user completes the full flow without confusion on any screen size |
| 7 | **Stretch Features** | Activity log screen, Export stock CSV, Webhook on low stock | Log shows before/after diff; CSV streams and downloads correctly; webhook fires, deduplicates, retries |
| 8 | **Testing & Docs** | Full PHPUnit suite, architecture notes, README, demo video | New developer runs system from README alone with zero hand-holding |

> 🚀 **VELOCITY TIP:** Complete Phases 1–3 before writing a single React component beyond the auth screens. A solid, tested data layer eliminates expensive rewrites.

---

## 5. Database Schema & Queries

All migrations must be idempotent and reversible (`up` and `down`). Use foreign key constraints on every relationship. Never store computed stock as a column.

### 5.1 `users`

```sql
CREATE TABLE users (
  id                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name              VARCHAR(255) NOT NULL,
  email             VARCHAR(255) NOT NULL UNIQUE,
  password          VARCHAR(255) NOT NULL,           -- bcrypt hash; never plain text
  role              ENUM('admin','manager','staff','supplier_user') NOT NULL,
  status            ENUM('active','inactive') NOT NULL DEFAULT 'active',
  email_verified_at TIMESTAMP NULL,
  remember_token    VARCHAR(100) NULL,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 5.2 `categories`

```sql
CREATE TABLE categories (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  is_active  TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 5.3 `products`

```sql
CREATE TABLE products (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  sku           VARCHAR(100) NOT NULL UNIQUE,
  name          VARCHAR(255) NOT NULL,
  description   TEXT NULL,
  unit          VARCHAR(50) NOT NULL,                -- pcs, kg, litre, box, ream…
  category_id   BIGINT UNSIGNED NOT NULL,
  reorder_level INT UNSIGNED NOT NULL DEFAULT 0,     -- global per-product threshold
  is_active     TINYINT(1) NOT NULL DEFAULT 1,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_products_category
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_name     ON products(name);
```

### 5.4 `locations`

```sql
CREATE TABLE locations (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code       VARCHAR(50) NOT NULL UNIQUE,            -- e.g. WH-01, STORE-03
  name       VARCHAR(255) NOT NULL,
  address    TEXT NULL,
  is_active  TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 5.5 `suppliers`

```sql
CREATE TABLE suppliers (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(255) NOT NULL,
  email      VARCHAR(255) NULL,                      -- used for PO email dispatch
  phone      VARCHAR(50) NULL,
  address    TEXT NULL,
  notes      TEXT NULL,
  is_active  TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 5.6 `stock_ledger` ⭐ Core Table

```sql
CREATE TABLE stock_ledger (
  id             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id     BIGINT UNSIGNED NOT NULL,
  location_id    BIGINT UNSIGNED NOT NULL,
  type           ENUM('in','out','adjust') NOT NULL,
  quantity       DECIMAL(12,3) NOT NULL,             -- always positive; direction = type
  reference_type VARCHAR(100) NULL,                  -- e.g. App\Models\PurchaseOrder
  reference_id   BIGINT UNSIGNED NULL,
  note           TEXT NULL,                          -- REQUIRED when type = 'adjust'
  created_by     BIGINT UNSIGNED NOT NULL,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_ledger_product  FOREIGN KEY (product_id)  REFERENCES products(id)  ON DELETE RESTRICT,
  CONSTRAINT fk_ledger_location FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE RESTRICT,
  CONSTRAINT fk_ledger_user     FOREIGN KEY (created_by)  REFERENCES users(id)     ON DELETE RESTRICT
);

-- Do not skip — critical for query performance
CREATE INDEX idx_ledger_product_location ON stock_ledger(product_id, location_id);
CREATE INDEX idx_ledger_created_at       ON stock_ledger(created_at);
CREATE INDEX idx_ledger_reference        ON stock_ledger(reference_type, reference_id);
CREATE INDEX idx_ledger_type             ON stock_ledger(type);
```

> `quantity` is always stored positive. The `type` column determines direction. Never store negative quantities.

### 5.7 `purchase_orders`

```sql
CREATE TABLE purchase_orders (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  po_number   VARCHAR(50) NOT NULL UNIQUE,           -- PO-YYYYMM-XXXX, server-generated
  supplier_id BIGINT UNSIGNED NOT NULL,
  location_id BIGINT UNSIGNED NOT NULL,              -- destination warehouse
  status      ENUM('draft','sent','partially_received','received','cancelled')
              NOT NULL DEFAULT 'draft',
  expected_at DATE NULL,
  notes       TEXT NULL,
  created_by  BIGINT UNSIGNED NOT NULL,
  sent_at     TIMESTAMP NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_po_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE RESTRICT,
  CONSTRAINT fk_po_location FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE RESTRICT,
  CONSTRAINT fk_po_user     FOREIGN KEY (created_by)  REFERENCES users(id)     ON DELETE RESTRICT
);

CREATE INDEX idx_po_status     ON purchase_orders(status);
CREATE INDEX idx_po_supplier   ON purchase_orders(supplier_id);
CREATE INDEX idx_po_created_by ON purchase_orders(created_by);
```

### 5.8 `purchase_order_items`

```sql
CREATE TABLE purchase_order_items (
  id                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  purchase_order_id BIGINT UNSIGNED NOT NULL,
  product_id        BIGINT UNSIGNED NOT NULL,
  qty_ordered       DECIMAL(12,3) NOT NULL,
  unit_cost         DECIMAL(12,4) NOT NULL,
  qty_received      DECIMAL(12,3) NOT NULL DEFAULT 0,

  CONSTRAINT fk_poi_po
    FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_poi_product
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);
```

### 5.9 `webhook_endpoints` (Stretch)

```sql
CREATE TABLE webhook_endpoints (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  event      VARCHAR(100) NOT NULL DEFAULT 'stock.low',
  url        VARCHAR(2048) NOT NULL,
  secret     VARCHAR(255) NULL,                      -- HMAC-SHA256 signing secret
  is_active  TINYINT(1) NOT NULL DEFAULT 1,
  created_by BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_webhook_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
);
```

### 5.10 `webhook_deliveries` (Stretch)

```sql
CREATE TABLE webhook_deliveries (
  id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  webhook_endpoint_id BIGINT UNSIGNED NOT NULL,
  event               VARCHAR(100) NOT NULL,
  payload             JSON NOT NULL,
  status              ENUM('pending','delivered','failed') NOT NULL DEFAULT 'pending',
  response_code       SMALLINT UNSIGNED NULL,
  response_body       TEXT NULL,
  attempt_count       TINYINT UNSIGNED NOT NULL DEFAULT 0,
  last_attempted_at   TIMESTAMP NULL,
  delivered_at        TIMESTAMP NULL,
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_delivery_endpoint
    FOREIGN KEY (webhook_endpoint_id) REFERENCES webhook_endpoints(id) ON DELETE CASCADE
);

CREATE INDEX idx_delivery_status   ON webhook_deliveries(status);
CREATE INDEX idx_delivery_endpoint ON webhook_deliveries(webhook_endpoint_id);
CREATE INDEX idx_delivery_created  ON webhook_deliveries(created_at);
```

### 5.11 `activity_log` (Stretch)

```sql
CREATE TABLE activity_log (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     BIGINT UNSIGNED NOT NULL,
  action      VARCHAR(100) NOT NULL,                 -- e.g. stock.adjust, po.sent
  model_type  VARCHAR(100) NULL,                     -- e.g. App\Models\Product
  model_id    BIGINT UNSIGNED NULL,
  payload     JSON NULL,                             -- { before: {...}, after: {...} }
  ip_address  VARCHAR(45) NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_log_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX idx_log_user       ON activity_log(user_id);
CREATE INDEX idx_log_created_at ON activity_log(created_at);
CREATE INDEX idx_log_model      ON activity_log(model_type, model_id);
CREATE INDEX idx_log_action     ON activity_log(action);
```

### 5.12 Critical Queries

**Current stock per product per location — the only correct way to read stock:**

```sql
SELECT
  product_id,
  location_id,
  SUM(
    CASE type
      WHEN 'in'     THEN  quantity
      WHEN 'out'    THEN -quantity
      WHEN 'adjust' THEN  quantity
    END
  ) AS current_stock
FROM stock_ledger
GROUP BY product_id, location_id;
```

Cache and invalidate on every write:

```php
// Read
$stock = Cache::remember(
    "stock.{$productId}.{$locationId}",
    now()->addSeconds(60),
    fn () => StockLedger::computeStock($productId, $locationId)
);

// Bust — call immediately after every new ledger entry for this pair
Cache::forget("stock.{$productId}.{$locationId}");
```

**All products below reorder level (drives alert emails + webhook dispatch):**

```sql
SELECT
  p.id, p.sku, p.name, p.reorder_level,
  l.id   AS location_id,
  l.code AS location_code,
  l.name AS location_name,
  COALESCE(SUM(
    CASE sl.type
      WHEN 'in'     THEN  sl.quantity
      WHEN 'out'    THEN -sl.quantity
      WHEN 'adjust' THEN  sl.quantity
    END
  ), 0) AS current_stock
FROM products p
CROSS JOIN locations l
LEFT JOIN stock_ledger sl
       ON sl.product_id  = p.id
      AND sl.location_id = l.id
WHERE p.is_active = 1
  AND l.is_active = 1
GROUP BY p.id, l.id
HAVING current_stock < p.reorder_level;
```

**PO detail with items and outstanding quantities:**

```sql
SELECT
  po.*,
  s.name    AS supplier_name,
  s.email   AS supplier_email,
  l.name    AS location_name,
  poi.id    AS item_id,
  poi.product_id,
  p.name    AS product_name,
  p.sku,
  poi.qty_ordered,
  poi.qty_received,
  (poi.qty_ordered - poi.qty_received) AS qty_outstanding,
  poi.unit_cost,
  (poi.qty_ordered * poi.unit_cost)    AS line_total
FROM purchase_orders po
JOIN suppliers            s   ON s.id  = po.supplier_id
JOIN locations            l   ON l.id  = po.location_id
JOIN purchase_order_items poi ON poi.purchase_order_id = po.id
JOIN products             p   ON p.id  = poi.product_id
WHERE po.id = :id;
```

---

## 6. Business Rules

### 6.1 Stock Rules

1. Stock is **never edited as a raw number**. All changes create a `stock_ledger` row — no exceptions.
2. A `type=out` movement that would make stock negative is **blocked** — unless the user is `admin` AND provides a non-empty `note` explaining the override.
3. A `type=adjust` movement **requires a non-empty `note`**. Enforce in the `FormRequest` class AND the service layer. Never rely on the frontend.
4. Receiving a PO item creates a `type=in` ledger entry with `reference_type = 'App\Models\PurchaseOrder'` and `reference_id = po.id`, then increments `qty_received` on the matching `purchase_order_items` row.
5. After any receive action: if all items have `qty_received >= qty_ordered`, PO status → `received`. Otherwise → `partially_received`.
6. When any stock movement causes stock to fall below a product's `reorder_level`, **two jobs are dispatched to the queue:**
   - `LowStockAlertJob` — sends email to all `manager` and `admin` users
   - `LowStockWebhookJob` — fires HTTP POST to all active webhook endpoints (with 24-hour cooldown — see Section 8)

### 6.2 Purchase Order Rules

1. **PO number format:** `PO-YYYYMM-{4-digit-zero-padded}` e.g. `PO-202505-0001`. Generated server-side on creation. Never editable.
2. A `draft` PO can be freely edited (header and line items). Any other status makes it immutable.
3. **Send action:** dispatches queued `PurchaseOrderSentMail` to the supplier's email field. Sets `sent_at`. Manager or Admin role required.
4. **Partial receiving:** each incoming `qty` must be > 0 and ≤ `(qty_ordered - qty_received)`. Enforced server-side in the controller/service.
5. **Cancelling a PO does not reverse** previously received stock. Ledger entries are permanent — that is the point of a ledger.

### 6.3 Authorization Matrix

| Action | Admin | Manager | Staff | SupplierUser |
|---|:---:|:---:|:---:|:---:|
| Manage users | ✅ | ❌ | ❌ | ❌ |
| CRUD Products / Categories / Locations | ✅ | ✅ | ❌ | ❌ |
| View products and stock levels | ✅ | ✅ | ✅ | ✅ |
| Create stock movement (in / out / adjust) | ✅ | ✅ | ✅ | ❌ |
| Force negative stock override | ✅ | ❌ | ❌ | ❌ |
| Create / edit draft PO | ✅ | ✅ | ✅ | ❌ |
| Send PO to supplier | ✅ | ✅ | ❌ | ❌ |
| Receive PO items | ✅ | ✅ | ✅ | ❌ |
| Cancel PO | ✅ | ✅ | ❌ | ❌ |
| Manage webhook endpoints | ✅ | ❌ | ❌ | ❌ |
| View webhook delivery log | ✅ | ✅ | ❌ | ❌ |
| View activity log | ✅ | ✅ | ❌ | ❌ |
| Export stock CSV | ✅ | ✅ | ❌ | ❌ |

> All authorization is enforced **server-side via Laravel Policies**. Frontend button visibility is UX only — never a security control.

---

## 7. Emails & Queue System

All emails **must be dispatched as queued jobs** — never sent synchronously in a request cycle. Implement `ShouldQueue` on every Mailable class.

| Email | Trigger | Recipient | Content |
|---|---|---|---|
| Password Reset | User requests reset link | The user | Default Laravel Breeze template |
| PO Sent | PO status → `sent` | Supplier's `email` field | HTML: PO number, items table, expected date, grand total, company name |
| Low Stock Alert | Stock drops below `reorder_level` | All `manager` + `admin` users | Product + SKU, location, current qty (red), reorder level, link to product page |
| Weekly Digest | Every Monday 08:00 | All `manager` + `admin` users | Low-stock summary table + pending PO count |

**PO Sent Email must include:**
- Company name / logo header
- PO number · creation date · expected delivery date
- Supplier name and address block
- Line items table: SKU · Product Name · Qty Ordered · Unit Cost · Line Total
- Grand total row (bold)
- Footer: "Please confirm receipt of this purchase order"

**Queue config:**
```env
QUEUE_CONNECTION=database
```

```bash
# Run in a separate terminal during development
php artisan queue:work --tries=3 --timeout=60
```

**Weekly digest** — add to `routes/console.php`:
```php
Schedule::job(new WeeklyDigestJob)->weeklyOn(1, '08:00');
```

**Failed jobs:** Run `php artisan queue:failed-table` migration so failed jobs are stored and inspectable.

---

## 8. Webhook System (Stretch)

### 8.1 Overview

When any stock movement causes stock to fall below a product's `reorder_level`, Invenio fires an HTTP POST to all active `webhook_endpoints` records, allowing external systems (Slack, procurement tools, dashboards) to react without polling.

### 8.2 URL Configuration

Webhook endpoints are **stored in the database** and managed by Admins via the settings UI. Multiple endpoints can be registered — each with its own URL, optional signing secret, and active toggle.

### 8.3 Deduplication — 24-Hour Cooldown

The webhook fires **once per product + location pair** when stock drops below threshold. It does not re-fire on subsequent out-movements until stock is replenished above the threshold and drops below again.

```php
// Before dispatching LowStockWebhookJob:
$cacheKey = "webhook.cooldown.{$productId}.{$locationId}";

if (Cache::has($cacheKey)) {
    return; // within cooldown — skip
}

Cache::put($cacheKey, true, now()->addHours(24));
dispatch(new LowStockWebhookJob($productId, $locationId));

// Clear when stock is replenished above reorder_level:
Cache::forget("webhook.cooldown.{$productId}.{$locationId}");
```

### 8.4 Payload Format

```json
{
  "event": "stock.low",
  "fired_at": "2025-05-20T08:30:00Z",
  "data": {
    "product": {
      "id": 12,
      "sku": "ELEC-001",
      "name": "USB-C Hub 7-Port",
      "reorder_level": 10
    },
    "location": {
      "id": 1,
      "code": "WH-01",
      "name": "Main Warehouse"
    },
    "current_stock": 3,
    "shortfall": 7
  }
}
```

### 8.5 HMAC Signing

If `webhook_endpoint.secret` is set, include on every delivery:

```
X-Invenio-Signature: sha256=<hmac_sha256(secret, raw_json_body)>
```

```php
$signature = 'sha256=' . hash_hmac('sha256', $rawBody, $endpoint->secret);
```

### 8.6 Retry Logic

```php
class LowStockWebhookJob implements ShouldQueue
{
    public int   $tries   = 3;
    public array $backoff = [60, 300, 900]; // 1 min · 5 min · 15 min
    public int   $timeout = 10;
}
```

- **HTTP 2xx:** mark delivery `delivered`, store `response_code`, set `delivered_at`
- **Non-2xx or timeout:** increment `attempt_count`, retry per backoff
- **All retries exhausted:** mark `failed`, log to `failed_jobs`

### 8.7 Webhook Settings UI

**Route:** `/settings/webhooks` — Admin role only.

- Endpoint list: URL (mono, truncated) · Status badge · Last delivery status + timestamp · Actions
- "Add Endpoint" slide-over: URL · Secret (optional, "Generate" button) · Active toggle
- Delivery log page per endpoint: Timestamp · Status badge · HTTP code · Response body (expandable)
- "Send Test Ping" button — bypasses cooldown, fires immediately

---

## 9. Screen-by-Screen Specification

### 9.1 Dashboard — `/dashboard`

**Top row — 4 stat cards:**

| Card | Icon | Alert color when |
|---|---|---|
| Total Active Products | `Package` | — |
| Active Locations | `MapPin` | — |
| Pending Purchase Orders | `ClipboardList` | count > 0 |
| Low Stock Alerts | `AlertTriangle` | count > 0 (card turns Danger red) |

**Low Stock Table** (max 10 rows + "View All" link):
Product (name + SKU muted below) · Location · Current Stock (red badge) · Reorder Level · "View" button

**Recent Movements Table** (max 10 rows):
Product · Type pill (`in` green / `out` red / `adjust` amber) · Qty · Location · By · When (time-ago)

**Pending POs Table** (max 5 rows):
PO Number (mono) · Supplier · Status badge · Expected Date · Item Count · "View" button

All three sections use skeleton loaders while fetching. Each shows a designed empty state when empty.

---

### 9.2 Products — `/products`

**List page:**
- Full-width search bar — searches SKU and name simultaneously, debounced
- Filters: Category (multi-select dropdown) · Status (Active / Inactive toggle)
- Sortable columns: SKU, Name, Category, Reorder Level
- Pagination: 25/page

**Table columns:** SKU (mono) · Name · Category · Unit · Reorder Level · Status badge · Edit · Deactivate

**Create / Edit slide-over fields:**
- SKU — required, async unique-check on blur
- Name — required
- Description — optional textarea
- Unit — required (pcs, kg, litre…)
- Category — required, searchable `<Select>`
- Reorder Level — required number, min 0
- Is Active — toggle switch

**Product Detail page** (`/products/{id}`):
- Read-only info card
- "Current Stock" table: Location · Current Qty · Status (OK / LOW badge) · Stock In button · Stock Out button
- "Movement History" table below: pre-filtered to this product, same columns + filters as main movement history

---

### 9.3 Categories — `/categories`

Table: Name · Status badge · Edit · Deactivate. Create/edit via slide-over. Search + pagination.

### 9.4 Locations — `/locations`

Table: Code (mono) · Name · Address · Status badge · Edit · Deactivate. Create/edit via slide-over.

### 9.5 Suppliers — `/suppliers`

Table: Name · Email · Phone · Status badge · Edit · Deactivate. Create/edit via slide-over.

---

### 9.6 Stock Movements — `/stock/movements`

**Create Movement** (`/stock/movements/create`):
- Tab bar: **Stock In** | **Stock Out** | **Adjust**
- Fields: Product (searchable, shows SKU) · Location · Quantity · Note (required for Adjust, optional otherwise) · Reference (optional)
- After product + location selected, fetch and display inline:
  ```
  Current stock at WH-01:  47 pcs   ← green if OK, red if LOW
  ```
- On success: toast + form resets to blank

**Movement History** (`/stock/movements`):
- Filters: Product · Location · Type · Date range picker
- Table: Timestamp · Product (SKU + name) · Type badge · Qty · Location · Note (truncated, click to expand) · By
- Pagination: 25/page

---

### 9.7 Purchase Orders — `/purchase-orders`

**List page:**
Filters: Status (multi-select) · Supplier · Date range
Table: PO Number (mono) · Supplier · Location · Status badge · Expected Date · Items count · Created By · Actions

**Create PO — two-step flow:**

Step 1 — Header: Supplier (searchable) · Location · Expected Date · Notes → "Next: Add Items"

Step 2 — Items: product search + Qty + Unit Cost per row · "Add row" · running grand total → "Create Draft PO"

**PO Detail** (`/purchase-orders/{id}`):

Header card with all PO metadata. Context-sensitive action buttons:

| Status | Available Actions |
|---|---|
| `draft` | Edit · Send to Supplier · Cancel |
| `sent` | Receive Items · Cancel |
| `partially_received` | Receive More Items · Cancel |
| `received` | *(read-only)* |
| `cancelled` | *(read-only)* |

Items table: SKU · Product · Qty Ordered · Qty Received · Outstanding · Unit Cost · Line Total · Progress bar

Status timeline at bottom: each transition with timestamp + user name.

**Receive Modal** (shadcn `<Dialog>`):
- Lists each non-fully-received line item
- Per item: Product name · "Outstanding: X pcs" · editable qty input pre-filled with outstanding, max = outstanding
- Validation: qty > 0 and ≤ outstanding (inline error per row)
- Confirm: creates stock-in movements, updates `qty_received`, transitions PO status, closes modal, refreshes page

---

### 9.8 Activity Log — `/activity-log` (Stretch)

- Filters: User · Action type · Date range
- Table: Timestamp · User · Action badge · Resource type + ID · "Details" expand
- Expanded row: two-column diff panel — Before (red tint, left) / After (green tint, right) as formatted JSON

---

### 9.9 Webhook Settings — `/settings/webhooks` (Stretch, Admin only)

Full spec in Section 8.7.

---

## 10. Stretch Features

### 10.1 Activity Log Screen

Dispatch an `ActivityLogged` event from **service classes** (not controllers) after every write action. Listeners write to `activity_log`.

**Actions to log:**

| Action Key | Trigger |
|---|---|
| `product.created` | New product saved |
| `product.updated` | Any product field changed |
| `product.deactivated` | `is_active` set to false |
| `stock.in` | Stock-in movement created |
| `stock.out` | Stock-out movement created |
| `stock.adjust` | Adjustment created |
| `po.created` | Draft PO created |
| `po.sent` | PO emailed to supplier |
| `po.received` | Items received (partial or full) |
| `po.cancelled` | PO cancelled |
| `user.created` | New user account |
| `user.deactivated` | Account deactivated |
| `webhook.delivered` | Delivery successful |
| `webhook.failed` | All retries exhausted |

**Payload example:**
```json
{
  "before": { "status": "draft" },
  "after":  { "status": "sent"  },
  "meta":   { "po_number": "PO-202505-0001", "supplier": "ABC Corp" }
}
```

---

### 10.2 Export Stock Report to CSV

**UI:** "Export CSV" button on the Stock Levels page → triggers direct browser file download.

**Response headers:**
```
Content-Type: text/csv
Content-Disposition: attachment; filename="stock-report-2025-05-20.csv"
```

**CSV columns:**
```
product_sku, product_name, category, unit, location_code, location_name,
current_stock, reorder_level, status
```

`status`: `OK` when `current_stock >= reorder_level`, `LOW` otherwise.

**Implementation:** Use Laravel `StreamedResponse`. Process in chunks of 500 rows — never load the full dataset into memory at once.

---

### 10.3 Webhook on Low Stock

Fully specified in [Section 8](#8-webhook-system-stretch). Summary:

- Endpoints stored in DB, managed by Admin via settings UI
- Fires once per product+location pair per 24-hour cooldown window
- Cooldown clears when stock is replenished above `reorder_level`
- HMAC-SHA256 signature header when secret is set
- 3 retries: 1 min · 5 min · 15 min backoff
- Delivery log in `webhook_deliveries` table
- Test ping button bypasses cooldown

---

## 11. Database Seeders

Running `php artisan db:seed` must produce a fully usable demo environment with zero extra steps.

### 11.1 Seeder Classes

| Seeder | Creates |
|---|---|
| `UserSeeder` | 4 users — one per role |
| `CategorySeeder` | 6 categories |
| `LocationSeeder` | 3 locations |
| `SupplierSeeder` | 4 suppliers |
| `ProductSeeder` | 30 products spread across categories |
| `StockLedgerSeeder` | Initial stock-in entries per product per location |
| `PurchaseOrderSeeder` | 5 POs covering all statuses |
| `WebhookEndpointSeeder` | 1 example endpoint (inactive by default) |

### 11.2 Default Seeded Users

| Name | Email | Password | Role |
|---|---|---|---|
| Admin User | `admin@invenio.test` | `password` | `admin` |
| Manager User | `manager@invenio.test` | `password` | `manager` |
| Staff User | `staff@invenio.test` | `password` | `staff` |
| Supplier User | `supplier@invenio.test` | `password` | `supplier_user` |

Document all four in the README under a **"Default Accounts"** section.

### 11.3 Sample Data Spec

**Categories:** Electronics · Office Supplies · Cleaning · Packaging · Tools · Safety Equipment

**Locations:** `WH-01` Main Warehouse · `WH-02` Secondary Warehouse · `STORE-01` Retail Store

**Required products (seed at minimum these 8):**

| SKU | Name | Category | Unit | Reorder Level |
|---|---|---|---|---|
| `ELEC-001` | USB-C Hub 7-Port | Electronics | pcs | 10 |
| `ELEC-002` | Wireless Keyboard | Electronics | pcs | 5 |
| `OFF-001` | A4 Copy Paper 500-Sheet Ream | Office Supplies | ream | 20 |
| `OFF-002` | Ballpoint Pens Box/50 | Office Supplies | box | 10 |
| `CLN-001` | Floor Cleaner 5L | Cleaning | bottle | 5 |
| `PKG-001` | Bubble Wrap Roll 50m | Packaging | roll | 3 |
| `TOOL-001` | Box Cutter Safety | Tools | pcs | 8 |
| `SAFE-001` | Nitrile Gloves Box/100 | Safety Equipment | box | 4 |

**POs to seed:** 1× `draft` · 1× `sent` · 1× `partially_received` · 1× `received` · 1× `cancelled`

> Deliberately seed 2–3 products **below** their reorder level so the dashboard Low Stock section is populated from day one and alert behavior can be verified immediately without manual setup.

---

## 12. Testing Requirements

Backend tests use **PHPUnit** via `php artisan test`. Frontend tests use **Vitest + React Testing Library**.

### 12.1 Auth Tests

```php
// tests/Feature/AuthTest.php

/** @test */
public function it_allows_a_user_to_login_with_correct_credentials(): void
public function it_rejects_login_with_wrong_password_and_returns_422(): void
public function it_blocks_access_to_protected_pages_when_not_logged_in(): void
public function it_returns_403_when_staff_accesses_an_admin_only_page(): void
public function it_logs_out_and_invalidates_the_session(): void
```

### 12.2 Stock Rule Tests

```php
// tests/Feature/StockRulesTest.php

public function it_creates_a_stock_in_movement_and_increases_ledger_total(): void
public function it_creates_a_stock_out_movement_and_decreases_ledger_total(): void
public function it_blocks_stock_out_that_would_make_stock_negative_for_staff(): void
public function it_allows_admin_to_force_stock_out_below_zero_with_a_note(): void
public function it_blocks_an_adjust_movement_submitted_without_a_note(): void
public function it_calculates_correct_totals_after_mixed_in_out_adjust_movements(): void
public function it_dispatches_low_stock_alert_job_when_stock_drops_below_reorder_level(): void
public function it_dispatches_low_stock_webhook_job_when_stock_drops_below_reorder_level(): void
public function it_does_not_dispatch_webhook_job_again_within_the_24_hour_cooldown(): void
public function it_dispatches_webhook_again_after_cooldown_clears_and_stock_drops(): void
```

### 12.3 Purchase Order Tests

```php
// tests/Feature/PurchaseOrderTest.php

public function it_creates_a_draft_purchase_order_with_line_items(): void
public function it_blocks_editing_a_sent_purchase_order(): void
public function it_sends_po_email_to_supplier_and_sets_status_to_sent(): void
public function it_queues_the_po_email_rather_than_sending_synchronously(): void
public function it_partially_receives_items_and_creates_stock_in_ledger_entries(): void
public function it_sets_status_to_partially_received_after_partial_receive(): void
public function it_sets_status_to_received_when_all_items_are_fully_received(): void
public function it_blocks_cancelling_a_received_purchase_order(): void
public function it_blocks_receiving_more_qty_than_was_ordered_on_a_line(): void
public function it_does_not_reverse_stock_when_a_po_is_cancelled(): void
```

### 12.4 Webhook Tests

```php
// tests/Feature/WebhookTest.php

public function it_dispatches_webhook_job_when_stock_drops_below_reorder_level(): void
public function it_fires_http_post_to_active_endpoints_with_correct_payload(): void
public function it_includes_hmac_signature_header_when_endpoint_has_a_secret(): void
public function it_skips_inactive_webhook_endpoints(): void
public function it_does_not_fire_again_within_the_24_hour_cooldown_window(): void
public function it_retries_delivery_on_non_2xx_response(): void
public function it_marks_delivery_failed_after_exhausting_all_retries(): void
public function it_clears_cooldown_when_stock_is_replenished_above_reorder_level(): void
public function test_ping_fires_immediately_and_bypasses_cooldown(): void
```

### 12.5 Activity Log Tests

```php
// tests/Feature/ActivityLogTest.php

public function it_logs_stock_adjust_with_before_and_after_payload(): void
public function it_logs_po_sent_with_po_metadata(): void
public function it_logs_po_received_with_received_quantities(): void
public function it_stores_user_id_and_ip_address_on_every_entry(): void
```

### 12.6 Frontend Component Tests (Vitest)

```
tests/Frontend/StockMovementForm.test.tsx
  ✓ renders note field as required when type is 'adjust'
  ✓ does not mark note required when type is 'in'
  ✓ fetches and shows current stock after product + location are selected
  ✓ disables submit button while request is in flight

tests/Frontend/PoReceiveModal.test.tsx
  ✓ pre-fills each qty input with the outstanding quantity for that line item
  ✓ shows inline error when qty exceeds outstanding
  ✓ disables confirm button when all qty inputs are zero

tests/Frontend/WebhookForm.test.tsx
  ✓ generates a random secret string when Generate is clicked
  ✓ shows URL validation error on blur for an invalid URL
```

---

## 13. Documentation Requirements

### 13.1 `README.md` — Required Sections

1. **Project Overview** — one concise paragraph describing Invenio
2. **Prerequisites** — PHP 8.2+, Composer 2+, Node 20+, MySQL 8+, Mailpit
3. **Installation**
   ```bash
   git clone <repo-url> && cd invenio
   composer install && npm install
   cp .env.example .env
   php artisan key:generate
   ```
4. **Database Setup**
   ```bash
   # Set DB_DATABASE, DB_USERNAME, DB_PASSWORD in .env first
   php artisan migrate
   php artisan db:seed
   ```
5. **Running the App**
   ```bash
   php artisan serve      # port 8000
   npm run dev            # Vite HMR
   php artisan queue:work # separate terminal — required for emails + webhooks
   ```
6. **Mail Testing** — Mailpit at `http://localhost:8025`. All outgoing dev mail is captured automatically.
7. **Webhook Testing** — Use [webhook.site](https://webhook.site) as a free test receiver URL. Register it under Settings → Webhooks → Add Endpoint, then use "Send Test Ping".
8. **Running Tests**
   ```bash
   php artisan test   # PHPUnit backend suite
   npm run test       # Vitest frontend suite
   ```
9. **Default Accounts** — table of all seeded users with Email · Password · Role
10. **Future: REST API** — brief note that the `/api/v1` layer will be added in a future phase

### 13.2 Architecture Notes — `/docs/ARCHITECTURE.md`

Must cover all five topics clearly:

1. **Stock computation** — the ledger aggregation SQL, how it maps to an Eloquent scope or service method, the `Cache::remember` key format, and what triggers cache invalidation
2. **Authorization** — which Policy class covers each model, how roles map to policy methods, where `AuthServiceProvider::policies()` registrations live, and how `FormRequest::authorize()` connects
3. **Partial receiving** — the form submission payload, how `qty_received` is incremented in a DB transaction, and how PO status auto-transitions are determined
4. **Webhook system** — endpoint registration, cooldown cache key logic + invalidation, HMAC signing, retry job config, delivery log writes
5. **Queue architecture** — list of all Job classes with purpose, `$tries`, `$backoff`, `$timeout`, and how to inspect or retry from `failed_jobs`

---

## 14. Non-Functional Requirements

- **No N+1 queries.** Use `->with()` eager loading on every Eloquent collection. Verify with Laravel Debugbar in development before marking any feature complete.
- **Pagination on all lists.** Default 25 items/page. No list may render without pagination.
- **All inputs validated server-side.** Create a `FormRequest` class for every write operation. Frontend validation is UX only — never a security control.
- **No sensitive data in logs.** Passwords, raw webhook secrets, and email content must never appear in `storage/logs/*.log`.
- **Audit trail on critical actions.** PO sent · PO received · stock adjust · user deactivated · webhook delivered/failed — each must write to `activity_log`.
- **No raw SQL in controllers.** Use Eloquent or Query Builder with named bindings. The ledger aggregation query (Section 5.12) is the only permitted exception.
- **Queue failures stored.** The `failed_jobs` migration must be run. Webhook failures must also be recorded in `webhook_deliveries` with `status = 'failed'`.
- **Webhook HTTP calls have a hard 10-second timeout.** A slow external endpoint must never stall a queue worker.
- **CSRF protection active** on all web routes — Sanctum handles this automatically via cookie for Inertia.
- **Response time under 500ms** for any page render on the seeded dev dataset. Profile with Debugbar if a page is slow.

---

## 15. Final Deliverables Checklist

> A feature is **done** when it is tested, code-reviewed via PR, merged, and documented. Shipping without tests is not acceptable.

### Web App — Core
- [ ] Auth: login · forgot password · reset password
- [ ] Dashboard: stat cards · low stock table · recent movements · pending POs (skeleton loaders + empty states on all)
- [ ] Full CRUD: Products · Categories · Locations · Suppliers (search + filter + pagination + slide-over forms)
- [ ] Stock movements: in / out / adjust — all business rules enforced server-side
- [ ] Movement history with full filter set and date range picker
- [ ] Purchase Order full lifecycle: draft → sent → partial receive → received
- [ ] PO email dispatched and visible in Mailpit with correct HTML
- [ ] Low-stock alert email dispatched and visible in Mailpit
- [ ] Weekly digest scheduled job wired and confirmed

### Stretch Features
- [ ] Activity log screen with before/after JSON diff
- [ ] Export stock report to CSV (streamed, chunked, `OK`/`LOW` status column)
- [ ] Webhook system: settings UI · HMAC signing · delivery log · 24h cooldown · 3-retry backoff · test ping

### Testing
- [ ] All PHPUnit test methods from Section 12 written and passing
- [ ] Webhook cooldown and retry behavior covered by tests
- [ ] Frontend Vitest component tests passing
- [ ] `php artisan test` exits 0

### Documentation
- [ ] `README.md` — complete setup from clone to running app, zero assumptions
- [ ] `/docs/ARCHITECTURE.md` — all 5 topics covered
- [ ] Default accounts table in README

---

*Invenio PRD v5.0 — Approved for Development*
