<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Customer Orders table.
     *
     * Stores COD orders placed by customers on the public storefront.
     *
     * Order number format: INV-YYYYMMDD-NNNN (auto-generated in model boot)
     *
     * Status lifecycle:
     *   pending → confirmed → processing → shipped → delivered
     *                                                    ↓
     *                                               cancelled (from any stage)
     *
     * fulfilling_location_id: assigned automatically at order time
     *   - Matches customer city to nearest location
     *   - Falls back to location with highest available stock
     *
     * Stock is deducted IMMEDIATELY on order creation (status: pending).
     * On cancellation, stock is fully restored via a reverse ledger entry.
     */
    public function up(): void
    {
        Schema::create('customer_orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number', 30)->unique(); // INV-20260612-0001

            // Customer details
            $table->string('customer_name', 255);
            $table->string('customer_phone', 30);
            $table->string('customer_city', 100);
            $table->text('customer_address');

            // Status
            $table->enum('status', [
                'pending',
                'confirmed',
                'processing',
                'shipped',
                'delivered',
                'cancelled',
            ])->default('pending');

            // Financials (snapshot at time of order)
            $table->decimal('subtotal', 12, 2);
            $table->decimal('shipping_fee', 12, 2)->default(350.00);
            $table->decimal('total', 12, 2);

            // Fulfillment
            $table->foreignId('fulfilling_location_id')
                  ->nullable()
                  ->constrained('locations')
                  ->onDelete('restrict');

            // Staff notes
            $table->text('notes')->nullable();

            // Cancellation audit trail
            $table->foreignId('cancelled_by')
                  ->nullable()
                  ->constrained('users')
                  ->onDelete('restrict');
            $table->timestamp('cancelled_at')->nullable();
            $table->string('cancellation_reason', 500)->nullable();

            $table->timestamps();

            // Indexes for common dashboard queries
            $table->index('status',           'idx_orders_status');
            $table->index('customer_phone',   'idx_orders_phone');
            $table->index('created_at',       'idx_orders_created_at');
            $table->index('fulfilling_location_id', 'idx_orders_location');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customer_orders');
    }
};
