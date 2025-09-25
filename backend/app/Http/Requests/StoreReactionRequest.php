<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreReactionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'type' => ['required', 'string', Rule::in(['like', 'love', 'laugh', 'angry', 'sad'])],
            'post_id' => 'sometimes|exists:posts,id'
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'type.required' => 'Reaction type is required.',
            'type.in' => 'Invalid reaction type. Allowed types are: like, love, laugh, angry, sad.',
            'post_id.exists' => 'The selected post does not exist.'
        ];
    }
}
