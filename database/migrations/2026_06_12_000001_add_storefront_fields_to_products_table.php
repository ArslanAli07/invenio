<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add public storefront fields to the products table.
     *
     * - price            : Retail price shown on the store (PKR)
     * - short_description: One-liner for catalogue cards
     * - show_on_store    : Controls public visibility — decoupled from is_active
     * - is_featured      : Flags products shown in the homepage Featured carousel
     * - slug             : SEO-friendly URL segment  e.g. "iphone-17-pro-max"
     *
     * NOTE: `description` (long description) already exists on this table.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('slug', 255)->nullable()->unique()->after('name');
            $table->string('short_description', 500)->nullable()->after('description');
            $table->decimal('price', 12, 2)->nullable()->after('short_description');
            $table->boolean('show_on_store')->default(false)->after('price');
            $table->boolean('is_featured')->default(false)->after('show_on_store');

            $table->index('show_on_store', 'idx_products_show_on_store');
            $table->index('is_featured',   'idx_products_is_featured');
            $table->index('slug',          'idx_products_slug');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex('idx_products_show_on_store');
            $table->dropIndex('idx_products_is_featured');
            $table->dropIndex('idx_products_slug');
            $table->dropColumn(['slug', 'short_description', 'price', 'show_on_store', 'is_featured']);
        });
    }
};
