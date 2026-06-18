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
    public function run(): void
    {
        $admin   = User::where('email', 'admin@invenio.test')->firstOrFail();
        $manager = User::where('email', 'manager@invenio.test')->firstOrFail();

        $techSource  = Supplier::where('email', 'orders@techsource.test')->firstOrFail();
        $officeWorld = Supplier::where('email', 'procurement@officeworld.test')->firstOrFail();
        $cleanPro    = Supplier::where('email', 'sales@cleanpro.test')->firstOrFail();

        $wh01    = Location::where('code', 'WH-01')->firstOrFail();
        $wh02    = Location::where('code', 'WH-02')->firstOrFail();

        // Let's get some products
        $iphone15PM = Product::where('sku', 'IPH15PM')->firstOrFail();
        $galaxyS24  = Product::where('sku', 'GS24')->firstOrFail();
        $pixel8     = Product::where('sku', 'PXL8P')->firstOrFail();

        // ── PO 1: DRAFT ───────────────────────────────────────────────────
        $po1 = PurchaseOrder::create([
            'po_number'   => 'PO-' . now()->format('Ym') . '-0001',
            'supplier_id' => $techSource->id,
            'location_id' => $wh01->id,
            'status'      => 'draft',
            'expected_at' => now()->addDays(14)->toDateString(),
            'notes'       => 'Restocking iPhones.',
            'created_by'  => $manager->id,
        ]);

        PurchaseOrderItem::insert([
            ['purchase_order_id' => $po1->id, 'product_id' => $iphone15PM->id, 'qty_ordered' => 50, 'unit_cost' => 1000.00, 'qty_received' => 0],
        ]);

        // ── PO 2: SENT ────────────────────────────────────────────────────
        $po2 = PurchaseOrder::create([
            'po_number'   => 'PO-' . now()->format('Ym') . '-0002',
            'supplier_id' => $officeWorld->id,
            'location_id' => $wh01->id,
            'status'      => 'sent',
            'expected_at' => now()->addDays(7)->toDateString(),
            'notes'       => 'Samsung restock.',
            'created_by'  => $manager->id,
            'sent_at'     => now()->subDays(2),
        ]);

        PurchaseOrderItem::insert([
            ['purchase_order_id' => $po2->id, 'product_id' => $galaxyS24->id, 'qty_ordered' => 100, 'unit_cost' => 700.00,  'qty_received' => 0],
        ]);

        // ── PO 3: PARTIALLY RECEIVED ─────────────────────────────────────
        $po3 = PurchaseOrder::create([
            'po_number'   => 'PO-' . now()->format('Ym') . '-0003',
            'supplier_id' => $cleanPro->id,
            'location_id' => $wh02->id,
            'status'      => 'partially_received',
            'expected_at' => now()->subDays(3)->toDateString(),
            'notes'       => 'Pixel delivery partial.',
            'created_by'  => $admin->id,
            'sent_at'     => now()->subDays(10),
        ]);

        PurchaseOrderItem::insert([
            ['purchase_order_id' => $po3->id, 'product_id' => $pixel8->id, 'qty_ordered' => 40, 'unit_cost' => 800.00, 'qty_received' => 20],
        ]);

        // Create corresponding stock-in ledger entries for received quantities
        DB::transaction(function () use ($po3, $pixel8, $wh02, $admin): void {
            StockLedger::create([
                'product_id'     => $pixel8->id,
                'location_id'    => $wh02->id,
                'type'           => 'in',
                'quantity'       => 20,
                'reference_type' => PurchaseOrder::class,
                'reference_id'   => $po3->id,
                'note'           => 'PO Partially Received',
                'created_by'     => $admin->id,
            ]);
            StockLedger::bustCache($pixel8->id, $wh02->id);
        });
    }
}
