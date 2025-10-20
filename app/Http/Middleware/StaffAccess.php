<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class StaffAccess
{
  /**
   * Handle an incoming request for staff routes.
   * Uses simple session-based role checking.
   */
  public function handle(Request $request, Closure $next, string $requiredRole): Response
  {
    // Check if user has selected a staff role in session
    $sessionRole = session('staff_role');

    if (!$sessionRole || $sessionRole !== $requiredRole) {
      // Redirect to role selection if no valid role in session
      return redirect()->route('staff.role-selection')
        ->with('intended_role', $requiredRole);
    }

    return $next($request);
  }
}
