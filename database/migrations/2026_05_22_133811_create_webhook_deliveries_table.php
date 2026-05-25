<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('webhook_deliveries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('webhook_endpoint_id')->constrained('webhook_endpoints')->onDelete('cascade');
            $table->string('event', 100);
            $table->json('payload');
            $table->enum('status', ['pending', 'delivered', 'failed'])->default('pending');
            $table->smallInteger('response_code')->unsigned()->nullable();
            $table->text('response_body')->nullable();
            $table->tinyInteger('attempt_count')->unsigned()->default(0);
            $table->timestamp('last_attempted_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('created_at')->useCurrent(); // append-only — no updated_at

            // Indexes per PRD §5.10
            $table->index('status', 'idx_delivery_status');
            $table->index('webhook_endpoint_id', 'idx_delivery_endpoint');
            $table->index('created_at', 'idx_delivery_created');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('webhook_deliveries');
    }
};
