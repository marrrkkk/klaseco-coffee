<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\MenuItem;
use App\Models\Addon;
use App\Models\Order;
use App\Models\User;
use App\Enums\OrderStatus;
use App\Enums\Size;
use App\Enums\Variant;
use App\Enums\UserRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderApiEndpointsTest extends TestCase
{
  use RefreshDatabase;

  protected $category;
  protected $menuItem;
  protected $addon;
  protected $cashier;
  protected $owner;

  protected function setUp(): void
  {
    parent::setUp();
    $this->createTestData();
  }

  private function createTestData(): void
  {
    $this->category = Category::create([
      'name' => 'Coffee',
      'slug' => 'coffee'
    ]);

    $this->menuItem = MenuItem::create([
      'category_id' => $this->category->id,
      'name' => 'Americano',
      'description' => 'Classic black coffee',
      'base_price' => 70.00,
      'is_available' => true
    ]);

    $this->addon = Addon::create([
      'name' => 'Extra Shot',
      'price' => 15.00,
      'is_available' => true
    ]);

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

  public function test_create_order_endpoint_validation(): void
  {
    // Test missing required fields
    $response = $this->postJson('/api/orders', []);
    $response->assertStatus(422)
      ->assertJsonValidationErrors(['customer_name', 'customer_phone', 'items']);

    // Test invalid menu item ID
    $response = $this->postJson('/api/orders', [
      'customer_name' => 'John Doe',
      'customer_phone' => '09123456789',
      'items' => [
        [
          'menu_item_id' => 999,
          'quantity' => 1,
          'size' => Size::DAILY->value,
          'variant' => Variant::HOT->value
        ]
      ]
    ]);
    $response->assertStatus(422)
      ->assertJsonValidationErrors(['items.0.menu_item_id']);

    // Test invalid size enum
    $response = $this->postJson('/api/orders', [
      'customer_name' => 'John Doe',
      'customer_phone' => '09123456789',
      'items' => [
        [
          'menu_item_id' => $this->menuItem->id,
          'quantity' => 1,
          'size' => 'invalid_size',
          'variant' => Variant::HOT->value
        ]
      ]
    ]);
    $response->assertStatus(422)
      ->assertJsonValidationErrors(['items.0.size']);

    // Test invalid variant enum
    $response = $this->postJson('/api/orders', [
      'customer_name' => 'John Doe',
      'customer_phone' => '09123456789',
      'items' => [
        [
          'menu_item_id' => $this->menuItem->id,
          'quantity' => 1,
          'size' => Size::DAILY->value,
          'variant' => 'invalid_variant'
        ]
      ]
    ]);
    $response->assertStatus(422)
      ->assertJsonValidationErrors(['items.0.variant']);

    // Test invalid addon ID
    $response = $this->postJson('/api/orders', [
      'customer_name' => 'John Doe',
      'customer_phone' => '09123456789',
      'items' => [
        [
          'menu_item_id' => $this->menuItem->id,
          'quantity' => 1,
          'size' => Size::DAILY->value,
          'variant' => Variant::HOT->value,
          'addons' => [
            [
              'addon_id' => 999,
              'quantity' => 1
            ]
          ]
        ]
      ]
    ]);
    $response->assertStatus(422)
      ->assertJsonValidationErrors(['items.0.addons.0.addon_id']);
  }

  public function test_get_orders_by_status_endpoint(): void
  {
    // Create orders with different statuses
    $pendingOrder = Order::create([
      'customer_name' => 'Pending Customer',
      'customer_phone' => '09111111111',
      'status' => OrderStatus::PENDING,
      'total_amount' => 85.00
    ]);

    $acceptedOrder = Order::create([
      'customer_name' => 'Accepted Customer',
      'customer_phone' => '09222222222',
      'status' => OrderStatus::ACCEPTED,
      'total_amount' => 95.00
    ]);

    $readyOrder = Order::create([
      'customer_name' => 'Ready Customer',
      'customer_phone' => '09333333333',
      'status' => OrderStatus::READY,
      'total_amount' => 105.00
    ]);

    // Test getting pending orders
    $response = $this->getJson('/api/orders/status/' . OrderStatus::PENDING->value);
    $response->assertStatus(200)
      ->assertJsonStructure([
        'success',
        'data' => [
          '*' => [
            'id',
            'customer_name',
            'status',
            'total_amount'
          ]
        ]
      ]);

    $orders = $response->json('data');
    $this->assertCount(1, $orders);
    $this->assertEquals($pendingOrder->id, $orders[0]['id']);

    // Test getting accepted orders
    $response = $this->getJson('/api/orders/status/' . OrderStatus::ACCEPTED->value);
    $orders = $response->json('data');
    $this->assertCount(1, $orders);
    $this->assertEquals($acceptedOrder->id, $orders[0]['id']);

    // Test invalid status
    $response = $this->getJson('/api/orders/status/invalid_status');
    $response->assertStatus(422)
      ->assertJsonValidationErrors(['status']);
  }

  public function test_get_pending_orders_with_etag(): void
  {
    // Create a pending order
    Order::create([
      'customer_name' => 'Test Customer',
      'customer_phone' => '09123456789',
      'status' => OrderStatus::PENDING,
      'total_amount' => 85.00
    ]);

    // First request should return data with ETag
    $response = $this->getJson('/api/orders/pending');
    $response->assertStatus(200)
      ->assertHeader('ETag');

    $etag = $response->headers->get('ETag');
    $this->assertNotNull($etag);

    // Second request with same ETag should return 304 Not Modified
    $response = $this->getJson('/api/orders/pending', [
      'If-None-Match' => $etag
    ]);
    $response->assertStatus(304);

    // Create another order to change the data
    Order::create([
      'customer_name' => 'Another Customer',
      'customer_phone' => '09987654321',
      'status' => OrderStatus::PENDING,
      'total_amount' => 95.00
    ]);

    // Request with old ETag should return new data
    $response = $this->getJson('/api/orders/pending', [
      'If-None-Match' => $etag
    ]);
    $response->assertStatus(200)
      ->assertHeader('ETag');

    $newEtag = $response->headers->get('ETag');
    $this->assertNotEquals($etag, $newEtag);
  }

  public function test_get_accepted_orders_with_etag(): void
  {
    // Create accepted orders
    Order::create([
      'customer_name' => 'Accepted Customer 1',
      'customer_phone' => '09111111111',
      'status' => OrderStatus::ACCEPTED,
      'total_amount' => 85.00
    ]);

    Order::create([
      'customer_name' => 'Preparing Customer',
      'customer_phone' => '09222222222',
      'status' => OrderStatus::PREPARING,
      'total_amount' => 95.00
    ]);

    // Test ETag functionality
    $response = $this->getJson('/api/orders/accepted');
    $response->assertStatus(200)
      ->assertHeader('ETag');

    $etag = $response->headers->get('ETag');
    $orders = $response->json('data');
    $this->assertCount(2, $orders);

    // Test 304 response with same ETag
    $response = $this->getJson('/api/orders/accepted', [
      'If-None-Match' => $etag
    ]);
    $response->assertStatus(304);
  }

  public function test_get_queue_stats_endpoint(): void
  {
    // Create orders with different statuses
    Order::create(['customer_name' => 'P1', 'customer_phone' => '09111111111', 'status' => OrderStatus::PENDING, 'total_amount' => 85.00]);
    Order::create(['customer_name' => 'P2', 'customer_phone' => '09111111112', 'status' => OrderStatus::PENDING, 'total_amount' => 85.00]);
    Order::create(['customer_name' => 'A1', 'customer_phone' => '09222222221', 'status' => OrderStatus::ACCEPTED, 'total_amount' => 95.00]);
    Order::create(['customer_name' => 'R1', 'customer_phone' => '09333333331', 'status' => OrderStatus::READY, 'total_amount' => 105.00]);
    Order::create(['customer_name' => 'S1', 'customer_phone' => '09444444441', 'status' => OrderStatus::SERVED, 'total_amount' => 115.00]);

    $response = $this->getJson('/api/orders/stats');
    $response->assertStatus(200)
      ->assertJsonStructure([
        'success',
        'data' => [
          'pending_count',
          'accepted_count',
          'ready_count',
          'total_active',
          'last_order_time',
          'last_update_time'
        ],
        'meta' => [
          'last_updated',
          'has_activity'
        ]
      ])
      ->assertHeader('ETag');

    $stats = $response->json('data');
    $this->assertEquals(2, $stats['pending_count']);
    $this->assertEquals(1, $stats['accepted_count']);
    $this->assertEquals(1, $stats['ready_count']);
    $this->assertEquals(4, $stats['total_active']); // Excluding served orders
    $this->assertTrue($response->json('meta.has_activity'));
  }

  public function test_show_order_endpoint(): void
  {
    $order = Order::create([
      'customer_name' => 'Show Test Customer',
      'customer_phone' => '09123456789',
      'status' => OrderStatus::PENDING,
      'total_amount' => 85.00
    ]);

    $response = $this->getJson("/api/orders/{$order->id}");
    $response->assertStatus(200)
      ->assertJsonStructure([
        'success',
        'data' => [
          'id',
          'customer_name',
          'customer_phone',
          'status',
          'total_amount',
          'order_items',
          'cashier',
          'owner'
        ]
      ])
      ->assertJson([
        'success' => true,
        'data' => [
          'id' => $order->id,
          'customer_name' => 'Show Test Customer'
        ]
      ]);
  }

  public function test_get_order_status_with_etag(): void
  {
    $order = Order::create([
      'customer_name' => 'Status Test Customer',
      'customer_phone' => '09123456789',
      'status' => OrderStatus::PENDING,
      'total_amount' => 85.00
    ]);

    // First request
    $response = $this->getJson("/api/orders/{$order->id}/status");
    $response->assertStatus(200)
      ->assertHeader('ETag')
      ->assertJsonStructure([
        'success',
        'data' => [
          'id',
          'status',
          'customer_name'
        ],
        'meta' => [
          'last_updated',
          'is_active'
        ]
      ]);

    $etag = $response->headers->get('ETag');
    $this->assertTrue($response->json('meta.is_active'));

    // Request with same ETag should return 304
    $response = $this->getJson("/api/orders/{$order->id}/status", [
      'If-None-Match' => $etag
    ]);
    $response->assertStatus(304);

    // Update order status
    $order->update(['status' => OrderStatus::ACCEPTED]);

    // Request with old ETag should return new data
    $response = $this->getJson("/api/orders/{$order->id}/status", [
      'If-None-Match' => $etag
    ]);
    $response->assertStatus(200)
      ->assertHeader('ETag');

    $newEtag = $response->headers->get('ETag');
    $this->assertNotEquals($etag, $newEtag);
    $this->assertEquals(OrderStatus::ACCEPTED->value, $response->json('data.status'));
  }

  public function test_update_order_status_validation(): void
  {
    $order = Order::create([
      'customer_name' => 'Update Test Customer',
      'customer_phone' => '09123456789',
      'status' => OrderStatus::PENDING,
      'total_amount' => 85.00
    ]);

    // Test invalid status transition (pending to ready)
    $response = $this->patchJson("/api/orders/{$order->id}/status", [
      'status' => OrderStatus::READY->value
    ]);
    $response->assertStatus(422)
      ->assertJson([
        'success' => false,
        'message' => 'Invalid status transition'
      ]);

    // Test valid status transition (pending to accepted)
    $response = $this->patchJson("/api/orders/{$order->id}/status", [
      'status' => OrderStatus::ACCEPTED->value,
      'user_id' => $this->cashier->id
    ]);
    $response->assertStatus(200)
      ->assertJson([
        'success' => true,
        'message' => 'Order status updated successfully'
      ]);

    $this->assertDatabaseHas('orders', [
      'id' => $order->id,
      'status' => OrderStatus::ACCEPTED->value,
      'cashier_id' => $this->cashier->id
    ]);
  }

  public function test_accept_order_endpoint(): void
  {
    $order = Order::create([
      'customer_name' => 'Accept Test Customer',
      'customer_phone' => '09123456789',
      'status' => OrderStatus::PENDING,
      'total_amount' => 85.00
    ]);

    // Test successful acceptance
    $response = $this->patchJson("/api/orders/{$order->id}/accept", [
      'cashier_id' => $this->cashier->id
    ]);
    $response->assertStatus(200)
      ->assertJson([
        'success' => true,
        'message' => 'Order accepted successfully'
      ]);

    // Test accepting non-pending order
    $response = $this->patchJson("/api/orders/{$order->id}/accept", [
      'cashier_id' => $this->cashier->id
    ]);
    $response->assertStatus(422)
      ->assertJson([
        'success' => false,
        'message' => 'Order can only be accepted when pending'
      ]);
  }

  public function test_reject_order_endpoint(): void
  {
    $order = Order::create([
      'customer_name' => 'Reject Test Customer',
      'customer_phone' => '09123456789',
      'status' => OrderStatus::PENDING,
      'total_amount' => 85.00
    ]);

    $response = $this->patchJson("/api/orders/{$order->id}/reject", [
      'cashier_id' => $this->cashier->id
    ]);
    $response->assertStatus(200)
      ->assertJson([
        'success' => true,
        'message' => 'Order rejected successfully'
      ]);

    $this->assertDatabaseHas('orders', [
      'id' => $order->id,
      'status' => OrderStatus::CANCELLED->value,
      'cashier_id' => $this->cashier->id
    ]);
  }

  public function test_mark_ready_endpoint(): void
  {
    $order = Order::create([
      'customer_name' => 'Ready Test Customer',
      'customer_phone' => '09123456789',
      'status' => OrderStatus::ACCEPTED,
      'total_amount' => 85.00
    ]);

    $response = $this->patchJson("/api/orders/{$order->id}/ready");
    $response->assertStatus(200)
      ->assertJson([
        'success' => true,
        'message' => 'Order marked as ready successfully'
      ]);

    $this->assertDatabaseHas('orders', [
      'id' => $order->id,
      'status' => OrderStatus::READY->value
    ]);

    // Test marking non-accepted order as ready
    $pendingOrder = Order::create([
      'customer_name' => 'Pending Customer',
      'customer_phone' => '09987654321',
      'status' => OrderStatus::PENDING,
      'total_amount' => 85.00
    ]);

    $response = $this->patchJson("/api/orders/{$pendingOrder->id}/ready");
    $response->assertStatus(400)
      ->assertJson([
        'message' => 'Order cannot be marked as ready in current status'
      ]);
  }

  public function test_mark_served_endpoint(): void
  {
    $order = Order::create([
      'customer_name' => 'Served Test Customer',
      'customer_phone' => '09123456789',
      'status' => OrderStatus::READY,
      'total_amount' => 85.00
    ]);

    $response = $this->patchJson("/api/orders/{$order->id}/served");
    $response->assertStatus(200)
      ->assertJson([
        'success' => true,
        'message' => 'Order marked as served'
      ]);

    $this->assertDatabaseHas('orders', [
      'id' => $order->id,
      'status' => OrderStatus::SERVED->value
    ]);

    // Test marking non-ready order as served
    $acceptedOrder = Order::create([
      'customer_name' => 'Accepted Customer',
      'customer_phone' => '09987654321',
      'status' => OrderStatus::ACCEPTED,
      'total_amount' => 85.00
    ]);

    $response = $this->patchJson("/api/orders/{$acceptedOrder->id}/served");
    $response->assertStatus(400)
      ->assertJson([
        'message' => 'Order cannot be marked as served in current status'
      ]);
  }
}
