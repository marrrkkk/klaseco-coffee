<?php

use App\Enums\UserRole;
use App\Models\Category;
use App\Models\MenuItem;
use App\Models\User;

beforeEach(function () {
  $this->admin = User::factory()->create([
    'role' => UserRole::ADMIN,
  ]);
  $this->category = Category::factory()->create();
});

test('admin can view product index', function () {
  MenuItem::factory()->count(3)->create(['category_id' => $this->category->id]);

  $response = $this->actingAs($this->admin)->get(route('admin.products.index'));

  $response->assertOk();
});

test('admin can filter products by category', function () {
  $category1 = Category::factory()->create(['name' => 'Category 1']);
  $category2 = Category::factory()->create(['name' => 'Category 2']);

  MenuItem::factory()->create(['category_id' => $category1->id, 'name' => 'Product 1']);
  MenuItem::factory()->create(['category_id' => $category2->id, 'name' => 'Product 2']);

  $response = $this->actingAs($this->admin)->get(route('admin.products.index', ['category_id' => $category1->id]));

  $response->assertOk();
});

test('admin can filter products by availability', function () {
  MenuItem::factory()->create(['category_id' => $this->category->id, 'is_available' => true]);
  MenuItem::factory()->create(['category_id' => $this->category->id, 'is_available' => false]);

  $response = $this->actingAs($this->admin)->get(route('admin.products.index', ['is_available' => true]));

  $response->assertOk();
});

test('admin can search products by name', function () {
  MenuItem::factory()->create(['category_id' => $this->category->id, 'name' => 'Espresso']);
  MenuItem::factory()->create(['category_id' => $this->category->id, 'name' => 'Latte']);

  $response = $this->actingAs($this->admin)->get(route('admin.products.index', ['search' => 'Espresso']));

  $response->assertOk();
});

test('admin can sort products by name', function () {
  MenuItem::factory()->create(['category_id' => $this->category->id, 'name' => 'Zebra Coffee']);
  MenuItem::factory()->create(['category_id' => $this->category->id, 'name' => 'Apple Coffee']);

  $response = $this->actingAs($this->admin)->get(route('admin.products.index', [
    'sort_by' => 'name',
    'sort_order' => 'asc'
  ]));

  $response->assertOk();
});

test('admin can view create product form', function () {
  $response = $this->actingAs($this->admin)->get(route('admin.products.create'));

  $response->assertOk();
});

test('admin can create a product with valid data', function () {
  $productData = [
    'name' => 'Test Product',
    'description' => 'A delicious test product',
    'category_id' => $this->category->id,
    'base_price' => 99.99,
    'image_url' => 'https://example.com/product.jpg',
    'is_available' => true,
  ];

  $response = $this->actingAs($this->admin)->post(route('admin.products.store'), $productData);

  $response->assertRedirect(route('admin.products.index'));
  $response->assertSessionHas('success');

  $this->assertDatabaseHas('menu_items', [
    'name' => 'Test Product',
    'description' => 'A delicious test product',
    'category_id' => $this->category->id,
    'base_price' => 99.99,
  ]);
});

test('admin cannot create product with empty name', function () {
  $productData = [
    'name' => '',
    'description' => 'Test description',
    'category_id' => $this->category->id,
    'base_price' => 50.00,
  ];

  $response = $this->actingAs($this->admin)->post(route('admin.products.store'), $productData);

  $response->assertSessionHasErrors('name');
});

test('admin cannot create product with empty description', function () {
  $productData = [
    'name' => 'Test Product',
    'description' => '',
    'category_id' => $this->category->id,
    'base_price' => 50.00,
  ];

  $response = $this->actingAs($this->admin)->post(route('admin.products.store'), $productData);

  $response->assertSessionHasErrors('description');
});

test('admin cannot create product with invalid category', function () {
  $productData = [
    'name' => 'Test Product',
    'description' => 'Test description',
    'category_id' => 99999,
    'base_price' => 50.00,
  ];

  $response = $this->actingAs($this->admin)->post(route('admin.products.store'), $productData);

  $response->assertSessionHasErrors('category_id');
});

