<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Transaction>
 */
class TransactionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'type' => $this->faker->randomElement(['subscription', 'service']),
            'amount' => $this->faker->numberBetween(100, 1500),
            'method' => $this->faker->randomElement(['credit_card', 'paypal', 'bank']),
            'status' => 'completed',
            'reference' => Str::random(10),
            'paid_at' => now(),
        ];
    }
}
