<?php

namespace App\Policies;

use App\Models\Category;
use App\Models\User;

class CategoryPolicy
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
     * View: All authenticated roles can view categories (needed for product forms).
     * CRUD: Admin and Manager only.
     */
    public function viewAny(User $user): bool
    {
        return true; // all authenticated users can view
    }

    public function view(User $user, Category $category): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->hasRole('admin', 'manager');
    }

    public function update(User $user, Category $category): bool
    {
        return $user->hasRole('admin', 'manager');
    }

    public function delete(User $user, Category $category): bool
    {
        return $user->isAdmin();
    }

    /** Toggling active/inactive status. */
    public function toggleActive(User $user, Category $category): bool
    {
        return $user->hasRole('admin', 'manager');
    }
}
