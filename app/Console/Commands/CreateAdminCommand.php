<?php

namespace App\Console\Commands;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class CreateAdminCommand extends Command
{
  /**
   * The name and signature of the console command.
   *
   * @var string
   */
  protected $signature = 'admin:create
                           {name : The name of the admin user}
                           {email : The email of the admin user}
                           {password : The password for the admin user}';

  /**
   * The console command description.
   *
   * @var string
   */
  protected $description = 'Create a new admin user';

  /**
   * Execute the console command.
   */
  public function handle(): int
  {
    $name = $this->argument('name');
    $email = $this->argument('email');
    $password = $this->argument('password');

    // Validate input
    $validator = Validator::make([
      'name' => $name,
      'email' => $email,
      'password' => $password,
    ], [
      'name' => ['required', 'string', 'max:255'],
      'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
      'password' => ['required', 'string', 'min:8'],
    ]);

    if ($validator->fails()) {
      $this->error('Validation failed:');
      foreach ($validator->errors()->all() as $error) {
        $this->error('  - ' . $error);
      }
      $this->newLine();
      $this->info('Usage: php artisan admin:create {name} {email} {password}');
      return Command::FAILURE;
    }

    // Check if email already exists (additional explicit check)
    if (User::where('email', $email)->exists()) {
      $this->error("Error: A user with email '{$email}' already exists.");
      return Command::FAILURE;
    }

    // Create admin user
    $user = User::create([
      'name' => $name,
      'email' => $email,
      'password' => Hash::make($password),
      'role' => UserRole::ADMIN,
    ]);

    $this->info('Admin user created successfully!');
    $this->newLine();
    $this->table(
      ['ID', 'Name', 'Email', 'Role'],
      [[$user->id, $user->name, $user->email, $user->role->value]]
    );

    return Command::SUCCESS;
  }
}
