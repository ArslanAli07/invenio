<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add variant_id to stock_ledger.
     *
     * This column links a stock movement to a specific product variant.
     * - NULL  → movement applies to the product with no variant (non-variant products)
     * - SET   → movement applies to a specific variant (e.g. 256GB Black iPhone)
     *
     * This is a nullable FK so all existing ledger entries remain valid (they're non-variant).
     */
    public function up(): void
    {
        Schema::table('stock_ledger', function (Blueprint $table) {
            $table->foreignId('variant_id')
                  ->nullable()
                  ->after('product_id')
                  ->constrained('product_variants')
                  ->onDelete('restrict');

            $table->index('variant_id', 'idx_ledger_variant_id');
            // Composite index for variant-level stock queries
            $table->index(['product_id', 'variant_id', 'location_id'], 'idx_ledger_product_variant_location');
        });
    }

    public function down(): void
    {
        Schema::table('stock_ledger', function (Blueprint $table) {
            $table->dropIndex('idx_ledger_variant_id');
            $table->dropIndex('idx_ledger_product_variant_location');
            $table->dropForeign(['variant_id']);
            $table->dropColumn('variant_id');
        });
    }
};
