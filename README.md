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
    Controllers/      # CategoryController, LocationController, SupplierController, ProductController
    Requests/         # One Store + Update FormRequest per resource
    Middleware/       # EnsureRole — gates routes by role string
    Policies/         # Eloquent policies for all resources
  Models/
    StockLedger.php   # computeStock() aggregates ledger rows per product/location

resources/js/
  Layouts/
    AuthenticatedLayout.jsx   # Sidebar, top bar, flash toasts
    GuestLayout.jsx           # Login/reset wrapper
  Pages/
    Categories/Index.jsx
    Locations/Index.jsx
    Suppliers/Index.jsx
    Products/
      Index.jsx   # List with low-stock indicator and SKU uniqueness check
      Show.jsx    # Per-location stock breakdown + movement history
    Auth/         # Login, ForgotPassword, ResetPassword

database/
  migrations/   # Schema for all 10 tables
  seeders/      # Demo data across all entities
```

---

## Tests

```bash
php artisan test
```

33 feature tests covering auth, CRUD policies, and validation rules.

---

## Roadmap

- [x] Phase 1 — Foundation & Auth
- [x] Phase 2 — Master data CRUD (Categories, Locations, Suppliers, Products)
- [ ] Phase 3 — Stock ledger (movements, aggregation, negative-stock guard)
- [ ] Phase 4 — Purchase orders (create, send, partial receive)
- [ ] Phase 5 — Emails & queues (low-stock alerts, weekly digest)
- [ ] Phase 6 — Dashboard & UX polish
- [ ] Phase 7 — Stretch (activity log, CSV export, webhooks)

---

## Notes

`vendor/` and `node_modules/` are gitignored. `public/build/` is excluded — run `npm run build` locally or hook it into your deploy pipeline.

The `.env.example` has sensible defaults. Only `DB_*` values need changing for a fresh install.
