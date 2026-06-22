<?php

namespace App\Providers;

use App\Models\ActivityLog;
use App\Models\Category;
use App\Models\Location;
use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\StockLedger;
use App\Models\Supplier;
use App\Models\User;
use App\Policies\ActivityLogPolicy;
use App\Policies\CategoryPolicy;
use App\Policies\LocationPolicy;
use App\Policies\ProductPolicy;
use App\Policies\PurchaseOrderPolicy;
use App\Policies\StockLedgerPolicy;
use App\Policies\SupplierPolicy;
use App\Policies\UserPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        // ──────────────────────────────────────────────────────────────
        // Policy registrations — single source of truth for authorization.
        // All policy checks are enforced server-side.
        // Frontend button visibility is UX only — never a security control.
        // PRD §6.3 Authorization Matrix
        // ──────────────────────────────────────────────────────────────
        Gate::policy(User::class,             UserPolicy::class);
        Gate::policy(Category::class,         CategoryPolicy::class);
        Gate::policy(Product::class,          ProductPolicy::class);
        Gate::policy(Location::class,         LocationPolicy::class);
        Gate::policy(Supplier::class,         SupplierPolicy::class);
        Gate::policy(StockLedger::class,      StockLedgerPolicy::class);
        Gate::policy(PurchaseOrder::class,    PurchaseOrderPolicy::class);
        Gate::policy(ActivityLog::class,      ActivityLogPolicy::class);
    }
}

