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

        // ── Visual Charts Data Aggregations ───────────────────────────────

        // 1. Stock levels by active Location
        $locationStock = DB::table('stock_ledger')
            ->join('locations', 'stock_ledger.location_id', '=', 'locations.id')
            ->where('locations.is_active', true)
            ->select('locations.name as location_name', 'locations.code as location_code')
            ->selectRaw("SUM(CASE stock_ledger.type
                WHEN 'in'     THEN  stock_ledger.quantity
                WHEN 'out'    THEN -stock_ledger.quantity
                WHEN 'adjust' THEN  stock_ledger.quantity
            END) as total_stock")
            ->groupBy('locations.id', 'locations.name', 'locations.code')
            ->get()
            ->map(fn($row) => [
                'name'  => $row->location_name . ' (' . $row->location_code . ')',
                'value' => max(0, (float)$row->total_stock)
            ])
            ->toArray();

        // 2. Stock levels by Category
        $categoryStock = DB::table('stock_ledger')
            ->join('products', 'stock_ledger.product_id', '=', 'products.id')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->select('categories.name as category_name')
            ->selectRaw("SUM(CASE stock_ledger.type
                WHEN 'in'     THEN  stock_ledger.quantity
                WHEN 'out'    THEN -stock_ledger.quantity
                WHEN 'adjust' THEN  stock_ledger.quantity
            END) as total_stock")
            ->groupBy('categories.id', 'categories.name')
            ->get()
            ->map(fn($row) => [
                'name'  => $row->category_name,
                'value' => max(0, (float)$row->total_stock)
            ])
            ->filter(fn($item) => $item['value'] > 0)
            ->values()
            ->toArray();

        // 3. Movements trend for the last 15 days (In vs Out volume per day)
        $trendData = [];
        for ($i = 14; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('m-d');
            $trendData[$date] = [
                'date' => $date,
                'in'   => 0.0,
                'out'  => 0.0,
            ];
        }

        $dbTrend = DB::table('stock_ledger')
            ->where('created_at', '>=', now()->subDays(15)->startOfDay())
            ->selectRaw("strftime('%m-%d', created_at) as date_label")
            ->selectRaw("SUM(CASE WHEN type = 'in' THEN quantity ELSE 0 END) as qty_in")
            ->selectRaw("SUM(CASE WHEN type = 'out' THEN quantity ELSE 0 END) as qty_out")
            ->groupBy('date_label')
            ->get();

        foreach ($dbTrend as $row) {
            if (isset($trendData[$row->date_label])) {
                $trendData[$row->date_label]['in']  = (float)$row->qty_in;
                $trendData[$row->date_label]['out'] = (float)$row->qty_out;
            }
        }
        $movementsTrend = array_values($trendData);

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
            'locationStock'    => $locationStock,
            'categoryStock'    => $categoryStock,
            'movementsTrend'   => $movementsTrend,
        ]);
    }
}
