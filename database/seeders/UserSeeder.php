<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
  /**
   * Run the database seeds.
   */
  public function run(): void
  {
    $users = [
      [
        'name' => 'Admin User',
        'email' => 'admin@klaseco.com',
        'password' => Hash::make('password'),
        'role' => UserRole::ADMIN,
      ],
      [
        'name' => 'Maria Santos',
        'email' => 'cashier@klaseco.com',
        'password' => Hash::make('password'),
        'role' => UserRole::CASHIER,
      ],
      [
        'name' => 'Juan Dela Cruz',
        'email' => 'cashier2@klaseco.com',
        'password' => Hash::make('password'),
        'role' => UserRole::CASHIER,
      ],
      [
        'name' => 'Ana Garcia',
        'email' => 'owner@klaseco.com',
        'password' => Hash::make('password'),
        'role' => UserRole::OWNER,
      ],
      [
        'name' => 'Carlos Reyes',
        'email' => 'owner2@klaseco.com',
        'password' => Hash::make('password'),
        'role' => UserRole::OWNER,
      ],
      [
        'name' => 'Test Customer',
        'email' => 'customer@klaseco.com',
        'password' => Hash::make('password'),
        'role' => UserRole::CUSTOMER,
      ],
    ];

    foreach ($users as $user) {
      User::create($user);
    }
  }
}
