<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Gate;

class ProductImageController extends Controller
{
    /**
     * Store a newly created image in storage.
     */
    public function store(Request $request, Product $product)
    {
        Gate::authorize('update', $product);

        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,webp,svg|max:5120',
            'variant_id' => 'nullable|exists:product_variants,id',
        ]);

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $path = $file->store('products', 'public');

            // If this is the first image for the product, make it primary
            $isPrimary = !$product->images()->where('is_primary', true)->exists();

            $maxSortOrder = $product->images()->max('sort_order') ?? -1;

            $image = $product->images()->create([
                'variant_id' => $request->variant_id,
                'path' => $path,
                'is_primary' => $isPrimary,
                'sort_order' => $maxSortOrder + 1,
            ]);

            return back()->with('success', 'Image uploaded successfully.');
        }

        return back()->with('error', 'Image upload failed.');
    }

    /**
     * Update the specified image (set primary, update sort_order).
     */
    public function update(Request $request, Product $product, ProductImage $image)
    {
        Gate::authorize('update', $product);

        $request->validate([
            'is_primary' => 'sometimes|boolean',
            'sort_order' => 'sometimes|integer',
            'variant_id' => 'sometimes|nullable|exists:product_variants,id',
        ]);

        if ($request->has('is_primary') && $request->is_primary) {
            // Unset primary from all other images
            $product->images()->update(['is_primary' => false]);
            $image->update(['is_primary' => true]);
        }

        if ($request->has('sort_order')) {
            $image->update(['sort_order' => $request->sort_order]);
        }

        if ($request->has('variant_id')) {
            $image->update(['variant_id' => $request->variant_id]);
        }

        return back()->with('success', 'Image updated.');
    }

    /**
     * Remove the specified image from storage.
     */
    public function destroy(Request $request, Product $product, ProductImage $image)
    {
        Gate::authorize('update', $product);

        Storage::disk('public')->delete($image->path);
        
        $wasPrimary = $image->is_primary;
        $image->delete();

        // If we deleted the primary image, randomly assign a new one if any exist
        if ($wasPrimary) {
            $nextImage = $product->images()->first();
            if ($nextImage) {
                $nextImage->update(['is_primary' => true]);
            }
        }

        return back()->with('success', 'Image deleted.');
    }
}
