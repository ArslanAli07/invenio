<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    /**
     * Enforce role-based access control per PRD §6.3 Authorization Matrix.
     *
     * Usage in routes:
     *   Route::middleware('role:admin')->group(...)
     *   Route::middleware('role:admin,manager')->group(...)
     *
     * Rules:
     *   - Unauthenticated users are redirected to the login page.
     *   - Inactive users ('status' = 'inactive') are denied all access.
     *   - Authenticated users without the required role receive a 403.
     *   - For Inertia requests, a JSON 403 is returned so Inertia can handle it.
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        // Not logged in → redirect to login
        if (! $request->user()) {
            return redirect()->route('login');
        }

        $user = $request->user();

        // Inactive account → deny all access
        if (! $user->isActive()) {
            abort(403, 'Your account has been deactivated. Please contact an administrator.');
        }

        // Check if user has any of the allowed roles
        if (! $user->hasRole(...$roles)) {
            if ($request->header('X-Inertia')) {
                return redirect()->back()->with('error', 'You do not have permission to perform this action.');
            }

            abort(403, 'You do not have permission to access this page.');
        }

        return $next($request);
    }
}
