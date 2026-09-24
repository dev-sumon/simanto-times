<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Category\StoreCategoryRequest;
use App\Http\Requests\Category\UpdateCategoryRequest;
use App\Models\Category;
use App\Services\CategoryService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function __construct(private CategoryService $categories) {}

    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));

        return Inertia::render('admin/categories/index', [
            'categories' => $this->categories->paginate($search),
            'filters' => ['search' => $search],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/categories/create');
    }

    public function store(StoreCategoryRequest $request): RedirectResponse
    {
        $this->categories->create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Category created successfully.']);

        return redirect()->route('admin.categories.index');
    }

    public function edit(Category $category): Response
    {
        return Inertia::render('admin/categories/edit', [
            'category' => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
            ],
        ]);
    }

    public function update(UpdateCategoryRequest $request, Category $category): RedirectResponse
    {
        $this->categories->update($category, $request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Category updated successfully.']);

        return redirect()->route('admin.categories.index');
    }

    public function destroy(Category $category): RedirectResponse
    {
        $this->categories->delete($category);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Category deleted successfully.']);

        return redirect()->back();
    }
}
