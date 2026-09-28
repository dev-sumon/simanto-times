<?php

use App\Enums\ArticleStatusEnum;
use App\Enums\ArticleVisibilityEnum;
use App\Enums\RoleEnum;
use App\Models\Article;
use App\Models\Category;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed([PermissionSeeder::class, RoleSeeder::class]);

    $this->admin = User::factory()->create();
    $this->admin->assignRole(RoleEnum::SUPER_ADMIN->value);
});

test('guests cannot access article management', function () {
    $this->get(route('admin.articles.index'))->assertRedirect(route('login'));
});

test('users without permission are forbidden', function () {
    $plain = User::factory()->create();

    $this->actingAs($plain)->get(route('admin.articles.index'))->assertForbidden();
});

test('the create page includes categories and enum options', function () {
    $category = Category::factory()->create(['name' => 'National']);

    $this->actingAs($this->admin)
        ->get(route('admin.articles.create'))
        ->assertOk()
        ->assertInertia(
            fn (Assert $page) => $page
                ->component('admin/articles/create')
                ->where('categories.0.id', $category->id)
                ->where('categories.0.name', 'National')
                ->has('statusOptions', 3)
                ->has('visibilityOptions', 3)
        );
});

test('an article can be created with a slug generated from the title', function () {
    Storage::fake('public');

    $category = Category::factory()->create();
    $image = UploadedFile::fake()->image('hero.jpg');

    $this->actingAs($this->admin)
        ->post(route('admin.articles.store'), [
            'title' => 'City Floods Overnight',
            'slug' => '',
            'category_id' => $category->id,
            'excerpt' => 'Heavy rain hit the city.',
            'content' => str_repeat('word ', 400),
            'featured_image' => $image,
            'status' => ArticleStatusEnum::DRAFT->value,
            'visibility' => ArticleVisibilityEnum::PUBLIC->value,
            'is_featured' => false,
            'is_breaking' => true,
            'is_trending' => false,
            'seo_keywords' => 'weather, flood',
        ])
        ->assertRedirect(route('admin.articles.index'));

    $article = Article::query()->first();

    expect($article)->not->toBeNull()
        ->and($article->title)->toBe('City Floods Overnight')
        ->and($article->slug)->toBe('city-floods-overnight')
        ->and($article->user_id)->toBe($this->admin->id)
        ->and($article->category_id)->toBe($category->id)
        ->and($article->is_breaking)->toBeTrue()
        ->and($article->reading_time)->toBe(2)
        ->and($article->seo_title)->toBe('City Floods Overnight')
        ->and($article->canonical_url)->toBe('/articles/city-floods-overnight')
        ->and($article->seo_keywords)->toBe(['weather', 'flood']);

    Storage::disk('public')->assertExists($article->featured_image);
});

test('publishing without a date stamps the current time', function () {
    Storage::fake('public');

    $this->freezeTime();

    $this->actingAs($this->admin)
        ->post(route('admin.articles.store'), [
            'title' => 'Live Update',
            'excerpt' => 'A short update.',
            'content' => 'Body copy.',
            'featured_image' => UploadedFile::fake()->image('cover.png'),
            'status' => ArticleStatusEnum::PUBLISHED->value,
            'visibility' => ArticleVisibilityEnum::PUBLIC->value,
        ])
        ->assertRedirect(route('admin.articles.index'));

    $article = Article::query()->first();

    expect($article->status)->toBe(ArticleStatusEnum::PUBLISHED)
        ->and($article->published_at?->equalTo(now()))->toBeTrue();
});

test('the slug must be unique', function () {
    Storage::fake('public');

    Article::factory()->create(['slug' => 'sports']);

    $this->actingAs($this->admin)
        ->post(route('admin.articles.store'), [
            'title' => 'Sports Desk',
            'slug' => 'sports',
            'excerpt' => 'Scores and recaps.',
            'content' => 'Full recap.',
            'featured_image' => UploadedFile::fake()->image('sports.jpg'),
            'status' => ArticleStatusEnum::DRAFT->value,
            'visibility' => ArticleVisibilityEnum::PUBLIC->value,
        ])
        ->assertSessionHasErrors('slug');
});

test('creating an article validates required fields', function () {
    $this->actingAs($this->admin)
        ->post(route('admin.articles.store'), [])
        ->assertSessionHasErrors(['title', 'excerpt', 'content', 'featured_image', 'status', 'visibility']);
});
