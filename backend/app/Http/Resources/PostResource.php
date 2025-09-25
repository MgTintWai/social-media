<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PostResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $user = $request->user();
        $userReaction = null;
        
        if ($user) {
            $userReaction = $this->reactions()->where('user_id', $user->id)->first();
        }

        // Determine media type and URL
        $mediaUrl = null;
        $mediaType = null;
        
        if ($this->image) {
            $mediaUrl = asset('storage/' . (str_contains($this->image, '/') ? $this->image : 'posts/' . $this->image));
            
            // Determine if it's an image or video based on file extension
            $extension = strtolower(pathinfo($this->image, PATHINFO_EXTENSION));
            $imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
            $videoExtensions = ['mp4', 'mov', 'avi', 'wmv', 'flv', 'webm'];
            
            if (in_array($extension, $imageExtensions)) {
                $mediaType = 'image';
            } elseif (in_array($extension, $videoExtensions)) {
                $mediaType = 'video';
            } else {
                $mediaType = 'unknown';
            }
        }

        return [
            'id' => $this->id,
            'title' => $this->title,
            'content' => $this->content,
            'image' => $mediaUrl, // Keep for backward compatibility
            'media_url' => $mediaUrl,
            'media_type' => $mediaType,
            'created_at' => $this->created_at,
            'author' => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'profile_picture' => $this->user->profile_picture,
            ],
            'reaction_count' => $this->reactions()->count(),
            'comment_count' => $this->comments()->count(),
            'user_has_reacted' => $userReaction ? true : false,
            'user_reaction' => $userReaction ? [
                'type' => $userReaction->type,
                'reacted_at' => $userReaction->created_at
            ] : null,
            'reactions_by_type' => $this->reactions()
                ->selectRaw('type, COUNT(*) as count')
                ->groupBy('type')
                ->pluck('count', 'type')
                ->toArray(),
            'updated_at' => $this->updated_at,
            'created_at_human' => $this->created_at->diffForHumans(),
        ];
    }
}
