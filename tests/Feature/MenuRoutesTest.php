<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class MenuRoutesTest extends TestCase
{
  /**
   * Test that the home route renders MenuHomePage
   */
  public function test_home_route_renders_menu_home_page(): void
  {
    $response = $this->get('/');

    $response->assertStatus(200);
    $response->assertInertia(fn($page) => $page->component('MenuHomePage'));
  }

  /**
   * Test that the category detail route renders CategoryDetailPage with categoryId prop
   */
  public function test_category_detail_route_renders_with_category_id(): void
  {
    $categoryId = 1;
    $response = $this->get("/menu/category/{$categoryId}");

    $response->assertStatus(200);
    $response->assertInertia(
      fn($page) =>
      $page->component('CategoryDetailPage')
        ->has('categoryId')
        ->where('categoryId', $categoryId)
    );
  }

  /**
   * Test that category ID is properly cast to integer
   */
  public function test_category_id_is_cast_to_integer(): void
  {
    $response = $this->get('/menu/category/5');

    $response->assertStatus(200);
    $response->assertInertia(
      fn($page) =>
      $page->where('categoryId', 5)
        ->where('categoryId', fn($value) => is_int($value))
    );
  }

  /**
   * Test that the menu.category route name works correctly
   */
  public function test_menu_category_route_name(): void
  {
    $url = route('menu.category', ['categoryId' => 3]);

    $this->assertStringEndsWith('/menu/category/3', $url);
  }

  /**
   * Test that the home route name works correctly
   */
  public function test_home_route_name(): void
  {
    $url = route('home');

    $this->assertStringContainsString('localhost', $url);
    $this->assertStringNotContainsString('/menu', $url);
  }
}
