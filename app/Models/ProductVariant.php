<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductVariant extends Model
{
    protected $fillable = [
        'product_id',
        'name',
        'sku',
        'price',
        'is_active',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'price'      => 'decimal:2',
            'is_active'  => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    // ──────────────────────────────────────────
    // Accessors
    // ──────────────────────────────────────────

    /**
     * Effective price: uses variant price if set, falls back to parent product price.
     * This means admin only needs to set a price if the variant differs from base.
     */
    public function getEffectivePriceAttribute(): ?float
    {
        return $this->price !== null
            ? (float) $this->price
            : ($this->product ? (float) $this->product->price : null);
    }

    // ──────────────────────────────────────────
    // Relationships
    // ──────────────────────────────────────────

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class, 'variant_id');
    }

    public function stockLedgerEntries(): HasMany
    {
        return $this->hasMany(StockLedger::class, 'variant_id');
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(CustomerOrderItem::class, 'variant_id');
    }
}
