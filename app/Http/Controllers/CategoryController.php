<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Gate;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        Gate::authorize('viewAny', Category::class);

        $query = Category::query();

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('status')) {
            if ($request->status === 'active') {
                $query->active();
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        $categories = $query->withCount('products')
            ->orderBy('name')
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('Categories/Index', [
            'brands' => $categories,
            'filters' => $request->only(['search', 'status']),
            'can' => [
                'create' => $request->user()->can('create', Category::class),
                'update' => $request->user()->can('update', new Category),
                'delete' => $request->user()->can('delete', new Category),
            ]
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCategoryRequest $request)
    {
        $validated = $request->validated();
        $validated['is_active'] = $request->input('is_active', true);

        Category::create($validated);

        return redirect()->route('categories.index')
            ->with('success', 'Brand created successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCategoryRequest $request, Category $category)
    {
        $validated = $request->validated();
        $validated['is_active'] = $request->input('is_active', $category->is_active);

        $category->update($validated);

        return redirect()->route('categories.index')
            ->with('success', 'Brand updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Category $category)
    {
        Gate::authorize('delete', $category);

        // Check if there are products in this category
        if ($category->products()->exists()) {
            return redirect()->route('categories.index')
                ->with('error', 'Cannot delete brand: it has active products.');
        }

        $category->delete();

        return redirect()->route('categories.index')
            ->with('success', 'Brand deleted successfully.');
    }
}
