<?php

namespace App\Services;

use App\Enums\ArticleStatusEnum;
use App\Enums\ArticleVisibilityEnum;
use App\Models\Article;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;

class ArticleService
{
    /**
     * @return LengthAwarePaginator<int, Article>
     */
    public function paginate(string $search): LengthAwarePaginator
    {
        return Article::query()
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($query) use ($search): void {
                    $query->where('title', 'like', "%{$search}%")
                        ->orWhere('slug', 'like', "%{$search}%");
                });
            })
            ->orderBy('title')
            ->orderBy('id')
            ->paginate(10)
            ->withQueryString();
    }

    /**
     * @param  array{
     *     title: string,
     *     slug?: string|null,
     *     category_id?: int|null,
     *     excerpt: string,
     *     content: string,
     *     featured_image: UploadedFile,
     *     status: string,
     *     visibility: string,
     *     is_featured?: bool,
     *     is_breaking?: bool,
     *     is_trending?: bool,
     *     published_at?: string|null,
     *     scheduled_at?: string|null,
     *     seo_title?: string|null,
     *     seo_description?: string|null,
     *     seo_keywords?: list<string>|null,
     *     canonical_url?: string|null
     * }  $data
     */
    public function create(array $data, User $user): Article
    {
        $slug = $this->uniqueSlug($data['slug'] ?? null, $data['title']);
        $status = ArticleStatusEnum::from($data['status']);
        $publishedAt = $data['published_at'] ?? null;

        if ($status === ArticleStatusEnum::PUBLISHED && $publishedAt === null) {
            $publishedAt = now();
        }

        return Article::query()->create([
            'title' => $data['title'],
            'slug' => $slug,
            'user_id' => $user->id,
            'category_id' => $data['category_id'] ?? null,
            'excerpt' => $data['excerpt'],
            'content' => $data['content'],
            'featured_image' => $data['featured_image']->store('articles', 'public'),
            'status' => $status,
            'visibility' => ArticleVisibilityEnum::from($data['visibility']),
            'is_featured' => (bool) ($data['is_featured'] ?? false),
            'is_breaking' => (bool) ($data['is_breaking'] ?? false),
            'is_trending' => (bool) ($data['is_trending'] ?? false),
            'published_at' => $publishedAt,
            'scheduled_at' => $data['scheduled_at'] ?? null,
            'views_count' => 0,
            'reading_time' => $this->readingTime($data['content']),
            'seo_title' => $data['seo_title'] ?: $data['title'],
            'seo_description' => $data['seo_description'] ?: Str::limit(strip_tags($data['excerpt']), 160, ''),
            'seo_keywords' => $data['seo_keywords'] ?? [],
            'canonical_url' => $data['canonical_url'] ?: '/articles/'.$slug,
        ]);
    }

    private function uniqueSlug(?string $slug, string $title, ?int $ignoreId = null): string
    {
        $base = Str::slug($slug ?: $title);

        if ($base === '') {
            $base = 'article';
        }

        $candidate = $base;
        $suffix = 2;

        while (
            Article::query()
                ->where('slug', $candidate)
                ->when($ignoreId !== null, fn ($query) => $query->where('id', '!=', $ignoreId))
                ->exists()
        ) {
            $candidate = $base.'-'.$suffix;
            $suffix++;
        }

        return $candidate;
    }

    private function readingTime(string $content): int
    {
        $words = str_word_count(strip_tags($content));

        if ($words === 0) {
            return 0;
        }

        return max(1, (int) ceil($words / 200));
    }
}
