<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    /**
     * Inactive accounts are denied before any policy method runs.
     */
    public function before(User $user, string $ability): bool|null
    {
        if (! $user->isActive()) {
            return false;
        }

        return null; // defer to individual methods
    }

    /**
     * PRD §6.3 — Only Admin can manage users.
     */
    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    public function view(User $user, User $model): bool
    {
        return $user->isAdmin();
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, User $model): bool
    {
        return $user->isAdmin();
    }

    public function delete(User $user, User $model): bool
    {
        return $user->isAdmin();
    }

    /** Deactivating a user account. */
    public function deactivate(User $user, User $model): bool
    {
        return $user->isAdmin();
    }
}
