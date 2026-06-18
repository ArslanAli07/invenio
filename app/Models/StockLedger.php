<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Facades\Cache;

class StockLedger extends Model
{
    /**
     * The table name does not follow Laravel's automatic pluralization.
     * Without this, Laravel would look for 'stock_ledgers'.
     */
    protected $table = 'stock_ledger';

    /**
     * This table has no updated_at column — ledger entries are immutable.
     * created_at is set by the DB default (useCurrent).
     */
    public $timestamps = false;

    protected $fillable = [
        'product_id',
        'variant_id',
        'location_id',
        'type',
        'quantity',
        'reference_type',
        'reference_id',
        'note',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'quantity'   => 'decimal:3',
            'created_at' => 'datetime',
        ];
    }

    // ──────────────────────────────────────────
    // North Star: Stock Computation
    // ──────────────────────────────────────────

    /**
     * Compute current stock for a product (+ optional variant) at a specific location.
     *
     * - For non-variant products: pass variantId = null
     * - For variant products: pass the specific variantId
     *
     * Cache key: "stock.{productId}.{locationId}" or "stock.{productId}.{locationId}.{variantId}"
     * Cache TTL: 60 seconds. Always call bustCache() after writing a new ledger entry.
     */
    public static function computeStock(int $productId, int $locationId, ?int $variantId = null): float
    {
        $cacheKey = self::stockCacheKey($productId, $locationId, $variantId);

        return (float) Cache::remember($cacheKey, 60, function () use ($productId, $locationId, $variantId) {
            $query = static::where('product_id', $productId)
                           ->where('location_id', $locationId);

            if ($variantId !== null) {
                $query->where('variant_id', $variantId);
            } else {
                $query->whereNull('variant_id');
            }

            $result = $query->selectRaw(
                "SUM(CASE type
                    WHEN 'in'     THEN  quantity
                    WHEN 'out'    THEN -quantity
                    WHEN 'adjust' THEN  quantity
                END) as current_stock"
            )->value('current_stock');

            return $result ?? 0.0;
        });
    }

    /**
     * Compute GLOBAL stock for a product (+ optional variant) across ALL locations.
     * Used for the storefront stock badge ("In Stock", "Only 3 Left", "Out of Stock").
     */
    public static function computeGlobalStock(int $productId, ?int $variantId = null): float
    {
        $cacheKey = self::globalStockCacheKey($productId, $variantId);

        return (float) Cache::remember($cacheKey, 60, function () use ($productId, $variantId) {
            $query = static::where('product_id', $productId);

            if ($variantId !== null) {
                $query->where('variant_id', $variantId);
            }

            $result = $query->selectRaw(
                "SUM(CASE type
                    WHEN 'in'     THEN  quantity
                    WHEN 'out'    THEN -quantity
                    WHEN 'adjust' THEN  quantity
                END) as current_stock"
            )->value('current_stock');

            return $result ?? 0.0;
        });
    }

    /**
     * Bust the per-location stock cache for a product+variant+location combination.
     * MUST be called immediately after every ledger entry write.
     */
    public static function bustCache(int $productId, int $locationId, ?int $variantId = null): void
    {
        Cache::forget(self::stockCacheKey($productId, $locationId, $variantId));
        Cache::forget(self::globalStockCacheKey($productId, $variantId));
    }

    // ──────────────────────────────────────────
    // Cache Key Helpers (private)
    // ──────────────────────────────────────────

    private static function stockCacheKey(int $productId, int $locationId, ?int $variantId): string
    {
        return $variantId
            ? "stock.{$productId}.{$locationId}.{$variantId}"
            : "stock.{$productId}.{$locationId}";
    }

    private static function globalStockCacheKey(int $productId, ?int $variantId): string
    {
        return $variantId
            ? "global_stock.{$productId}.{$variantId}"
            : "global_stock.{$productId}";
    }

    // ──────────────────────────────────────────
    // Relationships
    // ──────────────────────────────────────────

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'variant_id');
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Polymorphic reference — points to the source model (e.g. PurchaseOrder, CustomerOrderItem).
     * reference_type = 'App\Models\PurchaseOrder', reference_id = po.id
     */
    public function reference(): MorphTo
    {
        return $this->morphTo('reference');
    }
}