test('admin cannot create product with negative price', function () {
  $productData = [
    'name' => 'Test Product',
    'description' => 'Test description',
    'category_id' => $this->category->id,
    'base_price' => -10.00,
  ];

  $response = $this->actingAs($this->admin)->post(route('admin.products.store'), $productData);

  $response->assertSessionHasErrors('base_price');
});

test('admin cannot create product with price exceeding maximum', function () {
  $productData = [
    'name' => 'Test Product',
    'description' => 'Test description',
    'category_id' => $this->category->id,
    'base_price' => 100000.00,
  ];

  $response = $this->actingAs($this->admin)->post(route('admin.products.store'), $productData);

  $response->assertSessionHasErrors('base_price');
});

test('admin cannot create product with invalid url', function () {
  $productData = [
    'name' => 'Test Product',
    'description' => 'Test description',
    'category_id' => $this->category->id,
    'base_price' => 50.00,
    'image_url' => 'not-a-valid-url',
  ];

  $response = $this->actingAs($this->admin)->post(route('admin.products.store'), $productData);

  $response->assertSessionHasErrors('image_url');
});

test('admin can view edit product form', function () {
  $product = MenuItem::factory()->create(['category_id' => $this->category->id]);

  $response = $this->actingAs($this->admin)->get(route('admin.products.edit', $product));

  $response->assertOk();
});

test('admin can update a product with valid data', function () {
  $product = MenuItem::factory()->create([
    'category_id' => $this->category->id,
    'name' => 'Old Name',
    'description' => 'Old description',
    'base_price' => 50.00,
  ]);

  $updateData = [
    'name' => 'Updated Name',
    'description' => 'Updated description',
    'category_id' => $this->category->id,
    'base_price' => 75.00,
    'image_url' => 'https://example.com/new-image.jpg',
    'is_available' => false,
  ];

  $response = $this->actingAs($this->admin)->put(route('admin.products.update', $product), $updateData);

  $response->assertRedirect(route('admin.products.index'));
  $response->assertSessionHas('success');

  $this->assertDatabaseHas('menu_items', [
    'id' => $product->id,
    'name' => 'Updated Name',
    'description' => 'Updated description',
    'base_price' => 75.00,
    'is_available' => false,
  ]);
});

test('admin cannot update product with invalid data', function () {
  $product = MenuItem::factory()->create(['category_id' => $this->category->id]);

  $updateData = [
    'name' => '',
    'description' => 'Test description',
    'category_id' => $this->category->id,
    'base_price' => 50.00,
  ];

  $response = $this->actingAs($this->admin)->put(route('admin.products.update', $product), $updateData);

  $response->assertSessionHasErrors('name');
});

test('admin can delete a product', function () {
  $product = MenuItem::factory()->create(['category_id' => $this->category->id]);

  $response = $this->actingAs($this->admin)->delete(route('admin.products.destroy', $product));

  $response->assertRedirect(route('admin.products.index'));
  $response->assertSessionHas('success');

  $this->assertDatabaseMissing('menu_items', [
    'id' => $product->id,
  ]);
});

test('admin can toggle product availability to unavailable', function () {
  $product = MenuItem::factory()->create([
    'category_id' => $this->category->id,
    'is_available' => true,
  ]);

  $response = $this->actingAs($this->admin)->post(route('admin.products.toggle-availability', $product));

  $response->assertRedirect(route('admin.products.index'));
  $response->assertSessionHas('success');

  $this->assertDatabaseHas('menu_items', [
    'id' => $product->id,
    'is_available' => false,
  ]);
});

test('admin can toggle product availability to available', function () {
  $product = MenuItem::factory()->create([
    'category_id' => $this->category->id,
    'is_available' => false,
  ]);

  $response = $this->actingAs($this->admin)->post(route('admin.products.toggle-availability', $product));

  $response->assertRedirect(route('admin.products.index'));
  $response->assertSessionHas('success');

  $this->assertDatabaseHas('menu_items', [
    'id' => $product->id,
    'is_available' => true,
  ]);
});

test('non-admin users cannot access product management', function () {
  $user = User::factory()->create(['role' => UserRole::CUSTOMER]);

  $response = $this->actingAs($user)->get(route('admin.products.index'));

  $response->assertRedirect(route('dashboard'));
});
