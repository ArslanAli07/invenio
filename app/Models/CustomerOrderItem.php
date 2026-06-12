<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomerOrderItem extends Model
{
    protected $fillable = [
        'customer_order_id',
        'product_id',
        'variant_id',
        'quantity',
        'unit_price',
    ];

    protected function casts(): array
    {
        return [
            'quantity'   => 'integer',
            'unit_price' => 'decimal:2',
        ];
    }

    // ──────────────────────────────────────────
    // Accessors
    // ──────────────────────────────────────────

    /** Line total = unit_price × quantity */
    public function getLineTotalAttribute(): float
    {
        return (float) $this->unit_price * $this->quantity;
    }

    /** Display label: product name + variant name if applicable */
    public function getDisplayNameAttribute(): string
    {
        $name = $this->product?->name ?? 'Unknown Product';
        if ($this->variant) {
            $name .= ' — ' . $this->variant->name;
        }
        return $name;
    }

    // ──────────────────────────────────────────
    // Relationships
    // ──────────────────────────────────────────

    public function order(): BelongsTo
    {
        return $this->belongsTo(CustomerOrder::class, 'customer_order_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'variant_id');
    }
}
