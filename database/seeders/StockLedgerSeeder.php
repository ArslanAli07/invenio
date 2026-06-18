<?php

namespace Database\Seeders;

use App\Models\Location;
use App\Models\Product;
use App\Models\StockLedger;
use App\Models\User;
use Illuminate\Database\Seeder;

class StockLedgerSeeder extends Seeder
{
    public function run(): void
    {
        if (StockLedger::exists()) {
            $this->command->warn('StockLedgerSeeder: skipping to prevent duplicates.');
            return;
        }

        $admin     = User::where('email', 'admin@invenio.test')->firstOrFail();
        $wh01      = Location::where('code', 'WH-01')->firstOrFail();
        $wh02      = Location::where('code', 'WH-02')->firstOrFail();
        $store01   = Location::where('code', 'STORE-01')->firstOrFail();

        $stockIn = function (Product $product, Location $location, float $qty, $variantId = null, string $note = 'Initial stock') use ($admin): void {
            StockLedger::create([
                'product_id'  => $product->id,
                'location_id' => $location->id,
                'variant_id'  => $variantId,
                'type'        => 'in',
                'quantity'    => $qty,
                'note'        => $note,
                'created_by'  => $admin->id,
            ]);
            StockLedger::bustCache($product->id, $location->id);
        };

        $products = Product::with('variants')->get();

        foreach ($products as $product) {
            if ($product->variants->count() > 0) {
                // Seed stock specifically for variants
                foreach ($product->variants as $variant) {
                    // Random stock levels for variants
                    $stockIn($product, $wh01, rand(10, 50), $variant->id, 'Initial stock WH-01');
                    $stockIn($product, $wh02, rand(5, 30), $variant->id, 'Initial stock WH-02');
                    $stockIn($product, $store01, rand(2, 10), $variant->id, 'Initial store display stock');
                }
            } else {
                $stockIn($product, $wh01, rand(20, 100), null, 'Initial stock WH-01');
                $stockIn($product, $store01, rand(5, 20), null, 'Initial store display stock');
            }
        }
    }
}
