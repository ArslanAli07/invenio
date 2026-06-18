<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$brands = ['Xiaomi', 'Oppo', 'Vivo', 'Huawei', 'Realme', 'Infinix', 'Tecno', 'Sony', 'Motorola', 'Nokia'];
foreach($brands as $brand) {
    try {
        $cat = \App\Models\Category::firstOrCreate([
            'slug' => \Illuminate\Support\Str::slug($brand)
        ], [
            'name' => $brand,
            'description' => $brand . ' category'
        ]);
        \App\Models\Product::firstOrCreate([
            'slug' => \Illuminate\Support\Str::slug('Dummy ' . $brand . ' Phone')
        ], [
            'name' => 'Dummy ' . $brand . ' Phone',
            'sku' => strtoupper(substr($brand, 0, 3)) . '-DUMMY-01',
            'description' => 'Dummy product for ' . $brand,
            'category_id' => $cat->id,
            'price' => 10000,
            'cost_price' => 8000,
            'unit' => 'piece',
            'show_on_store' => true,
            'is_featured' => false,
        ]);
        echo 'Added ' . $brand . PHP_EOL;
    } catch(\Exception $e) {
        echo 'Error on ' . $brand . ': ' . $e->getMessage() . PHP_EOL;
    }
}
