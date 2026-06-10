# Invenio

Inventory management for teams that have outgrown spreadsheets but don't need a full ERP. Track products across multiple warehouse locations, manage suppliers, and keep a full audit trail of every stock movement.

---

## What it does

Every stock change — inbound shipment, outbound fulfillment, manual adjustment — writes an immutable ledger entry. Current stock at any location is always derived from that ledger, never stored directly. The history is the source of truth.

Access is role-gated. Admins manage everything. Managers handle day-to-day CRUD and stock operations. Staff get read-only views across all resources.

---

## Stack

- **Laravel 13** — backend, routing, auth, policies, validation
- **Inertia.js v2** — SPA-style navigation without a separate API layer
- **React 18** — all frontend components, JSX only (no TypeScript)
- **Tailwind CSS v3** — utility styling
- **shadcn/ui** — Radix-based primitives (Sheet, Dialog)
- **Vite 8** — asset bundling
- **MySQL 8** — primary database

---

## Getting started

```bash
git clone https://github.com/ArslanAli07/invenio.git
cd invenio

composer install
cp .env.example .env
php artisan key:generate

# Set DB_DATABASE, DB_USERNAME, DB_PASSWORD in .env
php artisan migrate --seed

npm install
npm run dev
```

If you're using Laravel Herd, the site is at `http://invenio.test` after setup.

### Seeded accounts

| Role    | Email                | Password |
| ------- | -------------------- | -------- |
| Admin   | admin@invenio.test   | password |
| Manager | manager@invenio.test | password |
| Staff   | staff@invenio.test   | password |

---

## Project structure

```
app/
  Http/
    Controllers/      # CategoryController, LocationController, SupplierController,
                      # ProductController, StockMovementController, PurchaseOrderController
    Requests/         # One Store + Update FormRequest per resource, plus StoreMovementRequest,
                      # StorePurchaseOrderRequest, UpdatePurchaseOrderRequest, ReceiveItemsRequest
    Middleware/       # EnsureRole — gates routes by role string
    Policies/         # Eloquent policies for all resources
    Mail/             # PurchaseOrderSentMail (queued, ShouldQueue)
  Models/
    StockLedger.php   # computeStock() aggregates ledger rows per product/location
    PurchaseOrder.php # generatePoNumber(), isDraft() helpers
    PurchaseOrderItem.php  # qty_outstanding, line_total accessors

resources/js/
  Layouts/
    AuthenticatedLayout.jsx   # Sidebar, top bar, flash toasts, theme toggle
    GuestLayout.jsx           # Login/reset wrapper
  Components/
    ThemeProvider.jsx         # Dark/light mode context, localStorage + OS preference
  Pages/
    Categories/Index.jsx
    Locations/Index.jsx
    Suppliers/Index.jsx
    Products/
      Index.jsx   # List with low-stock indicator and SKU uniqueness check
      Show.jsx    # Per-location stock breakdown + movement history
    PurchaseOrders/
      Index.jsx   # List with status badges and filters
      Create.jsx  # Two-section form with dynamic line items and live totals
      Edit.jsx    # Same as Create, pre-filled from existing draft
      Show.jsx    # Detail page with meta cards, items table, progress bars,
                  # context-sensitive actions, Receive Items modal
    Auth/         # Login, ForgotPassword, ResetPassword

resources/views/
  mail/
    purchase-order-sent.blade.php   # HTML email sent to supplier on PO send

database/
  migrations/   # Schema for all 10 tables
  seeders/      # Demo data across all entities
```

---

## Tests

```bash
php artisan test
```

68 feature tests covering auth, CRUD policies, stock ledger rules, PO lifecycle, and stock transfers.

---

## Roadmap

- [x] Phase 1 — Foundation & Auth
- [x] Phase 2 — Master data CRUD (Categories, Locations, Suppliers, Products)
- [x] Phase 3 — Stock ledger & manual movements (aggregation, negative-stock guard)
- [x] Phase 4 — Purchase orders (draft → sent → receive → stock auto-updated)
- [x] Phase 5 — User management & dashboard stats
- [x] Phase 6 — Global stock log (/movements)
- [x] Phase 7 — Dashboard charts (Recharts)
- [x] Phase 8 — Stock transfers
- [ ] Phase 9 — Low-stock email alerts

