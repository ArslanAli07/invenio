<?php

namespace Database\Seeders;

use App\Models\Location;
use App\Models\Product;
use App\Models\StockLedger;
use App\Models\User;
use Illuminate\Database\Seeder;

class StockLedgerSeeder extends Seeder
{
    /**
     * Seed initial stock-in movements per product per location.
     *
     * ⚠️ INTENTIONAL LOW STOCK (PRD §11.3):
     *   ELEC-001  reorder=10  → seeded 3  at WH-01   (LOW)
     *   OFF-001   reorder=20  → seeded 12 at WH-01   (LOW)
     *   SAFE-001  reorder=4   → seeded 1  at STORE-01 (LOW)
     *
     * This ensures the dashboard Low Stock section is populated from day one.
     */
    public function run(): void
    {
        // ── Idempotency guard ────────────────────────────────────────────
        // StockLedger::create() is not upsertable — running this seeder twice
        // without migrate:fresh would double every stock number.
        // If any ledger rows exist, skip with a warning instead of corrupting data.
        if (StockLedger::exists()) {
            $this->command->warn(
                'StockLedgerSeeder: stock_ledger table already has data. ' .
                'Skipping to prevent duplicate entries. ' .
                'Run [php artisan migrate:fresh --seed] to fully reset.'
            );

            return;
        }

        $admin     = User::where('email', 'admin@invenio.test')->firstOrFail();
        $wh01      = Location::where('code', 'WH-01')->firstOrFail();
        $wh02      = Location::where('code', 'WH-02')->firstOrFail();
        $store01   = Location::where('code', 'STORE-01')->firstOrFail();

        // Helper: create a single stock-in ledger entry and bust cache
        $stockIn = function (Product $product, Location $location, float $qty, string $note = 'Initial stock') use ($admin): void {
            StockLedger::create([
                'product_id'  => $product->id,
                'location_id' => $location->id,
                'type'        => 'in',
                'quantity'    => $qty,
                'note'        => $note,
                'created_by'  => $admin->id,
            ]);
            StockLedger::bustCache($product->id, $location->id);
        };

        // ── Electronics ─────────────────────────────────────────────────
        $elec001 = Product::where('sku', 'ELEC-001')->firstOrFail();
        $elec002 = Product::where('sku', 'ELEC-002')->firstOrFail();
        $elec003 = Product::where('sku', 'ELEC-003')->firstOrFail();
        $elec004 = Product::where('sku', 'ELEC-004')->firstOrFail();
        $elec005 = Product::where('sku', 'ELEC-005')->firstOrFail();
        $elec006 = Product::where('sku', 'ELEC-006')->firstOrFail();

        // ⚠️ ELEC-001: deliberately 3 at WH-01 (reorder=10 → LOW)
        $stockIn($elec001, $wh01,   3,  'Initial stock — intentionally low for demo');
        $stockIn($elec001, $wh02,   25, 'Initial stock — WH-02 primary');
        $stockIn($elec002, $wh01,   30, 'Initial stock');
        $stockIn($elec002, $wh02,   20, 'Initial stock');
        $stockIn($elec003, $wh01,   40, 'Initial stock');
        $stockIn($elec003, $wh02,   15, 'Initial stock');
        $stockIn($elec004, $wh01,   80, 'Initial stock');
        $stockIn($elec004, $store01, 25, 'Initial stock');
        $stockIn($elec005, $wh01,   120,'Initial stock');
        $stockIn($elec005, $store01, 40, 'Initial stock');
        $stockIn($elec006, $wh01,   15, 'Initial stock');
        $stockIn($elec006, $wh02,   8,  'Initial stock');

        // ── Office Supplies ─────────────────────────────────────────────
        $off001 = Product::where('sku', 'OFF-001')->firstOrFail();
        $off002 = Product::where('sku', 'OFF-002')->firstOrFail();
        $off003 = Product::where('sku', 'OFF-003')->firstOrFail();
        $off004 = Product::where('sku', 'OFF-004')->firstOrFail();
        $off005 = Product::where('sku', 'OFF-005')->firstOrFail();
        $off006 = Product::where('sku', 'OFF-006')->firstOrFail();
        $off007 = Product::where('sku', 'OFF-007')->firstOrFail();

        // ⚠️ OFF-001: deliberately 12 at WH-01 (reorder=20 → LOW)
        $stockIn($off001, $wh01,    12,  'Initial stock — intentionally low for demo');
        $stockIn($off001, $wh02,    60,  'Initial stock');
        $stockIn($off001, $store01, 30,  'Initial stock');
        $stockIn($off002, $wh01,    50,  'Initial stock');
        $stockIn($off002, $store01, 20,  'Initial stock');
        $stockIn($off003, $wh01,    35,  'Initial stock');
        $stockIn($off003, $store01, 12,  'Initial stock');
        $stockIn($off004, $wh01,    15,  'Initial stock');
        $stockIn($off005, $wh01,    40,  'Initial stock');
        $stockIn($off006, $wh01,    20,  'Initial stock');
        $stockIn($off006, $store01, 8,   'Initial stock');
        $stockIn($off007, $wh01,    60,  'Initial stock');
        $stockIn($off007, $store01, 20,  'Initial stock');

        // ── Cleaning ────────────────────────────────────────────────────
        $cln001 = Product::where('sku', 'CLN-001')->firstOrFail();
        $cln002 = Product::where('sku', 'CLN-002')->firstOrFail();
        $cln003 = Product::where('sku', 'CLN-003')->firstOrFail();
        $cln004 = Product::where('sku', 'CLN-004')->firstOrFail();

        $stockIn($cln001, $wh01,    20, 'Initial stock');
        $stockIn($cln001, $wh02,    15, 'Initial stock');
        $stockIn($cln002, $wh01,    60, 'Initial stock');
        $stockIn($cln002, $store01, 25, 'Initial stock');
        $stockIn($cln003, $wh01,    30, 'Initial stock');
        $stockIn($cln003, $store01, 10, 'Initial stock');
        $stockIn($cln004, $wh01,    8,  'Initial stock');
        $stockIn($cln004, $wh02,    4,  'Initial stock');

        // ── Packaging ───────────────────────────────────────────────────
        $pkg001 = Product::where('sku', 'PKG-001')->firstOrFail();
        $pkg002 = Product::where('sku', 'PKG-002')->firstOrFail();
        $pkg003 = Product::where('sku', 'PKG-003')->firstOrFail();
        $pkg004 = Product::where('sku', 'PKG-004')->firstOrFail();

        $stockIn($pkg001, $wh01, 15, 'Initial stock');
        $stockIn($pkg001, $wh02, 8,  'Initial stock');
        $stockIn($pkg002, $wh01, 30, 'Initial stock');
        $stockIn($pkg002, $wh02, 20, 'Initial stock');
        $stockIn($pkg003, $wh01, 50, 'Initial stock');
        $stockIn($pkg003, $wh02, 25, 'Initial stock');
        $stockIn($pkg004, $wh01, 18, 'Initial stock');
        $stockIn($pkg004, $wh02, 10, 'Initial stock');

        // ── Tools ────────────────────────────────────────────────────────
        $tool001 = Product::where('sku', 'TOOL-001')->firstOrFail();
        $tool002 = Product::where('sku', 'TOOL-002')->firstOrFail();
        $tool003 = Product::where('sku', 'TOOL-003')->firstOrFail();
        $tool004 = Product::where('sku', 'TOOL-004')->firstOrFail();
        $tool005 = Product::where('sku', 'TOOL-005')->firstOrFail();

        $stockIn($tool001, $wh01,    25, 'Initial stock');
        $stockIn($tool001, $store01, 10, 'Initial stock');
        $stockIn($tool002, $wh01,    12, 'Initial stock');
        $stockIn($tool002, $store01, 5,  'Initial stock');
        $stockIn($tool003, $wh01,    80, 'Initial stock');
        $stockIn($tool003, $wh02,    40, 'Initial stock');
        $stockIn($tool004, $wh01,    20, 'Initial stock');
        $stockIn($tool004, $store01, 8,  'Initial stock');
        $stockIn($tool005, $wh01,    30, 'Initial stock');
        $stockIn($tool005, $store01, 12, 'Initial stock');

        // ── Safety Equipment ─────────────────────────────────────────────
        $safe001 = Product::where('sku', 'SAFE-001')->firstOrFail();
        $safe002 = Product::where('sku', 'SAFE-002')->firstOrFail();
        $safe003 = Product::where('sku', 'SAFE-003')->firstOrFail();
        $safe004 = Product::where('sku', 'SAFE-004')->firstOrFail();

        // ⚠️ SAFE-001: deliberately 1 at STORE-01 (reorder=4 → LOW)
        $stockIn($safe001, $wh01,    20,  'Initial stock');
        $stockIn($safe001, $wh02,    15,  'Initial stock');
        $stockIn($safe001, $store01, 1,   'Initial stock — intentionally low for demo');
        $stockIn($safe002, $wh01,    18,  'Initial stock');
        $stockIn($safe002, $store01, 6,   'Initial stock');
        $stockIn($safe003, $wh01,    30,  'Initial stock');
        $stockIn($safe003, $store01, 10,  'Initial stock');
        $stockIn($safe004, $wh01,    5,   'Initial stock');
        $stockIn($safe004, $wh02,    3,   'Initial stock');
    }
}
