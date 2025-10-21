<?php

require_once 'vendor/autoload.php';

use App\Models\User;
use App\Enums\UserRole;
use Illuminate\Support\Facades\Hash;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Create users
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

foreach ($users as $userData) {
    $existingUser = User::where('email', $userData['email'])->first();
    if (!$existingUser) {
        User::create($userData);
        echo "Created user: {$userData['name']} ({$userData['email']})\n";
    } else {
        echo "User already exists: {$userData['name']} ({$userData['email']})\n";
    }
}

echo "User seeding completed!\n";
