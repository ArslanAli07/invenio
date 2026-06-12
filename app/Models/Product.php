<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Product extends Model
{
    protected $fillable = [
        'sku',
        'name',
        'slug',
        'description',
        'short_description',
        'price',
        'unit',
        'category_id',
        'reorder_level',
        'is_active',
        'show_on_store',
        'is_featured',
    ];

    protected function casts(): array
    {
        return [
            'reorder_level'  => 'integer',
            'is_active'      => 'boolean',
            'show_on_store'  => 'boolean',
            'is_featured'    => 'boolean',
            'price'          => 'decimal:2',
        ];
    }

    // ──────────────────────────────────────────
    // Model Boot — Auto-generate Slug
    // ──────────────────────────────────────────

    protected static function boot(): void
    {
        parent::boot();

        // Auto-generate slug from name on create if not provided
        static::creating(function (Product $product) {
            if (empty($product->slug)) {
                $product->slug = static::generateUniqueSlug($product->name);
            }
        });

        // Regenerate slug if name changes and no explicit slug was given
        static::updating(function (Product $product) {
            if ($product->isDirty('name') && !$product->isDirty('slug')) {
                $product->slug = static::generateUniqueSlug($product->name, $product->id);
            }
        });
    }

    /**
     * Generate a URL-safe slug from the product name.
     * Appends a numeric suffix if the slug already exists.
     * e.g. "iphone-17-pro-max", "iphone-17-pro-max-2"
     */
    public static function generateUniqueSlug(string $name, ?int $excludeId = null): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $i    = 2;

        while (
            static::where('slug', $slug)
                  ->when($excludeId, fn ($q) => $q->where('id', '!=', $excludeId))
                  ->exists()
        ) {
            $slug = "{$base}-{$i}";
            $i++;
        }

        return $slug;
    }

    // ──────────────────────────────────────────
    // Scopes
    // ──────────────────────────────────────────

    /** Filter to active products only. */
    public function scopeActive(Builder $query): void
    {
        $query->where('is_active', true);
    }

    /** Filter to products visible on the public storefront. */
    public function scopeOnStore(Builder $query): void
    {
        $query->where('is_active', true)->where('show_on_store', true);
    }

    /** Filter to featured products (shown in homepage carousel). */
    public function scopeFeatured(Builder $query): void
    {
        $query->where('is_active', true)
              ->where('show_on_store', true)
              ->where('is_featured', true);
    }

    // ──────────────────────────────────────────
    // Relationships
    // ──────────────────────────────────────────

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function stockLedgerEntries(): HasMany
    {
        return $this->hasMany(StockLedger::class);
    }

    public function purchaseOrderItems(): HasMany
    {
        return $this->hasMany(PurchaseOrderItem::class);
    }

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class)->orderBy('sort_order');
    }

    public function activeVariants(): HasMany
    {
        return $this->hasMany(ProductVariant::class)
                    ->where('is_active', true)
                    ->orderBy('sort_order');
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }

    public function primaryImage(): HasMany
    {
        return $this->hasMany(ProductImage::class)->where('is_primary', true)->limit(1);
    }

    public function specs(): HasMany
    {
        return $this->hasMany(ProductSpec::class)->orderBy('sort_order');
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(CustomerOrderItem::class);
    }
}
