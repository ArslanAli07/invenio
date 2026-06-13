<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductSpec;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class ProductSpecController extends Controller
{
    public function store(Request $request, Product $product)
    {
        Gate::authorize('update', $product);

        $validated = $request->validate([
            'spec_key' => 'required|string|max:100',
            'spec_value' => 'required|string|max:255',
            'sort_order' => 'integer',
        ]);

        $product->specs()->create($validated);

        return back()->with('success', 'Spec added successfully.');
    }

    public function update(Request $request, Product $product, ProductSpec $spec)
    {
        Gate::authorize('update', $product);

        $validated = $request->validate([
            'spec_key' => 'required|string|max:100',
            'spec_value' => 'required|string|max:255',
            'sort_order' => 'integer',
        ]);

        $spec->update($validated);

        return back()->with('success', 'Spec updated.');
    }

    public function destroy(Request $request, Product $product, ProductSpec $spec)
    {
        Gate::authorize('update', $product);

        $spec->delete();

        return back()->with('success', 'Spec deleted.');
    }
}
