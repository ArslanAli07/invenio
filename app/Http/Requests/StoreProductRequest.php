<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('create', \App\Models\Product::class);
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'sku' => 'required|string|max:100|unique:products,sku|alpha_dash',
            'name' => 'required|string|max:255',
            'short_description' => 'nullable|string|max:500',
            'description' => 'nullable|string',
            'price' => 'nullable|numeric|min:0',
            'unit' => 'required|string|max:50',
            'category_id' => 'required|exists:categories,id',
            'reorder_level' => 'required|integer|min:0',
            'is_active' => 'boolean',
            'show_on_store' => 'boolean',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'sku.required' => 'The SKU is required.',
            'sku.unique' => 'This SKU is already assigned to another product.',
            'sku.alpha_dash' => 'The SKU may only contain letters, numbers, dashes, and underscores.',
            'sku.max' => 'The SKU must not exceed 100 characters.',
            'name.required' => 'The product name is required.',
            'name.max' => 'The product name must not exceed 255 characters.',
            'unit.required' => 'The unit of measurement is required (e.g. pcs, box, kg).',
            'unit.max' => 'The unit must not exceed 50 characters.',
            'category_id.required' => 'The product category is required.',
            'category_id.exists' => 'The selected category is invalid.',
            'reorder_level.required' => 'The reorder level threshold is required.',
            'reorder_level.integer' => 'The reorder level must be an integer.',
            'reorder_level.min' => 'The reorder level cannot be negative.',
        ];
    }
}
