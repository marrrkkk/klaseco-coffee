<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\MenuItem;
use App\Models\Addon;
use Illuminate\Http\JsonResponse;

class MenuController extends Controller
{
  /**
   * Get all categories with their menu items
   */
  public function getCategories(): JsonResponse
  {
    $categories = Category::with(['menuItems' => function ($query) {
      $query->where('is_available', true);
    }])->get();

    return response()->json([
      'success' => true,
      'data' => $categories
    ]);
  }

  /**
   * Get menu items by category
   */
  public function getMenuItemsByCategory(Category $category): JsonResponse
  {
    $menuItems = $category->menuItems()
      ->where('is_available', true)
      ->get();

    return response()->json([
      'success' => true,
      'data' => $menuItems
    ]);
  }

  /**
   * Get all available addons
   */
  public function getAddons(): JsonResponse
  {
    $addons = Addon::where('is_available', true)->get();

    return response()->json([
      'success' => true,
      'data' => $addons
    ]);
  }

  /**
   * Get complete menu data (categories, items, and addons)
   */
  public function getCompleteMenu(): JsonResponse
  {
    $categories = Category::all();
    $menuItems = MenuItem::where('is_available', true)->get();
    $addons = Addon::where('is_available', true)->get();

    return response()->json([
      'categories' => $categories,
      'menu_items' => $menuItems,
      'addons' => $addons
    ]);
  }
}
