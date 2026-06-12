<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CustomerOrder extends Model
{
    // ──────────────────────────────────────────
    // Status Constants — single source of truth
    // ──────────────────────────────────────────

    const STATUS_PENDING    = 'pending';
    const STATUS_CONFIRMED  = 'confirmed';
    const STATUS_PROCESSING = 'processing';
    const STATUS_SHIPPED    = 'shipped';
    const STATUS_DELIVERED  = 'delivered';
    const STATUS_CANCELLED  = 'cancelled';

    /** Valid status transitions: from → [allowed next statuses] */
    const STATUS_TRANSITIONS = [
        self::STATUS_PENDING    => [self::STATUS_CONFIRMED,  self::STATUS_CANCELLED],
        self::STATUS_CONFIRMED  => [self::STATUS_PROCESSING, self::STATUS_CANCELLED],
        self::STATUS_PROCESSING => [self::STATUS_SHIPPED,    self::STATUS_CANCELLED],
        self::STATUS_SHIPPED    => [self::STATUS_DELIVERED,  self::STATUS_CANCELLED],
        self::STATUS_DELIVERED  => [],
        self::STATUS_CANCELLED  => [],
    ];

    protected $fillable = [
        'order_number',
        'customer_name',
        'customer_phone',
        'customer_city',
        'customer_address',
        'status',
        'subtotal',
        'shipping_fee',
        'total',
        'fulfilling_location_id',
        'notes',
        'cancelled_by',
        'cancelled_at',
        'cancellation_reason',
    ];

    protected function casts(): array
    {
        return [
            'subtotal'       => 'decimal:2',
            'shipping_fee'   => 'decimal:2',
            'total'          => 'decimal:2',
            'cancelled_at'   => 'datetime',
            'created_at'     => 'datetime',
            'updated_at'     => 'datetime',
        ];
    }

    // ──────────────────────────────────────────
    // Model Boot — Auto-generate Order Number
    // ──────────────────────────────────────────

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (CustomerOrder $order) {
            if (empty($order->order_number)) {
                $order->order_number = self::generateOrderNumber();
            }
        });
    }

    /**
     * Generate a unique order number in the format: INV-YYYYMMDD-NNNN
     * e.g. INV-20260612-0001
     *
     * Counts today's orders and increments. Thread-safe enough for small-medium volume.
     */
    public static function generateOrderNumber(): string
    {
        $today = now()->format('Ymd');
        $prefix = "INV-{$today}-";

        $todayCount = static::where('order_number', 'like', "{$prefix}%")->count();
        $sequence   = str_pad($todayCount + 1, 4, '0', STR_PAD_LEFT);

        return "{$prefix}{$sequence}";
    }

    // ──────────────────────────────────────────
    // Accessors & Helpers
    // ──────────────────────────────────────────

    /** Whether this order can be cancelled at its current stage. */
    public function canBeCancelled(): bool
    {
        return in_array(self::STATUS_CANCELLED, self::STATUS_TRANSITIONS[$this->status] ?? []);
    }

    /** Whether a given status is a valid next step from the current status. */
    public function canTransitionTo(string $newStatus): bool
    {
        return in_array($newStatus, self::STATUS_TRANSITIONS[$this->status] ?? []);
    }

    /** Human-readable status label with colour for badges. */
    public function getStatusBadgeAttribute(): array
    {
        return match ($this->status) {
            self::STATUS_PENDING    => ['label' => 'Pending',    'color' => 'yellow'],
            self::STATUS_CONFIRMED  => ['label' => 'Confirmed',  'color' => 'blue'],
            self::STATUS_PROCESSING => ['label' => 'Processing', 'color' => 'purple'],
            self::STATUS_SHIPPED    => ['label' => 'Shipped',    'color' => 'indigo'],
            self::STATUS_DELIVERED  => ['label' => 'Delivered',  'color' => 'green'],
            self::STATUS_CANCELLED  => ['label' => 'Cancelled',  'color' => 'red'],
            default                 => ['label' => 'Unknown',    'color' => 'gray'],
        };
    }

    // ──────────────────────────────────────────
    // Relationships
    // ──────────────────────────────────────────

    public function items(): HasMany
    {
        return $this->hasMany(CustomerOrderItem::class);
    }

    public function fulfillingLocation(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'fulfilling_location_id');
    }

    public function cancelledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cancelled_by');
    }
}
