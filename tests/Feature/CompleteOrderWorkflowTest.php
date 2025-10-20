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

class CompleteOrderWorkflowTest extends TestCase
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

  public function test_complete_order_workflow_from_placement_to_completion(): void
  {
    // Step 1: Customer places order
    $orderData = [
      'customer_name' => 'John Doe',
      'customer_phone' => '09123456789',
      'items' => [
        [
          'menu_item_id' => $this->menuItem->id,
          'quantity' => 2,
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
    $createResponse->assertStatus(201)
      ->assertJsonStructure([
        'success',
        'message',
        'order' => [
          'id',
          'customer_name',
          'customer_phone',
          'status',
          'total_amount',
          'order_items'
        ]
      ]);

    $orderId = $createResponse->json('order.id');
    $this->assertNotNull($orderId);

    // Verify order is in pending status
    $this->assertDatabaseHas('orders', [
      'id' => $orderId,
      'customer_name' => 'John Doe',
      'status' => OrderStatus::PENDING->value
    ]);

    // Step 2: Cashier views pending orders
    $pendingResponse = $this->getJson('/api/orders/pending');
    $pendingResponse->assertStatus(200)
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

    $pendingOrders = $pendingResponse->json('data');
    $this->assertCount(1, $pendingOrders);
    $this->assertEquals($orderId, $pendingOrders[0]['id']);

    // Step 3: Cashier accepts the order
    $acceptResponse = $this->patchJson("/api/orders/{$orderId}/accept", [
      'cashier_id' => $this->cashier->id
    ]);

    $acceptResponse->assertStatus(200)
      ->assertJson([
        'success' => true,
        'message' => 'Order accepted successfully'
      ]);

    // Verify order status changed to accepted
    $this->assertDatabaseHas('orders', [
      'id' => $orderId,
      'status' => OrderStatus::ACCEPTED->value,
      'cashier_id' => $this->cashier->id
    ]);

    // Step 4: Owner views accepted orders
    $acceptedResponse = $this->getJson('/api/orders/accepted');
    $acceptedResponse->assertStatus(200)
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

    $acceptedOrders = $acceptedResponse->json('data');
    $this->assertCount(1, $acceptedOrders);
    $this->assertEquals($orderId, $acceptedOrders[0]['id']);

    // Step 5: Owner marks order as ready
    $readyResponse = $this->patchJson("/api/orders/{$orderId}/ready");

    $readyResponse->assertStatus(200)
      ->assertJson([
        'message' => 'Order marked as ready successfully'
      ]);

    // Verify order status changed to ready
    $this->assertDatabaseHas('orders', [
      'id' => $orderId,
      'status' => OrderStatus::READY->value
    ]);

    // Step 6: Customer checks order status
    $statusResponse = $this->getJson("/api/orders/{$orderId}/status");
    $statusResponse->assertStatus(200)
      ->assertJson([
        'success' => true,
        'data' => [
          'id' => $orderId,
          'status' => OrderStatus::READY->value,
          'customer_name' => 'John Doe'
        ]
      ]);

    // Step 7: Customer marks order as served
    $servedResponse = $this->patchJson("/api/orders/{$orderId}/served");
    $servedResponse->assertStatus(200)
      ->assertJson([
        'success' => true,
        'message' => 'Order marked as served'
      ]);

    // Verify final order status
    $this->assertDatabaseHas('orders', [
      'id' => $orderId,
      'status' => OrderStatus::SERVED->value
    ]);

    // Step 8: Verify complete order data integrity
    $finalOrder = Order::with(['orderItems.menuItem', 'orderItems.addons.addon', 'cashier', 'owner'])
      ->find($orderId);

    $this->assertNotNull($finalOrder);
    $this->assertEquals('John Doe', $finalOrder->customer_name);
    $this->assertEquals(OrderStatus::SERVED, $finalOrder->status);
    $this->assertEquals($this->cashier->id, $finalOrder->cashier_id);

    // Verify order items
    $this->assertCount(1, $finalOrder->orderItems);
    $orderItem = $finalOrder->orderItems->first();
    $this->assertEquals(2, $orderItem->quantity);
    $this->assertEquals(Size::DAILY, $orderItem->size);
    $this->assertEquals(Variant::HOT, $orderItem->variant);

    // Verify addons
    $this->assertCount(1, $orderItem->addons);
    $addon = $orderItem->addons->first();
    $this->assertEquals($this->addon->id, $addon->addon_id);
    $this->assertEquals(1, $addon->quantity);
  }

  public function test_order_rejection_workflow(): void
  {
    // Step 1: Customer places order
    $orderData = [
      'customer_name' => 'Jane Doe',
      'customer_phone' => '09987654321',
      'items' => [
        [
          'menu_item_id' => $this->menuItem->id,
          'quantity' => 1,
          'size' => Size::EXTRA->value,
          'variant' => Variant::COLD->value,
          'addons' => []
        ]
      ]
    ];

    $createResponse = $this->postJson('/api/orders', $orderData);
    $createResponse->assertStatus(201);
    $orderId = $createResponse->json('order.id');

    // Step 2: Cashier rejects the order
    $rejectResponse = $this->patchJson("/api/orders/{$orderId}/reject", [
      'cashier_id' => $this->cashier->id
    ]);

    $rejectResponse->assertStatus(200)
      ->assertJson([
        'success' => true,
        'message' => 'Order rejected successfully'
      ]);

    // Verify order status changed to cancelled
    $this->assertDatabaseHas('orders', [
      'id' => $orderId,
      'status' => OrderStatus::CANCELLED->value,
      'cashier_id' => $this->cashier->id
    ]);

    // Step 3: Verify rejected order doesn't appear in accepted orders
    $acceptedResponse = $this->getJson('/api/orders/accepted');
    $acceptedOrders = $acceptedResponse->json('data');

    $rejectedOrderInAccepted = collect($acceptedOrders)->firstWhere('id', $orderId);
    $this->assertNull($rejectedOrderInAccepted);
  }

  public function test_multiple_orders_workflow(): void
  {
    // Create multiple orders
    $orders = [];
    for ($i = 1; $i <= 3; $i++) {
      $orderData = [
        'customer_name' => "Customer {$i}",
        'customer_phone' => "0912345678{$i}",
        'items' => [
          [
            'menu_item_id' => $this->menuItem->id,
            'quantity' => $i,
            'size' => Size::DAILY->value,
            'variant' => Variant::HOT->value,
            'addons' => []
          ]
        ]
      ];

      $response = $this->postJson('/api/orders', $orderData);
      $response->assertStatus(201);
      $orders[] = $response->json('order.id');
    }

    // Verify all orders are pending
    $pendingResponse = $this->getJson('/api/orders/pending');
    $pendingOrders = $pendingResponse->json('data');
    $this->assertCount(3, $pendingOrders);

    // Accept first order
    $this->patchJson("/api/orders/{$orders[0]}/accept", [
      'cashier_id' => $this->cashier->id
    ])->assertStatus(200);

    // Reject second order
    $this->patchJson("/api/orders/{$orders[1]}/reject", [
      'cashier_id' => $this->cashier->id
    ])->assertStatus(200);

    // Third order remains pending

    // Check pending orders (should have 1)
    $pendingResponse = $this->getJson('/api/orders/pending');
    $pendingOrders = $pendingResponse->json('data');
    $this->assertCount(1, $pendingOrders);
    $this->assertEquals($orders[2], $pendingOrders[0]['id']);

    // Check accepted orders (should have 1)
    $acceptedResponse = $this->getJson('/api/orders/accepted');
    $acceptedOrders = $acceptedResponse->json('data');
    $this->assertCount(1, $acceptedOrders);
    $this->assertEquals($orders[0], $acceptedOrders[0]['id']);
  }

  public function test_order_pricing_calculation(): void
  {
    // Test Daily size pricing
    $orderData = [
      'customer_name' => 'Price Test Customer',
      'customer_phone' => '09123456789',
      'items' => [
        [
          'menu_item_id' => $this->menuItem->id,
          'quantity' => 2,
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

    $response = $this->postJson('/api/orders', $orderData);
    $response->assertStatus(201);

    $order = $response->json('order');

    // Expected calculation:
    // Base price: ₱70.00 (Daily size, multiplier 1.0)
    // Quantity: 2
    // Subtotal: ₱70.00 * 2 = ₱140.00
    // Addon: ₱15.00 * 1 * 2 (per item) = ₱30.00
    // Total: ₱140.00 + ₱30.00 = ₱170.00
    $expectedTotal = 170.00;

    $this->assertEquals($expectedTotal, $order['total_amount']);

    // Test Extra size pricing
    $orderData['items'][0]['size'] = Size::EXTRA->value;
    $response = $this->postJson('/api/orders', $orderData);
    $response->assertStatus(201);

    $order = $response->json('order');

    // Expected calculation:
    // Base price: ₱70.00 * 1.3 = ₱91.00 (Extra size)
    // Quantity: 2
    // Subtotal: ₱91.00 * 2 = ₱182.00
    // Addon: ₱15.00 * 1 * 2 = ₱30.00
    // Total: ₱182.00 + ₱30.00 = ₱212.00
    $expectedTotal = 212.00;

    $this->assertEquals($expectedTotal, $order['total_amount']);
  }
}
