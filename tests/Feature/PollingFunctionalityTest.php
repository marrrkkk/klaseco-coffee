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
use Carbon\Carbon;

class PollingFunctionalityTest extends TestCase
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

  public function test_pending_orders_polling_etag_generation(): void
  {
    // Test empty queue ETag
    $response = $this->getJson('/api/orders/pending');
    $response->assertStatus(200);
    $emptyEtag = $response->headers->get('ETag');
    $this->assertNotNull($emptyEtag);

    // Create an order
    $order = Order::create([
      'customer_name' => 'Test Customer',
      'customer_phone' => '09123456789',
      'status' => OrderStatus::PENDING,
      'total_amount' => 85.00
    ]);

    // ETag should change when order is added
    $response = $this->getJson('/api/orders/pending');
    $response->assertStatus(200);
    $newEtag = $response->headers->get('ETag');
    $this->assertNotEquals($emptyEtag, $newEtag);

    // ETag should remain same for identical data
    $response = $this->getJson('/api/orders/pending');
    $response->assertStatus(200);
    $sameEtag = $response->headers->get('ETag');
    $this->assertEquals($newEtag, $sameEtag);

    // Update order status - ETag should change
    $order->update(['status' => OrderStatus::ACCEPTED]);
    $response = $this->getJson('/api/orders/pending');
    $response->assertStatus(200);
    $updatedEtag = $response->headers->get('ETag');
    $this->assertNotEquals($newEtag, $updatedEtag);
  }

  public function test_accepted_orders_polling_etag_generation(): void
  {
    // Create accepted and preparing orders
    $acceptedOrder = Order::create([
      'customer_name' => 'Accepted Customer',
      'customer_phone' => '09111111111',
      'status' => OrderStatus::ACCEPTED,
      'total_amount' => 85.00
    ]);

    $preparingOrder = Order::create([
      'customer_name' => 'Preparing Customer',
      'customer_phone' => '09222222222',
      'status' => OrderStatus::PREPARING,
      'total_amount' => 95.00
    ]);

    // Get initial ETag
    $response = $this->getJson('/api/orders/accepted');
    $response->assertStatus(200);
    $initialEtag = $response->headers->get('ETag');
    $orders = $response->json('data');
    $this->assertCount(2, $orders);

    // Same request should return 304 with ETag
    $response = $this->getJson('/api/orders/accepted', [
      'If-None-Match' => $initialEtag
    ]);
    $response->assertStatus(304);

    // Mark one order as ready - should change ETag
    $acceptedOrder->update(['status' => OrderStatus::READY]);
    $response = $this->getJson('/api/orders/accepted', [
      'If-None-Match' => $initialEtag
    ]);
    $response->assertStatus(200);
    $newEtag = $response->headers->get('ETag');
    $this->assertNotEquals($initialEtag, $newEtag);

    // Should now have only 1 order (preparing)
    $orders = $response->json('data');
    $this->assertCount(1, $orders);
    $this->assertEquals($preparingOrder->id, $orders[0]['id']);
  }

  public function test_order_status_polling_etag_generation(): void
  {
    $order = Order::create([
      'customer_name' => 'Status Test Customer',
      'customer_phone' => '09123456789',
      'status' => OrderStatus::PENDING,
      'total_amount' => 85.00
    ]);

    // Get initial status with ETag
    $response = $this->getJson("/api/orders/{$order->id}/status");
    $response->assertStatus(200);
    $initialEtag = $response->headers->get('ETag');
    $this->assertEquals(OrderStatus::PENDING->value, $response->json('data.status'));

    // Same request should return 304
    $response = $this->getJson("/api/orders/{$order->id}/status", [
      'If-None-Match' => $initialEtag
    ]);
    $response->assertStatus(304);

    // Update order status
    $order->update(['status' => OrderStatus::ACCEPTED]);

    // Request with old ETag should return new data
    $response = $this->getJson("/api/orders/{$order->id}/status", [
      'If-None-Match' => $initialEtag
    ]);
    $response->assertStatus(200);
    $newEtag = $response->headers->get('ETag');
    $this->assertNotEquals($initialEtag, $newEtag);
    $this->assertEquals(OrderStatus::ACCEPTED->value, $response->json('data.status'));
  }

  public function test_queue_stats_polling_etag_generation(): void
  {
    // Get initial stats
    $response = $this->getJson('/api/orders/stats');
    $response->assertStatus(200);
    $initialEtag = $response->headers->get('ETag');
    $initialStats = $response->json('data');

    // Same request should return 304
    $response = $this->getJson('/api/orders/stats', [
      'If-None-Match' => $initialEtag
    ]);
    $response->assertStatus(304);

    // Create an order to change stats
    Order::create([
      'customer_name' => 'Stats Test Customer',
      'customer_phone' => '09123456789',
      'status' => OrderStatus::PENDING,
      'total_amount' => 85.00
    ]);

    // Stats should change
    $response = $this->getJson('/api/orders/stats', [
      'If-None-Match' => $initialEtag
    ]);
    $response->assertStatus(200);
    $newEtag = $response->headers->get('ETag');
    $this->assertNotEquals($initialEtag, $newEtag);

    $newStats = $response->json('data');
    $this->assertEquals($initialStats['pending_count'] + 1, $newStats['pending_count']);
    $this->assertEquals($initialStats['total_active'] + 1, $newStats['total_active']);
  }

  public function test_polling_response_structure_consistency(): void
  {
    // Create test orders
    Order::create([
      'customer_name' => 'Pending Customer',
      'customer_phone' => '09111111111',
      'status' => OrderStatus::PENDING,
      'total_amount' => 85.00
    ]);

    Order::create([
      'customer_name' => 'Accepted Customer',
      'customer_phone' => '09222222222',
      'status' => OrderStatus::ACCEPTED,
      'total_amount' => 95.00
    ]);

    // Test pending orders response structure
    $response = $this->getJson('/api/orders/pending');
    $response->assertStatus(200)
      ->assertJsonStructure([
        'success',
        'data' => [
          '*' => [
            'id',
            'customer_name',
            'customer_phone',
            'status',
            'total_amount',
            'created_at',
            'updated_at'
          ]
        ],
        'meta' => [
          'count',
          'last_updated',
          'has_active_orders'
        ]
      ])
      ->assertHeader('ETag');

    $meta = $response->json('meta');
    $this->assertEquals(1, $meta['count']);
    $this->assertTrue($meta['has_active_orders']);

    // Test accepted orders response structure
    $response = $this->getJson('/api/orders/accepted');
    $response->assertStatus(200)
      ->assertJsonStructure([
        'success',
        'data' => [
          '*' => [
            'id',
            'customer_name',
            'customer_phone',
            'status',
            'total_amount',
            'created_at',
            'updated_at',
            'cashier'
          ]
        ],
        'meta' => [
          'count',
          'last_updated',
          'has_active_orders'
        ]
      ])
      ->assertHeader('ETag');
  }

  public function test_polling_performance_with_multiple_orders(): void
  {
    // Create multiple orders to test performance
    $orders = [];
    for ($i = 1; $i <= 10; $i++) {
      $orders[] = Order::create([
        'customer_name' => "Customer {$i}",
        'customer_phone' => "0912345678{$i}",
        'status' => $i % 2 === 0 ? OrderStatus::PENDING : OrderStatus::ACCEPTED,
        'total_amount' => 85.00 + ($i * 5)
      ]);
    }

    // Test pending orders polling
    $startTime = microtime(true);
    $response = $this->getJson('/api/orders/pending');
    $endTime = microtime(true);

    $response->assertStatus(200);
    $pendingOrders = $response->json('data');
    $this->assertCount(5, $pendingOrders); // 5 pending orders (even numbers)

    // Response should be fast (under 1 second for this test)
    $responseTime = $endTime - $startTime;
    $this->assertLessThan(1.0, $responseTime);

    // Test accepted orders polling
    $startTime = microtime(true);
    $response = $this->getJson('/api/orders/accepted');
    $endTime = microtime(true);

    $response->assertStatus(200);
    $acceptedOrders = $response->json('data');
    $this->assertCount(5, $acceptedOrders); // 5 accepted orders (odd numbers)

    $responseTime = $endTime - $startTime;
    $this->assertLessThan(1.0, $responseTime);
  }

  public function test_polling_with_order_relationships(): void
  {
    // Create order with items and addons
    $orderData = [
      'customer_name' => 'Relationship Test Customer',
      'customer_phone' => '09123456789',
      'items' => [
        [
          'menu_item_id' => $this->menuItem->id,
          'quantity' => 1,
          'size' => Size::DAILY->value,
          'variant' => Variant::HOT->value,
          'addons' => [
            [
              'addon_id' => $this->addon->id,
              'quantity' => 1
            ]
          ]
        ]
      ]
    ];

    $createResponse = $this->postJson('/api/orders', $orderData);
    $createResponse->assertStatus(201);
    $orderId = $createResponse->json('order.id');

    // Test pending orders includes relationships
    $response = $this->getJson('/api/orders/pending');
    $response->assertStatus(200);

    $orders = $response->json('data');
    $this->assertCount(1, $orders);

    $order = $orders[0];
    $this->assertEquals($orderId, $order['id']);
    $this->assertArrayHasKey('order_items', $order);
    $this->assertCount(1, $order['order_items']);

    $orderItem = $order['order_items'][0];
    $this->assertArrayHasKey('menu_item', $orderItem);
    $this->assertArrayHasKey('addons', $orderItem);
    $this->assertCount(1, $orderItem['addons']);

    // Accept the order and test accepted orders polling
    $this->patchJson("/api/orders/{$orderId}/accept", [
      'cashier_id' => $this->cashier->id
    ]);

    $response = $this->getJson('/api/orders/accepted');
    $response->assertStatus(200);

    $orders = $response->json('data');
    $this->assertCount(1, $orders);

    $order = $orders[0];
    $this->assertArrayHasKey('cashier', $order);
    $this->assertEquals($this->cashier->id, $order['cashier']['id']);
  }

  public function test_active_orders_polling_endpoint(): void
  {
    // Create orders in different states
    $acceptedOrder = Order::create([
      'customer_name' => 'Accepted Customer',
      'customer_phone' => '09111111111',
      'status' => OrderStatus::ACCEPTED,
      'total_amount' => 85.00
    ]);

    $preparingOrder = Order::create([
      'customer_name' => 'Preparing Customer',
      'customer_phone' => '09222222222',
      'status' => OrderStatus::PREPARING,
      'total_amount' => 95.00
    ]);

    $readyOrder = Order::create([
      'customer_name' => 'Ready Customer',
      'customer_phone' => '09333333333',
      'status' => OrderStatus::READY,
      'total_amount' => 105.00
    ]);

    // Test active orders endpoint (should only return accepted and preparing)
    $response = $this->getJson('/api/orders/active');
    $response->assertStatus(200);

    $orders = $response->json('orders');
    $this->assertCount(2, $orders);

    // Verify only accepted and preparing orders are returned
    $orderIds = collect($orders)->pluck('id')->toArray();
    $this->assertContains($acceptedOrder->id, $orderIds);
    $this->assertContains($preparingOrder->id, $orderIds);
    $this->assertNotContains($readyOrder->id, $orderIds);
  }

  public function test_polling_etag_uniqueness_across_endpoints(): void
  {
    // Create orders in different states
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

    // Get ETags from different endpoints
    $pendingResponse = $this->getJson('/api/orders/pending');
    $acceptedResponse = $this->getJson('/api/orders/accepted');
    $statsResponse = $this->getJson('/api/orders/stats');
    $statusResponse = $this->getJson("/api/orders/{$pendingOrder->id}/status");

    $pendingEtag = $pendingResponse->headers->get('ETag');
    $acceptedEtag = $acceptedResponse->headers->get('ETag');
    $statsEtag = $statsResponse->headers->get('ETag');
    $statusEtag = $statusResponse->headers->get('ETag');

    // ETags should exist and be strings
    $etags = [$pendingEtag, $acceptedEtag, $statsEtag, $statusEtag];
    foreach ($etags as $etag) {
      $this->assertNotNull($etag);
      $this->assertIsString($etag);
    }

    // At least some ETags should be different (they represent different data)
    $uniqueEtags = array_unique($etags);
    $this->assertGreaterThanOrEqual(2, count($uniqueEtags));

    // Update pending order to accepted - should affect multiple endpoints
    $pendingOrder->update(['status' => OrderStatus::ACCEPTED]);

    // Check that relevant ETags changed
    $newPendingResponse = $this->getJson('/api/orders/pending');
    $newAcceptedResponse = $this->getJson('/api/orders/accepted');
    $newStatsResponse = $this->getJson('/api/orders/stats');
    $newStatusResponse = $this->getJson("/api/orders/{$pendingOrder->id}/status");

    $this->assertNotEquals($pendingEtag, $newPendingResponse->headers->get('ETag'));
    $this->assertNotEquals($acceptedEtag, $newAcceptedResponse->headers->get('ETag'));
    $this->assertNotEquals($statsEtag, $newStatsResponse->headers->get('ETag'));
    $this->assertNotEquals($statusEtag, $newStatusResponse->headers->get('ETag'));
  }
}
