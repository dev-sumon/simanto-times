<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

test('guests cannot upload editor media', function () {
    $this->post(route('admin.editor-media.store'), [
        'image' => UploadedFile::fake()->image('photo.jpg'),
    ])->assertRedirect(route('login'));
});

test('an authenticated user can upload an editor image', function () {
    Storage::fake('public');

    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('admin.editor-media.store'), [
            'image' => UploadedFile::fake()->image('inline.jpg'),
        ])
        ->assertOk()
        ->assertJsonStructure(['url']);

    $files = Storage::disk('public')->allFiles('editor');

    expect($files)->toHaveCount(1);
});

test('editor media rejects a non-image file', function () {
    Storage::fake('public');

    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('admin.editor-media.store'), [
            'image' => UploadedFile::fake()->create('notes.txt', 10, 'text/plain'),
        ])
        ->assertSessionHasErrors('image');

    expect(Storage::disk('public')->allFiles('editor'))->toBeEmpty();
});
