<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Cart extends Model
{
  protected $fillable = [
    'customer_name',
    'customer_phone',
    'last_activity',
    'session_id',
    'total',
  ];

  protected $casts = [
    'last_activity' => 'datetime',
    'total' => 'decimal:2',
  ];

  /**
   * The cart items in this cart.
   */
  public function cartItems(): HasMany
  {
    return $this->hasMany(CartItem::class);
  }

  /**
   * Get the total price of all items in the cart.
   */
  public function calculateTotal(): float
  {
    return $this->cartItems->sum(function ($item) {
      return $item->subtotal;
    });
  }

  /**
   * Update cart's last activity timestamp.
   */
  public function touch($attribute = null)
  {
    $this->last_activity = now();
    parent::touch($attribute);
  }

  /**
   * Get active carts (activity within the last 30 minutes).
   */
  public static function getActive()
  {
    return static::with(['cartItems.menuItem', 'cartItems.addons'])
      ->where('last_activity', '>', now()->subMinutes(30))
      ->orderBy('last_activity', 'desc')
      ->get();
  }
}
