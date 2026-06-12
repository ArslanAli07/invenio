<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add variant_id to purchase_order_items.
     *
     * When receiving a PO for a product that has variants, staff can specify
     * which variant (e.g. 256GB Black) is being received, so stock is
     * correctly attributed to the right variant in the ledger.
     *
     * NULL = non-variant product (existing PO items remain valid).
     */
    public function up(): void
    {
        Schema::table('purchase_order_items', function (Blueprint $table) {
            $table->foreignId('variant_id')
                  ->nullable()
                  ->after('product_id')
                  ->constrained('product_variants')
                  ->onDelete('restrict');

            $table->index('variant_id', 'idx_po_items_variant_id');
        });
    }

    public function down(): void
    {
        Schema::table('purchase_order_items', function (Blueprint $table) {
            $table->dropIndex('idx_po_items_variant_id');
            $table->dropForeign(['variant_id']);
            $table->dropColumn('variant_id');
        });
    }
};
