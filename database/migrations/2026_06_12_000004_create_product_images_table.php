<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Product Images table.
     *
     * Supports multiple images per product and optionally per variant.
     * Images are stored in Laravel local storage: storage/app/public/products/
     * Publicly accessible at: /storage/products/{filename}
     *
     * Rules:
     *  - If variant_id is null  → image belongs to the product generally
     *  - If variant_id is set   → image shown when that specific variant is selected
     *  - is_primary = true      → used as the catalogue card thumbnail
     *  - Only one image per product should be is_primary = true
     */
    public function up(): void
    {
        Schema::create('product_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')
                  ->constrained('products')
                  ->onDelete('cascade');
            $table->foreignId('variant_id')
                  ->nullable()
                  ->constrained('product_variants')
                  ->onDelete('cascade');
            $table->string('path', 500);          // e.g. "products/42/iphone-front.webp"
            $table->string('alt_text', 255)->nullable(); // Accessibility + SEO
            $table->boolean('is_primary')->default(false);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index('product_id',           'idx_images_product_id');
            $table->index(['product_id', 'is_primary'], 'idx_images_primary');
            $table->index('variant_id',           'idx_images_variant_id');
            $table->index('sort_order',           'idx_images_sort_order');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_images');
    }
};
