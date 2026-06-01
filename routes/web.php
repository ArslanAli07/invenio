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

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Categories Routes
    Route::get('/categories', [\App\Http\Controllers\CategoryController::class, 'index'])->name('categories.index');
    Route::post('/categories', [\App\Http\Controllers\CategoryController::class, 'store'])->middleware('role:admin,manager')->name('categories.store');
    Route::put('/categories/{category}', [\App\Http\Controllers\CategoryController::class, 'update'])->middleware('role:admin,manager')->name('categories.update');
    Route::delete('/categories/{category}', [\App\Http\Controllers\CategoryController::class, 'destroy'])->middleware('role:admin,manager')->name('categories.destroy');

    // Locations Routes
    Route::get('/locations', [\App\Http\Controllers\LocationController::class, 'index'])->name('locations.index');
    Route::post('/locations', [\App\Http\Controllers\LocationController::class, 'store'])->middleware('role:admin,manager')->name('locations.store');
    Route::put('/locations/{location}', [\App\Http\Controllers\LocationController::class, 'update'])->middleware('role:admin,manager')->name('locations.update');
    Route::delete('/locations/{location}', [\App\Http\Controllers\LocationController::class, 'destroy'])->middleware('role:admin,manager')->name('locations.destroy');

    // Suppliers Routes
    Route::get('/suppliers', [\App\Http\Controllers\SupplierController::class, 'index'])->name('suppliers.index');
    Route::post('/suppliers', [\App\Http\Controllers\SupplierController::class, 'store'])->middleware('role:admin,manager')->name('suppliers.store');
    Route::put('/suppliers/{supplier}', [\App\Http\Controllers\SupplierController::class, 'update'])->middleware('role:admin,manager')->name('suppliers.update');
    Route::delete('/suppliers/{supplier}', [\App\Http\Controllers\SupplierController::class, 'destroy'])->middleware('role:admin,manager')->name('suppliers.destroy');

    // Products Routes
    Route::get('/products', [\App\Http\Controllers\ProductController::class, 'index'])->name('products.index');
    Route::get('/products/{product}', [\App\Http\Controllers\ProductController::class, 'show'])->name('products.show');
    Route::post('/products', [\App\Http\Controllers\ProductController::class, 'store'])->middleware('role:admin,manager')->name('products.store');
    Route::put('/products/{product}', [\App\Http\Controllers\ProductController::class, 'update'])->middleware('role:admin,manager')->name('products.update');
    Route::delete('/products/{product}', [\App\Http\Controllers\ProductController::class, 'destroy'])->middleware('role:admin,manager')->name('products.destroy');
    Route::post('/products/check-sku', [\App\Http\Controllers\ProductController::class, 'checkSku'])->middleware('role:admin,manager')->name('products.check-sku');

    // Stock Movement Routes
    Route::post('/products/{product}/movements', [\App\Http\Controllers\StockMovementController::class, 'store'])
        ->middleware('role:admin,manager')
        ->name('movements.store');
});

require __DIR__.'/auth.php';

