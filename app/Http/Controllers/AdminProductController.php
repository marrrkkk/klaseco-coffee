<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\MenuItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AdminProductController extends Controller
{
  /**
   * Display a listing of all products with optional filtering and sorting.
   */
  public function index(Request $request): Response
  {
    $query = MenuItem::with('category');

    // Apply filtering
    if ($request->filled('category_id')) {
      $query->where('category_id', $request->category_id);
    }

    if ($request->filled('is_available')) {
      $query->where('is_available', $request->boolean('is_available'));
    }

    if ($request->filled('search')) {
      $searchTerm = $request->search;
      $query->where(function ($q) use ($searchTerm) {
        $q->where('name', 'like', "%{$searchTerm}%")
          ->orWhere('description', 'like', "%{$searchTerm}%");
      });
    }

    // Apply sorting
    $sortBy = $request->get('sort_by', 'name');
    $sortOrder = $request->get('sort_order', 'asc');

    // Validate sort parameters
    $allowedSortFields = ['name', 'base_price', 'created_at', 'is_available'];
    $allowedSortOrders = ['asc', 'desc'];

    if (in_array($sortBy, $allowedSortFields) && in_array($sortOrder, $allowedSortOrders)) {
      $query->orderBy($sortBy, $sortOrder);
    } else {
      $query->orderBy('name', 'asc');
    }

    $products = $query->get();
    $categories = Category::orderBy('name')->get();

    return Inertia::render('Admin/ProductManagement', [
      'products' => $products,
      'categories' => $categories,
      'filters' => [
        'category_id' => $request->category_id,
        'is_available' => $request->is_available,
        'search' => $request->search,
        'sort_by' => $sortBy,
        'sort_order' => $sortOrder,
      ]
    ]);
  }

  /**
   * Show the form for creating a new product.
   */
  public function create(): Response
  {
    $categories = Category::orderBy('name')->get();

    return Inertia::render('Admin/ProductForm', [
      'product' => null,
      'categories' => $categories
    ]);
  }

  /**
   * Store a newly created product in storage.
   */
  public function store(Request $request): RedirectResponse
  {
    $validated = $request->validate([
      'name' => ['required', 'string', 'max:255'],
      'description' => ['required', 'string', 'max:1000'],
      'category_id' => ['required', 'integer', 'exists:categories,id'],
      'base_price' => ['required', 'numeric', 'min:0', 'max:99999.99'],
      'image_url' => ['nullable', 'url', 'max:500'],
      'is_available' => ['boolean'],
    ]);

    // Set default value for is_available if not provided
    $validated['is_available'] = $validated['is_available'] ?? true;

    MenuItem::create($validated);

    return redirect()->route('admin.products.index')
      ->with('success', 'Product created successfully');
  }

  /**
   * Show the form for editing the specified product.
   */
  public function edit(MenuItem $product): Response
  {
    $product->load('category');
    $categories = Category::orderBy('name')->get();

    return Inertia::render('Admin/ProductForm', [
      'product' => $product,
      'categories' => $categories
    ]);
  }

  /**
   * Update the specified product in storage.
   */
  public function update(Request $request, MenuItem $product): RedirectResponse
  {
    $validated = $request->validate([
      'name' => ['required', 'string', 'max:255'],
      'description' => ['required', 'string', 'max:1000'],
      'category_id' => ['required', 'integer', 'exists:categories,id'],
      'base_price' => ['required', 'numeric', 'min:0', 'max:99999.99'],
      'image_url' => ['nullable', 'url', 'max:500'],
      'is_available' => ['boolean'],
    ]);

    $product->update($validated);

    return redirect()->route('admin.products.index')
      ->with('success', 'Product updated successfully');
  }

  /**
   * Remove the specified product from storage.
   */
  public function destroy(MenuItem $product): RedirectResponse
  {
    // Products can be deleted even if they have order history
    // The order history will maintain referential integrity through foreign keys
    $product->delete();

    return redirect()->route('admin.products.index')
      ->with('success', 'Product deleted successfully');
  }

  /**
   * Toggle the availability status of the specified product.
   */
  public function toggleAvailability(MenuItem $product): RedirectResponse
  {
    $product->update([
      'is_available' => !$product->is_available
    ]);

    $status = $product->is_available ? 'available' : 'unavailable';

    return redirect()->route('admin.products.index')
      ->with('success', "Product marked as {$status}");
  }
}