---

## Notes

`vendor/` and `node_modules/` are gitignored. `public/build/` is excluded — run `npm run build` locally or hook it into your deploy pipeline.

The `.env.example` has sensible defaults. Only `DB_*` values need changing for a fresh install.

### Purchase order emails

The "Send to Supplier" action queues an email rather than sending it synchronously. For this to work during development, run a queue worker alongside `npm run dev`:

```bash
php artisan queue:work
```

Emails are delivered to Mailpit at `http://localhost:8025` when using Herd.

---

## 📘 Quick Start & Operations Guide

This guide outlines the standard operating procedures and walks through a complete end-to-end inventory management cycle using Invenio.

### 1. Architectural Concept: The Stock Ledger
Unlike basic database models that simply overwrite a static inventory count (e.g. updating stock directly from `10` to `8`), Invenio uses an **immutable Stock Ledger**. 

Every transaction—whether receiving shipments, fulfilling orders, performing manual adjustments, or transferring items—writes a permanent, audit-ready ledger record containing:
* **The Operator**: Who authorized and performed the transaction.
* **The Quantity & Type**: The exact unit movement (inflow, outflow, or adjustment).
* **The Target Location**: The specific facility where the stock changed.
* **The Reference & Notes**: The business context (e.g., linked Purchase Order #, transfer audit trails, or reason notes).

Current stock levels at any location are dynamically aggregated from this ledger history, ensuring a 100% transparent audit trail.

### 2. End-to-End Workflow Demonstration

To test the system's core features from procurement to transfer, execute the following operational sequence:

#### Step 1: Initialize Supplier and Location Resources
1. Navigate to **Suppliers** and select *New Supplier*. Create a distributor entry (e.g., **"Global Tech Distributors"**).
2. Navigate to **Locations** and register two separate facilities:
   - **"Main Warehouse"** (e.g., Code: `WH-MAIN`)
   - **"Retail Outlet"** (e.g., Code: `RT-OUTLET`)

#### Step 2: Register a Product in the Catalog
1. Navigate to **Products** and select *New Product*.
2. Add a new item to the system:
   - **Name**: "iPhone 17 Pro Max"
   - **SKU**: `IPH-17PM-256`
   - **Reorder Level**: `10` (the minimum global threshold that triggers low-stock alerts).

#### Step 3: Initiate a Purchase Order (Procurement)
1. Navigate to **Purchase Orders** and select *New Purchase Order*.
2. Select **"Global Tech Distributors"** as the supplier and designate **"Main Warehouse"** as the receiving destination.
3. Add the product **"iPhone 17 Pro Max"** to the line items, set the order quantity to `50` units, and click *Save as Draft*.
4. Once reviewed, click *Send to Supplier* to update the status and simulate sending the order request.

#### Step 4: Receive Inventory
1. Once the shipment arrives physically at the warehouse, select *Receive Items* on the Purchase Order details page.
2. Enter the quantity received (e.g., `50`) and confirm.
3. **Verification**: Navigate to the **Products** list. **"iPhone 17 Pro Max"** will now display a global stock of `50` units, with the underlying ledger recording: `+50 units received from PO #[ID]`.

#### Step 5: Execute an Internal Stock Transfer
1. Navigate to **Stock Transfers** and select *New Transfer*.
2. Select **"iPhone 17 Pro Max"** as the product.
3. Designate the source as **"Main Warehouse"** (which shows 50 units available) and the destination as **"Retail Outlet"**.
4. Set the transfer quantity to `15` and submit the form.
5. **Verification**: The system executes a database transaction to atomically write two ledger records (deducting 15 units from `WH-MAIN` and adding 15 units to `RT-OUTLET`), preventing any risk of lost stock in transit. Check the product details page to view the updated inventory allocations.
