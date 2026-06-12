<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Customer Order Items table.
     *
     * Each row is one line item in a customer order.
     * unit_price is a snapshot of the price at the time the order was placed
     * — this protects historical order accuracy if prices change later.
     *
     * variant_id is nullable: if the product has no variants, this is null.
     */
    public function up(): void
    {
        Schema::create('customer_order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_order_id')
                  ->constrained('customer_orders')
                  ->onDelete('cascade');
            $table->foreignId('product_id')
                  ->constrained('products')
                  ->onDelete('restrict');
            $table->foreignId('variant_id')
                  ->nullable()
                  ->constrained('product_variants')
                  ->onDelete('restrict');
            $table->unsignedInteger('quantity');
            $table->decimal('unit_price', 12, 2); // Price snapshot at order time
            $table->timestamps();

            $table->index('customer_order_id', 'idx_order_items_order_id');
            $table->index('product_id',        'idx_order_items_product_id');
            $table->index('variant_id',        'idx_order_items_variant_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customer_order_items');
    }
};
