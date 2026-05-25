<?php

namespace App\Policies;

use App\Models\Product;
use App\Models\User;

class ProductPolicy
{
    /**
     * Deny inactive accounts before any policy method runs.
     */
    public function before(User $user, string $ability): bool|null
    {
        if (! $user->isActive()) {
            return false;
        }

        return null;
    }

    /**
     * PRD §6.3:
     * View: All roles (Admin, Manager, Staff, SupplierUser).
     * CRUD: Admin and Manager only.
     */
    public function viewAny(User $user): bool
    {
        return true; // all roles can view the product list
    }

    public function view(User $user, Product $product): bool
    {
        return true; // all roles can view individual products
    }

    public function create(User $user): bool
    {
        return $user->hasRole('admin', 'manager');
    }

    public function update(User $user, Product $product): bool
    {
        return $user->hasRole('admin', 'manager');
    }

    public function delete(User $user, Product $product): bool
    {
        return $user->isAdmin();
    }

    /** Toggling active/inactive (soft-disable). */
    public function toggleActive(User $user, Product $product): bool
    {
        return $user->hasRole('admin', 'manager');
    }
}
