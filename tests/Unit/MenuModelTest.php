<?php

namespace Tests\Unit;

use App\Models\Category;
use App\Models\MenuItem;
use App\Models\Addon;
use App\Models\OrderItem;
use App\Models\OrderItemAddon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MenuModelTest extends TestCase
{
  use RefreshDatabase;

  public function test_category_has_correct_fillable_attributes(): void
  {
    $category = new Category();
    $expected = ['name', 'slug'];

    $this->assertEquals($expected, $category->getFillable());
  }

  public function test_category_has_many_menu_items(): void
  {
    $category = Category::create([
      'name' => 'Coffee',
      'slug' => 'coffee'
    ]);

    $menuItem1 = MenuItem::create([
      'category_id' => $category->id,
      'name' => 'Americano',
      'description' => 'Classic black coffee',
      'base_price' => 70.00,
      'is_available' => true
    ]);

    $menuItem2 = MenuItem::create([
      'category_id' => $category->id,
      'name' => 'Cappuccino',
      'description' => 'Espresso with steamed milk',
      'base_price' => 75.00,
      'is_available' => true
    ]);

    $this->assertCount(2, $category->menuItems);
    $this->assertInstanceOf(MenuItem::class, $category->menuItems->first());
    $this->assertTrue($category->menuItems->contains($menuItem1));
    $this->assertTrue($category->menuItems->contains($menuItem2));
  }

  public function test_menu_item_has_correct_fillable_attributes(): void
  {
    $menuItem = new MenuItem();
    $expected = [
      'category_id',
      'name',
      'description',
      'base_price',
      'is_available',
    ];

    $this->assertEquals($expected, $menuItem->getFillable());
  }

  public function test_menu_item_casts_attributes_correctly(): void
  {
    $category = Category::create([
      'name' => 'Coffee',
      'slug' => 'coffee'
    ]);

    $menuItem = MenuItem::create([
      'category_id' => $category->id,
      'name' => 'Americano',
      'description' => 'Classic black coffee',
      'base_price' => 70.50,
      'is_available' => true
    ]);

    $this->assertEquals('70.50', $menuItem->base_price);
    $this->assertTrue($menuItem->is_available);
    $this->assertIsBool($menuItem->is_available);
  }

  public function test_menu_item_belongs_to_category(): void
  {
    $category = Category::create([
      'name' => 'Coffee',
      'slug' => 'coffee'
    ]);

    $menuItem = MenuItem::create([
      'category_id' => $category->id,
      'name' => 'Americano',
      'description' => 'Classic black coffee',
      'base_price' => 70.00,
      'is_available' => true
    ]);

    $this->assertInstanceOf(Category::class, $menuItem->category);
    $this->assertEquals($category->id, $menuItem->category->id);
    $this->assertEquals('Coffee', $menuItem->category->name);
  }

  public function test_menu_item_has_many_order_items(): void
  {
    $category = Category::create([
      'name' => 'Coffee',
      'slug' => 'coffee'
    ]);

    $menuItem = MenuItem::create([
      'category_id' => $category->id,
      'name' => 'Americano',
      'description' => 'Classic black coffee',
      'base_price' => 70.00,
      'is_available' => true
    ]);

    // Create order items would require orders, so we'll just test the relationship exists
    $this->assertTrue(method_exists($menuItem, 'orderItems'));
    $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\HasMany::class, $menuItem->orderItems());
  }

  public function test_addon_has_correct_fillable_attributes(): void
  {
    $addon = new Addon();
    $expected = [
      'name',
      'price',
      'is_available',
    ];

    $this->assertEquals($expected, $addon->getFillable());
  }

  public function test_addon_casts_attributes_correctly(): void
  {
    $addon = Addon::create([
      'name' => 'Extra Shot',
      'price' => 15.75,
      'is_available' => true
    ]);

    $this->assertEquals('15.75', $addon->price);
    $this->assertTrue($addon->is_available);
    $this->assertIsBool($addon->is_available);
  }

  public function test_addon_has_many_order_item_addons(): void
  {
    $addon = Addon::create([
      'name' => 'Extra Shot',
      'price' => 15.00,
      'is_available' => true
    ]);

    // Test the relationship exists
    $this->assertTrue(method_exists($addon, 'orderItemAddons'));
    $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\HasMany::class, $addon->orderItemAddons());
  }

  public function test_category_can_be_created_with_slug(): void
  {
    $category = Category::create([
      'name' => 'Fruit Sodas',
      'slug' => 'fruit-sodas'
    ]);

    $this->assertEquals('Fruit Sodas', $category->name);
    $this->assertEquals('fruit-sodas', $category->slug);
    $this->assertDatabaseHas('categories', [
      'name' => 'Fruit Sodas',
      'slug' => 'fruit-sodas'
    ]);
  }

  public function test_menu_item_availability_can_be_toggled(): void
  {
    $category = Category::create([
      'name' => 'Coffee',
      'slug' => 'coffee'
    ]);

    $menuItem = MenuItem::create([
      'category_id' => $category->id,
      'name' => 'Americano',
      'description' => 'Classic black coffee',
      'base_price' => 70.00,
      'is_available' => true
    ]);

    $this->assertTrue($menuItem->is_available);

    $menuItem->update(['is_available' => false]);
    $menuItem->refresh();

    $this->assertFalse($menuItem->is_available);
  }

  public function test_addon_availability_can_be_toggled(): void
  {
    $addon = Addon::create([
      'name' => 'Extra Shot',
      'price' => 15.00,
      'is_available' => true
    ]);

    $this->assertTrue($addon->is_available);

    $addon->update(['is_available' => false]);
    $addon->refresh();

    $this->assertFalse($addon->is_available);
  }
}
