<?php

namespace App\Http\Controllers;

use App\Models\Location;
use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\StockLedger;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        // ── Stat cards ────────────────────────────────────────────────────
        $totalProducts  = Product::count();
        $totalLocations = Location::count();
        $openPoCount    = PurchaseOrder::whereIn('status', ['draft', 'sent', 'partially_received'])->count();

        // Low-stock products: those where total ledger qty < reorder_level
        // We subquery the ledger to get total stock per product (across all locations)
        $allProducts = Product::where('is_active', true)
            ->where('reorder_level', '>', 0)
            ->get();

        $lowStockProducts = [];

        foreach ($allProducts as $product) {
            // Sum across ALL locations for this product
            $totalStock = (float) StockLedger::where('product_id', $product->id)
                ->selectRaw(
                    "SUM(CASE type
                        WHEN 'in'     THEN  quantity
                        WHEN 'out'    THEN -quantity
                        WHEN 'adjust' THEN  quantity
                    END) as total"
                )
                ->value('total') ?? 0;

            if ($totalStock < $product->reorder_level) {
                $lowStockProducts[] = [
                    'id'            => $product->id,
                    'sku'           => $product->sku,
                    'name'          => $product->name,
                    'unit'          => $product->unit,
                    'reorder_level' => $product->reorder_level,
                    'total_stock'   => $totalStock,
                    'deficit'       => $product->reorder_level - $totalStock,
                ];
            }
        }

        // Sort by worst deficit first
        usort($lowStockProducts, fn($a, $b) => $b['deficit'] <=> $a['deficit']);

        $lowStockCount = count($lowStockProducts);
        // Cap to 8 for display
        $lowStockProducts = array_slice($lowStockProducts, 0, 8);

        // ── Recent Purchase Orders (last 6) ───────────────────────────────
        $recentPos = PurchaseOrder::with(['supplier', 'location', 'createdBy'])
            ->withCount('items')
            ->latest()
            ->take(6)
            ->get()
            ->map(fn($po) => [
                'id'           => $po->id,
                'po_number'    => $po->po_number,
                'status'       => $po->status,
                'supplier'     => $po->supplier?->name,
                'location'     => $po->location?->name,
                'items_count'  => $po->items_count,
                'expected_at'  => $po->expected_at?->toDateString(),
                'created_at'   => $po->created_at->toDateTimeString(),
            ]);

        // ── Recent Movements (last 10 across all products) ────────────────
        $recentMovements = StockLedger::with(['product', 'location', 'createdBy'])
            ->latest('created_at')
            ->take(10)
            ->get()
            ->map(fn($m) => [
                'id'           => $m->id,
                'type'         => $m->type,
                'quantity'     => (float) $m->quantity,
                'note'         => $m->note,
                'product'      => $m->product?->name,
                'product_id'   => $m->product_id,
                'product_sku'  => $m->product?->sku,
                'location'     => $m->location?->name,
                'created_by'   => $m->createdBy?->name,
                'created_at'   => $m->created_at->toDateTimeString(),
            ]);

        return Inertia::render('Dashboard', [
            'stats' => [
                'total_products'  => $totalProducts,
                'total_locations' => $totalLocations,
                'low_stock_count' => $lowStockCount,
                'open_po_count'   => $openPoCount,
            ],
            'lowStockProducts' => $lowStockProducts,
            'recentPos'        => $recentPos,
            'recentMovements'  => $recentMovements,
        ]);
    }
}
