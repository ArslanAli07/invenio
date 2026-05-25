<?php

namespace App\Policies;

use App\Models\Location;    
use App\Models\User;

class LocationPolicy
{
    public function before(User $user, string $ability): bool|null
    {
        if (! $user->isActive()) {
            return false;
        }

        return null;
    }

    /**
     * PRD §6.3 — CRUD Products/Categories/Locations: Admin + Manager.
     * View: all roles (needed for stock movement forms).
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Location $location): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->hasRole('admin', 'manager');
    }

    public function update(User $user, Location $location): bool
    {
        return $user->hasRole('admin', 'manager');
    }

    public function delete(User $user, Location $location): bool
    {
        return $user->isAdmin();
    }

    public function toggleActive(User $user, Location $location): bool
    {
        return $user->hasRole('admin', 'manager');
    }
}
