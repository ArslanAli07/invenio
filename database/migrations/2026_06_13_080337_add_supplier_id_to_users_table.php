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
        Schema::table('users', function (Blueprint $table) {
            // Update enum to include 'supplier'
            DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'manager', 'staff', 'supplier') NOT NULL DEFAULT 'staff'");
            $table->foreignId('supplier_id')->nullable()->constrained()->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['supplier_id']);
            $table->dropColumn('supplier_id');
            // Revert enum
            DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'manager', 'staff') NOT NULL DEFAULT 'staff'");
        });
    }
};
