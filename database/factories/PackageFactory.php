<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Package>
 */
class PackageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->word . " Plan",
            'price' => $this->faker->randomElement([499, 999, 1499]),
            'duration' => $this->faker->randomElement([30, 90, 365]),
            'max_listings' => $this->faker->randomElement([5, 20, 50]),
            'features' => json_encode(['feature1', 'feature2']),
        ];
    }
}
