<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\MenuItem;
use Illuminate\Database\Seeder;

class MenuItemSeeder extends Seeder
{
  /**
   * Run the database seeds.
   */
  public function run(): void
  {
    $coffeeCategory = Category::where('slug', 'coffee')->first();
    $nonCoffeeCategory = Category::where('slug', 'non-coffee')->first();
    $fruitSodasCategory = Category::where('slug', 'fruit-sodas')->first();

    // Coffee items - base price for Daily size (₱70)
    $coffeeItems = [
      [
        'category_id' => $coffeeCategory->id,
        'name' => 'Americano',
        'description' => 'Rich espresso with hot water',
        'image_url' => '/images/products/americano.jpg',
        'base_price' => 70.00,
        'is_available' => true,
      ],
      [
        'category_id' => $coffeeCategory->id,
        'name' => 'Cappuccino',
        'description' => 'Espresso with steamed milk and foam',
        'image_url' => '/images/products/cappuccino.jpg',
        'base_price' => 70.00,
        'is_available' => true,
      ],
      [
        'category_id' => $coffeeCategory->id,
        'name' => 'Latte',
        'description' => 'Espresso with steamed milk',
        'image_url' => '/images/products/latte.jpg',
        'base_price' => 70.00,
        'is_available' => true,
      ],
      [
        'category_id' => $coffeeCategory->id,
        'name' => 'Mocha',
        'description' => 'Espresso with chocolate and steamed milk',
        'image_url' => '/images/products/mocha.jpg',
        'base_price' => 70.00,
        'is_available' => true,
      ],
      [
        'category_id' => $coffeeCategory->id,
        'name' => 'Macchiato',
        'description' => 'Espresso with a dollop of foamed milk',
        'image_url' => '/images/products/macchiato.jpg',
        'base_price' => 70.00,
        'is_available' => true,
      ],
      [
        'category_id' => $coffeeCategory->id,
        'name' => 'Flat White',
        'description' => 'Double shot espresso with microfoam milk',
        'image_url' => '/images/products/flat-white.jpg',
        'base_price' => 70.00,
        'is_available' => true,
      ],
    ];

    // Non-Coffee items
    $nonCoffeeItems = [
      [
        'category_id' => $nonCoffeeCategory->id,
        'name' => 'Hot Chocolate',
        'description' => 'Rich chocolate drink with steamed milk',
        'image_url' => '/images/products/hot-chocolate.jpg',
        'base_price' => 70.00,
        'is_available' => true,
      ],
      [
        'category_id' => $nonCoffeeCategory->id,
        'name' => 'Chai Latte',
        'description' => 'Spiced tea with steamed milk',
        'image_url' => '/images/products/chai-latte.jpg',
        'base_price' => 70.00,
        'is_available' => true,
      ],
      [
        'category_id' => $nonCoffeeCategory->id,
        'name' => 'Matcha Latte',
        'description' => 'Japanese green tea with steamed milk',
        'image_url' => '/images/products/matcha-latte.jpg',
        'base_price' => 70.00,
        'is_available' => true,
      ],
      [
        'category_id' => $nonCoffeeCategory->id,
        'name' => 'Vanilla Milk Tea',
        'description' => 'Creamy vanilla flavored milk tea',
        'image_url' => '/images/products/vanilla-milk-tea.jpg',
        'base_price' => 70.00,
        'is_available' => true,
      ],
    ];

    // Fruit Sodas
    $fruitSodaItems = [
      [
        'category_id' => $fruitSodasCategory->id,
        'name' => 'Orange Soda',
        'description' => 'Refreshing orange flavored soda',
        'image_url' => '/images/products/orange-soda.jpg',
        'base_price' => 70.00,
        'is_available' => true,
      ],
      [
        'category_id' => $fruitSodasCategory->id,
        'name' => 'Apple Soda',
        'description' => 'Crisp apple flavored soda',
        'image_url' => '/images/products/apple-soda.jpg',
        'base_price' => 70.00,
        'is_available' => true,
      ],
      [
        'category_id' => $fruitSodasCategory->id,
        'name' => 'Grape Soda',
        'description' => 'Sweet grape flavored soda',
        'image_url' => '/images/products/grape-soda.jpg',
        'base_price' => 70.00,
        'is_available' => true,
      ],
      [
        'category_id' => $fruitSodasCategory->id,
        'name' => 'Lemon Lime Soda',
        'description' => 'Zesty lemon lime flavored soda',
        'image_url' => '/images/products/lemon-lime-soda.jpg',
        'base_price' => 70.00,
        'is_available' => true,
      ],
    ];

    // Create all menu items
    $allItems = array_merge($coffeeItems, $nonCoffeeItems, $fruitSodaItems);

    foreach ($allItems as $item) {
      MenuItem::create($item);
    }
  }
}
