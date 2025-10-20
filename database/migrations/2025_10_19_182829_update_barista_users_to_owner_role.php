<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $driver = DB::getDriverName();

        if ($driver === 'mysql') {
            // First, update the enum column to include both 'barista' and 'owner'
            DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('customer', 'cashier', 'barista', 'owner', 'admin') NOT NULL DEFAULT 'customer'");
        }

        // Update existing barista users to owner role
        DB::table('users')
            ->where('role', 'barista')
            ->update([
                'role' => 'owner',
                'email' => DB::raw("REPLACE(email, 'barista', 'owner')")
            ]);

        if ($driver === 'mysql') {
            // Finally, remove 'barista' from the enum
            DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('customer', 'cashier', 'owner', 'admin') NOT NULL DEFAULT 'customer'");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $driver = DB::getDriverName();

        if ($driver === 'mysql') {
            // First, update the enum column to include both 'barista' and 'owner'
            DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('customer', 'cashier', 'barista', 'owner', 'admin') NOT NULL DEFAULT 'customer'");
        }

        // Revert owner users back to barista
        DB::table('users')
            ->where('role', 'owner')
            ->where('email', 'LIKE', '%owner%')
            ->update([
                'role' => 'barista',
                'email' => DB::raw("REPLACE(email, 'owner', 'barista')")
            ]);

        if ($driver === 'mysql') {
            // Revert the enum column to include 'barista' instead of 'owner'
            DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('customer', 'cashier', 'barista', 'admin') NOT NULL DEFAULT 'customer'");
        }
    }
};
