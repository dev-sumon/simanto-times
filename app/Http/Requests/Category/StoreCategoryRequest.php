<?php

namespace App\Http\Requests\Category;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class StoreCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'alpha_dash', 'unique:categories,slug'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'name' => 'Category name',
            'slug' => 'Slug',
        ];
    }

    protected function prepareForValidation(): void
    {
        $slug = $this->input('slug');

        if (! is_string($slug) || trim($slug) === '') {
            $this->merge(['slug' => null]);

            return;
        }

        $this->merge(['slug' => Str::slug($slug) ?: null]);
    }
}
