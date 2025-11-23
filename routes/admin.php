<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
|
| These routes are protected by the 'auth' and 'admin' middleware.
| Only authenticated users with the admin role can access these routes.
|
*/

Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
  // Admin Dashboard Home
  // Temporary response for testing - will be replaced with Inertia::render('Admin/Dashboard') in future tasks
  Route::get('/', function () {
    return response()->json(['message' => 'Admin Dashboard']);
  })->name('dashboard');

  // Category Management Routes (to be implemented in future tasks)
  // Route::resource('categories', AdminCategoryController::class);

  // Product Management Routes (to be implemented in future tasks)
  // Route::resource('products', AdminProductController::class);

  // Order/Transaction Management Routes (to be implemented in future tasks)
  // Route::get('orders', [AdminOrderController::class, 'index'])->name('orders.index');
  // Route::get('orders/{order}', [AdminOrderController::class, 'show'])->name('orders.show');
});
