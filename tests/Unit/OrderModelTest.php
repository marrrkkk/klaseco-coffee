<?php

namespace Tests\Unit;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderItemAddon;
use App\Models\MenuItem;
use App\Models\Category;
use App\Models\Addon;
use App\Models\User;
use App\Enums\OrderStatus;
use App\Enums\Size;
use App\Enums\Variant;
use App\Enums\UserRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderModelTest extends TestCase
{
  use RefreshDatabase;

  protected function setUp(): void
  {
    parent::setUp();
    $this->createTestData();
  }

  private function createTestData(): void
  {
    // Create category
    $this->category = Category::create([
      'name' => 'Coffee',
      'slug' => 'coffee'
    ]);

    // Create menu item
    $this->menuItem = MenuItem::create([
      'category_id' => $this->category->id,
      'name' => 'Americano',
      'description' => 'Classic black coffee',
      'base_price' => 70.00,
      'is_available' => true
    ]);

    // Create addon
    $this->addon = Addon::create([
      'name' => 'Extra Shot',
      'price' => 15.00,
      'is_available' => true
    ]);

    // Create users
    $this->cashier = User::create([
      'name' => 'Test Cashier',
      'email' => 'cashier@test.com',
      'password' => bcrypt('password'),
      'role' => UserRole::CASHIER
    ]);

    $this->owner = User::create([
      'name' => 'Test Owner',
      'email' => 'owner@test.com',
      'password' => bcrypt('password'),
      'role' => UserRole::OWNER
    ]);
  }

  public function test_order_has_correct_fillable_attributes(): void
  {
    $order = new Order();
    $expected = [
      'customer_name',
      'customer_phone',
      'order_type',
      'payment_method',
      'status',
      'total_amount',
      'cashier_id',
      'owner_id',
    ];

    $this->assertEquals($expected, $order->getFillable());
  }

  public function test_order_casts_attributes_correctly(): void
  {
    $order = Order::create([
      'customer_name' => 'John Doe',
      'customer_phone' => '09123456789',
      'status' => OrderStatus::PENDING,
      'total_amount' => 85.50,
    ]);

    $this->assertInstanceOf(OrderStatus::class, $order->status);
    $this->assertEquals('85.50', $order->total_amount);
    $this->assertEquals(OrderStatus::PENDING, $order->status);
  }

  public function test_order_belongs_to_cashier(): void
  {
    $order = Order::create([
      'customer_name' => 'John Doe',
      'customer_phone' => '09123456789',
      'status' => OrderStatus::ACCEPTED,
      'total_amount' => 85.50,
      'cashier_id' => $this->cashier->id,
    ]);

    $this->assertInstanceOf(User::class, $order->cashier);
    $this->assertEquals($this->cashier->id, $order->cashier->id);
    $this->assertEquals('Test Cashier', $order->cashier->name);
  }

  public function test_order_belongs_to_owner(): void
  {
    $order = Order::create([
      'customer_name' => 'John Doe',
      'customer_phone' => '09123456789',
      'status' => OrderStatus::PREPARING,
      'total_amount' => 85.50,
      'owner_id' => $this->owner->id,
    ]);

    $this->assertInstanceOf(User::class, $order->owner);
    $this->assertEquals($this->owner->id, $order->owner->id);
    $this->assertEquals('Test Owner', $order->owner->name);
  }

  public function test_order_has_many_order_items(): void
  {
    $order = Order::create([
      'customer_name' => 'John Doe',
      'customer_phone' => '09123456789',
      'status' => OrderStatus::PENDING,
      'total_amount' => 85.50,
    ]);

    $orderItem = OrderItem::create([
      'order_id' => $order->id,
      'menu_item_id' => $this->menuItem->id,
      'quantity' => 1,
      'size' => Size::DAILY,
      'variant' => Variant::HOT,
      'unit_price' => 70.00,
      'subtotal' => 70.00,
    ]);

    $this->assertCount(1, $order->orderItems);
    $this->assertInstanceOf(OrderItem::class, $order->orderItems->first());
    $this->assertEquals($orderItem->id, $order->orderItems->first()->id);
  }

  public function test_order_item_has_correct_fillable_attributes(): void
  {
    $orderItem = new OrderItem();
    $expected = [
      'order_id',
      'menu_item_id',
      'quantity',
      'size',
      'variant',
      'unit_price',
      'subtotal',
    ];

    $this->assertEquals($expected, $orderItem->getFillable());
  }

  public function test_order_item_casts_attributes_correctly(): void
  {
    $order = Order::create([
      'customer_name' => 'John Doe',
      'customer_phone' => '09123456789',
      'status' => OrderStatus::PENDING,
      'total_amount' => 85.50,
    ]);

    $orderItem = OrderItem::create([
      'order_id' => $order->id,
      'menu_item_id' => $this->menuItem->id,
      'quantity' => 2,
      'size' => Size::EXTRA,
      'variant' => Variant::COLD,
      'unit_price' => 91.00,
      'subtotal' => 182.00,
    ]);

    $this->assertInstanceOf(Size::class, $orderItem->size);
    $this->assertInstanceOf(Variant::class, $orderItem->variant);
    $this->assertEquals(Size::EXTRA, $orderItem->size);
    $this->assertEquals(Variant::COLD, $orderItem->variant);
    $this->assertEquals('91.00', $orderItem->unit_price);
    $this->assertEquals('182.00', $orderItem->subtotal);
  }

  public function test_order_item_belongs_to_order(): void
  {
    $order = Order::create([
      'customer_name' => 'John Doe',
      'customer_phone' => '09123456789',
      'status' => OrderStatus::PENDING,
      'total_amount' => 85.50,
    ]);

    $orderItem = OrderItem::create([
      'order_id' => $order->id,
      'menu_item_id' => $this->menuItem->id,
      'quantity' => 1,
      'size' => Size::DAILY,
      'variant' => Variant::HOT,
      'unit_price' => 70.00,
      'subtotal' => 70.00,
    ]);

    $this->assertInstanceOf(Order::class, $orderItem->order);
    $this->assertEquals($order->id, $orderItem->order->id);
  }

  public function test_order_item_belongs_to_menu_item(): void
  {
    $order = Order::create([
      'customer_name' => 'John Doe',
      'customer_phone' => '09123456789',
      'status' => OrderStatus::PENDING,
      'total_amount' => 85.50,
    ]);

    $orderItem = OrderItem::create([
      'order_id' => $order->id,
      'menu_item_id' => $this->menuItem->id,
      'quantity' => 1,
      'size' => Size::DAILY,
      'variant' => Variant::HOT,
      'unit_price' => 70.00,
      'subtotal' => 70.00,
    ]);

    $this->assertInstanceOf(MenuItem::class, $orderItem->menuItem);
    $this->assertEquals($this->menuItem->id, $orderItem->menuItem->id);
    $this->assertEquals('Americano', $orderItem->menuItem->name);
  }

  public function test_order_item_has_many_addons(): void
  {
    $order = Order::create([
      'customer_name' => 'John Doe',
      'customer_phone' => '09123456789',
      'status' => OrderStatus::PENDING,
      'total_amount' => 85.50,
    ]);

    $orderItem = OrderItem::create([
      'order_id' => $order->id,
      'menu_item_id' => $this->menuItem->id,
      'quantity' => 1,
      'size' => Size::DAILY,
      'variant' => Variant::HOT,
      'unit_price' => 70.00,
      'subtotal' => 85.00,
    ]);

    $orderItemAddon = OrderItemAddon::create([
      'order_item_id' => $orderItem->id,
      'addon_id' => $this->addon->id,
      'quantity' => 1,
      'unit_price' => 15.00,
    ]);

    $this->assertCount(1, $orderItem->addons);
    $this->assertInstanceOf(OrderItemAddon::class, $orderItem->addons->first());
    $this->assertEquals($orderItemAddon->id, $orderItem->addons->first()->id);
  }

  public function test_order_item_addon_has_correct_fillable_attributes(): void
  {
    $orderItemAddon = new OrderItemAddon();
    $expected = [
      'order_item_id',
      'addon_id',
      'quantity',
      'unit_price',
    ];

    $this->assertEquals($expected, $orderItemAddon->getFillable());
  }

  public function test_order_item_addon_casts_attributes_correctly(): void
  {
    $order = Order::create([
      'customer_name' => 'John Doe',
      'customer_phone' => '09123456789',
      'status' => OrderStatus::PENDING,
      'total_amount' => 85.50,
    ]);

    $orderItem = OrderItem::create([
      'order_id' => $order->id,
      'menu_item_id' => $this->menuItem->id,
      'quantity' => 1,
      'size' => Size::DAILY,
      'variant' => Variant::HOT,
      'unit_price' => 70.00,
      'subtotal' => 85.00,
    ]);

    $orderItemAddon = OrderItemAddon::create([
      'order_item_id' => $orderItem->id,
      'addon_id' => $this->addon->id,
      'quantity' => 2,
      'unit_price' => 15.50,
    ]);

    $this->assertEquals('15.50', $orderItemAddon->unit_price);
    $this->assertEquals(2, $orderItemAddon->quantity);
  }

  public function test_order_item_addon_belongs_to_order_item(): void
  {
    $order = Order::create([
      'customer_name' => 'John Doe',
      'customer_phone' => '09123456789',
      'status' => OrderStatus::PENDING,
      'total_amount' => 85.50,
    ]);

    $orderItem = OrderItem::create([
      'order_id' => $order->id,
      'menu_item_id' => $this->menuItem->id,
      'quantity' => 1,
      'size' => Size::DAILY,
      'variant' => Variant::HOT,
      'unit_price' => 70.00,
      'subtotal' => 85.00,
    ]);

    $orderItemAddon = OrderItemAddon::create([
      'order_item_id' => $orderItem->id,
      'addon_id' => $this->addon->id,
      'quantity' => 1,
      'unit_price' => 15.00,
    ]);

    $this->assertInstanceOf(OrderItem::class, $orderItemAddon->orderItem);
    $this->assertEquals($orderItem->id, $orderItemAddon->orderItem->id);
  }

  public function test_order_item_addon_belongs_to_addon(): void
  {
    $order = Order::create([
      'customer_name' => 'John Doe',
      'customer_phone' => '09123456789',
      'status' => OrderStatus::PENDING,
      'total_amount' => 85.50,
    ]);

    $orderItem = OrderItem::create([
      'order_id' => $order->id,
      'menu_item_id' => $this->menuItem->id,
      'quantity' => 1,
      'size' => Size::DAILY,
      'variant' => Variant::HOT,
      'unit_price' => 70.00,
      'subtotal' => 85.00,
    ]);

    $orderItemAddon = OrderItemAddon::create([
      'order_item_id' => $orderItem->id,
      'addon_id' => $this->addon->id,
      'quantity' => 1,
      'unit_price' => 15.00,
    ]);

    $this->assertInstanceOf(Addon::class, $orderItemAddon->addon);
    $this->assertEquals($this->addon->id, $orderItemAddon->addon->id);
    $this->assertEquals('Extra Shot', $orderItemAddon->addon->name);
  }
}
