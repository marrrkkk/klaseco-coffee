<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\StaffController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Customer routes (no authentication required)
Route::get('/', function () {
    return Inertia::render('PremiumMenuPage');
})->name('home');

Route::get('/product', function () {
    return Inertia::render('ProductDetailPage');
})->name('product.detail');

Route::get('/track-order', function () {
    return Inertia::render('OrderTrackingPage');
})->name('track-order');

Route::get('/demo/seamless-polling', function () {
    return Inertia::render('SeamlessPollingDemo');
})->name('demo.seamless-polling');

// Staff role selection routes
Route::get('/staff', [StaffController::class, 'showRoleSelection'])->name('staff.role-selection');
Route::post('/staff/set-role', [StaffController::class, 'setRole'])->name('staff.set-role');
Route::post('/staff/logout', [StaffController::class, 'clearRole'])->name('staff.logout');

// Staff routes (no authentication for testing)
Route::get('/cashier', function () {
    return Inertia::render('CashierDashboard');
})->name('cashier');

Route::get('/barista', function () {
    return Inertia::render('BaristaDashboard');
})->name('barista');

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
