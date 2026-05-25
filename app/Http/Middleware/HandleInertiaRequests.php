<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
                'can' => $request->user() ? [
                    'manage_categories' => $request->user()->hasRole('admin', 'manager'),
                    'manage_locations' => $request->user()->hasRole('admin', 'manager'),
                    'manage_suppliers' => $request->user()->hasRole('admin', 'manager'),
                    'manage_products' => $request->user()->hasRole('admin', 'manager'),
                    'manage_users' => $request->user()->isAdmin(),
                    'view_movements' => $request->user()->hasRole('admin', 'manager', 'staff'),
                ] : [],
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}
