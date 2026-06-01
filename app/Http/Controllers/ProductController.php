<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use App\Models\Location;
use App\Models\StockLedger;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        Gate::authorize('viewAny', Product::class);

        $query = Product::query()->with('category');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                    ->orWhere('sku', 'like', '%' . $search . '%');
            });
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->filled('status')) {
            if ($request->status === 'active') {
                $query->active();
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        $products = $query->orderBy('sku')
            ->paginate(25)
            ->withQueryString();

        // Optimized bulk stock aggregation to avoid N+1 query loops
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

        $locations = Location::active()->get();

        // Map calculated stocks and low-stock statuses onto the paginated collection
        $products->getCollection()->transform(function ($product) use ($stockMap, $locations) {
            $isLowStock = false;
            $globalStock = 0.0;

            foreach ($locations as $loc) {
                $stock = $stockMap[$product->id][$loc->id] ?? 0.0;
                $globalStock += $stock;

                if ($stock < $product->reorder_level) {
                    $isLowStock = true;
                }
            }

            $product->global_stock = $globalStock;
            $product->is_low_stock = $isLowStock;

            return $product;
        });

        $categories = Category::active()->orderBy('name')->get();

        return Inertia::render('Products/Index', [
            'products' => $products,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category_id', 'status']),
            'can' => [
                'create' => $request->user()->can('create', Product::class),
                'update' => $request->user()->can('update', new Product),
                'delete' => $request->user()->can('delete', new Product),
            ]
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProductRequest $request)
    {
        $validated = $request->validated();
        $validated['is_active'] = $request->input('is_active', true);

        Product::create($validated);

        return redirect()->route('products.index')
            ->with('success', 'Product created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Product $product)
    {
        Gate::authorize('view', $product);

        $product->load('category');

        $locations = Location::active()->orderBy('code')->get();

        // Calculate cached stock values for each location per North Star rule
        $stockLevels = $locations->map(function ($loc) use ($product) {
            $currentStock = StockLedger::computeStock($product->id, $loc->id);
            return [
                'location_id'   => $loc->id,
                'location_code' => $loc->code,
                'location_name' => $loc->name,
                'current_stock' => $currentStock,
                'is_low'        => $currentStock < $product->reorder_level,
            ];
        });

        // Filtered, paginated movement history
        $movements = StockLedger::where('product_id', $product->id)
            ->when($request->filled('filter_location'), fn ($q) =>
                $q->where('location_id', $request->filter_location)
            )
            ->when($request->filled('filter_type'), fn ($q) =>
                $q->where('type', $request->filter_type)
            )
            ->with(['location', 'user'])
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Products/Show', [
            'product'         => $product,
            'stockLevels'     => $stockLevels,
            'movements'       => $movements,
            'movementFilters' => $request->only(['filter_location', 'filter_type']),
            'can'             => [
                'recordMovement' => $request->user()->can('update', $product),
            ],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProductRequest $request, Product $product)
    {
        $validated = $request->validated();
        $validated['is_active'] = $request->input('is_active', $product->is_active);

        $product->update($validated);

        return redirect()->route('products.index')
            ->with('success', 'Product updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Product $product)
    {
        Gate::authorize('delete', $product);

        // Check if there are ledger entries referencing this product
        if ($product->stockLedgerEntries()->exists()) {
            return redirect()->route('products.index')
                ->with('error', 'Cannot delete product: it has associated stock movement logs.');
        }

        $product->delete();

        return redirect()->route('products.index')
            ->with('success', 'Product deleted successfully.');
    }

    /**
     * Check if SKU is available.
     */
    public function checkSku(Request $request)
    {
        $request->validate([
            'sku' => 'required|string|max:100',
            'ignore_id' => 'nullable|integer'
        ]);

        $query = Product::where('sku', $request->sku);

        if ($request->filled('ignore_id')) {
            $query->where('id', '!=', $request->ignore_id);
        }

        return response()->json([
            'available' => !$query->exists()
        ]);
    }
}
