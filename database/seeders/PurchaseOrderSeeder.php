<?php

namespace Database\Seeders;

use App\Models\Location;
use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\StockLedger;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PurchaseOrderSeeder extends Seeder
{
    /**
     * Seed 5 purchase orders — one per status per PRD §11.3:
     * draft · sent · partially_received · received · cancelled
     */
    public function run(): void
    {
        $admin   = User::where('email', 'admin@invenio.test')->firstOrFail();
        $manager = User::where('email', 'manager@invenio.test')->firstOrFail();

        $techSource  = Supplier::where('email', 'orders@techsource.test')->firstOrFail();
        $officeWorld = Supplier::where('email', 'procurement@officeworld.test')->firstOrFail();
        $cleanPro    = Supplier::where('email', 'sales@cleanpro.test')->firstOrFail();
        $safeGuard   = Supplier::where('email', 'supply@safeguard.test')->firstOrFail();

        $wh01    = Location::where('code', 'WH-01')->firstOrFail();
        $wh02    = Location::where('code', 'WH-02')->firstOrFail();
        $store01 = Location::where('code', 'STORE-01')->firstOrFail();

        // ── PO 1: DRAFT ───────────────────────────────────────────────────
        $po1 = PurchaseOrder::create([
            'po_number'   => 'PO-' . now()->format('Ym') . '-0001',
            'supplier_id' => $techSource->id,
            'location_id' => $wh01->id,
            'status'      => 'draft',
            'expected_at' => now()->addDays(14)->toDateString(),
            'notes'       => 'Restocking electronics for main warehouse.',
            'created_by'  => $manager->id,
        ]);

        $elec001 = Product::where('sku', 'ELEC-001')->firstOrFail();
        $elec003 = Product::where('sku', 'ELEC-003')->firstOrFail();

        PurchaseOrderItem::insert([
            ['purchase_order_id' => $po1->id, 'product_id' => $elec001->id, 'qty_ordered' => 50, 'unit_cost' => 2850.00, 'qty_received' => 0],
            ['purchase_order_id' => $po1->id, 'product_id' => $elec003->id, 'qty_ordered' => 30, 'unit_cost' => 1200.00, 'qty_received' => 0],
        ]);

        // ── PO 2: SENT ────────────────────────────────────────────────────
        $po2 = PurchaseOrder::create([
            'po_number'   => 'PO-' . now()->format('Ym') . '-0002',
            'supplier_id' => $officeWorld->id,
            'location_id' => $wh01->id,
            'status'      => 'sent',
            'expected_at' => now()->addDays(7)->toDateString(),
            'notes'       => 'Urgent paper restock — running low.',
            'created_by'  => $manager->id,
            'sent_at'     => now()->subDays(2),
        ]);

        $off001 = Product::where('sku', 'OFF-001')->firstOrFail();
        $off002 = Product::where('sku', 'OFF-002')->firstOrFail();
        $off003 = Product::where('sku', 'OFF-003')->firstOrFail();

        PurchaseOrderItem::insert([
            ['purchase_order_id' => $po2->id, 'product_id' => $off001->id, 'qty_ordered' => 100, 'unit_cost' => 850.00,  'qty_received' => 0],
            ['purchase_order_id' => $po2->id, 'product_id' => $off002->id, 'qty_ordered' => 30,  'unit_cost' => 450.00,  'qty_received' => 0],
            ['purchase_order_id' => $po2->id, 'product_id' => $off003->id, 'qty_ordered' => 50,  'unit_cost' => 250.00,  'qty_received' => 0],
        ]);

        // ── PO 3: PARTIALLY RECEIVED ─────────────────────────────────────
        $po3 = PurchaseOrder::create([
            'po_number'   => 'PO-' . now()->format('Ym') . '-0003',
            'supplier_id' => $cleanPro->id,
            'location_id' => $wh02->id,
            'status'      => 'partially_received',
            'expected_at' => now()->subDays(3)->toDateString(),
            'notes'       => 'First partial delivery received.',
            'created_by'  => $admin->id,
            'sent_at'     => now()->subDays(10),
        ]);

        $cln001 = Product::where('sku', 'CLN-001')->firstOrFail();
        $cln002 = Product::where('sku', 'CLN-002')->firstOrFail();

        PurchaseOrderItem::insert([
            ['purchase_order_id' => $po3->id, 'product_id' => $cln001->id, 'qty_ordered' => 40, 'unit_cost' => 650.00, 'qty_received' => 20],
            ['purchase_order_id' => $po3->id, 'product_id' => $cln002->id, 'qty_ordered' => 100,'unit_cost' => 180.00, 'qty_received' => 60],
        ]);

        // Create corresponding stock-in ledger entries for received quantities
        DB::transaction(function () use ($po3, $cln001, $cln002, $wh02, $admin): void {
            StockLedger::create([
                'product_id'     => $cln001->id,
                'location_id'    => $wh02->id,
                'type'           => 'in',
                'quantity'       => 20,
                'reference_type' => PurchaseOrder::class,
                'reference_id'   => $po3->id,
                'note'           => 'Partial receive from PO-' . $po3->po_number,
                'created_by'     => $admin->id,
            ]);
            StockLedger::bustCache($cln001->id, $wh02->id);

            StockLedger::create([
                'product_id'     => $cln002->id,
                'location_id'    => $wh02->id,
                'type'           => 'in',
                'quantity'       => 60,
                'reference_type' => PurchaseOrder::class,
                'reference_id'   => $po3->id,
                'note'           => 'Partial receive from PO-' . $po3->po_number,
                'created_by'     => $admin->id,
            ]);
            StockLedger::bustCache($cln002->id, $wh02->id);
        });

        // ── PO 4: RECEIVED (fully) ────────────────────────────────────────
        $po4 = PurchaseOrder::create([
            'po_number'   => 'PO-' . now()->format('Ym') . '-0004',
            'supplier_id' => $safeGuard->id,
            'location_id' => $wh01->id,
            'status'      => 'received',
            'expected_at' => now()->subDays(7)->toDateString(),
            'notes'       => 'Fully received. All items inspected and counted.',
            'created_by'  => $admin->id,
            'sent_at'     => now()->subDays(15),
        ]);

        $safe001 = Product::where('sku', 'SAFE-001')->firstOrFail();
        $safe002 = Product::where('sku', 'SAFE-002')->firstOrFail();
        $safe003 = Product::where('sku', 'SAFE-003')->firstOrFail();

        PurchaseOrderItem::insert([
            ['purchase_order_id' => $po4->id, 'product_id' => $safe001->id, 'qty_ordered' => 50, 'unit_cost' => 380.00, 'qty_received' => 50],
            ['purchase_order_id' => $po4->id, 'product_id' => $safe002->id, 'qty_ordered' => 20, 'unit_cost' => 950.00, 'qty_received' => 20],
            ['purchase_order_id' => $po4->id, 'product_id' => $safe003->id, 'qty_ordered' => 30, 'unit_cost' => 280.00, 'qty_received' => 30],
        ]);

        // Stock-in entries for the fully received PO
        DB::transaction(function () use ($po4, $safe001, $safe002, $safe003, $wh01, $admin): void {
            foreach ([[$safe001, 50], [$safe002, 20], [$safe003, 30]] as [$product, $qty]) {
                StockLedger::create([
                    'product_id'     => $product->id,
                    'location_id'    => $wh01->id,
                    'type'           => 'in',
                    'quantity'       => $qty,
                    'reference_type' => PurchaseOrder::class,
                    'reference_id'   => $po4->id,
                    'note'           => 'Full receive from PO-' . $po4->po_number,
                    'created_by'     => $admin->id,
                ]);
                StockLedger::bustCache($product->id, $wh01->id);
            }
        });

        // ── PO 5: CANCELLED ──────────────────────────────────────────────
        $po5 = PurchaseOrder::create([
            'po_number'   => 'PO-' . now()->format('Ym') . '-0005',
            'supplier_id' => $techSource->id,
            'location_id' => $store01->id,
            'status'      => 'cancelled',
            'expected_at' => now()->addDays(21)->toDateString(),
            'notes'       => 'Cancelled — supplier unable to meet delivery deadline.',
            'created_by'  => $manager->id,
            'sent_at'     => now()->subDays(5),
        ]);

        $elec004 = Product::where('sku', 'ELEC-004')->firstOrFail();

        PurchaseOrderItem::insert([
            ['purchase_order_id' => $po5->id, 'product_id' => $elec004->id, 'qty_ordered' => 25, 'unit_cost' => 350.00, 'qty_received' => 0],
        ]);
        // Cancellation does NOT reverse stock — ledger is permanent (PRD §6.2.5)
    }
}
