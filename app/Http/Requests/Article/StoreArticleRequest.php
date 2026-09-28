<?php

namespace App\Http\Requests\Article;

use App\Enums\ArticleStatusEnum;
use App\Enums\ArticleVisibilityEnum;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class StoreArticleRequest extends FormRequest
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
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'alpha_dash', 'unique:articles,slug'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'excerpt' => ['required', 'string'],
            'content' => ['required', 'string'],
            'featured_image' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'status' => ['required', Rule::enum(ArticleStatusEnum::class)],
            'visibility' => ['required', Rule::enum(ArticleVisibilityEnum::class)],
            'is_featured' => ['sometimes', 'boolean'],
            'is_breaking' => ['sometimes', 'boolean'],
            'is_trending' => ['sometimes', 'boolean'],
            'published_at' => ['nullable', 'date'],
            'scheduled_at' => ['nullable', 'date'],
            'seo_title' => ['nullable', 'string', 'max:255'],
            'seo_description' => ['nullable', 'string'],
            'seo_keywords' => ['nullable', 'array'],
            'seo_keywords.*' => ['string', 'max:100'],
            'canonical_url' => ['nullable', 'string', 'max:255'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'title' => 'Title',
            'slug' => 'Slug',
            'category_id' => 'Category',
            'excerpt' => 'Excerpt',
            'content' => 'Content',
            'featured_image' => 'Featured image',
            'status' => 'Status',
            'visibility' => 'Visibility',
            'published_at' => 'Published at',
            'scheduled_at' => 'Scheduled at',
            'seo_title' => 'SEO title',
            'seo_description' => 'SEO description',
            'seo_keywords' => 'SEO keywords',
            'canonical_url' => 'Canonical URL',
        ];
    }

    protected function prepareForValidation(): void
    {
        $slug = $this->input('slug');

        if (! is_string($slug) || trim($slug) === '') {
            $this->merge(['slug' => null]);
        } else {
            $this->merge(['slug' => Str::slug($slug) ?: null]);
        }

        $categoryId = $this->input('category_id');

        if ($categoryId === '' || $categoryId === 'none') {
            $this->merge(['category_id' => null]);
        }

        foreach (['published_at', 'scheduled_at', 'canonical_url', 'seo_title', 'seo_description'] as $field) {
            $value = $this->input($field);

            if (! is_string($value) || trim($value) === '') {
                $this->merge([$field => null]);
            }
        }

        $keywords = $this->input('seo_keywords');

        if (is_string($keywords)) {
            $this->merge([
                'seo_keywords' => collect(explode(',', $keywords))
                    ->map(fn (string $keyword): string => trim($keyword))
                    ->filter()
                    ->values()
                    ->all(),
            ]);
        } elseif (! is_array($keywords)) {
            $this->merge(['seo_keywords' => []]);
        }
    }
}
