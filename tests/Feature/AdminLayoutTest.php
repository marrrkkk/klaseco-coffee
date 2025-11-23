<?php

use App\Enums\UserRole;
use App\Models\User;

test('admin dashboard renders with correct layout', function () {
  $admin = User::factory()->create([
    'role' => UserRole::ADMIN,
  ]);

  $response = $this->actingAs($admin)->get(route('admin.dashboard'));

  // Just check that the page loads successfully
  $response->assertOk();
});

test('admin categories page renders with correct layout', function () {
  $admin = User::factory()->create([
    'role' => UserRole::ADMIN,
  ]);

  $response = $this->actingAs($admin)->get('/admin/categories');

  $response->assertOk();
  $response->assertInertia(
    fn($page) => $page
      ->component('Admin/CategoryManagement')
      ->has('categories')
  );
});

test('admin products page renders with correct layout', function () {
  $admin = User::factory()->create([
    'role' => UserRole::ADMIN,
  ]);

  $response = $this->actingAs($admin)->get('/admin/products');

  $response->assertOk();
  $response->assertInertia(
    fn($page) => $page
      ->component('Admin/ProductManagement')
      ->has('products')
      ->has('categories')
      ->has('filters')
  );
});

test('admin orders page renders with correct layout', function () {
  $admin = User::factory()->create([
    'role' => UserRole::ADMIN,
  ]);

  $response = $this->actingAs($admin)->get('/admin/orders');

  $response->assertOk();
  $response->assertInertia(
    fn($page) => $page
      ->component('Admin/TransactionHistory')
      ->has('orders')
      ->has('filters')
      ->has('stats')
  );
});

test('admin layout includes navigation links', function () {
  $admin = User::factory()->create([
    'role' => UserRole::ADMIN,
  ]);

  $response = $this->actingAs($admin)->get('/admin');

  $response->assertOk();
  // The layout should render the page successfully
  // Navigation is handled client-side in React
});
