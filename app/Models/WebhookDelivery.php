<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WebhookDelivery extends Model
{
    /**
     * Delivery records are append-only — no updated_at column.
     */
    public $timestamps = false;

    protected $fillable = [
        'webhook_endpoint_id',
        'event',
        'payload',
        'status',
        'response_code',
        'response_body',
        'attempt_count',
        'last_attempted_at',
        'delivered_at',
    ];

    protected function casts(): array
    {
        return [
            'payload'           => 'array',
            'last_attempted_at' => 'datetime',
            'delivered_at'      => 'datetime',
            'created_at'        => 'datetime',
        ];
    }

    // ──────────────────────────────────────────
    // Relationships
    // ──────────────────────────────────────────

    public function endpoint(): BelongsTo
    {
        return $this->belongsTo(WebhookEndpoint::class, 'webhook_endpoint_id');
    }
}
