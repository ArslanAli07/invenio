<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\StockLedger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class StockAdjustmentController extends Controller
{
    /**
     * Store a manual stock adjustment.
     */
    public function store(Request $request)
    {
        Gate::authorize('create', StockLedger::class);

        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'variant_id' => 'nullable|exists:product_variants,id',
            'location_id' => 'required|exists:locations,id',
            'type' => 'required|in:add,remove',
            'quantity' => 'required|numeric|min:0.001',
            'reason' => 'required|string|max:500',
        ]);

        $ledgerType = 'adjust';
        $quantity = $validated['type'] === 'remove' ? -$validated['quantity'] : $validated['quantity'];

        // Perform the ledger write
        StockLedger::create([
            'product_id' => $validated['product_id'],
            'variant_id' => $validated['variant_id'],
            'location_id' => $validated['location_id'],
            'type' => $ledgerType,
            'quantity' => $quantity,
            'note' => 'Manual Adjustment: ' . $validated['reason'],
            'created_by' => $request->user()->id,
            'reference_type' => null,
            'reference_id' => null,
        ]);

        // Bust cache
        StockLedger::bustCache(
            $validated['product_id'], 
            $validated['location_id'], 
            $validated['variant_id']
        );

        return back()->with('success', 'Stock adjusted successfully.');
    }
}
