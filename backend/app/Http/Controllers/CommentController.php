<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCommentRequest;
use App\Http\Resources\CommentResource;
use App\Models\Comment;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class CommentController extends Controller
{
    /**
     * Store a newly created comment.
     */
    public function store(StoreCommentRequest $request, $postId)
    {
        // Check if post exists
        $post = Post::findOrFail($postId);

        $comment = Comment::create([
            'user_id' => $request->user()->id,
            'post_id' => $post->id,
            'content' => $request->content,
        ]);

        // Load the user relationship
        $comment->load('user');

        return response()->json([
            'success' => true,
            'message' => 'Comment created successfully',
            'data' => new CommentResource($comment)
        ], Response::HTTP_CREATED);
    }

    /**
     * Get comments for a specific post.
     */
    public function index(Request $request, $postId)
    {
        // Check if post exists
        $post = Post::findOrFail($postId);

        $perPage = min($request->get('per_page', 10), 50); // Max 50 items per page
        $comments = Comment::with('user')
                          ->where('post_id', $post->id)
                          ->orderBy('created_at', 'desc')
                          ->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => CommentResource::collection($comments->items()),
            'pagination' => [
                'current_page' => $comments->currentPage(),
                'total_pages' => $comments->lastPage(),
                'per_page' => $comments->perPage(),
                'total' => $comments->total(),
                'has_more_pages' => $comments->hasMorePages(),
            ]
        ]);
    }
}
