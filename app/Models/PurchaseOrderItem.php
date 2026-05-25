<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PurchaseOrderItem extends Model
{
    /**
     * PO items have no timestamps — they're part of the immutable PO record.
     */
    public $timestamps = false;

    protected $fillable = [
        'purchase_order_id',
        'product_id',
        'qty_ordered',
        'unit_cost',
        'qty_received',
    ];

    protected function casts(): array
    {
        return [
            'qty_ordered'  => 'decimal:3',
            'qty_received' => 'decimal:3',
            'unit_cost'    => 'decimal:4',
        ];
    }

    // ──────────────────────────────────────────
    // Computed Accessors
    // ──────────────────────────────────────────

    /** How many units still need to be received. */
    public function getQtyOutstandingAttribute(): float
    {
        return (float) $this->qty_ordered - (float) $this->qty_received;
    }

    /** Total cost for this line (qty_ordered × unit_cost). */
    public function getLineTotalAttribute(): float
    {
        return (float) $this->qty_ordered * (float) $this->unit_cost;
    }

    // ──────────────────────────────────────────
    // Relationships
    // ──────────────────────────────────────────

    public function purchaseOrder(): BelongsTo
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
