<?php

namespace Database\Seeders;

use App\Models\Location;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\CustomerOrder;
use App\Models\CustomerOrderItem;
use Illuminate\Database\Seeder;

class CustomerOrderSeeder extends Seeder
{
    public function run(): void
    {
        $loc = Location::first();
        $prod = Product::first();
        $var = ProductVariant::where('product_id', $prod->id)->first();

        if ($loc && $prod) {
            $order = CustomerOrder::create([
                'customer_name' => 'John Doe',
                'customer_phone' => '03001234567',
                'customer_city' => 'Lahore',
                'customer_address' => '123 Main St, Gulberg',
                'status' => 'pending',
                'subtotal' => 150000,
                'shipping_fee' => 350,
                'total' => 150350,
                'fulfilling_location_id' => $loc->id,
                'notes' => 'Test order generated for dashboard preview',
            ]);
            
            CustomerOrderItem::create([
                'customer_order_id' => $order->id,
                'product_id' => $prod->id,
                'variant_id' => $var ? $var->id : null,
                'quantity' => 1,
                'unit_price' => 150000,
            ]);
        }

        $prod2 = Product::skip(1)->first();
        if ($loc && $prod2) {
            $order2 = CustomerOrder::create([
                'customer_name' => 'Jane Smith',
                'customer_phone' => '03119876543',
                'customer_city' => 'Karachi',
                'customer_address' => '456 Sea View Road',
                'status' => 'processing',
                'subtotal' => 85000,
                'shipping_fee' => 350,
                'total' => 85350,
                'fulfilling_location_id' => $loc->id,
                'notes' => 'Another test order',
            ]);
            
            CustomerOrderItem::create([
                'customer_order_id' => $order2->id,
                'product_id' => $prod2->id,
                'variant_id' => null,
                'quantity' => 1,
                'unit_price' => 85000,
            ]);
        }
    }
}
