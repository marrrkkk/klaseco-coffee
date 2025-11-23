<?php

use App\Enums\UserRole;
use App\Models\Category;
use App\Models\MenuItem;
use App\Models\User;

beforeEach(function () {
  $this->admin = User::factory()->create([
    'role' => UserRole::ADMIN,
  ]);
});

test('admin can view category index', function () {
  Category::factory()->count(3)->create();

  $response = $this->actingAs($this->admin)->get(route('admin.categories.index'));

  $response->assertOk();
});

test('admin can view create category form', function () {
  $response = $this->actingAs($this->admin)->get(route('admin.categories.create'));

  $response->assertOk();
});

test('admin can create a category with valid data', function () {
  $categoryData = [
    'name' => 'Test Category',
    'slug' => 'test-category',
    'image_url' => 'https://example.com/image.jpg',
  ];

  $response = $this->actingAs($this->admin)->post(route('admin.categories.store'), $categoryData);

  $response->assertRedirect(route('admin.categories.index'));
  $response->assertSessionHas('success');

  $this->assertDatabaseHas('categories', [
    'name' => 'Test Category',
    'slug' => 'test-category',
    'image_url' => 'https://example.com/image.jpg',
  ]);
});

test('admin cannot create category with empty name', function () {
  $categoryData = [
    'name' => '',
    'slug' => 'test-category',
  ];

  $response = $this->actingAs($this->admin)->post(route('admin.categories.store'), $categoryData);

  $response->assertSessionHasErrors('name');
});

test('admin cannot create category with duplicate name', function () {
  Category::factory()->create(['name' => 'Existing Category', 'slug' => 'existing-category']);

  $categoryData = [
    'name' => 'Existing Category',
    'slug' => 'new-slug',
  ];

  $response = $this->actingAs($this->admin)->post(route('admin.categories.store'), $categoryData);

  $response->assertSessionHasErrors('name');
});

test('admin cannot create category with invalid url', function () {
  $categoryData = [
    'name' => 'Test Category',
    'slug' => 'test-category',
    'image_url' => 'not-a-valid-url',
  ];

  $response = $this->actingAs($this->admin)->post(route('admin.categories.store'), $categoryData);

  $response->assertSessionHasErrors('image_url');
});

test('admin can view edit category form', function () {
  $category = Category::factory()->create();

  $response = $this->actingAs($this->admin)->get(route('admin.categories.edit', $category));

  $response->assertOk();
});

test('admin can update a category with valid data', function () {
  $category = Category::factory()->create([
    'name' => 'Old Name',
    'slug' => 'old-slug',
  ]);

  $updateData = [
    'name' => 'Updated Name',
    'slug' => 'updated-slug',
    'image_url' => 'https://example.com/new-image.jpg',
  ];

  $response = $this->actingAs($this->admin)->put(route('admin.categories.update', $category), $updateData);

  $response->assertRedirect(route('admin.categories.index'));
  $response->assertSessionHas('success');

  $this->assertDatabaseHas('categories', [
    'id' => $category->id,
    'name' => 'Updated Name',
    'slug' => 'updated-slug',
    'image_url' => 'https://example.com/new-image.jpg',
  ]);
});

test('admin cannot update category with invalid data', function () {
  $category = Category::factory()->create();

  $updateData = [
    'name' => '',
    'slug' => 'test-slug',
  ];

  $response = $this->actingAs($this->admin)->put(route('admin.categories.update', $category), $updateData);

  $response->assertSessionHasErrors('name');
});

test('admin can delete a category without menu items', function () {
  $category = Category::factory()->create();

  $response = $this->actingAs($this->admin)->delete(route('admin.categories.destroy', $category));

  $response->assertRedirect(route('admin.categories.index'));
  $response->assertSessionHas('success');

  $this->assertDatabaseMissing('categories', [
    'id' => $category->id,
  ]);
});

test('admin cannot delete category with associated menu items', function () {
  $category = Category::factory()->create();
  MenuItem::factory()->create(['category_id' => $category->id]);

  $response = $this->actingAs($this->admin)->delete(route('admin.categories.destroy', $category));

  $response->assertRedirect(route('admin.categories.index'));
  $response->assertSessionHas('error');

  $this->assertDatabaseHas('categories', [
    'id' => $category->id,
  ]);
});

test('non-admin users cannot access category management', function () {
  $user = User::factory()->create(['role' => UserRole::CUSTOMER]);

  $response = $this->actingAs($user)->get(route('admin.categories.index'));

  $response->assertRedirect(route('dashboard'));
});
