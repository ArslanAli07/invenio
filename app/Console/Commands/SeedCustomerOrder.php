<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Location;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\CustomerOrder;
use App\Models\CustomerOrderItem;
use App\Models\StockLedger;
use Illuminate\Support\Str;

class SeedCustomerOrder extends Command
{
    protected $signature = 'seed:customer-order';
    protected $description = 'Creates a dummy customer order and deducts stock correctly';

    public function handle()
    {
        $loc = Location::first();
        $prod = Product::first();
        if (!$loc || !$prod) {
            $this->error('Need a location and product.');
            return;
        }
        $var = ProductVariant::where('product_id', $prod->id)->first();

        // Check if there's enough stock first (assume there is for dummy)
        // Deduct 2 units of this product.

        $price = $prod->price ?: 50000;

        $order = CustomerOrder::create([
            'customer_name' => 'Ali Khan',
            'customer_phone' => '03009998887',
            'customer_city' => 'Islamabad',
            'customer_address' => 'House 12, Street 5, F-8',
            'status' => 'pending',
            'subtotal' => $price * 2,
            'shipping_fee' => 350,
            'total' => ($price * 2) + 350,
            'fulfilling_location_id' => $loc->id,
            'notes' => 'Dummy order for testing stock deduction and cancellation',
        ]);
        
        $item = CustomerOrderItem::create([
            'customer_order_id' => $order->id,
            'product_id' => $prod->id,
            'variant_id' => $var ? $var->id : null,
            'quantity' => 2,
            'unit_price' => $price,
        ]);

        // When a real customer checks out, we immediately deduct the stock
        // so it cannot be oversold. Here we simulate that manually:
        StockLedger::create([
            'location_id' => $loc->id,
            'product_id' => $prod->id,
            'variant_id' => $var ? $var->id : null,
            'type' => 'out', // Stock going out
            'quantity' => 2, // 2 items ordered
            'reference_type' => 'customer_order',
            'reference_id' => $order->id,
            'notes' => 'Stock reserved for customer order #' . $order->order_number,
            'created_by' => 1,
        ]);
        
        StockLedger::bustCache($prod->id, $loc->id, $var ? $var->id : null);

        $this->info("Created dummy order {$order->order_number} and deducted 2 units from stock.");
    }
}
