<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  /**
   * Run the migrations.
   */
  public function up(): void
  {
    Schema::create('carts', function (Blueprint $table) {
      $table->id();
      $table->string('customer_name')->nullable();
      $table->string('customer_phone')->nullable();
      $table->string('session_id');
      $table->timestamp('last_activity');
      $table->decimal('total', 10, 2)->default(0);
      $table->timestamps();

      $table->index('session_id');
      $table->index('last_activity');
    });

    Schema::create('cart_items', function (Blueprint $table) {
      $table->id();
      $table->foreignId('cart_id')->constrained()->cascadeOnDelete();
      $table->foreignId('menu_item_id')->constrained();
      $table->integer('quantity');
      $table->enum('size', ['daily', 'extra']);
      $table->enum('variant', ['hot', 'cold']);
      $table->decimal('subtotal', 10, 2);
      $table->timestamps();
    });

    Schema::create('cart_item_addons', function (Blueprint $table) {
      $table->id();
      $table->foreignId('cart_item_id')->constrained()->cascadeOnDelete();
      $table->foreignId('addon_id')->constrained();
      $table->integer('quantity');
      $table->timestamps();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('cart_item_addons');
    Schema::dropIfExists('cart_items');
    Schema::dropIfExists('carts');
  }
};
