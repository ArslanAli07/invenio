<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add slug and description to categories.
     *
     * - slug       : SEO-friendly URL segment e.g. "samsung-mobiles"
     * - description: Short blurb shown on the category card on the storefront
     */
    public function up(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->string('slug', 100)->nullable()->unique()->after('name');
            $table->string('description', 300)->nullable()->after('slug');

            $table->index('slug', 'idx_categories_slug');
        });
    }

    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->dropIndex('idx_categories_slug');
            $table->dropColumn(['slug', 'description']);
        });
    }
};
