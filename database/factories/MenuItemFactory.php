<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\MenuItem>
 */
class MenuItemFactory extends Factory
{
  /**
   * Define the model's default state.
   *
   * @return array<string, mixed>
   */
  public function definition(): array
  {
    return [
      'category_id' => Category::factory(),
      'name' => fake()->words(3, true),
      'description' => fake()->sentence(),
      'image_url' => fake()->optional()->imageUrl(640, 480, 'food', true),
      'base_price' => fake()->randomFloat(2, 50, 500),
      'is_available' => fake()->boolean(80),
    ];
  }
}
