<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCheckoutRequest;
use App\Models\CustomerOrder;
use App\Models\CustomerOrderItem;
use App\Models\Location;
use App\Models\StockLedger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CheckoutController extends Controller
{
    public function cart()
    {
        return Inertia::render('Public/Cart/Index');
    }

    public function checkout()
    {
        return Inertia::render('Public/Checkout/Index');
    }

    public function store(StoreCheckoutRequest $request)
    {
        // 1. Honeypot check (Silent reject to confuse bots)
        if (!empty($request->honeypot)) {
            // Fake success
            return redirect()->route('public.checkout.success', ['order_number' => 'INV-' . date('Ymd') . '-' . rand(1000, 9999)]);
        }

        // 2. reCAPTCHA check (Mocked for now as agreed)
        // In a real app, verify $request->recaptcha_token with Google API here.
        
        $data = $request->validated();
        
        // 3. Location Assignment Logic
        $locationId = $this->determineFulfillingLocation($data['customer_city'], $data['items']);
        
        // 4. Create Order & Items inside a transaction
        $orderNumber = null;
        
        DB::transaction(function () use ($data, $locationId, &$orderNumber) {
            $order = CustomerOrder::create([
                'customer_name' => $data['customer_name'],
                'customer_phone' => $data['customer_phone'],
                'customer_city' => $data['customer_city'],
                'customer_address' => $data['customer_address'],
                'status' => 'pending',
                'subtotal' => $data['subtotal'],
                'shipping_fee' => $data['shipping_fee'],
                'total' => $data['total'],
                'fulfilling_location_id' => $locationId,
            ]);
            
            $orderNumber = $order->order_number; // Auto-generated in boot()
            
            foreach ($data['items'] as $item) {
                // Create Line Item
                $orderItem = CustomerOrderItem::create([
                    'customer_order_id' => $order->id,
                    'product_id' => $item['product_id'],
                    'variant_id' => $item['variant_id'] ?? null,
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                ]);
                
                // Deduct stock IMMEDIATELY (pending order)
                StockLedger::create([
                    'product_id' => $item['product_id'],
                    'variant_id' => $item['variant_id'] ?? null,
                    'location_id' => $locationId,
                    'type' => 'out',
                    'quantity' => $item['quantity'],
                    'reference_type' => CustomerOrderItem::class,
                    'reference_id' => $orderItem->id,
                    'note' => "Customer order #{$order->order_number} — {$order->customer_name}",
                    // 'created_by' is null for customer-placed orders
                ]);
                
                // Bust the stock caches
                StockLedger::bustCache($item['product_id'], $locationId, $item['variant_id'] ?? null);
            }
        });

        // 5. Redirect to success page
        return redirect()->route('public.checkout.success', ['order_number' => $orderNumber]);
    }

    public function success($orderNumber)
    {
        return Inertia::render('Public/Checkout/Success', [
            'orderNumber' => $orderNumber
        ]);
    }

    /**
     * Determine which warehouse will fulfill this order
     */
    private function determineFulfillingLocation(string $city, array $items)
    {
        // Find all active locations
        $locations = Location::active()->get();
        if ($locations->isEmpty()) {
            return null; // Fatal configuration error
        }

        // 1. Try to match location name or address with the city
        $cityLower = strtolower(trim($city));
        foreach ($locations as $loc) {
            if (str_contains(strtolower($loc->name), $cityLower) || 
                str_contains(strtolower($loc->address), $cityLower)) {
                return $loc->id;
            }
        }

        // 2. If no match, find location with the highest stock of the first item
        if (count($items) > 0) {
            $firstItem = $items[0];
            $bestLocationId = $locations->first()->id;
            $maxStock = -999999;

            foreach ($locations as $loc) {
                $stock = StockLedger::computeStock($firstItem['product_id'], $loc->id, $firstItem['variant_id'] ?? null);
                if ($stock > $maxStock) {
                    $maxStock = $stock;
                    $bestLocationId = $loc->id;
                }
            }
            return $bestLocationId;
        }

        // Fallback
        return $locations->first()->id;
    }
}
