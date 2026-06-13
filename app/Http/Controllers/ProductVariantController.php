<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class ProductVariantController extends Controller
{
    public function store(Request $request, Product $product)
    {
        Gate::authorize('update', $product);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'required|string|max:100|unique:product_variants,sku',
            'price' => 'nullable|numeric|min:0',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ]);

        $product->variants()->create($validated);

        return back()->with('success', 'Variant added successfully.');
    }

    public function update(Request $request, Product $product, ProductVariant $variant)
    {
        Gate::authorize('update', $product);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'required|string|max:100|unique:product_variants,sku,' . $variant->id,
            'price' => 'nullable|numeric|min:0',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ]);

        $variant->update($validated);

        return back()->with('success', 'Variant updated.');
    }

    public function destroy(Request $request, Product $product, ProductVariant $variant)
    {
        Gate::authorize('update', $product);

        if ($variant->stockLedgerEntries()->exists()) {
            return back()->with('error', 'Cannot delete variant: it has associated stock logs.');
        }

        $variant->delete();

        return back()->with('success', 'Variant deleted.');
    }
}
