<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PurchaseOrder extends Model
{
    protected $fillable = [
        'po_number',
        'supplier_id',
        'location_id',
        'status',
        'expected_at',
        'notes',
        'created_by',
        'sent_at',
    ];

    protected function casts(): array
    {
        return [
            'expected_at' => 'date',
            'sent_at'     => 'datetime',
        ];
    }

    // ──────────────────────────────────────────
    // Helpers
    // ──────────────────────────────────────────

    /** Only draft POs can be edited (PRD §6.2). */
    public function isDraft(): bool
    {
        return $this->status === 'draft';
    }

    public function isEditable(): bool
    {
        return $this->isDraft();
    }

    /**
     * Generate a PO number in format: PO-YYYYMM-{4-digit-zero-padded}
     * e.g. PO-202505-0001
     * PRD §6.2.1 — server-side only, never editable.
     */
    public static function generatePoNumber(): string
    {
        $prefix = 'PO-' . now()->format('Ym') . '-';

        // Count existing POs this month and zero-pad to 4 digits
        $count = static::whereRaw("po_number LIKE ?", [$prefix . '%'])->count();

        return $prefix . str_pad((string) ($count + 1), 4, '0', STR_PAD_LEFT);
    }

    // ──────────────────────────────────────────
    // Relationships
    // ──────────────────────────────────────────

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function items(): HasMany
    {
        return $this->hasMany(PurchaseOrderItem::class);
    }
}
