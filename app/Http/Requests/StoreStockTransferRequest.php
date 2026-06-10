<?php

namespace App\Http\Requests;

use App\Models\Location;
use App\Models\Product;
use Illuminate\Foundation\Http\FormRequest;

class StoreStockTransferRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('create', \App\Models\StockTransfer::class);
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'product_id' => [
                'required',
                'exists:products,id',
                function ($attribute, $value, $fail) {
                    $product = Product::find($value);
                    if ($product && !$product->is_active) {
                        $fail('The selected product is inactive and cannot be transferred.');
                    }
                },
            ],
            'from_location_id' => [
                'required',
                'exists:locations,id',
                function ($attribute, $value, $fail) {
                    $location = Location::find($value);
                    if ($location && !$location->is_active) {
                        $fail('The source location is inactive.');
                    }
                },
            ],
            'to_location_id' => [
                'required',
                'exists:locations,id',
                'different:from_location_id',
                function ($attribute, $value, $fail) {
                    $location = Location::find($value);
                    if ($location && !$location->is_active) {
                        $fail('The destination location is inactive.');
                    }
                },
            ],
            'quantity' => 'required|numeric|min:0.001',
            'notes'    => 'nullable|string|max:1000',
        ];
    }

    /**
     * Get the custom validation error messages.
     */
    public function messages(): array
    {
        return [
            'to_location_id.different' => 'The destination location must be different from the source location.',
            'quantity.min' => 'The transfer quantity must be at least 0.001.',
        ];
    }
}
