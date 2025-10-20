<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class CartItem extends Model
{
  protected $fillable = [
    'cart_id',
    'menu_item_id',
    'quantity',
    'size',
    'variant',
    'subtotal',
  ];

  protected $casts = [
    'quantity' => 'integer',
    'subtotal' => 'decimal:2',
  ];

  /**
   * The cart this item belongs to.
   */
  public function cart(): BelongsTo
  {
    return $this->belongsTo(Cart::class);
  }

  /**
   * The menu item this cart item represents.
   */
  public function menuItem(): BelongsTo
  {
    return $this->belongsTo(MenuItem::class);
  }

  /**
   * The addons added to this cart item.
   */
  public function addons(): BelongsToMany
  {
    return $this->belongsToMany(Addon::class, 'cart_item_addons')
      ->withPivot('quantity')
      ->withTimestamps();
  }

  /**
   * Calculate the subtotal for this item including addons.
   */
  public function calculateSubtotal(): float
  {
    // Get base price from menu item
    $basePrice = $this->menuItem->price;

    // Apply size multiplier if 'extra' size
    $sizeMultiplier = $this->size === 'extra' ? 1.3 : 1;

    // Calculate addons total
    $addonsTotal = $this->addons->sum(function ($addon) {
      return $addon->price * $addon->pivot->quantity;
    });

    return ($basePrice * $sizeMultiplier * $this->quantity) + $addonsTotal;
  }
}
