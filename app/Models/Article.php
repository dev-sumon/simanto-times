<?php

namespace App\Models;

use App\Enums\ArticleStatusEnum;
use App\Enums\ArticleVisibilityEnum;
use Database\Factories\ArticleFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Article extends Model
{
    /** @use HasFactory<ArticleFactory> */
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'user_id',
        'category_id',
        'excerpt',
        'content',
        'featured_image',
        'status',
        'visibility',
        'is_featured',
        'is_breaking',
        'is_trending',
        'published_at',
        'scheduled_at',
        'views_count',
        'reading_time',
        'seo_title',
        'seo_description',
        'seo_keywords',
        'canonical_url',
        'created_at',
        'updated_at',
    ];

    protected $casts = [
        'status' => ArticleStatusEnum::class,
        'visibility' => ArticleVisibilityEnum::class,
        'is_featured' => 'boolean',
        'is_breaking' => 'boolean',
        'is_trending' => 'boolean',
        'seo_keywords' => 'array',
        'published_at' => 'datetime',
        'scheduled_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'category_id');
    }
}
