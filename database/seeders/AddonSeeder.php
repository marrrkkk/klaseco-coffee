<?php

namespace Database\Seeders;

use App\Models\Addon;
use Illuminate\Database\Seeder;

class AddonSeeder extends Seeder
{
  /**
   * Run the database seeds.
   */
  public function run(): void
  {
    $addons = [
      [
        'name' => 'Extra Shot',
        'price' => 15.00,
        'is_available' => true,
      ],
      [
        'name' => 'Decaf',
        'price' => 0.00,
        'is_available' => true,
      ],
      [
        'name' => 'Oat Milk',
        'price' => 10.00,
        'is_available' => true,
      ],
      [
        'name' => 'Almond Milk',
        'price' => 10.00,
        'is_available' => true,
      ],
      [
        'name' => 'Soy Milk',
        'price' => 10.00,
        'is_available' => true,
      ],
      [
        'name' => 'Coconut Milk',
        'price' => 10.00,
        'is_available' => true,
      ],
      [
        'name' => 'Extra Foam',
        'price' => 0.00,
        'is_available' => true,
      ],
      [
        'name' => 'No Foam',
        'price' => 0.00,
        'is_available' => true,
      ],
      [
        'name' => 'Vanilla Syrup',
        'price' => 8.00,
        'is_available' => true,
      ],
      [
        'name' => 'Caramel Syrup',
        'price' => 8.00,
        'is_available' => true,
      ],
      [
        'name' => 'Hazelnut Syrup',
        'price' => 8.00,
        'is_available' => true,
      ],
      [
        'name' => 'Cinnamon Syrup',
        'price' => 8.00,
        'is_available' => true,
      ],
      [
        'name' => 'Extra Hot',
        'price' => 0.00,
        'is_available' => true,
      ],
      [
        'name' => 'Extra Sweet',
        'price' => 5.00,
        'is_available' => true,
      ],
      [
        'name' => 'Less Sweet',
        'price' => 0.00,
        'is_available' => true,
      ],
    ];

    foreach ($addons as $addon) {
      Addon::create($addon);
    }
  }
}
