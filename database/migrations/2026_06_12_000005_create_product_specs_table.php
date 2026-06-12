<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Product Specs table.
     *
     * Stores key-value technical specifications for a product.
     * e.g. RAM → 8GB, Battery → 4000mAh, Display → 6.7" AMOLED
     *
     * Displayed as a clean specs table on the product detail page.
     * Ordered by sort_order for full admin control over display sequence.
     */
    public function up(): void
    {
        Schema::create('product_specs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')
                  ->constrained('products')
                  ->onDelete('cascade');
            $table->string('spec_key', 100);    // e.g. "RAM", "Battery", "Display"
            $table->string('spec_value', 255);  // e.g. "8GB", "4000mAh", "6.7\" AMOLED"
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index('product_id',  'idx_specs_product_id');
            $table->index('sort_order',  'idx_specs_sort_order');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_specs');
    }
};
