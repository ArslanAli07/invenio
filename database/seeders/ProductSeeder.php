<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $cats = Category::pluck('id', 'name');

        $products = [
            // ── Apple ──────────────────────────────────
            [
                'sku' => 'IPH15PM', 'name' => 'iPhone 15 Pro Max', 'unit' => 'pcs', 'category' => 'Apple', 'reorder_level' => 10, 
                'description' => 'A17 Pro chip, Titanium design, 48MP main camera, 5x Telephoto camera.', 'price' => 1199,
                'variants' => [
                    ['sku' => 'IPH15PM-256-NT', 'name' => '256GB Natural Titanium', 'price' => 1199],
                    ['sku' => 'IPH15PM-512-NT', 'name' => '512GB Natural Titanium', 'price' => 1399],
                    ['sku' => 'IPH15PM-256-BT', 'name' => '256GB Black Titanium', 'price' => 1199],
                ]
            ],
            [
                'sku' => 'IPH15', 'name' => 'iPhone 15', 'unit' => 'pcs', 'category' => 'Apple', 'reorder_level' => 15, 
                'description' => 'A16 Bionic chip, Dynamic Island, 48MP main camera.', 'price' => 799,
                'variants' => [
                    ['sku' => 'IPH15-128-BK', 'name' => '128GB Black', 'price' => 799],
                    ['sku' => 'IPH15-256-BK', 'name' => '256GB Black', 'price' => 899],
                    ['sku' => 'IPH15-128-BL', 'name' => '128GB Blue', 'price' => 799],
                ]
            ],

            // ── Samsung ─────────────────────────────
            [
                'sku' => 'GS24U', 'name' => 'Galaxy S24 Ultra', 'unit' => 'pcs', 'category' => 'Samsung', 'reorder_level' => 10, 
                'description' => 'Snapdragon 8 Gen 3, Titanium frame, 200MP camera, built-in S Pen.', 'price' => 1299,
                'variants' => [
                    ['sku' => 'GS24U-256-TG', 'name' => '256GB Titanium Gray', 'price' => 1299],
                    ['sku' => 'GS24U-512-TG', 'name' => '512GB Titanium Gray', 'price' => 1419],
                    ['sku' => 'GS24U-256-TB', 'name' => '256GB Titanium Black', 'price' => 1299],
                ]
            ],
            [
                'sku' => 'GS24', 'name' => 'Galaxy S24', 'unit' => 'pcs', 'category' => 'Samsung', 'reorder_level' => 15, 
                'description' => 'Galaxy AI, Exynos 2400, 50MP camera, Armor Aluminum frame.', 'price' => 799,
                'variants' => [
                    ['sku' => 'GS24-128-OB', 'name' => '128GB Onyx Black', 'price' => 799],
                    ['sku' => 'GS24-256-OB', 'name' => '256GB Onyx Black', 'price' => 859],
                ]
            ],

            // ── Google ──────────────────────────────────
            [
                'sku' => 'PXL8P', 'name' => 'Pixel 8 Pro', 'unit' => 'pcs', 'category' => 'Google', 'reorder_level' => 8, 
                'description' => 'Google Tensor G3, AI features, 50MP main camera, polished aluminum frame.', 'price' => 999,
                'variants' => [
                    ['sku' => 'PXL8P-128-OB', 'name' => '128GB Obsidian', 'price' => 999],
                    ['sku' => 'PXL8P-256-OB', 'name' => '256GB Obsidian', 'price' => 1059],
                    ['sku' => 'PXL8P-128-PO', 'name' => '128GB Porcelain', 'price' => 999],
                ]
            ],

            // ── OnePlus ──────────────────────────────────
            [
                'sku' => 'OP12', 'name' => 'OnePlus 12', 'unit' => 'pcs', 'category' => 'OnePlus', 'reorder_level' => 5, 
                'description' => 'Snapdragon 8 Gen 3, Hasselblad Camera for Mobile, 100W SUPERVOOC charging.', 'price' => 799,
                'variants' => [
                    ['sku' => 'OP12-256-SG', 'name' => '256GB Silky Black', 'price' => 799],
                    ['sku' => 'OP12-512-FE', 'name' => '512GB Flowy Emerald', 'price' => 899],
                ]
            ],
        ];

        foreach ($products as $data) {
            $product = Product::firstOrCreate(
                ['sku' => $data['sku']],
                [
                    'name'          => $data['name'],
                    'description'   => $data['description'],
                    'unit'          => $data['unit'],
                    'category_id'   => $cats[$data['category']],
                    'reorder_level' => $data['reorder_level'],
                    'price'         => $data['price'],
                    'is_active'     => true,
                    'show_on_store' => true,
                ]
            );

            if (isset($data['variants'])) {
                foreach ($data['variants'] as $vIndex => $vData) {
                    $product->variants()->firstOrCreate(
                        ['sku' => $vData['sku']],
                        [
                            'name' => $vData['name'],
                            'price' => $vData['price'],
                            'is_active' => true,
                            'sort_order' => $vIndex,
                        ]
                    );
                }
            }
        }
    }
}
