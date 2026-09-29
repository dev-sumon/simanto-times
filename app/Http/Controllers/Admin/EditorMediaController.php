<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\EditorMedia\StoreEditorMediaRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class EditorMediaController extends Controller
{
    public function store(StoreEditorMediaRequest $request): JsonResponse
    {
        $image = $request->file('image');

        if (! $image instanceof UploadedFile) {
            abort(422);
        }

        $path = $image->store('editor', 'public');

        return response()->json([
            'url' => Storage::disk('public')->url($path),
        ]);
    }
}
