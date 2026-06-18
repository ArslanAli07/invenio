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

    public function bulkUpdate(Request $request, Product $product)
    {
        Gate::authorize('update', $product);

        $validated = $request->validate([
            'specs' => 'array',
            'specs.*.id' => 'nullable|integer|exists:product_specs,id',
            'specs.*.spec_group' => 'nullable|string|max:100',
            'specs.*.spec_key' => 'required|string|max:100',
            'specs.*.spec_value' => 'nullable|string|max:255',
            'specs.*.sort_order' => 'nullable|integer',
        ]);

        $incomingIds = collect($validated['specs'] ?? [])->pluck('id')->filter()->toArray();

        // Delete specs that are no longer present
        $product->specs()->whereNotIn('id', $incomingIds)->delete();

        // Update or create specs
        foreach ($validated['specs'] ?? [] as $index => $specData) {
            // Null values are fine, we just store empty strings if missing (but we made it nullable in validation to allow empty strings during edit)
            $value = $specData['spec_value'] ?? '';
            $sortOrder = $specData['sort_order'] ?? $index;

            if (!empty($specData['id'])) {
                $product->specs()->where('id', $specData['id'])->update([
                    'spec_group' => $specData['spec_group'] ?? null,
                    'spec_key' => $specData['spec_key'],
                    'spec_value' => $value,
                    'sort_order' => $sortOrder,
                ]);
            } else {
                $product->specs()->create([
                    'spec_group' => $specData['spec_group'] ?? null,
                    'spec_key' => $specData['spec_key'],
                    'spec_value' => $value,
                    'sort_order' => $sortOrder,
                ]);
            }
        }

        return back()->with('success', 'Specifications saved successfully.');
    }
}
