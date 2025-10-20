<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
  /**
   * Run the database seeds.
   */
  public function run(): void
  {
    $categories = [
      [
        'name' => 'Coffee',
        'slug' => 'coffee',
      ],
      [
        'name' => 'Non-Coffee',
        'slug' => 'non-coffee',
      ],
      [
        'name' => 'Fruit Sodas',
        'slug' => 'fruit-sodas',
      ],
    ];

    foreach ($categories as $category) {
      Category::create($category);
    }
  }
}
