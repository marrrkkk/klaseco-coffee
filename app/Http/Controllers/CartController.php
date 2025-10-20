<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\CartItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use App\Http\Resources\CartResource;

class CartController extends Controller
{
  /**
   * Get active customer carts
   */
  public function active()
  {
    $carts = Cart::getActive();

    return response()->json([
      'success' => true,
      'data' => $carts->map(function ($cart) {
        return [
          'id' => $cart->id,
          'customer_name' => $cart->customer_name,
          'total' => $cart->total,
          'items' => $cart->cartItems->map(function ($item) {
            return [
              'menu_item_id' => $item->menu_item_id,
              'name' => $item->menuItem->name,
              'quantity' => $item->quantity,
              'size' => $item->size,
              'variant' => $item->variant,
              'subtotal' => $item->subtotal,
            ];
          }),
          'addons' => $cart->cartItems->flatMap(function ($item) {
            return $item->addons->map(function ($addon) use ($item) {
              return [
                'id' => $addon->id,
                'name' => $addon->name,
                'quantity' => $addon->pivot->quantity,
                'price' => $addon->price,
              ];
            });
          })->unique('id')->values(),
          'updated_at' => $cart->updated_at->toISOString(),
        ];
      }),
    ]);
  }

  /**
   * Add an item to cart
   */
  public function addItem(Request $request)
  {
    $request->validate([
      'menu_item_id' => 'required|exists:menu_items,id',
      'quantity' => 'required|integer|min:1',
      'size' => 'required|in:daily,extra',
      'variant' => 'required|in:hot,cold',
      'addons' => 'array',
      'addons.*.addon_id' => 'exists:addons,id',
      'addons.*.quantity' => 'required|integer|min:1',
    ]);

    // Get or create cart for current session
    $cart = Cart::firstOrCreate(
      ['session_id' => Session::getId()],
      ['last_activity' => now()]
    );

    // Create cart item
    $cartItem = $cart->cartItems()->create([
      'menu_item_id' => $request->menu_item_id,
      'quantity' => $request->quantity,
      'size' => $request->size,
      'variant' => $request->variant,
    ]);

    // Add addons if any
    if ($request->has('addons')) {
      foreach ($request->addons as $addon) {
        $cartItem->addons()->attach($addon['addon_id'], [
          'quantity' => $addon['quantity'],
        ]);
      }
    }

    // Calculate and update subtotal
    $cartItem->subtotal = $cartItem->calculateSubtotal();
    $cartItem->save();

    // Update cart total
    $cart->total = $cart->calculateTotal();
    $cart->touch();
    $cart->save();

    return response()->json([
      'success' => true,
      'message' => 'Item added to cart',
      'data' => $cart->fresh(['cartItems.menuItem', 'cartItems.addons']),
    ]);
  }

  /**
   * Remove an item from cart
   */
  public function removeItem(CartItem $item)
  {
    $cart = $item->cart;

    // Delete the item
    $item->delete();

    // Recalculate cart total
    $cart->total = $cart->calculateTotal();
    $cart->touch();
    $cart->save();

    return response()->json([
      'success' => true,
      'message' => 'Item removed from cart',
      'data' => $cart->fresh(['cartItems.menuItem', 'cartItems.addons']),
    ]);
  }

  /**
   * Update customer information
   */
  public function updateCustomer(Request $request, Cart $cart)
  {
    $request->validate([
      'customer_name' => 'required|string|max:255',
      'customer_phone' => 'required|string|max:255',
    ]);

    $cart->update([
      'customer_name' => $request->customer_name,
      'customer_phone' => $request->customer_phone,
    ]);

    $cart->touch();

    return response()->json([
      'success' => true,
      'message' => 'Customer information updated',
      'data' => $cart->fresh(['cartItems.menuItem', 'cartItems.addons']),
    ]);
  }
}
