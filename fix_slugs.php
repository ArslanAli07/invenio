<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

foreach (\App\Models\Category::all() as $cat) {
    if (!$cat->slug) {
        $cat->slug = \App\Models\Category::generateUniqueSlug($cat->name);
        $cat->save();
        echo "Updated slug for " . $cat->name . "\n";
    }
}
foreach (\App\Models\Product::all() as $prod) {
    if (!$prod->slug) {
        $prod->slug = \App\Models\Product::generateUniqueSlug($prod->name);
        $prod->save();
        echo "Updated slug for " . $prod->name . "\n";
    }
}
echo "Slugs fixed.\n";
