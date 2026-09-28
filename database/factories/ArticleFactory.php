<?php

namespace Database\Factories;

use App\Enums\ArticleStatusEnum;
use App\Enums\ArticleVisibilityEnum;
use App\Models\Article;
use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Article>
 */
class ArticleFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = fake()->unique()->sentence(6);

        return [
            'title' => $title,
            'slug' => Str::slug($title).'-'.fake()->unique()->numerify('###'),
            'user_id' => User::factory(),
            'category_id' => Category::factory(),
            'excerpt' => fake()->paragraph(),
            'content' => fake()->paragraphs(4, true),
            'featured_image' => 'articles/example.jpg',
            'status' => ArticleStatusEnum::DRAFT,
            'visibility' => ArticleVisibilityEnum::PUBLIC,
            'is_featured' => false,
            'is_breaking' => false,
            'is_trending' => false,
            'published_at' => null,
            'scheduled_at' => null,
            'views_count' => 0,
            'reading_time' => 1,
            'seo_title' => $title,
            'seo_description' => fake()->sentence(),
            'seo_keywords' => ['news'],
            'canonical_url' => '/articles/'.Str::slug($title),
        ];
    }
}
