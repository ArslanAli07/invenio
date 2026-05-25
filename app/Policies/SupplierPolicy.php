<?php

namespace App\Policies;

use App\Models\Supplier;
use App\Models\User;

class SupplierPolicy
{
    public function before(User $user, string $ability): bool|null
    {
        if (! $user->isActive()) {
            return false;
        }

        return null;
    }

    /**
     * PRD §6.3 — View: Admin, Manager, Staff.
     * Create/Update: Admin + Manager only.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasRole('admin', 'manager', 'staff');
    }

    public function view(User $user, Supplier $supplier): bool
    {
        return $user->hasRole('admin', 'manager', 'staff');
    }

    public function create(User $user): bool
    {
        return $user->hasRole('admin', 'manager');
    }

    public function update(User $user, Supplier $supplier): bool
    {
        return $user->hasRole('admin', 'manager');
    }

    public function delete(User $user, Supplier $supplier): bool
    {
        return $user->isAdmin();
    }

    public function toggleActive(User $user, Supplier $supplier): bool
    {
        return $user->hasRole('admin', 'manager');
    }
}
