<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReceiveItemsRequest extends FormRequest
{
    /**
     * Admin, Manager, and Staff can receive PO items.
     * PO must be in 'sent' or 'partially_received' — enforced via policy in the controller.
     * PRD §6.3 Authorization Matrix.
     */
    public function authorize(): bool
    {
        return $this->user()->hasRole('admin', 'manager', 'staff');
    }

    /**
     * Basic structural validation.
     * Per-item guard (qty <= outstanding) is enforced in the controller
     * to avoid racing against the DB state.
     */
    public function rules(): array
    {
        return [
            'items'                  => ['required', 'array', 'min:1'],
            'items.*.item_id'        => ['required', 'integer', 'exists:purchase_order_items,id'],
            'items.*.qty_received'   => ['required', 'numeric', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'items.required'                 => 'At least one item must be provided.',
            'items.*.item_id.required'       => 'Item ID is required.',
            'items.*.item_id.exists'         => 'One or more items do not exist.',
            'items.*.qty_received.required'  => 'Received quantity is required for each item.',
            'items.*.qty_received.min'       => 'Received quantity cannot be negative.',
        ];
    }
}
