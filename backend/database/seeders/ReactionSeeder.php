<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Reaction;
use App\Models\Post;
use App\Models\User;
class ReactionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Post::all()->each(function ($post) {
            $users = User::inRandomOrder()->take(5)->pluck('id');

            foreach ($users as $userId) {
                Reaction::factory()->create([
                    'post_id' => $post->id,
                    'user_id' => $userId,
                ]);
            }
        });
    }
}
