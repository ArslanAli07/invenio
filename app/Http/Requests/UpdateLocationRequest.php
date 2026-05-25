<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateLocationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('location'));
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $locationId = $this->route('location')?->id;

        return [
            'code' => 'required|string|max:50|alpha_dash|unique:locations,code,' . $locationId,
            'name' => 'required|string|max:255',
            'address' => 'nullable|string',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'code.required' => 'The location code is required.',
            'code.unique' => 'This location code is already in use.',
            'code.alpha_dash' => 'The location code may only contain letters, numbers, dashes, and underscores.',
            'code.max' => 'The location code must not exceed 50 characters.',
            'name.required' => 'The location name is required.',
            'name.max' => 'The location name must not exceed 255 characters.',
        ];
    }
}
