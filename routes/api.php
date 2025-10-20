<?php

use App\Http\Controllers\CartController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\OrderController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
  return $request->user();
});

/*
|--------------------------------------------------------------------------
| Menu API Routes
|--------------------------------------------------------------------------
*/

// Public menu routes (no authentication required for customers)
Route::prefix('menu')->group(function () {
  Route::get('/categories', [MenuController::class, 'getCategories']);
  Route::get('/categories/{category}/items', [MenuController::class, 'getMenuItemsByCategory']);
  Route::get('/addons', [MenuController::class, 'getAddons']);
  Route::get('/complete', [MenuController::class, 'getCompleteMenu']);
});

/*
|--------------------------------------------------------------------------
| Order API Routes
|--------------------------------------------------------------------------
*/

// Public order routes (for customers)
Route::prefix('orders')->group(function () {
  // Create new order (customer)
  Route::post('/', [OrderController::class, 'store']);

  // Get order status (customer tracking)
  Route::get('/{order}/status', [OrderController::class, 'getOrderStatus']);

  // Mark order as served (customer confirmation)
  Route::patch('/{order}/served', [OrderController::class, 'markServed']);

  // Generate receipt for served orders
  Route::get('/{order}/receipt', [OrderController::class, 'generateReceipt']);
});

// Staff order management routes (cashier and barista)
Route::prefix('orders')->group(function () {
  // Get orders by status
  Route::get('/status/{status}', [OrderController::class, 'getOrdersByStatus']);

  // Get pending orders (cashier queue)
  Route::get('/pending', [OrderController::class, 'getPendingOrders']);

  // Get accepted orders (legacy endpoint - maintained for compatibility)
  Route::get('/accepted', [OrderController::class, 'getAcceptedOrders']);

  // Get active orders (owner's streamlined preparation queue)
  Route::get('/active', [OrderController::class, 'getActiveOrders']);

  // Get queue statistics for smart polling
  Route::get('/stats', [OrderController::class, 'getQueueStats']);

  // Get specific order details
  Route::get('/{order}', [OrderController::class, 'show']);

  // Update order status (general)
  Route::patch('/{order}/status', [OrderController::class, 'updateStatus']);

  // Cashier actions
  Route::patch('/{order}/accept', [OrderController::class, 'acceptOrder']);
  Route::patch('/{order}/reject', [OrderController::class, 'rejectOrder']);

  // Owner actions
  Route::patch('/{order}/ready', [OrderController::class, 'markReady']);
});

/*
|--------------------------------------------------------------------------
| Cart API Routes
|--------------------------------------------------------------------------
*/

Route::prefix('carts')->group(function () {
  // Get active carts (for staff)
  Route::get('/active', [CartController::class, 'active']);

  // Public cart management (for customers)
  Route::post('/items', [CartController::class, 'addItem']);
  Route::delete('/items/{item}', [CartController::class, 'removeItem']);
  Route::patch('/{cart}/customer', [CartController::class, 'updateCustomer']);
});
