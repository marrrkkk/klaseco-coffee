<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AdminCategoryController extends Controller
{
  /**
   * Display a listing of all categories.
   */
  public function index(): Response
  {
    $categories = Category::withCount('menuItems')
      ->orderBy('name')
      ->get();

    return Inertia::render('Admin/CategoryManagement', [
      'categories' => $categories
    ]);
  }

  /**
   * Show the form for creating a new category.
   */
  public function create(): Response
  {
    return Inertia::render('Admin/CategoryForm', [
      'category' => null
    ]);
  }

  /**
   * Store a newly created category in storage.
   */
  public function store(Request $request): RedirectResponse
  {
    $validated = $request->validate([
      'name' => ['required', 'string', 'max:255', 'unique:categories,name'],
      'slug' => ['required', 'string', 'max:255', 'unique:categories,slug', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/'],
      'image_url' => ['nullable', 'url', 'max:500'],
    ]);

    Category::create($validated);

    return redirect()->route('admin.categories.index')
      ->with('success', 'Category created successfully');
  }

  /**
   * Show the form for editing the specified category.
   */
  public function edit(Category $category): Response
  {
    return Inertia::render('Admin/CategoryForm', [
      'category' => $category
    ]);
  }

  /**
   * Update the specified category in storage.
   */
  public function update(Request $request, Category $category): RedirectResponse
  {
    $validated = $request->validate([
      'name' => ['required', 'string', 'max:255', Rule::unique('categories', 'name')->ignore($category->id)],
      'slug' => ['required', 'string', 'max:255', Rule::unique('categories', 'slug')->ignore($category->id), 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/'],
      'image_url' => ['nullable', 'url', 'max:500'],
    ]);

    $category->update($validated);

    return redirect()->route('admin.categories.index')
      ->with('success', 'Category updated successfully');
  }

  /**
   * Remove the specified category from storage.
   */
  public function destroy(Category $category): RedirectResponse
  {
    // Check if category has associated menu items
    if ($category->menuItems()->count() > 0) {
      return redirect()->route('admin.categories.index')
        ->with('error', 'Cannot delete category with existing menu items');
    }

    $category->delete();

    return redirect()->route('admin.categories.index')
      ->with('success', 'Category deleted successfully');
  }
}
