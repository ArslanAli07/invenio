<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePurchaseOrderRequest extends FormRequest
{
    /**
     * Only Admin, Manager, and Staff can edit — but only while status is 'draft'.
     * The draft-only gate is enforced separately in the controller via the policy.
     */
    public function authorize(): bool
    {
        return $this->user()->hasRole('admin', 'manager', 'staff');
    }

    public function rules(): array
    {
        return [
            // Header — same rules as store
            'supplier_id'  => ['required', 'integer', 'exists:suppliers,id'],
            'location_id'  => ['required', 'integer', 'exists:locations,id'],
            'expected_at'  => ['nullable', 'date'],
            'notes'        => ['nullable', 'string', 'max:1000'],

            // Line items — at least one row required
            'items'                  => ['required', 'array', 'min:1'],
            'items.*.product_id'     => ['required', 'integer', 'exists:products,id'],
            'items.*.variant_id'     => ['nullable', 'integer', 'exists:product_variants,id'],
            'items.*.qty_ordered'    => ['required', 'numeric', 'min:0.001'],
            'items.*.unit_cost'      => ['required', 'numeric', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'supplier_id.required'           => 'A supplier must be selected.',
            'supplier_id.exists'             => 'The selected supplier does not exist.',
            'location_id.required'           => 'A receiving location must be selected.',
            'location_id.exists'             => 'The selected location does not exist.',
            'expected_at.date'               => 'Expected date must be a valid date.',
            'items.required'                 => 'At least one line item is required.',
            'items.min'                      => 'At least one line item is required.',
            'items.*.product_id.required'    => 'Each line item must have a product.',
            'items.*.product_id.exists'      => 'One or more selected products do not exist.',
            'items.*.variant_id.exists'      => 'One or more selected variants do not exist.',
            'items.*.qty_ordered.required'   => 'Quantity is required for each line item.',
            'items.*.qty_ordered.min'        => 'Quantity must be greater than zero.',
            'items.*.unit_cost.required'     => 'Unit cost is required for each line item.',
            'items.*.unit_cost.min'          => 'Unit cost cannot be negative.',
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
