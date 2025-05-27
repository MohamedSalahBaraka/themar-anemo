<?php

namespace Database\Factories;

use App\Models\Package;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Subscription>
 */
class SubscriptionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $start = now();
        return [
            'user_id' => User::factory(),
            'package_id' => Package::factory(),
            'started_at' => $start,
            'expires_at' => $start->copy()->addDays(30),
            'is_active' => true,
        ];
    }
}
