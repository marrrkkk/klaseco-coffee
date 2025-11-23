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
        'image_url' => "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%238B7355' width='400' height='400'/%3E%3Ctext fill='%23FFFFFF' font-family='Arial, sans-serif' font-size='32' font-weight='300' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3ECoffee%3C/text%3E%3C/svg%3E",
      ],
      [
        'name' => 'Non-Coffee',
        'slug' => 'non-coffee',
        'image_url' => "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%238B7355' width='400' height='400'/%3E%3Ctext fill='%23FFFFFF' font-family='Arial, sans-serif' font-size='32' font-weight='300' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3ENon-Coffee%3C/text%3E%3C/svg%3E",
      ],
      [
        'name' => 'Fruit Sodas',
        'slug' => 'fruit-sodas',
        'image_url' => "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%238B7355' width='400' height='400'/%3E%3Ctext fill='%23FFFFFF' font-family='Arial, sans-serif' font-size='32' font-weight='300' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3EFruit Sodas%3C/text%3E%3C/svg%3E",
      ],
    ];

    foreach ($categories as $category) {
      Category::updateOrCreate(
        ['slug' => $category['slug']],
        $category
      );
    }
  }
}
