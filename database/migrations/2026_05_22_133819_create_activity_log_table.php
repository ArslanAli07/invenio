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
        Schema::create('activity_log', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('restrict');
            $table->string('action', 100);               // e.g. stock.adjust, po.sent
            $table->string('model_type', 100)->nullable(); // e.g. App\Models\Product
            $table->unsignedBigInteger('model_id')->nullable();
            $table->json('payload')->nullable();          // { before: {...}, after: {...} }
            $table->string('ip_address', 45)->nullable();
            $table->timestamp('created_at')->useCurrent(); // immutable — no updated_at

            // Indexes per PRD §5.11
            $table->index('user_id', 'idx_log_user');
            $table->index('created_at', 'idx_log_created_at');
            $table->index(['model_type', 'model_id'], 'idx_log_model');
            $table->index('action', 'idx_log_action');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity_log');
    }
};
