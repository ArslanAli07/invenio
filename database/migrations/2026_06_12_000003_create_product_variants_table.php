<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Product Variants table.
     *
     * A variant represents a specific configuration of a product.
     * e.g. iPhone 17 Pro Max → "256GB Midnight Black", "512GB Gold"
     *
     * Each variant:
     *  - Has its own SKU (for unambiguous stock tracking)
     *  - Can override the parent product's base price
     *  - Tracks its own stock via stock_ledger.variant_id
     */
    public function up(): void
    {
        Schema::create('product_variants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')
                  ->constrained('products')
                  ->onDelete('cascade');   // Deleting a product removes all its variants
            $table->string('name', 255);   // e.g. "256GB — Midnight Black"
            $table->string('sku', 100)->unique();
            $table->decimal('price', 12, 2)->nullable(); // null = use parent product price
            $table->boolean('is_active')->default(true);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index('product_id',  'idx_variants_product_id');
            $table->index('is_active',   'idx_variants_is_active');
            $table->index('sort_order',  'idx_variants_sort_order');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_variants');
    }
};
