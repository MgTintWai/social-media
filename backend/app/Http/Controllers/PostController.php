<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePostRequest;
use App\Http\Requests\UpdatePostRequest;
use App\Http\Requests\StoreReactionRequest;
use App\Http\Resources\PostResource;
use App\Http\Resources\PostCollection;
use App\Http\Resources\ReactionResource;
use App\Models\Post;
use App\Models\Reaction;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class PostController extends Controller
{
    /**
     * Display a listing of posts.
     */
    public function index(Request $request)
    {
        $perPage = min($request->get('per_page', 10), 50); // Max 50 items per page
        $posts = Post::with(['user', 'reactions', 'comments'])
                    ->orderBy('created_at', 'desc')
                    ->paginate($perPage);

        return new PostCollection($posts);
    }

    /**
     * Display posts belonging to the authenticated user.
     */
    public function myPosts(Request $request)
    {
        $perPage = min($request->get('per_page', 10), 50); // Max 50 items per page
        $posts = Post::with(['user', 'reactions', 'comments'])
                    ->where('user_id', $request->user()->id)
                    ->orderBy('created_at', 'desc')
                    ->paginate($perPage);

        return new PostCollection($posts);
    }

    /**
     * Store a newly created post.
     */
    public function store(StorePostRequest $request)
    {
        // Check for file upload errors
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            if ($file->getError() !== UPLOAD_ERR_OK) {
                $errorMessages = [
                    UPLOAD_ERR_INI_SIZE => 'The uploaded file exceeds the server upload limit.',
                    UPLOAD_ERR_FORM_SIZE => 'The uploaded file exceeds the form upload limit.',
                    UPLOAD_ERR_PARTIAL => 'The file was only partially uploaded.',
                    UPLOAD_ERR_NO_FILE => 'No file was uploaded.',
                    UPLOAD_ERR_NO_TMP_DIR => 'Missing temporary folder.',
                    UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk.',
                    UPLOAD_ERR_EXTENSION => 'File upload stopped by extension.',
                ];
                
                return response()->json([
                    'success' => false,
                    'message' => $errorMessages[$file->getError()] ?? 'Unknown upload error.',
                ], 422);
            }
        }

        $mediaPath = null;
        
        // Handle media upload if present (images or videos)
        if ($request->hasFile('image')) {
            $mediaFile = $request->file('image');
            $mimeType = $mediaFile->getMimeType();
            
            // Determine if it's an image or video
            if (str_starts_with($mimeType, 'image/')) {
                $mediaName = time() . '_' . uniqid() . '.jpg'; // Images saved as JPEG
                $this->processAndSaveImage($mediaFile, $mediaName);
                $mediaPath = $mediaName;
            } elseif (str_starts_with($mimeType, 'video/')) {
                $extension = $mediaFile->getClientOriginalExtension();
                $mediaName = time() . '_' . uniqid() . '.' . $extension; // Keep original video format
                $this->processAndSaveVideo($mediaFile, $mediaName);
                $mediaPath = $mediaName;
            }
        }

        $post = Post::create([
            'title' => $request->title,
            'content' => $request->content,
            'image' => $mediaPath, // This field now stores both images and videos
            'user_id' => $request->user()->id,
        ]);

        $post->load(['user', 'reactions', 'comments']);

        return response()->json([
            'success' => true,
            'message' => 'Post created successfully',
            'data' => new PostResource($post)
        ], Response::HTTP_CREATED);
    }

    /**
     * Display the specified post.
     */
    public function show($id)
    {
        $post = Post::with(['user', 'reactions', 'comments'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => new PostResource($post)
        ]);
    }

    /**
     * Update the specified post.
     */
    public function update(UpdatePostRequest $request, $id)
    {
        $post = Post::findOrFail($id);

        // Check if the authenticated user owns the post
        if ($post->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to update this post'
            ], Response::HTTP_FORBIDDEN);
        }

        $mediaPath = $post->image; // Keep existing media by default
        
        // Handle media upload if present (images or videos)
        if ($request->hasFile('image')) {
            // Delete old media if it exists
            if ($post->image) {
                // Handle both old format (with path) and new format (filename only)
                $oldMediaPath = str_contains($post->image, '/') ? $post->image : 'posts/' . $post->image;
                if (Storage::disk('public')->exists($oldMediaPath)) {
                    Storage::disk('public')->delete($oldMediaPath);
                }
            }
            
            $mediaFile = $request->file('image');
            $mimeType = $mediaFile->getMimeType();
            
            // Determine if it's an image or video
            if (str_starts_with($mimeType, 'image/')) {
                $mediaName = time() . '_' . uniqid() . '.jpg'; // Images saved as JPEG
                $this->processAndSaveImage($mediaFile, $mediaName);
                $mediaPath = $mediaName;
            } elseif (str_starts_with($mimeType, 'video/')) {
                $extension = $mediaFile->getClientOriginalExtension();
                $mediaName = time() . '_' . uniqid() . '.' . $extension; // Keep original video format
                $this->processAndSaveVideo($mediaFile, $mediaName);
                $mediaPath = $mediaName;
            }
        } elseif ($request->has('remove_media') && $request->input('remove_media') === '1') {
            // If remove_media flag is set, remove the existing media
            if ($post->image) {
                // Handle both old format (with path) and new format (filename only)
                $oldMediaPath = str_contains($post->image, '/') ? $post->image : 'posts/' . $post->image;
                if (Storage::disk('public')->exists($oldMediaPath)) {
                    Storage::disk('public')->delete($oldMediaPath);
                }
            }
            $mediaPath = null;
        }

        $post->update([
            'title' => $request->title,
            'content' => $request->content,
            'image' => $mediaPath,
        ]);

        $post->load(['user', 'reactions', 'comments']);

        return response()->json([
            'success' => true,
            'message' => 'Post updated successfully',
            'data' => new PostResource($post)
        ]);
    }

    /**
     * Remove the specified post.
     */
    public function destroy($id)
    {
        $post = Post::findOrFail($id);

        // Check if the authenticated user owns the post
        if ($post->user_id !== request()->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to delete this post'
            ], Response::HTTP_FORBIDDEN);
        }

        // Delete associated media (image or video) if it exists
        if ($post->image) {
            // Handle both old format (with path) and new format (filename only)
            $mediaPath = str_contains($post->image, '/') ? $post->image : 'posts/' . $post->image;
            if (Storage::disk('public')->exists($mediaPath)) {
                Storage::disk('public')->delete($mediaPath);
            }
        }

        $post->delete();

        return response()->json([
            'success' => true,
            'message' => 'Post deleted successfully'
        ]);
    }

    /**
     * Toggle reaction on a post.
     */
    public function toggleReaction(StoreReactionRequest $request, $postId)
    {
        $post = Post::findOrFail($postId);
        $user = $request->user();
        $reactionType = $request->input('type');

        // Check if user already has a reaction on this post
        $existingReaction = $post->reactions()
            ->where('user_id', $user->id)
            ->first();

        $reactionAdded = false;
        $message = '';

        if ($existingReaction) {
            if ($existingReaction->type === $reactionType) {
                // Same reaction type - remove it (toggle off)
                $existingReaction->delete();
                $message = 'Reaction removed';
                $reactionAdded = false;
            } else {
                // Different reaction type - update it
                $existingReaction->update(['type' => $reactionType]);
                $message = 'Reaction updated';
                $reactionAdded = true;
            }
        } else {
            // No existing reaction - create new one
            $post->reactions()->create([
                'user_id' => $user->id,
                'type' => $reactionType,
            ]);
            $message = 'Reaction added';
            $reactionAdded = true;
        }

        // Get updated counts and user reaction status
        $totalReactionsCount = $post->reactions()->count();
        $userReaction = $post->reactions()->where('user_id', $user->id)->first();
        $userHasReacted = $userReaction !== null;

        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => [
                'post_id' => $post->id,
                'user_has_reacted' => $userHasReacted,
                'user_reacted' => $userHasReacted, // Keep both for compatibility
                'user_reaction_type' => $userReaction ? $userReaction->type : null,
                'user_reaction' => $userReaction ? new ReactionResource($userReaction) : null,
                'reaction_count' => $totalReactionsCount,
                'total_reactions_count' => $totalReactionsCount, // Keep both for compatibility
                'reactions_by_type' => $post->reactions()
                    ->selectRaw('type, COUNT(*) as count')
                    ->groupBy('type')
                    ->pluck('count', 'type')
                    ->toArray()
            ]
        ]);
    }

    /**
     * Process and save image with optimization using Intervention Image
     */
    private function processAndSaveImage($uploadedFile, $imageName)
    {
        try {
            // Create ImageManager with GD driver
            $manager = new ImageManager(new Driver());
            
            // Use Intervention Image to process the uploaded file
            $image = $manager->read($uploadedFile->getPathname());
            
            // Set maximum dimensions while maintaining aspect ratio
            $maxWidth = 1200;
            $maxHeight = 1200;
            
            // Get original dimensions
            $originalWidth = $image->width();
            $originalHeight = $image->height();
            
            // Only resize if the image is larger than our maximum dimensions
            if ($originalWidth > $maxWidth || $originalHeight > $maxHeight) {
                // Scale down the image proportionally to fit within max dimensions
                $image->scaleDown($maxWidth, $maxHeight);
            }
            
            // Ensure the directory exists
            $directory = storage_path('app/public/posts');
            if (!file_exists($directory)) {
                mkdir($directory, 0755, true);
            }
            
            // Save as JPEG with high quality (90% for better clarity while keeping reasonable file size)
            $savePath = storage_path('app/public/posts/' . $imageName);
            $image->toJpeg(90)->save($savePath);
            
        } catch (\Exception $e) {
            // Log the error and fallback to simple file storage
            Log::error('Image processing with Intervention Image failed: ' . $e->getMessage());
            try {
                // Fallback: just store the file as is
                $uploadedFile->storeAs('posts', $imageName, 'public');
            } catch (\Exception $fallbackException) {
                Log::error('Fallback image storage also failed: ' . $fallbackException->getMessage());
                throw $fallbackException;
            }
        }
    }

    /**
     * Process and save video file
     */
    private function processAndSaveVideo($uploadedFile, $videoName)
    {
        try {
            // Simply store the video file without processing
            // Video processing would require FFmpeg which might not be available
            $uploadedFile->storeAs('posts', $videoName, 'public');
            
        } catch (\Exception $e) {
            // Log the error
            Log::error('Video processing failed: ' . $e->getMessage());
            throw $e;
        }
    }
}
