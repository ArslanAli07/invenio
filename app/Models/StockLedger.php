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
    // PRD §5.12 — the ONLY correct way to read stock
    // ──────────────────────────────────────────

    /**
     * Compute current stock for a product at a location.
     * Uses 60-second cache (key: "stock.{productId}.{locationId}").
     * Call bustCache() immediately after every new ledger entry.
     */
    public static function computeStock(int $productId, int $locationId): float
    {
        return (float) Cache::remember(
            "stock.{$productId}.{$locationId}",
            60,
            function () use ($productId, $locationId) {
                $result = static::where('product_id', $productId)
                    ->where('location_id', $locationId)
                    ->selectRaw(
                        "SUM(CASE type
                            WHEN 'in'     THEN  quantity
                            WHEN 'out'    THEN -quantity
                            WHEN 'adjust' THEN  quantity
                        END) as current_stock"
                    )
                    ->value('current_stock');

                return $result ?? 0.0;
            }
        );
    }

    /**
     * Bust the stock cache for a product+location pair.
     * MUST be called immediately after every new ledger entry write.
     */
    public static function bustCache(int $productId, int $locationId): void
    {
        Cache::forget("stock.{$productId}.{$locationId}");
    }

    // ──────────────────────────────────────────
    // Relationships
    // ──────────────────────────────────────────

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
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
     * Polymorphic reference — points to the source model (e.g. PurchaseOrder).
     * reference_type = 'App\Models\PurchaseOrder', reference_id = po.id
     */
    public function reference(): MorphTo
    {
        return $this->morphTo('reference');
    }
}
