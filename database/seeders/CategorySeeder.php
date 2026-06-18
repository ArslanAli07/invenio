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
            'Apple',
            'Samsung',
            'Google',
            'OnePlus',
            'Xiaomi',
            'Sony',
        ];

        foreach ($categories as $name) {
            Category::firstOrCreate(['name' => $name], ['is_active' => true]);
        }
    }
}
