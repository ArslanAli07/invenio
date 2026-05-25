<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Seed the 6 product categories per PRD §11.3.
     */
    public function run(): void
    {
        $categories = [
            'Electronics',
            'Office Supplies',
            'Cleaning',
            'Packaging',
            'Tools',
            'Safety Equipment',
        ];

        foreach ($categories as $name) {
            Category::firstOrCreate(['name' => $name], ['is_active' => true]);
        }
    }
}
