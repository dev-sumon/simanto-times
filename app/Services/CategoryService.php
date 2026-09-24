<?php

namespace App\Services;

use App\Models\Category;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;

class CategoryService
{
    /**
     * @return LengthAwarePaginator<int, Category>
     */
    public function paginate(string $search): LengthAwarePaginator
    {
        return Category::query()
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($query) use ($search): void {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('slug', 'like', "%{$search}%");
                });
            })
            ->orderBy('name')
            ->orderBy('id')
            ->paginate(10)
            ->withQueryString();
    }

    /**
     * @param  array{name: string, slug?: string|null}  $data
     */
    public function create(array $data): Category
    {
        return Category::create([
            'name' => $data['name'],
            'slug' => $this->uniqueSlug($data['slug'] ?? null, $data['name']),
        ]);
    }

    /**
     * @param  array{name: string, slug?: string|null}  $data
     */
    public function update(Category $category, array $data): Category
    {
        $category->update([
            'name' => $data['name'],
            'slug' => $this->uniqueSlug($data['slug'] ?? null, $data['name'], $category->id),
        ]);

        return $category;
    }

    public function delete(Category $category): void
    {
        $category->delete();
    }

    private function uniqueSlug(?string $slug, string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($slug ?: $name);

        if ($base === '') {
            $base = 'category';
        }

        $candidate = $base;
        $suffix = 2;

        while (
            Category::query()
                ->where('slug', $candidate)
                ->when($ignoreId !== null, fn ($query) => $query->where('id', '!=', $ignoreId))
                ->exists()
        ) {
            $candidate = $base.'-'.$suffix;
            $suffix++;
        }

        return $candidate;
    }
}
