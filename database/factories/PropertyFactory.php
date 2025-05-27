<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Property>
 */
class PropertyFactory extends Factory
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
            'title' => $this->faker->sentence(4),
            'description' => $this->faker->paragraph,
            'type' => $this->faker->randomElement(['apartment', 'villa', 'land', 'office']),
            'status' => 'available',
            'purpose' => $this->faker->randomElement(['sale', 'rent']),
            'price' => $this->faker->numberBetween(50000, 500000),
            'area' => $this->faker->randomFloat(2, 50, 500),
            'bedrooms' => $this->faker->numberBetween(1, 5),
            'bathrooms' => $this->faker->numberBetween(1, 3),
            'floor' => $this->faker->numberBetween(1, 10),
            'latitude' => $this->faker->latitude,
            'longitude' => $this->faker->longitude,
            'address' => $this->faker->address,
            'published_at' => now(),
            'is_featured' => $this->faker->boolean(20),
        ];
    }
}
