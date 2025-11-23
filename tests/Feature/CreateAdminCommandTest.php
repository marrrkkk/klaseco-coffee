<?php

use App\Enums\UserRole;
use App\Models\User;

test('command creates admin user with valid data', function () {
  $this->artisan('admin:create', [
    'name' => 'Admin User',
    'email' => 'admin@example.com',
    'password' => 'password123',
  ])
    ->expectsOutput('Admin user created successfully!')
    ->assertExitCode(0);

  $user = User::where('email', 'admin@example.com')->first();

  expect($user)->not->toBeNull()
    ->and($user->name)->toBe('Admin User')
    ->and($user->email)->toBe('admin@example.com')
    ->and($user->role)->toBe(UserRole::ADMIN);
});

test('command hashes password correctly', function () {
  $this->artisan('admin:create', [
    'name' => 'Test Admin',
    'email' => 'test@example.com',
    'password' => 'mypassword',
  ])->assertExitCode(0);

  $user = User::where('email', 'test@example.com')->first();

  expect($user->password)->not->toBe('mypassword')
    ->and(password_verify('mypassword', $user->password))->toBeTrue();
});

test('command rejects duplicate email', function () {
  User::factory()->create([
    'email' => 'existing@example.com',
  ]);

  $this->artisan('admin:create', [
    'name' => 'Another Admin',
    'email' => 'existing@example.com',
    'password' => 'password123',
  ])
    ->expectsOutput('Validation failed:')
    ->assertExitCode(1);
});

test('command validates email format', function () {
  $this->artisan('admin:create', [
    'name' => 'Invalid Email Admin',
    'email' => 'notanemail',
    'password' => 'password123',
  ])
    ->expectsOutput('Validation failed:')
    ->assertExitCode(1);
});

test('command validates password length', function () {
  $this->artisan('admin:create', [
    'name' => 'Short Password Admin',
    'email' => 'shortpass@example.com',
    'password' => 'short',
  ])
    ->expectsOutput('Validation failed:')
    ->assertExitCode(1);
});

test('command validates required name field', function () {
  $this->artisan('admin:create', [
    'name' => '',
    'email' => 'noname@example.com',
    'password' => 'password123',
  ])
    ->expectsOutput('Validation failed:')
    ->assertExitCode(1);
});

test('command validates required email field', function () {
  $this->artisan('admin:create', [
    'name' => 'No Email Admin',
    'email' => '',
    'password' => 'password123',
  ])
    ->expectsOutput('Validation failed:')
    ->assertExitCode(1);
});

test('command validates required password field', function () {
  $this->artisan('admin:create', [
    'name' => 'No Password Admin',
    'email' => 'nopass@example.com',
    'password' => '',
  ])
    ->expectsOutput('Validation failed:')
    ->assertExitCode(1);
});

test('command displays user details after creation', function () {
  $this->artisan('admin:create', [
    'name' => 'Display Test Admin',
    'email' => 'display@example.com',
    'password' => 'password123',
  ])
    ->expectsOutput('Admin user created successfully!')
    ->expectsTable(
      ['ID', 'Name', 'Email', 'Role'],
      [[1, 'Display Test Admin', 'display@example.com', 'admin']]
    )
    ->assertExitCode(0);
});
