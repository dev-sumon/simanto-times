<?php

use App\Enums\RoleEnum;
use App\Models\Category;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed([PermissionSeeder::class, RoleSeeder::class]);

    $this->admin = User::factory()->create();
    $this->admin->assignRole(RoleEnum::SUPER_ADMIN->value);
});

test('guests cannot access category management', function () {
    $this->get(route('admin.categories.index'))->assertRedirect(route('login'));
});

test('users without permission are forbidden', function () {
    $plain = User::factory()->create();

    $this->actingAs($plain)->get(route('admin.categories.index'))->assertForbidden();
});

test('super admin can view the categories list', function () {
    Category::factory()->create(['name' => 'National', 'slug' => 'national']);

    $this->actingAs($this->admin)
        ->get(route('admin.categories.index'))
        ->assertOk()
        ->assertInertia(
            fn (Assert $page) => $page
                ->component('admin/categories/index')
                ->has('categories.data', 1)
                ->has('filters.search')
        );
});

test('a category can be created with a slug generated from the name', function () {
    $this->actingAs($this->admin)
        ->post(route('admin.categories.store'), [
            'name' => 'National News',
            'slug' => '',
        ])
        ->assertRedirect(route('admin.categories.index'));

    $this->assertDatabaseHas('categories', [
        'name' => 'National News',
        'slug' => 'national-news',
    ]);
});

test('the slug must be unique', function () {
    Category::factory()->create(['slug' => 'sports']);

    $this->actingAs($this->admin)
        ->post(route('admin.categories.store'), [
            'name' => 'Sports Desk',
            'slug' => 'sports',
        ])
        ->assertSessionHasErrors('slug');
});

test('creating a category validates required fields', function () {
    $this->actingAs($this->admin)
        ->post(route('admin.categories.store'), [
            'name' => '',
        ])
        ->assertSessionHasErrors('name');
});

test('a category can be updated', function () {
    $category = Category::factory()->create([
        'name' => 'World',
        'slug' => 'world',
    ]);

    $this->actingAs($this->admin)
        ->put(route('admin.categories.update', $category), [
            'name' => 'World News',
            'slug' => 'world-news',
        ])
        ->assertRedirect(route('admin.categories.index'));

    expect($category->fresh()->name)->toBe('World News')
        ->and($category->fresh()->slug)->toBe('world-news');
});

test('a category can be deleted', function () {
    $category = Category::factory()->create();

    $this->actingAs($this->admin)
        ->delete(route('admin.categories.destroy', $category))
        ->assertRedirect();

    expect(Category::find($category->id))->toBeNull();
});

test('an editor can create a category', function () {
    $editor = User::factory()->create();
    $editor->assignRole(RoleEnum::EDITOR->value);

    $this->actingAs($editor)
        ->post(route('admin.categories.store'), [
            'name' => 'Politics',
        ])
        ->assertRedirect(route('admin.categories.index'));

    $this->assertDatabaseHas('categories', [
        'name' => 'Politics',
        'slug' => 'politics',
    ]);
});

test('an author can view categories but cannot create them', function () {
    $author = User::factory()->create();
    $author->assignRole(RoleEnum::AUTHOR->value);

    $this->actingAs($author)
        ->get(route('admin.categories.index'))
        ->assertOk();

    $this->actingAs($author)
        ->post(route('admin.categories.store'), [
            'name' => 'Forbidden',
        ])
        ->assertForbidden();
});
