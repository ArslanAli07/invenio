<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePurchaseOrderRequest extends FormRequest
{
    /**
     * Admin, Manager, and Staff can create draft purchase orders.
     * PRD §6.3 Authorization Matrix.
     */
    public function authorize(): bool
    {
        return $this->user()->hasRole('admin', 'manager', 'staff');
    }

    public function rules(): array
    {
        return [
            // Header
            'supplier_id'  => ['required', 'integer', 'exists:suppliers,id'],
            'location_id'  => ['required', 'integer', 'exists:locations,id'],
            'expected_at'  => ['nullable', 'date'],
            'notes'        => ['nullable', 'string', 'max:1000'],

            // Line items — at least one row required
            'items'                  => ['required', 'array', 'min:1'],
            'items.*.product_id'     => ['required', 'integer', 'exists:products,id'],
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
            'items.*.qty_ordered.required'   => 'Quantity is required for each line item.',
            'items.*.qty_ordered.min'        => 'Quantity must be greater than zero.',
            'items.*.unit_cost.required'     => 'Unit cost is required for each line item.',
            'items.*.unit_cost.min'          => 'Unit cost cannot be negative.',
        ];
    }
}
