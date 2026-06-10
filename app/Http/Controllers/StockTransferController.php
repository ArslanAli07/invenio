<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreStockTransferRequest;
use App\Models\Location;
use App\Models\Product;
use App\Models\StockLedger;
use App\Models\StockTransfer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class StockTransferController extends Controller
{
    /**
     * Display a listing of stock transfers.
     */
    public function index(): Response
    {
        Gate::authorize('viewAny', StockTransfer::class);

        $transfers = StockTransfer::with(['product', 'fromLocation', 'toLocation', 'createdBy'])
            ->latest()
            ->paginate(25);

        return Inertia::render('Transfers/Index', [
            'transfers' => $transfers,
        ]);
    }

    /**
     * Show the form for creating a new stock transfer.
     */
    public function create(): Response
    {
        Gate::authorize('create', StockTransfer::class);

        // Fetch active locations
        $locations = Location::active()->orderBy('name')->get(['id', 'name', 'code']);

        // Aggregate stock totals per product and location
        $stockLedgerTotals = DB::table('stock_ledger')
            ->select('product_id', 'location_id')
            ->selectRaw("SUM(CASE type
                WHEN 'in'     THEN  quantity
                WHEN 'out'    THEN -quantity
                WHEN 'adjust' THEN  quantity
            END) as current_stock")
            ->groupBy('product_id', 'location_id')
            ->get();

        $stockMap = [];
        foreach ($stockLedgerTotals as $total) {
            $stockMap[$total->product_id][$total->location_id] = (float)$total->current_stock;
        }

        // Map stock levels onto active products
        $products = Product::active()
            ->orderBy('name')
            ->get(['id', 'sku', 'name', 'unit'])
            ->map(function ($product) use ($stockMap) {
                return [
                    'id'     => $product->id,
                    'sku'    => $product->sku,
                    'name'   => $product->name,
                    'unit'   => $product->unit,
                    'stocks' => $stockMap[$product->id] ?? [],
                ];
            });

        return Inertia::render('Transfers/Create', [
            'products'  => $products,
            'locations' => $locations,
        ]);
    }

    /**
     * Store a newly created stock transfer.
     */
    public function store(StoreStockTransferRequest $request): RedirectResponse
    {
        Gate::authorize('create', StockTransfer::class);

        $qty = (float) $request->quantity;

        // Perform strict availability check
        $availableStock = StockLedger::computeStock($request->product_id, $request->from_location_id);
        if ($availableStock < $qty) {
            return back()->withErrors([
                'quantity' => "Insufficient stock at the source location. Available: {$availableStock}."
            ]);
        }

        // Execute atomic double entry ledger write in a database transaction
        DB::transaction(function () use ($request, $qty) {
            $transfer = StockTransfer::create([
                'product_id'       => $request->product_id,
                'from_location_id' => $request->from_location_id,
                'to_location_id'   => $request->to_location_id,
                'quantity'         => $qty,
                'notes'            => $request->notes,
                'created_by'       => auth()->id(),
            ]);

            $fromLoc = Location::find($request->from_location_id);
            $toLoc   = Location::find($request->to_location_id);

            // 1. Stock Out from source location
            StockLedger::create([
                'product_id'     => $request->product_id,
                'location_id'    => $request->from_location_id,
                'type'           => 'out',
                'quantity'       => $qty,
                'reference_type' => StockTransfer::class,
                'reference_id'   => $transfer->id,
                'note'           => "Transferred to {$toLoc->name}." . ($request->notes ? " Notes: {$request->notes}" : ""),
                'created_by'     => auth()->id(),
            ]);

            // 2. Stock In to destination location
            StockLedger::create([
                'product_id'     => $request->product_id,
                'location_id'    => $request->to_location_id,
                'type'           => 'in',
                'quantity'       => $qty,
                'reference_type' => StockTransfer::class,
                'reference_id'   => $transfer->id,
                'note'           => "Transferred from {$fromLoc->name}." . ($request->notes ? " Notes: {$request->notes}" : ""),
                'created_by'     => auth()->id(),
            ]);

            // 3. Bust caches for both locations
            StockLedger::bustCache($request->product_id, $request->from_location_id);
            StockLedger::bustCache($request->product_id, $request->to_location_id);
        });

        $product = Product::find($request->product_id);
        return redirect()->route('transfers.index')
            ->with('success', "Successfully transferred {$qty} {$product->unit} of {$product->name}.");
    }
}
