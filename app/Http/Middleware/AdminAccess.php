<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminAccess
{
  /**
   * Handle an incoming request to verify admin role.
   *
   * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
   */
  public function handle(Request $request, Closure $next): Response
  {
    // Check if user is authenticated
    if (!auth()->check()) {
      return redirect()->route('login')
        ->with('error', 'Please log in to access the admin dashboard.');
    }

    // Check if user has admin role
    if (auth()->user()->role !== UserRole::ADMIN) {
      return redirect()->route('dashboard')
        ->with('error', 'You do not have permission to access the admin dashboard.');
    }

    return $next($request);
  }
}
