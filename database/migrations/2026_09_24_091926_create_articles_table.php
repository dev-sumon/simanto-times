<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Enums\ArticleStatusEnum;
use App\Enums\ArticleVisibilityEnum;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('articles', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->foreignId('user_id')->unsignedBigInteger()->nullable();
            $table->foreignId('category_id')->unsignedBigInteger()->nullable();
            $table->longText('excerpt');
            $table->longText('content');
            $table->string('featured_image');
            $table->string('status')->default(ArticleStatusEnum::DRAFT->value);
            $table->string('visibility')->default(ArticleVisibilityEnum::PUBLIC->value);
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_breaking')->default(false);
            $table->boolean('is_trending')->default(false);
            $table->timestamp('published_at')->nullable();
            $table->timestamp('scheduled_at')->nullable();
            $table->bigInteger('views_count')->default(0);
            $table->smallInteger('reading_time')->default(0);
            $table->string('seo_title');
            $table->longText('seo_description');
            $table->json('seo_keywords');
            $table->string('canonical_url');


            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
            $table->foreign('category_id')->references('id')->on('categories')->onDelete('set null');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('articles');
    }
};
