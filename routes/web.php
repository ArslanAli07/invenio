<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('dashboard');
    }
    return redirect()->route('login');
});

Route::get('/dashboard', [\App\Http\Controllers\DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Categories Routes
    Route::get('/categories', [\App\Http\Controllers\CategoryController::class, 'index'])->middleware('role:admin,manager,staff')->name('categories.index');
    Route::post('/categories', [\App\Http\Controllers\CategoryController::class, 'store'])->middleware('role:admin,manager')->name('categories.store');
    Route::put('/categories/{category}', [\App\Http\Controllers\CategoryController::class, 'update'])->middleware('role:admin,manager')->name('categories.update');
    Route::delete('/categories/{category}', [\App\Http\Controllers\CategoryController::class, 'destroy'])->middleware('role:admin,manager')->name('categories.destroy');

    // Locations Routes
    Route::get('/locations', [\App\Http\Controllers\LocationController::class, 'index'])->middleware('role:admin,manager,staff')->name('locations.index');
    Route::post('/locations', [\App\Http\Controllers\LocationController::class, 'store'])->middleware('role:admin,manager')->name('locations.store');
    Route::put('/locations/{location}', [\App\Http\Controllers\LocationController::class, 'update'])->middleware('role:admin,manager')->name('locations.update');
    Route::delete('/locations/{location}', [\App\Http\Controllers\LocationController::class, 'destroy'])->middleware('role:admin,manager')->name('locations.destroy');

    // Suppliers Routes
    Route::get('/suppliers', [\App\Http\Controllers\SupplierController::class, 'index'])->middleware('role:admin,manager,staff')->name('suppliers.index');
    Route::post('/suppliers', [\App\Http\Controllers\SupplierController::class, 'store'])->middleware('role:admin,manager')->name('suppliers.store');
    Route::put('/suppliers/{supplier}', [\App\Http\Controllers\SupplierController::class, 'update'])->middleware('role:admin,manager')->name('suppliers.update');
    Route::delete('/suppliers/{supplier}', [\App\Http\Controllers\SupplierController::class, 'destroy'])->middleware('role:admin,manager')->name('suppliers.destroy');

    // Products Routes
    Route::get('/products', [\App\Http\Controllers\ProductController::class, 'index'])->middleware('role:admin,manager,staff')->name('products.index');
    Route::get('/products/{product}', [\App\Http\Controllers\ProductController::class, 'show'])->middleware('role:admin,manager,staff')->name('products.show');
    Route::post('/products', [\App\Http\Controllers\ProductController::class, 'store'])->middleware('role:admin,manager')->name('products.store');
    Route::put('/products/{product}', [\App\Http\Controllers\ProductController::class, 'update'])->middleware('role:admin,manager')->name('products.update');
    Route::delete('/products/{product}', [\App\Http\Controllers\ProductController::class, 'destroy'])->middleware('role:admin,manager')->name('products.destroy');
    Route::post('/products/check-sku', [\App\Http\Controllers\ProductController::class, 'checkSku'])->middleware('role:admin,manager')->name('products.check-sku');

    // Product Images
    Route::post('/products/{product}/images', [\App\Http\Controllers\ProductImageController::class, 'store'])->middleware('role:admin,manager')->name('products.images.store');
    Route::patch('/products/{product}/images/{image}', [\App\Http\Controllers\ProductImageController::class, 'update'])->middleware('role:admin,manager')->name('products.images.update');
    Route::delete('/products/{product}/images/{image}', [\App\Http\Controllers\ProductImageController::class, 'destroy'])->middleware('role:admin,manager')->name('products.images.destroy');

    // Product Variants
    Route::post('/products/{product}/variants', [\App\Http\Controllers\ProductVariantController::class, 'store'])->middleware('role:admin,manager')->name('products.variants.store');
    Route::put('/products/{product}/variants/{variant}', [\App\Http\Controllers\ProductVariantController::class, 'update'])->middleware('role:admin,manager')->name('products.variants.update');
    Route::delete('/products/{product}/variants/{variant}', [\App\Http\Controllers\ProductVariantController::class, 'destroy'])->middleware('role:admin,manager')->name('products.variants.destroy');

    // Product Specs
    Route::post('/products/{product}/specs', [\App\Http\Controllers\ProductSpecController::class, 'store'])->middleware('role:admin,manager')->name('products.specs.store');
    Route::put('/products/{product}/specs/{spec}', [\App\Http\Controllers\ProductSpecController::class, 'update'])->middleware('role:admin,manager')->name('products.specs.update');
    Route::delete('/products/{product}/specs/{spec}', [\App\Http\Controllers\ProductSpecController::class, 'destroy'])->middleware('role:admin,manager')->name('products.specs.destroy');

    // Manual Stock Adjustment
    Route::post('/stock-adjustments', [\App\Http\Controllers\StockAdjustmentController::class, 'store'])->middleware('role:admin,manager')->name('stock-adjustments.store');

    // Stock Movement Routes
    Route::get('/movements', [\App\Http\Controllers\StockMovementController::class, 'index'])->middleware('role:admin,manager,staff')->name('movements.index');
    Route::post('/products/{product}/movements', [\App\Http\Controllers\StockMovementController::class, 'store'])
        ->middleware('role:admin,manager')
        ->name('movements.store');

    // Stock Transfer Routes
    Route::get('/transfers', [\App\Http\Controllers\StockTransferController::class, 'index'])->middleware('role:admin,manager,staff')->name('transfers.index');
    Route::get('/transfers/create', [\App\Http\Controllers\StockTransferController::class, 'create'])->middleware('role:admin,manager,staff')->name('transfers.create');
    Route::post('/transfers', [\App\Http\Controllers\StockTransferController::class, 'store'])->name('transfers.store');

    // Purchase Order Routes
    // NOTE: specific routes (create, index) come before the {purchaseOrder} wildcard to avoid conflicts
    Route::get('/purchase-orders',             [\App\Http\Controllers\PurchaseOrderController::class, 'index'])->name('po.index');
    Route::get('/purchase-orders/create',      [\App\Http\Controllers\PurchaseOrderController::class, 'create'])->name('po.create');
    Route::post('/purchase-orders',            [\App\Http\Controllers\PurchaseOrderController::class, 'store'])->middleware('role:admin,manager,staff')->name('po.store');
    Route::get('/purchase-orders/{purchaseOrder}',       [\App\Http\Controllers\PurchaseOrderController::class, 'show'])->name('po.show');
    Route::get('/purchase-orders/{purchaseOrder}/edit',  [\App\Http\Controllers\PurchaseOrderController::class, 'edit'])->name('po.edit');
    Route::put('/purchase-orders/{purchaseOrder}',       [\App\Http\Controllers\PurchaseOrderController::class, 'update'])->middleware('role:admin,manager,staff')->name('po.update');
    Route::post('/purchase-orders/{purchaseOrder}/send',    [\App\Http\Controllers\PurchaseOrderController::class, 'send'])->middleware('role:admin,manager')->name('po.send');
    Route::post('/purchase-orders/{purchaseOrder}/receive', [\App\Http\Controllers\PurchaseOrderController::class, 'receive'])->middleware('role:admin,manager,staff')->name('po.receive');
    Route::post('/purchase-orders/{purchaseOrder}/cancel',  [\App\Http\Controllers\PurchaseOrderController::class, 'cancel'])->middleware('role:admin,manager')->name('po.cancel');
    Route::delete('/purchase-orders/{purchaseOrder}',    [\App\Http\Controllers\PurchaseOrderController::class, 'destroy'])->middleware('role:admin')->name('po.destroy');

    // Customer Order Routes
    Route::get('/orders', [\App\Http\Controllers\CustomerOrderController::class, 'index'])->middleware('role:admin,manager,staff')->name('orders.index');
    Route::get('/orders/{order}', [\App\Http\Controllers\CustomerOrderController::class, 'show'])->middleware('role:admin,manager,staff')->name('orders.show');
    Route::patch('/orders/{order}/status', [\App\Http\Controllers\CustomerOrderController::class, 'updateStatus'])->middleware('role:admin,manager')->name('orders.update-status');
    Route::post('/orders/{order}/cancel', [\App\Http\Controllers\CustomerOrderController::class, 'cancel'])->middleware('role:admin,manager')->name('orders.cancel');

    // User Management Routes (admin + manager only)
    Route::get('/users',           [\App\Http\Controllers\UserController::class, 'index'])->middleware('role:admin,manager')->name('users.index');
    Route::post('/users',          [\App\Http\Controllers\UserController::class, 'store'])->middleware('role:admin,manager')->name('users.store');
    Route::put('/users/{user}',    [\App\Http\Controllers\UserController::class, 'update'])->middleware('role:admin,manager')->name('users.update');
    Route::delete('/users/{user}', [\App\Http\Controllers\UserController::class, 'destroy'])->middleware('role:admin')->name('users.destroy');
});

require __DIR__.'/auth.php';

