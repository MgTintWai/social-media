<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\User;

class PostFactory extends Factory
{
    public function definition(): array
    {
        return [
            'title' => fake()->sentence(),
            'content' => fake()->paragraph(5),
            'image' => "1758637847_68d2af171e295.jpg",
            'user_id' => User::factory(),
        ];
    }
}
