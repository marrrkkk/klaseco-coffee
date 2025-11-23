<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\StaffController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Customer routes (no authentication required)
Route::get('/', fn() => Inertia::render('MenuHomePage'))->name('home');

Route::get('/menu/category/{categoryId}', fn($categoryId) => Inertia::render('CategoryDetailPage', [
    'categoryId' => (int) $categoryId
]))->name('menu.category');

Route::get('/product', fn() => Inertia::render('ProductDetailPage'))->name('product.detail');

Route::get('/track-order', fn() => Inertia::render('OrderTrackingPage'))->name('track-order');

Route::get('/demo/seamless-polling', fn() => Inertia::render('SeamlessPollingDemo'))->name('demo.seamless-polling');

// Staff role selection routes
Route::get('/staff', [StaffController::class, 'showRoleSelection'])->name('staff.role-selection');
Route::post('/staff/set-role', [StaffController::class, 'setRole'])->name('staff.set-role');
Route::post('/staff/logout', [StaffController::class, 'clearRole'])->name('staff.logout');

// Staff routes (no authentication for testing)
Route::get('/cashier', fn() => Inertia::render('CashierDashboard'))->name('cashier');

Route::get('/barista', fn() => Inertia::render('BaristaDashboard'))->name('barista');

Route::get('/dashboard', fn() => Inertia::render('Dashboard'))->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Admin routes
Route::middleware(['auth', \App\Http\Middleware\AdminAccess::class])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [\App\Http\Controllers\AdminOrderController::class, 'dashboard'])->name('dashboard');
    Route::resource('categories', \App\Http\Controllers\AdminCategoryController::class);
    Route::resource('products', \App\Http\Controllers\AdminProductController::class);
    Route::post('products/{product}/toggle-availability', [\App\Http\Controllers\AdminProductController::class, 'toggleAvailability'])
        ->name('products.toggle-availability');
    Route::get('orders', [\App\Http\Controllers\AdminOrderController::class, 'index'])->name('orders.index');
    Route::get('orders/{order}', [\App\Http\Controllers\AdminOrderController::class, 'show'])->name('orders.show');
});

require __DIR__ . '/auth.php';
