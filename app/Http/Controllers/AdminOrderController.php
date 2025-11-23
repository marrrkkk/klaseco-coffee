<?php

namespace App\Http\Controllers;

use App\Enums\OrderStatus;
use App\Models\Category;
use App\Models\MenuItem;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AdminOrderController extends Controller
{
  /**
   * Display the admin dashboard with statistics and overview data.
   */
  public function dashboard(): Response
  {
    // Calculate overall statistics
    $totalOrders = Order::count();
    $totalRevenue = Order::sum('total_amount');
    $activeProducts = MenuItem::where('is_available', true)->count();
    $totalCategories = Category::count();

    // Get orders from today
    $ordersToday = Order::whereDate('created_at', today())->count();
    $revenueToday = Order::whereDate('created_at', today())->sum('total_amount');

    // Get pending orders count
    $pendingOrders = Order::where('status', OrderStatus::PENDING)->count();

    // Get recent orders (last 10)
    $recentOrders = Order::with(['orderItems.menuItem', 'cashier', 'owner'])
      ->orderBy('created_at', 'desc')
      ->limit(10)
      ->get()
      ->map(fn($order) => $this->formatOrderForDashboard($order));

    // Get trending products (top 5 by order count in last 30 days)
    $trendingProducts = MenuItem::select('menu_items.*')
      ->selectRaw('COUNT(order_items.id) as order_count')
      ->selectRaw('SUM(order_items.subtotal) as revenue')
      ->join('order_items', 'menu_items.id', '=', 'order_items.menu_item_id')
      ->join('orders', 'order_items.order_id', '=', 'orders.id')
      ->where('orders.created_at', '>=', now()->subDays(30))
      ->groupBy('menu_items.id')
      ->orderByDesc('order_count')
      ->limit(5)
      ->get()
      ->map(function ($product) {
        return [
          'product' => [
            'id' => $product->id,
            'name' => $product->name,
            'description' => $product->description,
            'image_url' => $product->image_url,
            'base_price' => number_format((float) $product->base_price, 2),
          ],
          'order_count' => $product->order_count,
          'revenue' => number_format((float) $product->revenue, 2),
        ];
      });

    // Get revenue by day for the last 7 days
    $revenueByDay = Order::selectRaw('DATE(created_at) as date')
      ->selectRaw('SUM(total_amount) as revenue')
      ->selectRaw('COUNT(*) as orders')
      ->where('created_at', '>=', now()->subDays(7))
      ->groupBy('date')
      ->orderBy('date', 'asc')
      ->get()
      ->map(function ($day) {
        return [
          'date' => $day->date,
          'revenue' => number_format((float) $day->revenue, 2),
          'orders' => $day->orders,
        ];
      });

    return Inertia::render('Admin/Dashboard', [
      'stats' => [
        'total_orders' => $totalOrders,
        'total_revenue' => number_format((float) $totalRevenue, 2),
        'active_products' => $activeProducts,
        'total_categories' => $totalCategories,
        'orders_today' => $ordersToday,
        'revenue_today' => number_format((float) $revenueToday, 2),
        'pending_orders' => $pendingOrders,
        'recent_orders' => $recentOrders,
        'trending_products' => $trendingProducts,
        'revenue_by_day' => $revenueByDay,
      ],
    ]);
  }

  /**
   * Display a listing of all orders with filtering, sorting, and pagination.
   */
  public function index(Request $request): Response
  {
    // Validate query parameters
    $validated = $request->validate([
      'status' => ['nullable', Rule::in(array_column(OrderStatus::cases(), 'value'))],
      'date_from' => ['nullable', 'date'],
      'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
      'customer_name' => ['nullable', 'string', 'max:255'],
      'sort_by' => ['nullable', 'in:created_at,total_amount,status,customer_name'],
      'sort_order' => ['nullable', 'in:asc,desc'],
      'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
    ]);

    $query = Order::with(['orderItems.menuItem', 'orderItems.addons.addon', 'cashier', 'owner']);

    // Apply status filter
    if ($request->filled('status')) {
      $query->where('status', $validated['status']);
    }

    // Apply date range filter
    if ($request->filled('date_from')) {
      $query->whereDate('created_at', '>=', $validated['date_from']);
    }

    if ($request->filled('date_to')) {
      $query->whereDate('created_at', '<=', $validated['date_to']);
    }

    // Apply customer name filter
    if ($request->filled('customer_name')) {
      $query->where('customer_name', 'like', '%' . $validated['customer_name'] . '%');
    }

    // Apply sorting
    $sortBy = $validated['sort_by'] ?? 'created_at';
    $sortOrder = $validated['sort_order'] ?? 'desc';
    $query->orderBy($sortBy, $sortOrder);

    // Apply pagination
    $perPage = $validated['per_page'] ?? 20;
    $orders = $query->paginate($perPage)->withQueryString();

    // Calculate statistics for the filtered dataset
    $statsQuery = Order::query();

    if ($request->filled('status')) {
      $statsQuery->where('status', $validated['status']);
    }

    if ($request->filled('date_from')) {
      $statsQuery->whereDate('created_at', '>=', $validated['date_from']);
    }

    if ($request->filled('date_to')) {
      $statsQuery->whereDate('created_at', '<=', $validated['date_to']);
    }

    if ($request->filled('customer_name')) {
      $statsQuery->where('customer_name', 'like', '%' . $validated['customer_name'] . '%');
    }

    $stats = [
      'total_orders' => $statsQuery->count(),
      'total_revenue' => number_format((float) $statsQuery->sum('total_amount'), 2),
      'average_order_value' => number_format((float) $statsQuery->avg('total_amount'), 2),
    ];

    return Inertia::render('Admin/TransactionHistory', [
      'orders' => $orders,
      'filters' => [
        'status' => $validated['status'] ?? null,
        'date_from' => $validated['date_from'] ?? null,
        'date_to' => $validated['date_to'] ?? null,
        'customer_name' => $validated['customer_name'] ?? null,
        'sort_by' => $sortBy,
        'sort_order' => $sortOrder,
        'per_page' => $perPage,
      ],
      'stats' => $stats,
      'statuses' => array_column(OrderStatus::cases(), 'value'),
    ]);
  }

  /**
   * Display the specified order with complete details.
   */
  public function show(Order $order): Response
  {
    $order->load([
      'orderItems.menuItem.category',
      'orderItems.addons.addon',
      'cashier',
      'owner'
    ]);

    return Inertia::render('Admin/OrderDetails', [
      'order' => $this->formatOrderForAdmin($order),
    ]);
  }

  /**
   * Format order data for dashboard display (simplified).
   */
  private function formatOrderForDashboard(Order $order): array
  {
    return [
      'id' => $order->id,
      'order_number' => str_pad($order->id, 4, '0', STR_PAD_LEFT),
      'customer_name' => $order->customer_name,
      'status' => $order->status->value,
      'status_display' => ucfirst($order->status->value),
      'total_amount' => number_format((float) $order->total_amount, 2),
      'items_count' => $order->orderItems->count(),
      'created_at' => $order->created_at->format('M d, Y h:i A'),
      'created_at_timestamp' => $order->created_at->timestamp,
    ];
  }

  /**
   * Format order data for admin display with all details.
   */
  private function formatOrderForAdmin(Order $order): array
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
      'status_display' => ucfirst($order->status->value),
      'total_amount' => number_format((float) $order->total_amount, 2),
      'items' => $order->orderItems->map(function ($item) {
        return [
          'id' => $item->id,
          'menu_item' => [
            'id' => $item->menuItem->id,
            'name' => $item->menuItem->name,
            'description' => $item->menuItem->description,
            'category' => $item->menuItem->category ? [
              'id' => $item->menuItem->category->id,
              'name' => $item->menuItem->category->name,
            ] : null,
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
        'email' => $order->cashier->email,
      ] : null,
      'owner' => $order->owner ? [
        'id' => $order->owner->id,
        'name' => $order->owner->name,
        'email' => $order->owner->email,
      ] : null,
      'created_at' => $order->created_at->format('M d, Y h:i A'),
      'updated_at' => $order->updated_at->format('M d, Y h:i A'),
      'created_at_timestamp' => $order->created_at->timestamp,
      'updated_at_timestamp' => $order->updated_at->timestamp,
    ];
  }
}
