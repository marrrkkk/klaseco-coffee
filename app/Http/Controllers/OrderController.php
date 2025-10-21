<?php

namespace App\Http\Controllers;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\User;
use App\Enums\UserRole;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
  /**
   * Store a new order (customer creates order).
   */
  public function store(Request $request): JsonResponse
  {
    $validated = $request->validate([
      'customer_name' => 'required|string|max:255',
      'customer_phone' => 'nullable|string|max:20',
      'order_type' => 'required|in:dine_in,take_away',
      'payment_method' => 'required|in:cash,gcash',
      'items' => 'required|array|min:1',
      'items.*.menu_item_id' => 'required|exists:menu_items,id',
      'items.*.quantity' => 'required|integer|min:1',
      'items.*.size' => 'required|in:daily,extra',
      'items.*.variant' => 'required|in:hot,cold',
      'items.*.addons' => 'nullable|array',
      'items.*.addons.*.addon_id' => 'required|exists:addons,id',
      'items.*.addons.*.quantity' => 'required|integer|min:1',
    ]);

    try {
      DB::beginTransaction();

      $order = Order::create([
        'customer_name' => $validated['customer_name'],
        'customer_phone' => $validated['customer_phone'],
        'order_type' => $validated['order_type'],
        'payment_method' => $validated['payment_method'],
        'status' => OrderStatus::PENDING,
        'total_amount' => 0, // Will be calculated
      ]);

      $totalAmount = 0;

      foreach ($validated['items'] as $item) {
        $menuItem = \App\Models\MenuItem::findOrFail($item['menu_item_id']);

        // Calculate price based on size
        $sizeMultiplier = $item['size'] === 'extra' ? 1.3 : 1.0;
        $unitPrice = $menuItem->base_price * $sizeMultiplier;
        $subtotal = $unitPrice * $item['quantity'];

        $orderItem = $order->orderItems()->create([
          'menu_item_id' => $item['menu_item_id'],
          'quantity' => $item['quantity'],
          'size' => $item['size'],
          'variant' => $item['variant'],
          'unit_price' => $unitPrice,
          'subtotal' => $subtotal,
        ]);

        $totalAmount += $subtotal;

        // Add addons if present
        if (!empty($item['addons'])) {
          foreach ($item['addons'] as $addon) {
            $addonModel = \App\Models\Addon::findOrFail($addon['addon_id']);

            $orderItem->addons()->create([
              'addon_id' => $addon['addon_id'],
              'quantity' => $addon['quantity'],
              'unit_price' => $addonModel->price,
            ]);

            // Addon cost should be multiplied by both addon quantity and item quantity
            $totalAmount += $addonModel->price * $addon['quantity'] * $item['quantity'];
          }
        }
      }

      $order->update(['total_amount' => $totalAmount]);

      DB::commit();

      return response()->json([
        'message' => 'Order placed successfully',
        'order' => $this->formatOrderResponse($order->fresh(['orderItems.menuItem', 'orderItems.addons.addon'])),
      ], 201);
    } catch (\Exception $e) {
      DB::rollBack();
      Log::error('Order creation failed', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
        'request_data' => $request->all()
      ]);
      return response()->json([
        'message' => 'Failed to create order',
        'error' => $e->getMessage(),
        'details' => config('app.debug') ? $e->getTraceAsString() : null,
      ], 500);
    }
  }

  /**
   * Get order status for customer tracking with elegant formatting.
   */
  public function getOrderStatus(Order $order): JsonResponse
  {
    $order->load(['orderItems.menuItem', 'orderItems.addons.addon', 'cashier', 'owner']);

    return response()->json([
      'order' => $this->formatOrderResponse($order),
      'status_display' => $this->getElegantStatusDisplay($order->status),
    ]);
  }

  /**
   * Get pending orders for cashier queue.
   */
  public function getPendingOrders(): JsonResponse
  {
    $orders = Order::where('status', OrderStatus::PENDING)
      ->with(['orderItems.menuItem', 'orderItems.addons.addon'])
      ->orderBy('created_at', 'asc')
      ->get();

    return response()->json([
      'success' => true,
      'data' => $orders->map(fn($order) => $this->formatOrderResponse($order)),
      'meta' => [
        'count' => $orders->count(),
        'timestamp' => now()->toISOString(),
      ],
    ]);
  }

  /**
   * Get active orders for owner's streamlined preparation queue.
   * This endpoint shows only orders that are in preparation (accepted/preparing).
   */
  public function getActiveOrders(): JsonResponse
  {
    $orders = Order::whereIn('status', [OrderStatus::ACCEPTED, OrderStatus::PREPARING])
      ->with(['orderItems.menuItem', 'orderItems.addons.addon', 'cashier'])
      ->orderBy('created_at', 'asc')
      ->get();

    return response()->json([
      'success' => true,
      'data' => $orders->map(fn($order) => $this->formatOrderResponse($order)),
      'meta' => [
        'count' => $orders->count(),
        'timestamp' => now()->toISOString(),
      ],
    ]);
  }

  /**
   * Get accepted orders (legacy endpoint for compatibility).
   */
  public function getAcceptedOrders(): JsonResponse
  {
    $orders = Order::where('status', OrderStatus::ACCEPTED)
      ->with(['orderItems.menuItem', 'orderItems.addons.addon', 'cashier'])
      ->orderBy('created_at', 'asc')
      ->get();

    return response()->json([
      'success' => true,
      'data' => $orders->map(fn($order) => $this->formatOrderResponse($order)),
      'meta' => [
        'count' => $orders->count(),
        'timestamp' => now()->toISOString(),
      ],
    ]);
  }

  /**
   * Get orders by status.
   */
  public function getOrdersByStatus(string $status): JsonResponse
  {
    $validStatuses = array_column(OrderStatus::cases(), 'value');

    if (!in_array($status, $validStatuses)) {
      return response()->json(['message' => 'Invalid status'], 400);
    }

    $orders = Order::where('status', $status)
      ->with(['orderItems.menuItem', 'orderItems.addons.addon', 'cashier', 'owner'])
      ->orderBy('created_at', 'desc')
      ->get();

    return response()->json([
      'orders' => $orders->map(fn($order) => $this->formatOrderResponse($order)),
    ]);
  }

  /**
   * Get queue statistics for smart polling.
   */
  public function getQueueStats(): JsonResponse
  {
    return response()->json([
      'success' => true,
      'data' => [
        'pending_count' => Order::where('status', OrderStatus::PENDING)->count(),
        'accepted_count' => Order::where('status', OrderStatus::ACCEPTED)->count(),
        'preparing_count' => Order::where('status', OrderStatus::PREPARING)->count(),
        'active_count' => Order::whereIn('status', [OrderStatus::ACCEPTED, OrderStatus::PREPARING])->count(),
        'ready_count' => Order::where('status', OrderStatus::READY)->count(),
        'served_count' => Order::where('status', OrderStatus::SERVED)->count(),
        'cancelled_count' => Order::where('status', OrderStatus::CANCELLED)->count(),
      ],
      'meta' => [
        'timestamp' => now()->toISOString(),
      ],
    ]);
  }

  /**
   * Get order history (all non-pending orders).
   */
  public function getOrderHistory(): JsonResponse
  {
    $orders = Order::whereIn('status', [
      OrderStatus::ACCEPTED,
      OrderStatus::PREPARING,
      OrderStatus::READY,
      OrderStatus::SERVED,
      OrderStatus::CANCELLED
    ])
      ->with(['orderItems.menuItem', 'orderItems.addons.addon', 'cashier', 'owner'])
      ->orderBy('updated_at', 'desc')
      ->limit(50) // Limit to last 50 orders
      ->get();

    return response()->json([
      'success' => true,
      'data' => $orders->map(fn($order) => $this->formatOrderResponse($order)),
      'meta' => [
        'count' => $orders->count(),
        'timestamp' => now()->toISOString(),
      ],
    ]);
  }

  /**
   * Show specific order details.
   */
  public function show(Order $order): JsonResponse
  {
    $order->load(['orderItems.menuItem', 'orderItems.addons.addon', 'cashier', 'owner']);

    return response()->json([
      'order' => $this->formatOrderResponse($order),
    ]);
  }

  /**
   * Update order status (general endpoint).
   */
  public function updateStatus(Request $request, Order $order): JsonResponse
  {
    $validated = $request->validate([
      'status' => ['required', Rule::in(array_column(OrderStatus::cases(), 'value'))],
    ]);

    $order->update(['status' => $validated['status']]);

    return response()->json([
      'message' => 'Order status updated successfully',
      'order' => $this->formatOrderResponse($order->fresh(['orderItems.menuItem', 'orderItems.addons.addon', 'cashier', 'owner'])),
      'status_display' => $this->getElegantStatusDisplay($order->status),
    ]);
  }

  /**
   * Accept order (cashier action).
   */
  public function acceptOrder(Request $request, Order $order): JsonResponse
  {
    // Check if order exists
    if (!$order) {
      Log::error('Order not found for acceptance', [
        'order_id' => $request->route('order'),
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Order not found',
      ], 404);
    }

    if ($order->status !== OrderStatus::PENDING) {
      return response()->json([
        'success' => false,
        'message' => 'Order cannot be accepted in current status',
      ], 400);
    }

    // Get a valid cashier ID - either from authenticated user or find first cashier
    $cashierId = $request->user()?->id;
    if (!$cashierId) {
      // Find the first cashier user if no authenticated user
      $cashier = User::where('role', UserRole::CASHIER)->first();
      $cashierId = $cashier?->id;
    }

    $order->update([
      'status' => OrderStatus::ACCEPTED,
      'cashier_id' => $cashierId,
    ]);

    return response()->json([
      'success' => true,
      'message' => 'Order accepted successfully',
      'order' => $this->formatOrderResponse($order->fresh(['orderItems.menuItem', 'orderItems.addons.addon', 'cashier'])),
      'status_display' => $this->getElegantStatusDisplay($order->status),
    ]);
  }

  /**
   * Reject order (cashier action).
   */
  public function rejectOrder(Request $request, Order $order): JsonResponse
  {
    // Check if order exists
    if (!$order) {
      Log::error('Order not found for rejection', [
        'order_id' => $request->route('order'),
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Order not found',
      ], 404);
    }

    // Log the current order status for debugging
    Log::info('Reject order attempt', [
      'order_id' => $order->id,
      'current_status' => $order->status->value,
      'user_id' => $request->user()?->id,
    ]);

    if ($order->status !== OrderStatus::PENDING) {
      Log::warning('Order rejection failed - wrong status', [
        'order_id' => $order->id,
        'current_status' => $order->status->value,
        'expected_status' => OrderStatus::PENDING->value,
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Order cannot be rejected in current status',
        'current_status' => $order->status->value,
        'order_id' => $order->id,
      ], 400);
    }

    // Get a valid cashier ID - either from authenticated user or find first cashier
    $cashierId = $request->user()?->id;
    if (!$cashierId) {
      // Find the first cashier user if no authenticated user
      $cashier = User::where('role', UserRole::CASHIER)->first();
      $cashierId = $cashier?->id;
    }

    $order->update([
      'status' => OrderStatus::CANCELLED,
      'cashier_id' => $cashierId,
    ]);

    Log::info('Order rejected successfully', [
      'order_id' => $order->id,
      'cashier_id' => $request->user()?->id,
    ]);

    return response()->json([
      'success' => true,
      'message' => 'Order rejected successfully',
      'order' => $this->formatOrderResponse($order->fresh(['orderItems.menuItem', 'orderItems.addons.addon', 'cashier'])),
      'status_display' => $this->getElegantStatusDisplay($order->status),
    ]);
  }

  /**
   * Mark order as ready (owner action).
   */
  public function markReady(Request $request, Order $order): JsonResponse
  {
    if (!in_array($order->status, [OrderStatus::ACCEPTED, OrderStatus::PREPARING])) {
      return response()->json([
        'success' => false,
        'message' => 'Order cannot be marked as ready in current status',
      ], 400);
    }

    $order->update([
      'status' => OrderStatus::READY,
      'owner_id' => $request->user()?->id,
    ]);

    return response()->json([
      'success' => true,
      'message' => 'Order marked as ready successfully',
      'order' => $this->formatOrderResponse($order->fresh(['orderItems.menuItem', 'orderItems.addons.addon', 'cashier', 'owner'])),
      'status_display' => $this->getElegantStatusDisplay($order->status),
    ]);
  }

  /**
   * Mark order as served (customer confirmation).
   */
  public function markServed(Order $order): JsonResponse
  {
    if ($order->status !== OrderStatus::READY) {
      return response()->json([
        'message' => 'Order cannot be marked as served in current status',
      ], 400);
    }

    $order->update(['status' => OrderStatus::SERVED]);

    return response()->json([
      'message' => 'Order marked as served successfully',
      'order' => $this->formatOrderResponse($order->fresh(['orderItems.menuItem', 'orderItems.addons.addon', 'cashier', 'owner'])),
      'status_display' => $this->getElegantStatusDisplay($order->status),
    ]);
  }

  /**
   * Generate receipt for served orders.
   */
  public function generateReceipt(Order $order): JsonResponse
  {
    if ($order->status !== OrderStatus::SERVED) {
      return response()->json([
        'message' => 'Receipt can only be generated for served orders',
      ], 400);
    }

    $order->load(['orderItems.menuItem', 'orderItems.addons.addon', 'cashier', 'owner']);

    return response()->json([
      'receipt' => [
        'order_id' => $order->id,
        'order_number' => str_pad($order->id, 4, '0', STR_PAD_LEFT),
        'customer_name' => $order->customer_name,
        'customer_phone' => $order->customer_phone,
        'order_type' => $order->order_type === 'dine_in' ? 'Dine In' : 'Take Away',
        'payment_method' => $order->payment_method === 'cash' ? 'Cash' : 'GCash',
        'items' => $order->orderItems->map(function ($item) {
          return [
            'name' => $item->menuItem->name,
            'size' => ucfirst($item->size->value),
            'variant' => ucfirst($item->variant->value),
            'quantity' => $item->quantity,
            'unit_price' => number_format($item->unit_price, 2),
            'subtotal' => number_format($item->subtotal, 2),
            'addons' => $item->addons->map(function ($addon) {
              return [
                'name' => $addon->addon->name,
                'quantity' => $addon->quantity,
                'unit_price' => number_format((float) $addon->unit_price, 2),
              ];
            }),
          ];
        }),
        'total_amount' => number_format((float) $order->total_amount, 2),
        'status' => $this->getElegantStatusDisplay($order->status),
        'created_at' => $order->created_at->format('M d, Y h:i A'),
        'served_at' => $order->updated_at->format('M d, Y h:i A'),
      ],
    ]);
  }

  /**
   * Format order response with elegant structure.
   */
  private function formatOrderResponse(Order $order): array
  {
    return [
      'id' => $order->id,
      'order_number' => str_pad($order->id, 4, '0', STR_PAD_LEFT),
      'customer_name' => $order->customer_name,
      'customer_phone' => $order->customer_phone,
      'order_type' => $order->order_type,
      'order_type_display' => $order->order_type === 'dine_in' ? 'Dine In' : 'Take Away',
      'payment_method' => $order->payment_method,
      'payment_method_display' => $order->payment_method === 'cash' ? 'Cash' : 'GCash',
      'status' => $order->status->value,
      'status_display' => $this->getElegantStatusDisplay($order->status),
      'total_amount' => number_format((float) $order->total_amount, 2),
      'items' => $order->orderItems->map(function ($item) {
        return [
          'id' => $item->id,
          'menu_item' => [
            'id' => $item->menuItem->id,
            'name' => $item->menuItem->name,
            'description' => $item->menuItem->description,
          ],
          'quantity' => $item->quantity,
          'size' => $item->size->value,
          'size_display' => ucfirst($item->size->value),
          'variant' => $item->variant->value,
          'variant_display' => ucfirst($item->variant->value),
          'unit_price' => number_format((float) $item->unit_price, 2),
          'subtotal' => number_format((float) $item->subtotal, 2),
          'addons' => $item->addons->map(function ($addon) {
            return [
              'id' => $addon->id,
              'name' => $addon->addon->name,
              'quantity' => $addon->quantity,
              'unit_price' => number_format((float) $addon->unit_price, 2),
            ];
          }),
        ];
      }),
      'cashier' => $order->cashier ? [
        'id' => $order->cashier->id,
        'name' => $order->cashier->name,
      ] : null,
      'owner' => $order->owner ? [
        'id' => $order->owner->id,
        'name' => $order->owner->name,
      ] : null,
      'created_at' => $order->created_at->format('M d, Y h:i A'),
      'updated_at' => $order->updated_at->format('M d, Y h:i A'),
    ];
  }

  /**
   * Get elegant status display for premium customer notifications.
   */
  private function getElegantStatusDisplay(OrderStatus $status): array
  {
    return match ($status) {
      OrderStatus::PENDING => [
        'label' => 'Order Received',
        'message' => 'Your order has been received and is awaiting confirmation.',
        'icon' => '📋',
        'color' => 'gray',
      ],
      OrderStatus::ACCEPTED => [
        'label' => 'Preparing Your Order',
        'message' => 'Our barista is crafting your coffee with care.',
        'icon' => '☕',
        'color' => 'blue',
      ],
      OrderStatus::PREPARING => [
        'label' => 'In Preparation',
        'message' => 'Your order is being carefully prepared.',
        'icon' => '👨‍🍳',
        'color' => 'amber',
      ],
      OrderStatus::READY => [
        'label' => 'Ready for Pickup',
        'message' => 'Your order is ready! Please proceed to the counter.',
        'icon' => '✨',
        'color' => 'green',
      ],
      OrderStatus::SERVED => [
        'label' => 'Order Complete',
        'message' => 'Thank you for choosing KlaséCo. Enjoy your coffee!',
        'icon' => '✓',
        'color' => 'emerald',
      ],
      OrderStatus::CANCELLED => [
        'label' => 'Order Cancelled',
        'message' => 'We apologize, but your order could not be processed.',
        'icon' => '✕',
        'color' => 'red',
      ],
    };
  }
}
