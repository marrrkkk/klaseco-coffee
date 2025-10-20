<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StaffController extends Controller
{
  /**
   * Show the staff role selection interface.
   */
  public function showRoleSelection(Request $request): Response
  {
    $intendedRole = $request->session()->get('intended_role');

    return Inertia::render('StaffRoleSelection', [
      'intendedRole' => $intendedRole,
      'availableRoles' => [
        UserRole::CASHIER->value => 'Cashier',
        UserRole::OWNER->value => 'Owner',
      ]
    ]);
  }

  /**
   * Set the staff role in session.
   */
  public function setRole(Request $request)
  {
    $request->validate([
      'role' => ['required', 'in:' . UserRole::CASHIER->value . ',' . UserRole::OWNER->value]
    ]);

    $role = $request->input('role');
    $request->session()->put('staff_role', $role);

    // Redirect to the appropriate dashboard
    if ($role === UserRole::CASHIER->value) {
      return redirect()->route('cashier');
    } elseif ($role === UserRole::OWNER->value) {
      return redirect()->route('owner');
    }

    return redirect()->route('staff.role-selection');
  }

  /**
   * Clear the staff role from session (logout).
   */
  public function clearRole(Request $request)
  {
    $request->session()->forget('staff_role');
    return redirect()->route('staff.role-selection')
      ->with('message', 'You have been logged out.');
  }
}
