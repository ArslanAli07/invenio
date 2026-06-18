<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Honeypot field
            'honeypot' => 'nullable|string|max:0',
            
            // Customer Details
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'required|string|max:30',
            'customer_city' => 'required|string|max:100',
            'customer_address' => 'required|string|max:1000',
            
            // Cart Items
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.variant_id' => 'nullable|exists:product_variants,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            
            // Financials
            'subtotal' => 'required|numeric|min:0',
            'shipping_fee' => 'required|numeric|min:0',
            'total' => 'required|numeric|min:0',
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $items = $this->input('items', []);
            if (is_array($items)) {
                foreach ($items as $index => $item) {
                    $productId = $item['product_id'] ?? null;
                    $variantId = $item['variant_id'] ?? null;
                    
                    if ($productId) {
                        $product = \App\Models\Product::with('variants')->find($productId);
                        if ($product) {
                            $hasVariants = $product->variants->isNotEmpty();
                            
                            if ($hasVariants && empty($variantId)) {
                                $validator->errors()->add("items.{$index}.variant_id", 'The variant field is required when the selected product has variants.');
                            }
                            if (!$hasVariants && !empty($variantId)) {
                                $validator->errors()->add("items.{$index}.variant_id", 'The selected product does not have variants.');
                            }
                        }
                    }
                }
            }
        });
    }
}
