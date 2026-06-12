<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Category extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    // ──────────────────────────────────────────
    // Model Boot — Auto-generate Slug
    // ──────────────────────────────────────────

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (Category $category) {
            if (empty($category->slug)) {
                $category->slug = static::generateUniqueSlug($category->name);
            }
        });

        static::updating(function (Category $category) {
            if ($category->isDirty('name') && !$category->isDirty('slug')) {
                $category->slug = static::generateUniqueSlug($category->name, $category->id);
            }
        });
    }

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

    /** Filter to active categories only. */
    public function scopeActive(Builder $query): void
    {
        $query->where('is_active', true);
    }

    /** Categories that have at least one store-visible product (for homepage grid). */
    public function scopeOnStore(Builder $query): void
    {
        $query->where('is_active', true)
              ->whereHas('products', fn ($q) => $q->where('show_on_store', true)->where('is_active', true));
    }

    // ──────────────────────────────────────────
    // Relationships
    // ──────────────────────────────────────────

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function storeProducts(): HasMany
    {
        return $this->hasMany(Product::class)
                    ->where('is_active', true)
                    ->where('show_on_store', true);
    }
}
