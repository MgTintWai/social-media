<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePostRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // User must be authenticated via middleware
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'content' => 'required|string|max:5000',
            'image' => 'nullable|file|mimes:jpeg,png,jpg,gif,webp,mp4,mov,avi,wmv,flv,webm|max:204800', // Support both images and videos, 200MB max
        ];
    }

    /**
     * Get custom error messages for validation rules.
     */
    public function messages(): array
    {
        return [
            'title.required' => 'Post title is required.',
            'title.max' => 'Post title cannot exceed 255 characters.',
            'content.required' => 'Post content is required.',
            'content.max' => 'Post content cannot exceed 5000 characters.',
            'image.file' => 'The uploaded file must be a valid file.',
            'image.mimes' => 'File must be an image (jpeg, png, jpg, gif, webp) or video (mp4, mov, avi, wmv, flv, webm).',
            'image.max' => 'File size cannot exceed 200MB.',
        ];
    }
}
