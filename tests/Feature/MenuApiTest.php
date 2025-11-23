<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\MenuItem;
use App\Models\Addon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MenuApiTest extends TestCase
{
  use RefreshDatabase;

  protected function setUp(): void
  {
    parent::setUp();

    // Create test data
    $this->createTestData();
  }

  private function createTestData(): void
  {
    // Create categories
    $coffeeCategory = Category::create([
      'name' => 'Coffee',
      'slug' => 'coffee'
    ]);

    $nonCoffeeCategory = Category::create([
      'name' => 'Non-Coffee',
      'slug' => 'non-coffee'
    ]);

    // Create menu items
    MenuItem::create([
      'category_id' => $coffeeCategory->id,
      'name' => 'Americano',
      'description' => 'Classic black coffee',
      'base_price' => 70.00,
      'is_available' => true
    ]);

    MenuItem::create([
      'category_id' => $coffeeCategory->id,
      'name' => 'Cappuccino',
      'description' => 'Espresso with steamed milk',
      'base_price' => 70.00,
      'is_available' => true
    ]);

    MenuItem::create([
      'category_id' => $nonCoffeeCategory->id,
      'name' => 'Hot Chocolate',
      'description' => 'Rich chocolate drink',
      'base_price' => 70.00,
      'is_available' => false // Test unavailable item
    ]);

    // Create addons
    Addon::create([
      'name' => 'Extra Shot',
      'price' => 15.00,
      'is_available' => true
    ]);

    Addon::create([
      'name' => 'Whipped Cream',
      'price' => 10.00,
      'is_available' => true
    ]);

    Addon::create([
      'name' => 'Unavailable Addon',
      'price' => 5.00,
      'is_available' => false
    ]);
  }

  public function test_can_get_all_categories_with_available_menu_items(): void
  {
    $response = $this->getJson('/api/menu/categories');

    $response->assertStatus(200)
      ->assertJsonStructure([
        'success',
        'data' => [
          '*' => [
            'id',
            'name',
            'slug',
            'menu_items' => [
              '*' => [
                'id',
                'name',
                'description',
                'base_price',
                'is_available'
              ]
            ]
          ]
        ]
      ])
      ->assertJson([
        'success' => true
      ]);

    // Verify only available items are returned
    $data = $response->json('data');
    foreach ($data as $category) {
      foreach ($category['menu_items'] as $item) {
        $this->assertTrue($item['is_available']);
      }
    }
  }

  public function test_can_get_menu_items_by_category(): void
  {
    $category = Category::where('slug', 'coffee')->first();

    $response = $this->getJson("/api/menu/categories/{$category->id}/items");

    $response->assertStatus(200)
      ->assertJsonStructure([
        'success',
        'data' => [
          '*' => [
            'id',
            'name',
            'description',
            'base_price',
            'is_available'
          ]
        ]
      ])
      ->assertJson([
        'success' => true
      ]);

    // Verify only available items are returned
    $items = $response->json('data');
    foreach ($items as $item) {
      $this->assertTrue($item['is_available']);
    }
  }

  public function test_can_get_available_addons(): void
  {
    $response = $this->getJson('/api/menu/addons');

    $response->assertStatus(200)
      ->assertJsonStructure([
        'success',
        'data' => [
          '*' => [
            'id',
            'name',
            'price',
            'is_available'
          ]
        ]
      ])
      ->assertJson([
        'success' => true
      ]);

    // Verify only available addons are returned
    $addons = $response->json('data');
    foreach ($addons as $addon) {
      $this->assertTrue($addon['is_available']);
    }

    // Should return 2 available addons (excluding the unavailable one)
    $this->assertCount(2, $addons);
  }

  public function test_can_get_complete_menu(): void
  {
    $response = $this->getJson('/api/menu/complete');

    $response->assertStatus(200)
      ->assertJsonStructure([
        'success',
        'data' => [
          'categories' => [
            '*' => [
              'id',
              'name',
              'slug',
              'menu_items'
            ]
          ],
          'addons' => [
            '*' => [
              'id',
              'name',
              'price',
              'is_available'
            ]
          ]
        ]
      ])
      ->assertJson([
        'success' => true
      ]);

    $data = $response->json('data');

    // Verify we have categories and addons
    $this->assertArrayHasKey('categories', $data);
    $this->assertArrayHasKey('addons', $data);

    // Verify only available items are included
    foreach ($data['categories'] as $category) {
      foreach ($category['menu_items'] as $item) {
        $this->assertTrue($item['is_available']);
      }
    }

    foreach ($data['addons'] as $addon) {
      $this->assertTrue($addon['is_available']);
    }
  }

  public function test_returns_404_for_nonexistent_category(): void
  {
    $response = $this->getJson('/api/menu/categories/999/items');

    $response->assertStatus(404);
  }

  public function test_can_get_category_with_items_and_addons(): void
  {
    $category = Category::where('slug', 'coffee')->first();

    $response = $this->getJson("/api/menu/category/{$category->id}");

    $response->assertStatus(200)
      ->assertJsonStructure([
        'success',
        'category' => [
          'id',
          'name',
          'slug'
        ],
        'items' => [
          '*' => [
            'id',
            'name',
            'description',
            'base_price',
            'is_available'
          ]
        ],
        'addons' => [
          '*' => [
            'id',
            'name',
            'price',
            'is_available'
          ]
        ]
      ])
      ->assertJson([
        'success' => true,
        'category' => [
          'id' => $category->id,
          'name' => 'Coffee'
        ]
      ]);

    // Verify only available items are returned
    $items = $response->json('items');
    foreach ($items as $item) {
      $this->assertTrue($item['is_available']);
      $this->assertEquals($category->id, $item['category_id']);
    }

    // Verify only available addons are returned
    $addons = $response->json('addons');
    foreach ($addons as $addon) {
      $this->assertTrue($addon['is_available']);
    }

    // Should return 2 available addons
    $this->assertCount(2, $addons);
  }

  public function test_category_endpoint_returns_404_for_invalid_id(): void
  {
    $response = $this->getJson('/api/menu/category/999');

    $response->assertStatus(404)
      ->assertJson([
        'success' => false,
        'message' => 'Category not found'
      ]);
  }

  public function test_category_endpoint_filters_unavailable_items(): void
  {
    $category = Category::where('slug', 'non-coffee')->first();

    $response = $this->getJson("/api/menu/category/{$category->id}");

    $response->assertStatus(200);

    // The non-coffee category has one item but it's unavailable
    // So items array should be empty
    $items = $response->json('items');
    $this->assertCount(0, $items);
  }
}
