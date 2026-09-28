<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ArticleStatusEnum;
use App\Enums\ArticleVisibilityEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\Article\StoreArticleRequest;
use App\Models\Category;
use App\Models\User;
use App\Services\ArticleService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ArticleController extends Controller
{
    public function __construct(private ArticleService $articles) {}

    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));

        return Inertia::render('admin/articles/index', [
            'articles' => $this->articles->paginate($search),
            'filters' => ['search' => $search],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/articles/create', [
            'categories' => Category::query()
                ->orderBy('name')
                ->orderBy('id')
                ->get(['id', 'name']),
            'statusOptions' => ArticleStatusEnum::options(),
            'visibilityOptions' => ArticleVisibilityEnum::options(),
        ]);
    }

    public function store(StoreArticleRequest $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        $this->articles->create($request->validated(), $user);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Article created successfully.']);

        return redirect()->route('admin.articles.index');
    }
}
