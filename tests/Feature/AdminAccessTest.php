<?php

use App\Enums\UserRole;
use App\Models\User;

test('unauthenticated users are redirected to login', function () {
  $response = $this->get('/admin');

  $response->assertRedirect(route('login'));
});

test('non-admin users are denied access to admin dashboard', function () {
  $user = User::factory()->create([
    'role' => UserRole::CUSTOMER,
  ]);

  $response = $this->actingAs($user)->get('/admin');

  $response->assertRedirect(route('dashboard'));
  $response->assertSessionHas('error');
});

test('admin users can access admin dashboard', function () {
  $admin = User::factory()->create([
    'role' => UserRole::ADMIN,
  ]);

  $response = $this->actingAs($admin)->get('/admin');

  $response->assertOk();
});

test('cashier users are denied access to admin dashboard', function () {
  $cashier = User::factory()->create([
    'role' => UserRole::CASHIER,
  ]);

  $response = $this->actingAs($cashier)->get('/admin');

  $response->assertRedirect(route('dashboard'));
});

test('owner users are denied access to admin dashboard', function () {
  $owner = User::factory()->create([
    'role' => UserRole::OWNER,
  ]);

  $response = $this->actingAs($owner)->get('/admin');

  $response->assertRedirect(route('dashboard'));
});
