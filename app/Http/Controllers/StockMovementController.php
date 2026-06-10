<?php

namespace App\Http\Controllers;

use App\Models\Location;
use App\Models\Product;
use App\Models\StockLedger;
use App\Http\Requests\StoreMovementRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class StockMovementController extends Controller
{
    /**
     * Global movement log — all stock changes across all products.
     */
    public function index(Request $request): Response
    {
        $query = StockLedger::with(['product', 'location', 'createdBy']);

        if ($search = $request->input('search')) {
            $query->whereHas('product', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku',  'like', "%{$search}%");
            });
        }

        if ($locationId = $request->input('filter_location')) {
            $query->where('location_id', $locationId);
        }

        if ($type = $request->input('filter_type')) {
            $query->where('type', $type);
        }

        if ($from = $request->input('filter_from')) {
            $query->whereDate('created_at', '>=', $from);
        }

        if ($to = $request->input('filter_to')) {
            $query->whereDate('created_at', '<=', $to);
        }

        $movements = $query
            ->orderBy('created_at', 'desc')
            ->paginate(25)
            ->withQueryString();

        $locations = Location::orderBy('name')->get(['id', 'name', 'code']);

        return Inertia::render('Movements/Index', [
            'movements' => $movements,
            'locations' => $locations,
            'filters'   => $request->only([
                'search', 'filter_location', 'filter_type', 'filter_from', 'filter_to',
            ]),
            'summary' => [
                'total'   => StockLedger::count(),
                'in'      => StockLedger::where('type', 'in')->count(),
                'out'     => StockLedger::where('type', 'out')->count(),
                'adjust'  => StockLedger::where('type', 'adjust')->count(),
            ],
        ]);
    }

    /**
     * Record a stock movement (in / out / adjust) against a product.
     *
     * Guards enforced here (in order):
     *   1. Authorization  — Admin / Manager only (via ProductPolicy::update)
     *   2. Active location — rejected at the DB query level
     *   3. Positive quantity — in/out must be > 0
     *   4. Negative-stock guard — out/adjust cannot push stock below 0
     *
     * On success:
     *   - Writes one immutable row to stock_ledger
     *   - Busts the 60-second stock cache for product+location
     *   - Redirects back to the product show page with a success flash
     */
    public function store(StoreMovementRequest $request, Product $product): \Illuminate\Http\RedirectResponse
    {
        Gate::authorize('update', $product);

        $data       = $request->validated();
        $locationId = (int) $data['location_id'];
        $type       = $data['type'];
        $quantity   = (float) $data['quantity'];

        // ── Guard 1: Location must be active ─────────────────────────────────
        $location = Location::where('id', $locationId)->where('is_active', true)->first();

        if (! $location) {
            return back()
                ->withErrors(['location_id' => 'The selected location is inactive or does not exist.'])
                ->withInput();
        }

        // ── Guard 2: Stock-in and Stock-out quantities must be positive ───────
        if (in_array($type, ['in', 'out']) && $quantity <= 0) {
            return back()
                ->withErrors(['quantity' => 'Quantity must be greater than zero for stock-in and stock-out movements.'])
                ->withInput();
        }

        // ── Guard 3: Negative-stock guard ─────────────────────────────────────
        if ($type === 'out') {
            $current = StockLedger::computeStock($product->id, $locationId);

            if ($quantity > $current) {
                return back()
                    ->withErrors([
                        'quantity' => "Insufficient stock at this location. "
                            . "Available: {$current} {$product->unit}.",
                    ])
                    ->withInput();
            }
        }

        if ($type === 'adjust') {
            $current = StockLedger::computeStock($product->id, $locationId);

            if (($current + $quantity) < 0) {
                return back()
                    ->withErrors([
                        'quantity' => "Adjustment would result in negative stock. "
                            . "Current stock at this location: {$current} {$product->unit}.",
                    ])
                    ->withInput();
            }
        }

        // ── Write immutable ledger entry ───────────────────────────────────────
        StockLedger::create([
            'product_id'     => $product->id,
            'location_id'    => $locationId,
            'type'           => $type,
            'quantity'       => $quantity,
            // For manual movements reference_type stores a free-text reference
            // (e.g. "Delivery Note #42"). Phase 4 PO entries will use
            // 'App\Models\PurchaseOrder' + reference_id for polymorphic linking.
            'reference_type' => $data['reference_source'] ?? null,
            'reference_id'   => null,
            'note'           => $data['note'] ?? null,
            'created_by'     => $request->user()->id,
        ]);

        // ── Bust the 60-second stock cache for this product + location ─────────
        StockLedger::bustCache($product->id, $locationId);

        return redirect()
            ->route('products.show', $product)
            ->with('success', 'Stock movement recorded.');
    }
}
