<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PublicController extends Controller
{
    public function home()
    {
        $featuredProducts = Product::where('show_on_store', true)
            ->where('is_featured', true)
            ->with(['primaryImage', 'variants'])
            ->get();

        $featuredProducts->transform(function ($product) {
            $product->global_stock = \App\Models\StockLedger::computeGlobalStock($product->id);
            return $product;
        });

        $categories = Category::whereHas('products', function ($query) {
            $query->where('show_on_store', true);
        })->get();

        return Inertia::render('Public/Home', [
            'featuredProducts' => $featuredProducts,
            'brands' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $query = Product::where('show_on_store', true)
            ->with(['category', 'primaryImage', 'variants']);

        if ($request->has('search') && $request->search) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('sku', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->has('storage') && $request->storage) {
            $query->whereHas('variants', function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->storage . '%');
            });
        }

        if ($request->has('ram') && $request->ram) {
            $query->whereHas('variants', function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->ram . '%');
            });
        }

        if ($request->has('min_price') && $request->min_price !== null) {
            $query->where('price', '>=', $request->min_price);
        }

        if ($request->has('max_price') && $request->max_price !== null) {
            $query->where('price', '<=', $request->max_price);
        }

        if ($request->has('sort')) {
            if ($request->sort === 'price_asc') {
                $query->orderBy('price', 'asc');
            } elseif ($request->sort === 'price_desc') {
                $query->orderBy('price', 'desc');
            } else {
                $query->latest();
            }
        } else {
            $query->latest();
        }

        $products = $query->paginate(24)->withQueryString();
        $products->getCollection()->transform(function ($product) {
            $product->global_stock = \App\Models\StockLedger::computeGlobalStock($product->id);
            return $product;
        });

        return Inertia::render('Public/Store/Index', [
            'products' => $products,
            'brands' => Category::has('products')->get(),
            'currentbrand' => null,
            'filters' => (object) $request->only(['search', 'sort', 'storage', 'ram', 'min_price', 'max_price']),
        ]);
    }

    public function category(Request $request, $category_slug)
    {
        $category = Category::where('slug', $category_slug)->firstOrFail();

        $query = Product::where('show_on_store', true)
            ->where('category_id', $category->id)
            ->with(['category', 'primaryImage', 'variants']);

        if ($request->has('search') && $request->search) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('sku', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->has('storage') && $request->storage) {
            $query->whereHas('variants', function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->storage . '%');
            });
        }

        if ($request->has('ram') && $request->ram) {
            $query->whereHas('variants', function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->ram . '%');
            });
        }

        if ($request->has('min_price') && $request->min_price !== null) {
            $query->where('price', '>=', $request->min_price);
        }

        if ($request->has('max_price') && $request->max_price !== null) {
            $query->where('price', '<=', $request->max_price);
        }

        if ($request->has('sort')) {
            if ($request->sort === 'price_asc') {
                $query->orderBy('price', 'asc');
            } elseif ($request->sort === 'price_desc') {
                $query->orderBy('price', 'desc');
            } else {
                $query->latest();
            }
        } else {
            $query->latest();
        }

        $products = $query->paginate(24)->withQueryString();
        $products->getCollection()->transform(function ($product) {
            $product->global_stock = \App\Models\StockLedger::computeGlobalStock($product->id);
            return $product;
        });

        return Inertia::render('Public/Store/Index', [
            'products' => $products,
            'brands' => Category::has('products')->get(),
            'currentbrand' => $category,
            'filters' => (object) $request->only(['search', 'sort', 'storage', 'ram', 'min_price', 'max_price']),
        ]);
    }

    public function product($category_slug, $product_slug)
    {
        $product = Product::where('slug', $product_slug)
            ->where('show_on_store', true)
            ->with(['category', 'images', 'primaryImage', 'variants', 'specs'])
            ->firstOrFail();

        if ($category_slug !== 'all' && $product->category && $product->category->slug !== $category_slug) {
            abort(404);
        }

        $relatedProducts = Product::where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->where('show_on_store', true)
            ->with(['primaryImage', 'variants'])
            ->inRandomOrder()
            ->take(4)
            ->get();

        $product->global_stock = \App\Models\StockLedger::computeGlobalStock($product->id);
        
        $product->variants->transform(function ($variant) use ($product) {
            $variant->global_stock = \App\Models\StockLedger::computeGlobalStock($product->id, $variant->id);
            return $variant;
        });

        $relatedProducts->transform(function ($rp) {
            $rp->global_stock = \App\Models\StockLedger::computeGlobalStock($rp->id);
            return $rp;
        });

        return Inertia::render('Public/Store/Show', [
            'product' => $product,
            'relatedProducts' => $relatedProducts,
        ]);
    }

    public function about()
    {
        return Inertia::render('Public/About');
    }

    public function contact()
    {
        return Inertia::render('Public/Contact');
    }
}
