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

class OrderApiTest extends TestCase
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
    // Create category
    $category = Category::create([
      'name' => 'Coffee',
      'slug' => 'coffee'
    ]);

    // Create menu item
    MenuItem::create([
      'category_id' => $category->id,
      'name' => 'Americano',
      'description' => 'Classic black coffee',
      'base_price' => 70.00,
      'is_available' => true
    ]);

    // Create addon
    Addon::create([
      'name' => 'Extra Shot',
      'price' => 15.00,
      'is_available' => true
    ]);

    // Create test users
    User::create([
      'name' => 'Test Cashier',
      'email' => 'cashier@test.com',
      'password' => bcrypt('password'),
      'role' => UserRole::CASHIER
    ]);

    User::create([
      'name' => 'Test Owner',
      'email' => 'owner@test.com',
      'password' => bcrypt('password'),
      'role' => UserRole::OWNER
    ]);
  }

  public function test_can_get_menu_categories(): void
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
            'menu_items'
          ]
        ]
      ]);
  }

  public function test_can_get_addons(): void
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
      ]);
  }

  public function test_can_create_order(): void
  {
    $menuItem = MenuItem::first();
    $addon = Addon::first();

    $orderData = [
      'customer_name' => 'John Doe',
      'customer_phone' => '09123456789',
      'items' => [
        [
          'menu_item_id' => $menuItem->id,
          'quantity' => 1,
          'size' => Size::DAILY->value,
          'variant' => Variant::HOT->value,
          'addons' => [
            [
              'addon_id' => $addon->id,
              'quantity' => 1
            ]
          ]
        ]
      ]
    ];

    $response = $this->postJson('/api/orders', $orderData);

    $response->assertStatus(201)
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

    $this->assertDatabaseHas('orders', [
      'customer_name' => 'John Doe',
      'status' => OrderStatus::PENDING->value
    ]);
  }

  public function test_can_get_pending_orders(): void
  {
    // Create a test order
    $order = Order::create([
      'customer_name' => 'Test Customer',
      'customer_phone' => '09123456789',
      'status' => OrderStatus::PENDING,
      'total_amount' => 85.00
    ]);

    $response = $this->getJson('/api/orders/pending');

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
  }

  public function test_can_accept_order(): void
  {
    $cashier = User::where('role', UserRole::CASHIER)->first();
    $order = Order::create([
      'customer_name' => 'Test Customer',
      'customer_phone' => '09123456789',
      'status' => OrderStatus::PENDING,
      'total_amount' => 85.00
    ]);

    $response = $this->patchJson("/api/orders/{$order->id}/accept", [
      'cashier_id' => $cashier->id
    ]);

    $response->assertStatus(200)
      ->assertJson([
        'success' => true,
        'message' => 'Order accepted successfully'
      ]);

    $this->assertDatabaseHas('orders', [
      'id' => $order->id,
      'status' => OrderStatus::ACCEPTED->value,
      'cashier_id' => $cashier->id
    ]);
  }

  public function test_can_mark_order_ready(): void
  {
    $owner = User::where('role', UserRole::OWNER)->first();
    $order = Order::create([
      'customer_name' => 'Test Customer',
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
  }

  public function test_can_get_order_status(): void
  {
    // Get the menu item and addon IDs from the database
    $menuItem = MenuItem::first();
    $addon = Addon::first();

    // Create an order with items
    $orderData = [
      'customer_name' => 'Jane Doe',
      'customer_phone' => '09123456789',
      'items' => [
        [
          'menu_item_id' => $menuItem->id,
          'quantity' => 1,
          'size' => Size::DAILY->value,
          'variant' => Variant::HOT->value,
          'addons' => [
            [
              'addon_id' => $addon->id,
              'quantity' => 1
            ]
          ]
        ]
      ]
    ];

    $createResponse = $this->postJson('/api/orders', $orderData);
    $createResponse->assertStatus(201);
    $orderId = $createResponse->json('order.id');

    $this->assertNotNull($orderId, 'Order ID should not be null');

    // Test getting order status
    $response = $this->getJson("/api/orders/{$orderId}/status");

    $response->assertStatus(200)
      ->assertJsonStructure([
        'success',
        'data' => [
          'id',
          'customer_name',
          'customer_phone',
          'status',
          'total_amount',
          'created_at',
          'updated_at',
          'order_items' => [
            '*' => [
              'id',
              'menu_item_id',
              'quantity',
              'size',
              'variant',
              'unit_price',
              'subtotal',
              'menu_item' => [
                'id',
                'name',
                'description',
                'base_price'
              ],
              'addons' => [
                '*' => [
                  'id',
                  'addon_id',
                  'quantity',
                  'unit_price',
                  'addon' => [
                    'id',
                    'name',
                    'price'
                  ]
                ]
              ]
            ]
          ]
        ],
        'meta' => [
          'last_updated',
          'is_active'
        ]
      ]);

    $this->assertEquals('Jane Doe', $response->json('data.customer_name'));
    $this->assertEquals(OrderStatus::PENDING->value, $response->json('data.status'));
  }

  public function test_can_generate_receipt_for_served_order(): void
  {
    $cashier = User::where('role', UserRole::CASHIER)->first();
    $owner = User::where('role', UserRole::OWNER)->first();
    $menuItem = MenuItem::first();
    $addon = Addon::first();

    // Create an order with items
    $orderData = [
      'customer_name' => 'Receipt Test Customer',
      'customer_phone' => '09123456789',
      'items' => [
        [
          'menu_item_id' => $menuItem->id,
          'quantity' => 2,
          'size' => Size::EXTRA->value,
          'variant' => Variant::COLD->value,
          'addons' => [
            [
              'addon_id' => $addon->id,
              'quantity' => 1
            ]
          ]
        ]
      ]
    ];

    $createResponse = $this->postJson('/api/orders', $orderData);
    $createResponse->assertStatus(201);
    $orderId = $createResponse->json('order.id');

    // Progress order through workflow to served status
    $order = Order::find($orderId);
    $order->update([
      'status' => OrderStatus::ACCEPTED,
      'cashier_id' => $cashier->id
    ]);
    $order->update([
      'status' => OrderStatus::READY,
      'owner_id' => $owner->id
    ]);
    $order->update(['status' => OrderStatus::SERVED]);

    // Test receipt generation
    $response = $this->getJson("/api/orders/{$orderId}/receipt");

    $response->assertStatus(200)
      ->assertJsonStructure([
        'success',
        'data' => [
          'order_info' => [
            'id',
            'customer_name',
            'customer_phone',
            'status',
            'created_at',
            'updated_at',
            'served_at'
          ],
          'staff_info' => [
            'cashier' => [
              'id',
              'name'
            ],
            'owner' => [
              'id',
              'name'
            ]
          ],
          'items_breakdown' => [
            '*' => [
              'menu_item' => [
                'name',
                'category'
              ],
              'quantity',
              'size',
              'variant',
              'unit_price',
              'base_subtotal',
              'addons',
              'addon_total',
              'item_total'
            ]
          ],
          'pricing' => [
            'subtotal',
            'total_amount',
            'currency',
            'items_count',
            'total_quantity'
          ],
          'business_info' => [
            'name',
            'tagline',
            'receipt_footer'
          ],
          'receipt_metadata' => [
            'generated_at',
            'receipt_number',
            'format_version'
          ]
        ]
      ]);

    // Verify receipt data
    $receiptData = $response->json('data');
    $this->assertEquals('Receipt Test Customer', $receiptData['order_info']['customer_name']);
    $this->assertEquals('served', $receiptData['order_info']['status']);
    $this->assertEquals('Test Cashier', $receiptData['staff_info']['cashier']['name']);
    $this->assertEquals('Test Owner', $receiptData['staff_info']['owner']['name']);
    $this->assertEquals('KlaséCo', $receiptData['business_info']['name']);
    $this->assertEquals('PHP', $receiptData['pricing']['currency']);
    $this->assertEquals(1, $receiptData['pricing']['items_count']);
    $this->assertEquals(2, $receiptData['pricing']['total_quantity']);
    $this->assertStringStartsWith('R', $receiptData['receipt_metadata']['receipt_number']);
  }

  public function test_cannot_generate_receipt_for_non_served_order(): void
  {
    $order = Order::create([
      'customer_name' => 'Test Customer',
      'customer_phone' => '09123456789',
      'status' => OrderStatus::PENDING,
      'total_amount' => 85.00
    ]);

    $response = $this->getJson("/api/orders/{$order->id}/receipt");

    $response->assertStatus(422)
      ->assertJson([
        'success' => false,
        'message' => 'Receipt can only be generated for served orders'
      ]);
  }
}
