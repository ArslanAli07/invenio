<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMovementRequest extends FormRequest
{
    /**
     * Only Admin and Manager roles can record stock movements.
     */
    public function authorize(): bool
    {
        return $this->user()->hasRole('admin', 'manager');
    }

    /**
     * Validation rules.
     * Quantity sign rules (positive for in/out, non-zero for adjust) are
     * enforced in the controller alongside the negative-stock guard.
     */
    public function rules(): array
    {
        return [
            'location_id'      => ['required', 'integer', 'exists:locations,id'],
            'variant_id'       => ['nullable', 'integer', 'exists:product_variants,id'],
            'type'             => ['required', 'string', 'in:in,out,adjust'],
            'quantity'         => ['required', 'numeric', 'not_in:0'],
            'reference_source' => ['nullable', 'string', 'max:100'],
            'note'             => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'location_id.required' => 'A location must be selected.',
            'location_id.exists'   => 'The selected location does not exist.',
            'type.required'        => 'Movement type is required.',
            'type.in'              => 'Movement type must be one of: in, out, or adjust.',
            'quantity.required'    => 'Quantity is required.',
            'quantity.numeric'     => 'Quantity must be a valid number.',
            'quantity.not_in'      => 'Quantity cannot be zero.',
            'reference_source.max' => 'Reference must not exceed 100 characters.',
            'note.max'             => 'Notes must not exceed 500 characters.',
        ];
    }
}
